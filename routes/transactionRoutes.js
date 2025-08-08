const express = require('express');
const {
  getAll,
  create,
  update,
  remove,
} = require('../controllers/transactionController');

const { authenticate } = require('../middlewares/authMiddleware');
const { transactionRateLimiter } = require('../middlewares/rateLimiter');
const validate = require('../middlewares/validate');
const { transactionSchema } = require('../validators/transactionValidator');

const router = express.Router();

router.use(authenticate);
router.use(transactionRateLimiter);

router.get('/', getAll);
router.post('/', validate(transactionSchema), create);
router.put('/:id', validate(transactionSchema), update);
router.delete('/:id', remove);

module.exports = router;
