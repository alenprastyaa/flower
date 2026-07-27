const ApiError = require('../utils/ApiError');
const { round2 } = require('../utils/money');
const { sequelize, Campaign, OrderRequest, CraftsmanProfile } = require('../models');
const orderLifecycle = require('./orderLifecycle.service');
const commissionService = require('./commission.service');
const { getIo } = require('../sockets');
const EVENTS = require('../sockets/events');

// The correctness-critical operation the whole business model depends on:
// many craftsmen may hit this endpoint for the same campaign at nearly the
// same instant, and exactly one of them must win.
async function claimCampaign(campaignId, craftsmanProfileId) {
  const result = await sequelize.transaction(async (t) => {
    // Primary defense: a single atomic conditional UPDATE. InnoDB takes a
    // row lock while evaluating+applying this statement, so two simultaneous
    // UPDATEs against the same row cannot both match status='open' — the
    // second one to execute sees the row already flipped and affects 0 rows.
    const [affectedRows] = await Campaign.update(
      {
        status: 'claimed',
        claimed_by_craftsman_id: craftsmanProfileId,
        claimed_at: new Date(),
      },
      {
        where: { id: campaignId, status: 'open' },
        transaction: t,
      }
    );

    if (affectedRows === 0) {
      const exists = await Campaign.findByPk(campaignId, { transaction: t });
      if (!exists) throw new ApiError(404, 'Campaign not found');
      throw new ApiError(409, 'Campaign sudah diklaim pengrajin lain');
    }

    // We hold the win. Re-fetch with row locks so nothing else (e.g. an
    // admin cancelling the order) interleaves while we write the dependent
    // records (order_requests status + commission snapshot + history).
    const campaign = await Campaign.findByPk(campaignId, { transaction: t, lock: t.LOCK.UPDATE });
    const orderRequest = await OrderRequest.findByPk(campaign.order_request_id, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    orderLifecycle.assertTransition(orderRequest.status, 'claimed');

    const craftsman = await CraftsmanProfile.findByPk(craftsmanProfileId, { transaction: t });
    if (!craftsman) throw new ApiError(404, 'Craftsman profile not found');

    const rate =
      craftsman.commission_rate_override != null
        ? Number(craftsman.commission_rate_override)
        : await commissionService.getActiveRate(t);

    const finalPrice = Number(orderRequest.final_price);
    const commissionAmount = round2(finalPrice * (rate / 100));
    const craftsmanEarning = round2(finalPrice - commissionAmount);

    await orderRequest.update(
      {
        status: 'claimed',
        claimed_by_craftsman_id: craftsmanProfileId,
        claimed_at: new Date(),
        commission_rate_applied: rate,
        commission_amount: commissionAmount,
        craftsman_earning: craftsmanEarning,
      },
      { transaction: t }
    );

    await orderLifecycle.recordTransition(
      {
        orderRequestId: orderRequest.id,
        fromStatus: 'published',
        toStatus: 'claimed',
        changedByUserId: craftsman.user_id,
        note: 'Claimed via open campaign board',
      },
      { transaction: t }
    );

    return { campaign, orderRequest };
  }); // commit here; releases all locks atomically

  // Only broadcast after a successful commit — never from inside the
  // transaction, so we never announce a claim that could still roll back.
  try {
    const io = getIo();
    io.to('open-campaigns').emit(EVENTS.CAMPAIGN_CLAIMED, {
      campaignId: result.campaign.id,
      claimedByCraftsmanId: craftsmanProfileId,
    });
    io.to(`craftsman:${craftsmanProfileId}`).emit(EVENTS.ORDER_NEW_CLAIM, {
      orderId: result.orderRequest.id,
      campaignId: result.campaign.id,
    });
  } catch (err) {
    // Socket.io not initialized (e.g. a script importing this service
    // directly without booting the HTTP server) — non-fatal for the claim itself.
  }

  return result;
}

module.exports = { claimCampaign };
