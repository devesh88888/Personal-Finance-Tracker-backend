// backend/config/redis.js
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL,
});

client.connect()
  .then(() => console.log('🟢 Connected to Redis'))
  .catch(err => console.error('🔴 Redis connection error', err));

module.exports = client;
