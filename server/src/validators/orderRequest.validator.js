const { z } = require('zod');

const submitOrderSchema = z.object({
  product_id: z.number().int().positive(),
  buyer_name: z.string().min(2).max(150),
  buyer_phone: z.string().min(8).max(30),
  buyer_email: z.string().email().optional().or(z.literal('')),
  occasion: z.string().max(150).optional(),
  needed_by_date: z
    .string()
    .min(1, 'Tanggal dibutuhkan wajib diisi')
    .refine((v) => !Number.isNaN(Date.parse(v)), 'Format tanggal tidak valid'),
  description: z.string().min(3).max(3000),
  reference_image_urls: z.array(z.string().url()).max(10).optional(),
  delivery_province: z.string().min(2).max(100),
  delivery_city: z.string().min(2).max(100),
  delivery_district: z.string().min(2).max(100),
  delivery_village: z.string().min(2).max(100),
  delivery_address: z.string().min(5).max(1000),
});

const approveOrderSchema = z.object({
  admin_notes: z.string().max(2000).optional(),
});

const rejectOrderSchema = z.object({
  admin_notes: z.string().min(3).max(2000),
});

const cancelOrderSchema = z.object({
  admin_notes: z.string().max(2000).optional(),
});

const markPaymentSchema = z.object({
  status: z.enum(['paid', 'unpaid', 'refunded']),
});

module.exports = {
  submitOrderSchema,
  approveOrderSchema,
  rejectOrderSchema,
  cancelOrderSchema,
  markPaymentSchema,
};
