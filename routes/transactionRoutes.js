// routes/transactionRoutes.js
const express = require('express');
const { getAll, create, update, remove } = require('../controllers/transactionController');
const { authenticate } = require('../middlewares/authMiddleware');
const {
  transactionsReadLimiter,
  transactionsWriteLimiter,
} = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');
const { transactionSchema } = require('../validators/transactionValidator');

const router = express.Router();

router.use(authenticate);

// 👇 Only GET is “read-limited”
router.get('/', transactionsReadLimiter, getAll);

// 👇 Writes are “write-limited”
router.post('/', transactionsWriteLimiter, validate(transactionSchema), create);
router.put('/:id', transactionsWriteLimiter, validate(transactionSchema), update);
router.delete('/:id', transactionsWriteLimiter, remove);

module.exports = router;
