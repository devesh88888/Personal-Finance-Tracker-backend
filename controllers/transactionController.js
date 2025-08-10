// controllers/transactionController.js
const redisClient = require('../config/redis');
const {
  getTransactionsByUser,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../models/transactionModel');

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions for the logged-in user
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer }
 *                       user_id: { type: integer }
 *                       title: { type: string }
 *                       amount: { type: number }
 *                       type: { type: string, enum: [income, expense] }
 *                       category: { type: string }
 *                       created_at: { type: string, format: date-time }
 */
const getAll = async (req, res) => {
  const cacheKey = `transactions:${req.user.id}`;

  try {
    // 1) Try cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return res.status(200).json({ transactions: parsed });
    }

    // 2) DB fetch
    const transactions = (await getTransactionsByUser(req.user.id)) || [];

    // 3) Cache for 15 minutes
    await redisClient.setEx(cacheKey, 900, JSON.stringify(transactions));

    // 4) Standard envelope response (no stringify!)
    return res.status(200).json({ transactions });
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to get transactions',
      error: err.message,
    });
  }
};

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 */
const create = async (req, res) => {
  if (req.user.role === 'read-only') {
    return res.status(403).json({ message: 'Permission denied' });
  }

  try {
    const transaction = await createTransaction({ ...req.body, userId: req.user.id });

    // Invalidate caches
    await redisClient.del(`transactions:${req.user.id}`);
    await redisClient.del(`analytics:${req.user.id}`);

    return res.status(201).json(transaction);
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to create transaction',
      error: err.message,
    });
  }
};

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Update an existing transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 */
const update = async (req, res) => {
  if (req.user.role === 'read-only') {
    return res.status(403).json({ message: 'Permission denied' });
  }

  try {
    const updated = await updateTransaction(req.params.id, req.user.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Invalidate caches
    await redisClient.del(`transactions:${req.user.id}`);
    await redisClient.del(`analytics:${req.user.id}`);

    return res.status(200).json(updated);
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to update transaction',
      error: err.message,
    });
  }
};

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Delete a transaction
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 */
const remove = async (req, res) => {
  if (req.user.role === 'read-only') {
    return res.status(403).json({ message: 'Permission denied' });
  }

  try {
    const deleted = await deleteTransaction(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Invalidate caches
    await redisClient.del(`transactions:${req.user.id}`);
    await redisClient.del(`analytics:${req.user.id}`);

    return res.status(200).json(deleted);
  } catch (err) {
    return res.status(500).json({
      message: 'Failed to delete transaction',
      error: err.message,
    });
  }
};

module.exports = {
  getAll,
  create,
  update,
  remove,
};
