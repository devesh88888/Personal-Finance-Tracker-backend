// backend/validators/transactionValidator.js
const Joi = require('joi');

const transactionSchema = Joi.object({
  title: Joi.string().min(1).required(),
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('income', 'expense').required(),
  category: Joi.string().min(1).required(),
});

module.exports = {
  transactionSchema,
};
