// middleware/validateCartData.js
import Joi from "joi";

// Validation schema for adding items to cart
const cartItemSchema = Joi.object({
  productId: Joi.number().integer().positive().required().messages({
    "number.base": "Product ID must be a number",
    "number.integer": "Product ID must be an integer",
    "number.positive": "Product ID must be positive",
    "any.required": "Product ID is required",
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity must be at least 1",
    "any.required": "Quantity is required",
  }),
});

// Middleware to validate cart item data
export const validateCartItem = (req, res, next) => {
  const { error } = cartItemSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: errorMessages,
    });
  }

  next();
};

// Validation schema for updating cart items
const updateCartSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required().messages({
    "number.base": "Quantity must be a number",
    "number.integer": "Quantity must be an integer",
    "number.min": "Quantity cannot be negative",
    "any.required": "Quantity is required",
  }),
});

// Middleware to validate cart update data
export const validateCartUpdate = (req, res, next) => {
  const { error } = updateCartSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: errorMessages,
    });
  }

  next();
};
