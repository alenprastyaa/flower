const { z } = require('zod');

const publishOrderSchema = z.object({
  title: z.string().min(5).max(200),
  public_summary: z.string().min(10).max(2000),
});

module.exports = { publishOrderSchema };
