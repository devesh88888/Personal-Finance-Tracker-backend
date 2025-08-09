// middlewares/rateLimiter.js
const { rateLimit, ipKeyGenerator } = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

const jsonHandler = (req, res) => {
  const resetMs = Math.max(0, (req.rateLimit?.resetTime || 0) - Date.now());
  if (resetMs) res.setHeader('Retry-After', Math.ceil(resetMs / 1000));
  return res.status(429).json({
    message: req.rateLimit?.message || 'Too many requests. Please try again later.',
  });
};

// Helper: prefer user ID, fall back to proper IP handling
const byUserOrIp = (req) =>
  req.user?.id ? `user:${req.user.id}` : ipKeyGenerator(req);

// Auth routes – 5 reqs / 15 min (looser in dev)
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler,
  message: 'Too many login attempts. Please try again later.',
  keyGenerator: byUserOrIp,
});

// READs (GET) – disabled in dev, generous in prod
const transactionsReadLimiter = isDev
  ? (req, _res, next) => next()
  : rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 600,
      standardHeaders: true,
      legacyHeaders: false,
      handler: jsonHandler,
      message: 'Too many transaction reads. Please slow down.',
      keyGenerator: byUserOrIp,
    });

// WRITEs (POST/PUT/DELETE)
const transactionsWriteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler,
  message: 'Too many transaction requests. Please slow down.',
  keyGenerator: byUserOrIp,
});

// Analytics – 50 / hour (looser in dev)
const analyticsRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDev ? 1000 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler,
  message: 'Too many analytics requests. Please try again later.',
  keyGenerator: byUserOrIp,
});

module.exports = {
  authRateLimiter,
  transactionsReadLimiter,
  transactionsWriteLimiter,
  analyticsRateLimiter,
};
