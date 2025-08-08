const rateLimit = require('express-rate-limit');

// Auth routes – 5 reqs per 15 min
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again later.',
});

// Transactions – 100 per hour
const transactionRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: 'Too many transaction requests. Please slow down.',
});

// Analytics – 50 per hour
const analyticsRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: 'Too many analytics requests. Please try again later.',
});

module.exports = {
  authRateLimiter,
  transactionRateLimiter,
  analyticsRateLimiter,
};
