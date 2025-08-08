const express = require('express');
const { register, login } = require('../controllers/authController');
const { authRateLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validators/userValidator');

const router = express.Router();

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);

module.exports = router;
