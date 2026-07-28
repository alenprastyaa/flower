const { z } = require('zod');

const createRegionGroupSchema = z.object({
  name: z.string().min(2).max(150),
  image_url: z.string().url().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

const updateRegionGroupSchema = createRegionGroupSchema.partial();

module.exports = { createRegionGroupSchema, updateRegionGroupSchema };
