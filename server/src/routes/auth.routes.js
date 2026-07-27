const express = require('express');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { registerCraftsmanSchema, loginSchema } = require('../validators/auth.validator');
const { registerCraftsman, login, me } = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', validate(registerCraftsmanSchema), registerCraftsman);
router.post('/login', validate(loginSchema), login);
router.get('/me', authenticate, me);

module.exports = router;
