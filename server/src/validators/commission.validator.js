const { z } = require('zod');

const setCommissionRateSchema = z.object({
  rate_percent: z.number().positive().max(100),
});

module.exports = { setCommissionRateSchema };
