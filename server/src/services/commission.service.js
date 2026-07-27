const { CommissionConfig } = require('../models');

async function getActiveRate(transaction) {
  const config = await CommissionConfig.findOne({
    where: { is_active: true },
    order: [['effective_from', 'DESC']],
    transaction,
  });
  if (!config) throw new Error('No active commission_configs row found');
  return Number(config.rate_percent);
}

module.exports = { getActiveRate };
