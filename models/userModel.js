const pool = require('../config/db');

const createUser = async (name, email, hashedPassword, role) => {
  const result = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [name, email, hashedPassword, role]
  );
  return result.rows[0];
};

const getUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const listUsers = async () => {
  const result = await pool.query(
    'SELECT id, name, email, role, created_at FROM users ORDER BY id DESC'
  );
  return result.rows;
};

module.exports = {
  createUser,
  getUserByEmail,
  listUsers,
};
