// // backend/config/db.js
// const { Pool } = require('pg');
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

// pool.connect()
//   .then(() => console.log('🟢 Connected to PostgreSQL'))
//   .catch(err => console.error('🔴 PostgreSQL connection error', err));

// module.exports = pool;



// // backend/config/redis.js
// const redis = require('redis');
// const client = redis.createClient({
//   url: process.env.REDIS_URL,
// });

// client.connect()
//   .then(() => console.log('🟢 Connected to Redis'))
//   .catch(err => console.error('🔴 Redis connection error', err));

// module.exports = client;




// backend/config/db.js
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(() => console.log('🟢 Connected to PostgreSQL'))
  .catch(err => console.error('🔴 PostgreSQL connection error', err));

module.exports = pool;





