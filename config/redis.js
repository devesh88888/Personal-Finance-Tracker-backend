// backend/config/redis.js
const { createClient } = require('redis');

const client = createClient({
  url: process.env.REDIS_URL, // e.g. rediss://default:<password>@host.upstash.io:6379
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 2000), // retry with backoff
  },
});

client.on('connect', () => console.log('🟢 Connected to Redis'));
client.on('error', (err) => console.error('🔴 Redis error', err));

(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error('🔴 Redis connection error', err);
  }
})();

module.exports = client;
