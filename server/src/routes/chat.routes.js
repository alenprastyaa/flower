const express = require('express');
const authenticate = require('../middleware/authenticate');
const { authorize } = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { sendMessageSchema } = require('../validators/chat.validator');
const { getGroupMessages, sendGroupMessage } = require('../controllers/chat.controller');

const router = express.Router();

router.use(authenticate, authorize('superadmin', 'pengrajin'));

router.get('/group', getGroupMessages);
router.post('/group', validate(sendMessageSchema), sendGroupMessage);

module.exports = router;
