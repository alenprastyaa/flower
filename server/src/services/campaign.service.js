const { Op } = require('sequelize');
const { Campaign, OrderRequest } = require('../models');
const { recordTransition } = require('./orderLifecycle.service');
const { getIo } = require('../sockets');
const EVENTS = require('../sockets/events');

// Lazy expiry: flip any open campaign past its needed_by_date before returning
// board queries. No dedicated cron worker for MVP (documented upgrade path).
async function sweepExpiredCampaigns() {
  const today = new Date().toISOString().slice(0, 10);

  const expiredCampaigns = await Campaign.sequelize.query(
    'SELECT id, order_request_id FROM campaigns WHERE status = :open AND needed_by_date < :today',
    { replacements: { open: 'open', today }, type: Campaign.sequelize.QueryTypes.SELECT }
  );

  if (!expiredCampaigns.length) return [];

  const campaignIds = expiredCampaigns.map((c) => c.id);
  const orderIds = expiredCampaigns.map((c) => c.order_request_id);

  await Campaign.update({ status: 'expired' }, { where: { id: { [Op.in]: campaignIds } } });
  await OrderRequest.update({ status: 'expired' }, { where: { id: { [Op.in]: orderIds }, status: 'published' } });

  for (const orderId of orderIds) {
    await recordTransition({ orderRequestId: orderId, fromStatus: 'published', toStatus: 'expired', note: 'Auto-expired: past needed_by_date' });
  }

  try {
    const io = getIo();
    for (const campaignId of campaignIds) {
      io.to('open-campaigns').emit(EVENTS.CAMPAIGN_EXPIRED, { campaignId });
    }
  } catch (err) {
    // Socket.io not initialized — non-fatal, board queries still return correct data.
  }

  return campaignIds;
}

module.exports = { sweepExpiredCampaigns };
