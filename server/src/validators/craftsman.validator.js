const { z } = require('zod');

const updateOrderStatusSchema = z.object({
  status: z.enum(['in_progress', 'completed']),
  completion_image_url: z.string().url().optional(),
  completion_caption: z.string().max(255).optional(),
});

const updateProfileSchema = z.object({
  store_name: z.string().min(2).max(150).optional(),
  bio: z.string().max(2000).optional(),
  province: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  avatar_url: z.string().url().optional(),
  cover_image_url: z.string().url().optional(),
});

module.exports = { updateOrderStatusSchema, updateProfileSchema };
