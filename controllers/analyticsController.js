const redisClient = require('../config/redis');
const db = require('../config/db');

const getAnalytics = async (req, res) => {
  const cacheKey = `analytics:${req.user.id}`;
  try {
    // Check Redis cache first
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const userId = req.user.id;

    const incomeResult = await db.query(
      'SELECT COALESCE(SUM(amount), 0) AS total_income FROM transactions WHERE user_id = $1 AND type = $2',
      [userId, 'income']
    );
    const expenseResult = await db.query(
      'SELECT COALESCE(SUM(amount), 0) AS total_expense FROM transactions WHERE user_id = $1 AND type = $2',
      [userId, 'expense']
    );

    const byCategory = await db.query(
      `SELECT category, SUM(amount) AS total
       FROM transactions
       WHERE user_id = $1
       GROUP BY category
       ORDER BY total DESC`,
      [userId]
    );

    const monthly = await db.query(
      `SELECT TO_CHAR(created_at, 'YYYY-MM') AS month, 
              SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS income,
              SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expense
       FROM transactions
       WHERE user_id = $1
       GROUP BY month
       ORDER BY month`,
      [userId]
    );

    const analytics = {
      totalIncome: parseFloat(incomeResult.rows[0].total_income),
      totalExpense: parseFloat(expenseResult.rows[0].total_expense),
      balance:
        parseFloat(incomeResult.rows[0].total_income) -
        parseFloat(expenseResult.rows[0].total_expense),
      categoryBreakdown: byCategory.rows,
      monthlyTrends: monthly.rows,
    };

    await redisClient.setEx(cacheKey, 900, JSON.stringify(analytics)); // 15 mins cache

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: err.message });
  }
};

module.exports = { getAnalytics };
