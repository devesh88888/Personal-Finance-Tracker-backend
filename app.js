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

// ✅ CORS Config (for frontend origin)
app.use(cors()); // Allows all origins (good for dev, not for production)


// ✅ Parse JSON
app.use(express.json());

// ✅ Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));



// ✅ Routes
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');



app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);


app.get('/', (req, res) => {
  res.json({ message: 'API is running 🚀' });
});

module.exports = app;
