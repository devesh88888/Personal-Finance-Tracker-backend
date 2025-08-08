const pool = require('../config/db');

const getTransactionsByUser = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

const createTransaction = async (data) => {
  const { userId, title, amount, type, category } = data;
  const result = await pool.query(
    'INSERT INTO transactions (user_id, title, amount, type, category) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [userId, title, amount, type, category]
  );
  return result.rows[0];
};

const updateTransaction = async (id, userId, data) => {
  const { title, amount, type, category } = data;
  const result = await pool.query(
    `UPDATE transactions
     SET title = $1, amount = $2, type = $3, category = $4
     WHERE id = $5 AND user_id = $6 RETURNING *`,
    [title, amount, type, category, id, userId]
  );
  return result.rows[0];
};

const deleteTransaction = async (id, userId) => {
  const result = await pool.query(
    'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING *',
    [id, userId]
  );
  return result.rows[0];
};

module.exports = {
  getTransactionsByUser,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};
