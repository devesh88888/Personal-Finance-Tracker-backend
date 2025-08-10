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

// ✅ Make rate-limiter/IP detection correct behind proxies (localhost/NGINX/Render/etc.)
app.set('trust proxy', 1);

// ✅ Security Middleware
app.use(helmet());

// ✅ CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  })
);

// ✅ JSON parsing
app.use(express.json());

// ✅ Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ✅ Routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

// ✅ Health check
app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to Finance Tracking Application' });
});

module.exports = app;

