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
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   user_id: { type: integer }
 *                   title: { type: string }
 *                   amount: { type: number }
 *                   type: { type: string, enum: [income, expense] }
 *                   category: { type: string }
 *                   created_at: { type: string, format: date-time }
 */
const getAll = async (req, res) => {
  const cacheKey = `transactions:${req.user.id}`;
  try {
    // Check Redis cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return res.json({ transactions: parsed });
    }

    const transactions = await getTransactionsByUser(req.user.id) || [];

    // Cache for 15 minutes
    await redisClient.setEx(cacheKey, 900, JSON.stringify(transactions));

    // Always respond with { transactions: [...] }
    res.json({ transactions });
  } catch (err) {
    res.status(500).json({
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               amount: { type: number }
 *               type: { type: string, enum: [income, expense] }
 *               category: { type: string }
 *     responses:
 *       201:
 *         description: Transaction created
 *       403:
 *         description: Permission denied
 *       500:
 *         description: Server error
 */
const create = async (req, res) => {
  if (req.user.role === 'read-only') return res.status(403).json({ message: 'Permission denied' });
  try {
    const transaction = await createTransaction({ ...req.body, userId: req.user.id });
    await redisClient.del(`transactions:${req.user.id}`);
    await redisClient.del(`analytics:${req.user.id}`);
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create transaction', error: err.message });
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
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transaction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               amount: { type: number }
 *               type: { type: string, enum: [income, expense] }
 *               category: { type: string }
 *     responses:
 *       200:
 *         description: Transaction updated
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
const update = async (req, res) => {
  if (req.user.role === 'read-only') return res.status(403).json({ message: 'Permission denied' });
  try {
    const updated = await updateTransaction(req.params.id, req.user.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Transaction not found' });
    await redisClient.del(`transactions:${req.user.id}`);
    await redisClient.del(`analytics:${req.user.id}`);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update transaction', error: err.message });
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
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Transaction ID
 *     responses:
 *       200:
 *         description: Transaction deleted
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
const remove = async (req, res) => {
  if (req.user.role === 'read-only') return res.status(403).json({ message: 'Permission denied' });
  try {
    const deleted = await deleteTransaction(req.params.id, req.user.id);
    if (!deleted) return res.status(404).json({ message: 'Transaction not found' });
    await redisClient.del(`transactions:${req.user.id}`);
    await redisClient.del(`analytics:${req.user.id}`);
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete transaction', error: err.message });
  }
};

module.exports = {
  getAll,
  create,
  update,
  remove,
};
