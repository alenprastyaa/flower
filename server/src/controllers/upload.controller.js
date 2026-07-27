const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

const handleUpload = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  const form = new FormData();
  form.append('file', new Blob([req.file.buffer], { type: req.file.mimetype }), req.file.originalname);

  let externalRes;
  try {
    externalRes = await fetch(env.uploadServiceUrl, { method: 'POST', body: form });
  } catch (err) {
    throw new ApiError(502, 'Upload service unreachable');
  }

  const body = await externalRes.json().catch(() => null);

  if (!externalRes.ok || !body || body.status !== 200 || !body.data?.url) {
    throw new ApiError(502, 'Upload service failed', body);
  }

  res.status(201).json({ data: { url: body.data.url } });
});

module.exports = { handleUpload };
