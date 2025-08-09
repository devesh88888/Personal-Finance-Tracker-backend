// backend/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

require('dotenv').config();

// ✅ Initialize DB and Redis
require('./config/db');
require('./config/redis');

const app = express();

// ✅ Security Middleware
app.use(helmet());

// ✅ CORS Config
// For dev you can allow all. For prod, set FRONTEND_URL in env and restrict.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  })
);

// ✅ Parse JSON
app.use(express.json());

// ✅ Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ Routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes'); // 👈 NEW (admin only)

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes); // 👈 NEW

// ✅ Health check
app.get('/', (_req, res) => {
  res.json({ message: 'API is running 🚀' });
});

module.exports = app;
