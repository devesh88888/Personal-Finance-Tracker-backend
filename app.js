const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// DB + Redis connections
require('./config/db');
require('./config/redis');
const authRoutes = require('./routes/authRoutes');


const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use('/api/auth', authRoutes);
// Test route
app.get('/', (req, res) => {
  res.json({ message: 'API is running 🚀' });
});

module.exports = app;
