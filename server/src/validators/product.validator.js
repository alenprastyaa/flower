const { z } = require('zod');

const createProductSchema = z.object({
  name: z.string().min(2).max(150),
  subtitle: z.string().max(255).optional(),
  price: z.number().positive(),
  image_url: z.string().url().optional(),
  category: z.string().max(100).optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

const updateProductSchema = createProductSchema.partial();

module.exports = { createProductSchema, updateProductSchema };
