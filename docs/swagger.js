// backend/docs/swagger.js
const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Personal Finance Tracker API',
      version: '1.0.0',
      description: 'Track income and expenses with secure authentication and role-based access',
    },
    servers: [
      {
        url: 'http://localhost:5050', // ✅ Match your backend port
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // ✅ This must point to your actual route files!
  apis: ['./routes/*.js', './controllers/*.js'], // ← ADD THIS if your JSDocs are in controllers!
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
