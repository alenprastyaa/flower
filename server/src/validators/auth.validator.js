const { z } = require('zod');

const registerCraftsmanSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  full_name: z.string().min(2).max(150),
  phone: z.string().min(8).max(30),
  store_name: z.string().min(2).max(150),
  bio: z.string().max(2000).optional(),
  province: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

module.exports = { registerCraftsmanSchema, loginSchema };
