const { z } = require('zod');

const addPortfolioItemSchema = z.object({
  image_url: z.string().url(),
  caption: z.string().max(255).optional(),
  is_featured: z.boolean().optional(),
});

module.exports = { addPortfolioItemSchema };
