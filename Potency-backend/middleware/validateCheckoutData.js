// middleware/validateCheckoutData.js
import Joi from "joi";

// Validation schema for checkout data
const checkoutSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.base": "Name must be a string",
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name cannot exceed 100 characters",
    "any.required": "Name is required",
  }),
  email: Joi.string().email().required().messages({
    "string.base": "Email must be a string",
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),
  phone: Joi.string()
    .pattern(/^\+?[0-9\s-]{10,15}$/)
    .required()
    .messages({
      "string.base": "Phone must be a string",
      "string.pattern.base": "Please provide a valid phone number",
      "any.required": "Phone number is required",
    }),
  address: Joi.string().min(10).max(255).required().messages({
    "string.base": "Address must be a string",
    "string.min": "Address must be at least 10 characters long",
    "string.max": "Address cannot exceed 255 characters",
    "any.required": "Address is required",
  }),
  paymentMethod: Joi.string()
    .valid("credit_card", "paypal", "bank_transfer", "cod")
    .required()
    .messages({
      "string.base": "Payment method must be a string",
      "any.only":
        "Payment method must be one of credit_card, paypal, bank_transfer, or cod",
      "any.required": "Payment method is required",
    }),
  paymentDetails: Joi.object().when("paymentMethod", {
    switch: [
      {
        is: "credit_card",
        then: Joi.object({
          cardNumber: Joi.string()
            .pattern(/^[0-9]{13,19}$/)
            .required(),
          cardHolderName: Joi.string().required(),
          expiryMonth: Joi.number().integer().min(1).max(12).required(),
          expiryYear: Joi.number()
            .integer()
            .min(new Date().getFullYear() % 100)
            .required(),
          cvv: Joi.string()
            .pattern(/^[0-9]{3,4}$/)
            .required(),
        }).required(),
      },
      {
        is: "paypal",
        then: Joi.object({
          email: Joi.string().email().required(),
        }).required(),
      },
      {
        is: "bank_transfer",
        then: Joi.object({
          accountName: Joi.string().required(),
          accountNumber: Joi.string().required(),
          bankName: Joi.string().required(),
        }).required(),
      },
      {
        is: "cod",
        then: Joi.object({}).optional(),
      },
    ],
    otherwise: Joi.forbidden(),
  }),
});

// Middleware to validate checkout data
export const validateCheckoutData = (req, res, next) => {
  const { error } = checkoutSchema.validate(req.body, { abortEarly: false });

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
