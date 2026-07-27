const asyncHandler = require('../utils/asyncHandler');
const { Campaign } = require('../models');
const { sweepExpiredCampaigns } = require('../services/campaign.service');

const listPublicCampaigns = asyncHandler(async (req, res) => {
  await sweepExpiredCampaigns();

  const campaigns = await Campaign.findAll({
    where: { status: 'open' },
    order: [['published_at', 'DESC']],
    attributes: ['id', 'title', 'public_summary', 'city', 'price', 'needed_by_date', 'published_at'],
  });

  res.json({ data: campaigns });
});

const listOpenCampaignsForCraftsman = asyncHandler(async (req, res) => {
  await sweepExpiredCampaigns();

  const campaigns = await Campaign.findAll({
    where: { status: 'open' },
    order: [['published_at', 'DESC']],
  });

  res.json({ data: campaigns });
});

module.exports = { listPublicCampaigns, listOpenCampaignsForCraftsman };
