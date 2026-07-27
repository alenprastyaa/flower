const { Op } = require('sequelize');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { claimCampaign } = require('../services/claimCampaign.service');
const { assertTransition, recordTransition } = require('../services/orderLifecycle.service');
const { sequelize, OrderRequest, OrderStatusHistory, PortfolioItem, Payment, Rating } = require('../models');

const claim = asyncHandler(async (req, res) => {
  const campaignId = req.params.id;
  const craftsmanProfileId = req.craftsmanProfile.id;

  const result = await claimCampaign(campaignId, craftsmanProfileId);

  res.json({
    data: {
      campaignId: result.campaign.id,
      orderRequestId: result.orderRequest.id,
      status: result.orderRequest.status,
      commissionAmount: result.orderRequest.commission_amount,
      craftsmanEarning: result.orderRequest.craftsman_earning,
    },
  });
});

const listMyOrders = asyncHandler(async (req, res) => {
  const where = { claimed_by_craftsman_id: req.craftsmanProfile.id };
  if (req.query.status) {
    where.status = req.query.status;
  } else {
    where.status = { [Op.in]: ['claimed', 'in_progress', 'completed'] };
  }

  const orders = await OrderRequest.findAll({
    where,
    include: [{ model: Payment, as: 'payment' }],
    order: [['claimed_at', 'DESC']],
  });

  res.json({ data: orders });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, completion_image_url, completion_caption } = req.body;

  const result = await sequelize.transaction(async (t) => {
    const order = await OrderRequest.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.claimed_by_craftsman_id !== req.craftsmanProfile.id) {
      throw new ApiError(403, 'This order does not belong to you');
    }
    assertTransition(order.status, status);

    const fromStatus = order.status;
    const updates = { status };
    if (status === 'completed') updates.completed_at = new Date();
    await order.update(updates, { transaction: t });

    await recordTransition(
      { orderRequestId: order.id, fromStatus, toStatus: status, changedByUserId: req.user.id },
      { transaction: t }
    );

    if (status === 'completed' && completion_image_url) {
      await PortfolioItem.create(
        {
          craftsman_profile_id: req.craftsmanProfile.id,
          order_request_id: order.id,
          image_url: completion_image_url,
          caption: completion_caption || order.arrangement_type || null,
        },
        { transaction: t }
      );
    }

    return order;
  });

  res.json({ data: result });
});

const dashboardSummary = asyncHandler(async (req, res) => {
  const craftsmanProfileId = req.craftsmanProfile.id;

  const [claimedCount, inProgressCount, completedCount, earningsRow] = await Promise.all([
    OrderRequest.count({ where: { claimed_by_craftsman_id: craftsmanProfileId, status: 'claimed' } }),
    OrderRequest.count({ where: { claimed_by_craftsman_id: craftsmanProfileId, status: 'in_progress' } }),
    OrderRequest.count({ where: { claimed_by_craftsman_id: craftsmanProfileId, status: 'completed' } }),
    OrderRequest.findOne({
      where: { claimed_by_craftsman_id: craftsmanProfileId, status: 'completed' },
      attributes: [[sequelize.fn('SUM', sequelize.col('craftsman_earning')), 'totalEarnings']],
      raw: true,
    }),
  ]);

  res.json({
    data: {
      claimedCount,
      inProgressCount,
      completedCount,
      totalEarnings: Number(earningsRow?.totalEarnings || 0),
    },
  });
});

module.exports = { claim, listMyOrders, updateOrderStatus, dashboardSummary };
