const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');
const { getAllUsers } = require('../controllers/userController');

// GET /api/users  -> admin only
router.get('/', authenticate, authorizeRoles('admin'), getAllUsers);

module.exports = router;
