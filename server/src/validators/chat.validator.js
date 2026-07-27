const { z } = require('zod');

const sendMessageSchema = z.object({
  body: z.string().min(1, 'Pesan tidak boleh kosong').max(2000),
});

const sendVisitorMessageSchema = z.object({
  body: z.string().min(1, 'Pesan tidak boleh kosong').max(2000),
  name: z.string().min(1, 'Nama wajib diisi').max(150),
});

module.exports = { sendMessageSchema, sendVisitorMessageSchema };
