// validateProductData.js
import Joi from 'joi';

const productSchema = Joi.object({
  name: Joi.string().min(3).max(100).required()
    .messages({
      'string.base': 'Name must be a string',
      'string.min': 'Name must be at least 3 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
  price: Joi.number().precision(2).positive().required()
    .messages({
      'number.base': 'Price must be a number',
      'number.positive': 'Price must be positive',
      'any.required': 'Price is required'
    }),
  type: Joi.string().max(50).required(),
  stock: Joi.number().integer().min(0).default(0),
  subtitle: Joi.string().max(255).allow(null, ''),
  description: Joi.string().max(255).allow(null, '')
});

export const validateProduct = (req, res, next) => {
  // Validate only the data fields, not the image
  const { error } = productSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errorMessages
    });
  }
  next();
};

export default { validateProduct };
