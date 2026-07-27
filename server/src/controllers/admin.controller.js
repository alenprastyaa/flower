const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { sequelize, OrderRequest, OrderStatusHistory, Payment, Campaign, CraftsmanProfile, User, CommissionConfig } = require('../models');
const { assertTransition, recordTransition } = require('../services/orderLifecycle.service');
const { getIo } = require('../sockets');
const EVENTS = require('../sockets/events');

const listOrders = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const pageSize = Math.min(Math.max(parseInt(req.query.pageSize || '20', 10), 1), 100);
  const where = {};
  if (req.query.status) where.status = req.query.status;

  const { rows, count } = await OrderRequest.findAndCountAll({
    where,
    order: [['created_at', 'DESC']],
    limit: pageSize,
    offset: (page - 1) * pageSize,
  });

  res.json({ data: rows, meta: { page, pageSize, total: count } });
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await OrderRequest.findByPk(req.params.id, {
    include: [
      { model: OrderStatusHistory, as: 'statusHistory', order: [['created_at', 'ASC']] },
      { model: Payment, as: 'payment' },
      { model: Campaign, as: 'campaign' },
      { model: CraftsmanProfile, as: 'claimedByCraftsman' },
    ],
  });
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ data: order });
});

const approveOrder = asyncHandler(async (req, res) => {
  const { admin_notes } = req.body;

  const result = await sequelize.transaction(async (t) => {
    const order = await OrderRequest.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!order) throw new ApiError(404, 'Order not found');
    assertTransition(order.status, 'approved');
    if (!order.final_price) throw new ApiError(409, 'Order has no price set (missing product reference)');

    const fromStatus = order.status;
    await order.update(
      {
        status: 'approved',
        admin_notes: admin_notes || null,
        reviewed_by_admin_id: req.user.id,
        reviewed_at: new Date(),
      },
      { transaction: t }
    );

    await recordTransition(
      { orderRequestId: order.id, fromStatus, toStatus: 'approved', changedByUserId: req.user.id, note: admin_notes },
      { transaction: t }
    );

    await Payment.create(
      { order_request_id: order.id, amount: order.final_price, currency: 'IDR', status: 'unpaid', method: 'manual' },
      { transaction: t }
    );

    return order;
  });

  res.json({ data: result });
});

const publishOrder = asyncHandler(async (req, res) => {
  const { title, public_summary } = req.body;

  const result = await sequelize.transaction(async (t) => {
    const order = await OrderRequest.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!order) throw new ApiError(404, 'Order not found');
    assertTransition(order.status, 'published');
    if (!order.final_price) throw new ApiError(409, 'Order has no final_price set');

    const fromStatus = order.status;
    await order.update({ status: 'published' }, { transaction: t });

    await recordTransition(
      { orderRequestId: order.id, fromStatus, toStatus: 'published', changedByUserId: req.user.id },
      { transaction: t }
    );

    const campaign = await Campaign.create(
      {
        order_request_id: order.id,
        title,
        public_summary,
        city: order.delivery_city,
        price: order.final_price,
        needed_by_date: order.needed_by_date,
        status: 'open',
        published_at: new Date(),
      },
      { transaction: t }
    );

    return { order, campaign };
  });

  try {
    getIo().to('open-campaigns').emit(EVENTS.CAMPAIGN_PUBLISHED, {
      id: result.campaign.id,
      title: result.campaign.title,
      public_summary: result.campaign.public_summary,
      city: result.campaign.city,
      price: result.campaign.price,
      needed_by_date: result.campaign.needed_by_date,
      published_at: result.campaign.published_at,
      status: result.campaign.status,
    });
  } catch (err) {
    // Socket.io not initialized — non-fatal for the publish action itself.
  }

  res.status(201).json({ data: { order: result.order, campaign: result.campaign } });
});

const listCampaignsOverview = asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.status) where.status = req.query.status;
  const campaigns = await Campaign.findAll({
    where,
    include: [{ model: CraftsmanProfile, as: 'claimedBy', attributes: ['id', 'store_name', 'slug'] }],
    order: [['published_at', 'DESC']],
  });
  res.json({ data: campaigns });
});

const rejectOrder = asyncHandler(async (req, res) => {
  const { admin_notes } = req.body;

  const result = await sequelize.transaction(async (t) => {
    const order = await OrderRequest.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!order) throw new ApiError(404, 'Order not found');
    assertTransition(order.status, 'rejected');

    const fromStatus = order.status;
    await order.update(
      { status: 'rejected', admin_notes, reviewed_by_admin_id: req.user.id, reviewed_at: new Date() },
      { transaction: t }
    );

    await recordTransition(
      { orderRequestId: order.id, fromStatus, toStatus: 'rejected', changedByUserId: req.user.id, note: admin_notes },
      { transaction: t }
    );

    return order;
  });

  res.json({ data: result });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const { admin_notes } = req.body;

  const result = await sequelize.transaction(async (t) => {
    const order = await OrderRequest.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!order) throw new ApiError(404, 'Order not found');
    assertTransition(order.status, 'cancelled');

    const fromStatus = order.status;
    await order.update({ status: 'cancelled', admin_notes: admin_notes || order.admin_notes }, { transaction: t });

    await recordTransition(
      { orderRequestId: order.id, fromStatus, toStatus: 'cancelled', changedByUserId: req.user.id, note: admin_notes },
      { transaction: t }
    );

    const campaign = await Campaign.findOne({ where: { order_request_id: order.id }, transaction: t });
    if (campaign && ['open', 'claimed'].includes(campaign.status)) {
      await campaign.update({ status: 'cancelled' }, { transaction: t });
    }

    return order;
  });

  res.json({ data: result });
});

