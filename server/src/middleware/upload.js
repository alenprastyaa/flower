const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Files are forwarded to the external upload service (see upload.controller.js),
// never written to local disk, so memoryStorage is sufficient.
const storage = multer.memoryStorage();

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.includes(file.mimetype)) {
      return cb(new ApiError(400, 'Only image uploads (jpeg, png, webp, gif) are allowed'));
    }
    cb(null, true);
  },
});

module.exports = { upload };
