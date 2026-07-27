const { z } = require('zod');

const submitRatingSchema = z.object({
  stars: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

module.exports = { submitRatingSchema };