const markPayment = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const payment = await Payment.findOne({ where: { order_request_id: req.params.id } });
  if (!payment) throw new ApiError(404, 'Payment record not found for this order');

  await payment.update({
    status,
    paid_at: status === 'paid' ? new Date() : payment.paid_at,
    marked_by_admin_id: req.user.id,
  });

  res.json({ data: payment });
});

const listCraftsmen = asyncHandler(async (req, res) => {
  const craftsmen = await CraftsmanProfile.findAll({
    include: [{ model: User, as: 'user', attributes: ['id', 'email', 'full_name', 'is_active', 'is_approved'] }],
    order: [['created_at', 'DESC']],
  });
  res.json({ data: craftsmen });
});

const approveCraftsman = asyncHandler(async (req, res) => {
  const profile = await CraftsmanProfile.findByPk(req.params.id, { include: [{ model: User, as: 'user' }] });
  if (!profile) throw new ApiError(404, 'Craftsman not found');
  await profile.user.update({ is_approved: true });
  res.json({ data: { id: profile.id, is_approved: true } });
});

const suspendCraftsman = asyncHandler(async (req, res) => {
  const profile = await CraftsmanProfile.findByPk(req.params.id, { include: [{ model: User, as: 'user' }] });
  if (!profile) throw new ApiError(404, 'Craftsman not found');
  await profile.user.update({ is_active: false });
  res.json({ data: { id: profile.id, is_active: false } });
});

const dashboardSummary = asyncHandler(async (req, res) => {
  const bookedStatuses = ['claimed', 'in_progress', 'completed'];

  const [pendingReviewCount, openCampaignsCount, activeCraftsmenCount, totals] = await Promise.all([
    OrderRequest.count({ where: { status: 'submitted' } }),
    Campaign.count({ where: { status: 'open' } }),
    CraftsmanProfile.count({
      include: [{ model: User, as: 'user', where: { is_active: true, is_approved: true }, attributes: [] }],
    }),
    OrderRequest.findOne({
      where: { status: { [Op.in]: bookedStatuses } },
      attributes: [
        [sequelize.fn('SUM', sequelize.col('final_price')), 'gmv'],
        [sequelize.fn('SUM', sequelize.col('commission_amount')), 'totalCommission'],
      ],
      raw: true,
    }),
  ]);

  res.json({
    data: {
      pendingReviewCount,
      openCampaignsCount,
      activeCraftsmenCount,
      gmv: Number(totals?.gmv || 0),
      totalCommission: Number(totals?.totalCommission || 0),
    },
  });
});

const dashboardCharts = asyncHandler(async (req, res) => {
  const bookedStatuses = ['claimed', 'in_progress', 'completed'];
  const days = 14;

  const [statusRows, trendRows, topCraftsmenRows] = await Promise.all([
    OrderRequest.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true,
    }),
    sequelize.query(
      `SELECT DATE(claimed_at) as date,
              COALESCE(SUM(final_price), 0) as gmv,
              COALESCE(SUM(commission_amount), 0) as commission
       FROM order_requests
       WHERE status IN (:statuses)
         AND claimed_at IS NOT NULL
         AND claimed_at >= DATE_SUB(CURDATE(), INTERVAL :days DAY)
       GROUP BY DATE(claimed_at)
       ORDER BY date ASC`,
      { replacements: { statuses: bookedStatuses, days: days - 1 }, type: sequelize.QueryTypes.SELECT }
    ),
    sequelize.query(
      `SELECT cp.store_name as storeName, SUM(o.craftsman_earning) as earnings
       FROM order_requests o
       JOIN craftsman_profiles cp ON cp.id = o.claimed_by_craftsman_id
       WHERE o.status = 'completed'
       GROUP BY o.claimed_by_craftsman_id, cp.store_name
       ORDER BY earnings DESC
       LIMIT 5`,
      { type: sequelize.QueryTypes.SELECT }
    ),
  ]);

  // Fill in the last `days` dates so the trend chart has a continuous x-axis
  // even on days with zero claimed orders, rather than skipping gaps.
  const trendByDate = new Map(trendRows.map((r) => [r.date, r]));
  const revenueTrend = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const row = trendByDate.get(key);
    revenueTrend.push({ date: key, gmv: Number(row?.gmv || 0), commission: Number(row?.commission || 0) });
  }

  res.json({
    data: {
      ordersByStatus: statusRows.map((r) => ({ status: r.status, count: Number(r.count) })),
      revenueTrend,
      topCraftsmen: topCraftsmenRows.map((r) => ({
        storeName: r.storeName,
        earnings: Number(r.earnings),
      })),
    },
  });
});

const getCommissionConfig = asyncHandler(async (req, res) => {
  const active = await CommissionConfig.findOne({ where: { is_active: true }, order: [['effective_from', 'DESC']] });
  const history = await CommissionConfig.findAll({ order: [['effective_from', 'DESC']], limit: 20 });
  res.json({ data: { active, history } });
});

const setCommissionRate = asyncHandler(async (req, res) => {
  const { rate_percent } = req.body;

  const result = await sequelize.transaction(async (t) => {
    await CommissionConfig.update({ is_active: false }, { where: { is_active: true }, transaction: t });
    const created = await CommissionConfig.create(
      { rate_percent, is_active: true, effective_from: new Date(), created_by_user_id: req.user.id },
      { transaction: t }
    );
    return created;
  });

  res.status(201).json({ data: result });
});

module.exports = {
  listOrders,
  getOrder,
  approveOrder,
  publishOrder,
  listCampaignsOverview,
  rejectOrder,
  cancelOrder,
  markPayment,
  listCraftsmen,
  approveCraftsman,
  suspendCraftsman,
  dashboardSummary,
  dashboardCharts,
  getCommissionConfig,
  setCommissionRate,
};
