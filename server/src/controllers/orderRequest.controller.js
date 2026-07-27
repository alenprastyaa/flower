const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sequelize, OrderRequest, OrderStatusHistory, Campaign, CraftsmanProfile, Rating, Product } = require('../models');
const { recordTransition } = require('../services/orderLifecycle.service');
const { getIo } = require('../sockets');
const EVENTS = require('../sockets/events');

const submitOrder = asyncHandler(async (req, res) => {
  const body = req.body;
  const trackingToken = uuidv4();

  const order = await sequelize.transaction(async (t) => {
    const product = await Product.findByPk(body.product_id, { transaction: t });
    if (!product) throw new ApiError(404, 'Produk tidak ditemukan');
    if (!product.is_active) throw new ApiError(409, 'Produk sudah tidak tersedia');

    const created = await OrderRequest.create(
      {
        buyer_name: body.buyer_name,
        buyer_phone: body.buyer_phone,
        buyer_email: body.buyer_email || null,
        tracking_token: trackingToken,
        product_id: product.id,
        product_image_snapshot: product.image_url,
        arrangement_type: product.name,
        occasion: body.occasion || null,
        needed_by_date: body.needed_by_date,
        description: body.description,
        reference_image_urls: body.reference_image_urls || null,
        delivery_address: body.delivery_address,
        delivery_province: body.delivery_province,
        delivery_city: body.delivery_city,
        delivery_district: body.delivery_district,
        delivery_village: body.delivery_village,
        status: 'submitted',
        final_price: product.price,
      },
      { transaction: t }
    );

    await recordTransition(
      { orderRequestId: created.id, fromStatus: null, toStatus: 'submitted', note: 'Order submitted by buyer' },
      { transaction: t }
    );

    return created;
  });

  try {
    getIo().to('admin-room').emit(EVENTS.ORDER_SUBMITTED, {
      id: order.id,
      arrangementType: order.arrangement_type,
      buyerName: order.buyer_name,
      neededByDate: order.needed_by_date,
      createdAt: order.createdAt,
    });
  } catch (err) {
    // Socket.io not initialized — non-fatal for the submission itself.
  }

  res.status(201).json({ data: { trackingToken: order.tracking_token } });
});

const trackOrder = asyncHandler(async (req, res) => {
  const order = await OrderRequest.findOne({
    where: { tracking_token: req.params.token },
    include: [
      { model: OrderStatusHistory, as: 'statusHistory', order: [['created_at', 'ASC']] },
      { model: CraftsmanProfile, as: 'claimedByCraftsman', attributes: ['id', 'store_name', 'slug', 'city'] },
      { model: Rating, as: 'rating' },
    ],
  });

  if (!order) throw new ApiError(404, 'Order tidak ditemukan');

  res.json({
    data: {
      id: order.id,
      status: order.status,
      arrangementType: order.arrangement_type,
      productImage: order.product_image_snapshot,
      occasion: order.occasion,
      neededByDate: order.needed_by_date,
      finalPrice: order.final_price,
      adminNotes: order.status === 'rejected' ? order.admin_notes : undefined,
      claimedByCraftsman: order.claimedByCraftsman
        ? { storeName: order.claimedByCraftsman.store_name, slug: order.claimedByCraftsman.slug, city: order.claimedByCraftsman.city }
        : null,
      completedAt: order.completed_at,
      rating: order.rating ? { stars: order.rating.stars, comment: order.rating.comment } : null,
      history: order.statusHistory.map((h) => ({ from: h.from_status, to: h.to_status, note: h.note, at: h.created_at })),
    },
  });
});

const submitRating = asyncHandler(async (req, res) => {
  const { stars, comment } = req.body;

  const result = await sequelize.transaction(async (t) => {
    const order = await OrderRequest.findOne({ where: { tracking_token: req.params.token }, transaction: t, lock: t.LOCK.UPDATE });
    if (!order) throw new ApiError(404, 'Order tidak ditemukan');
    if (order.status !== 'completed') throw new ApiError(409, 'Order belum selesai dikerjakan');
    if (!order.claimed_by_craftsman_id) throw new ApiError(409, 'Order tidak memiliki pengrajin');

    const existing = await Rating.findOne({ where: { order_request_id: order.id }, transaction: t });
    if (existing) throw new ApiError(409, 'Rating sudah pernah diberikan untuk pesanan ini');

    const rating = await Rating.create(
      { order_request_id: order.id, craftsman_profile_id: order.claimed_by_craftsman_id, stars, comment: comment || null },
      { transaction: t }
    );

    const craftsman = await CraftsmanProfile.findByPk(order.claimed_by_craftsman_id, { transaction: t, lock: t.LOCK.UPDATE });
    const agg = await Rating.findOne({
      where: { craftsman_profile_id: craftsman.id },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('stars')), 'avg'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      ],
      transaction: t,
      raw: true,
    });
    await craftsman.update(
      { rating_avg: Number(agg.avg).toFixed(2), rating_count: Number(agg.count) },
      { transaction: t }
    );

    return rating;
  });

  res.status(201).json({ data: { stars: result.stars, comment: result.comment } });
});

module.exports = { submitOrder, trackOrder, submitRating };
