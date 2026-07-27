const express = require('express');
const authRoutes = require('./auth.routes');
const publicRoutes = require('./public.routes');
const adminRoutes = require('./admin.routes');
const craftsmanRoutes = require('./craftsman.routes');
const uploadRoutes = require('./upload.routes');
const chatRoutes = require('./chat.routes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/admin', adminRoutes);
router.use('/craftsman', craftsmanRoutes);
router.use('/uploads', uploadRoutes);
router.use('/chat', chatRoutes);

module.exports = router;
