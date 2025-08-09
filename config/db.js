const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
  max: 5,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

pool.connect()
  .then(() => console.log('🟢 Connected to PostgreSQL'))
  .catch(err => console.error('🔴 PostgreSQL connection error', err));

module.exports = pool;
