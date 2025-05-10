// controller/checkoutController.js
import * as cartServices from "../services/cartServices.js";
import * as orderServices from "../services/orderServices.js";

/**
 * Validate cart for checkout
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const validateCheckout = async (req, res) => {
  try {
    const userId = req.user.id;

    const validatedCart = await cartServices.validateCartForCheckout(userId);

    res.status(200).json({
      success: true,
      data: validatedCart,
      message: "Cart is valid for checkout",
    });
  } catch (error) {
    console.error("Error in validateCheckout:", error);

    if (error.message.includes("Cart is empty")) {
      return res.status(400).json({
        success: false,
        message: "Cannot checkout with an empty cart",
      });
    }

    if (error.message.includes("Cart validation failed")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to validate cart for checkout",
    });
  }
};

/**
 * Process checkout and create order
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const processCheckout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, address, paymentMethod, paymentDetails } =
      req.body;

    // Validate required fields
    if (!name || !email || !phone || !address || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Missing required checkout information",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s-]/g, ""))) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format",
      });
    }

    // First validate the cart
    await cartServices.validateCartForCheckout(userId);

    // Process payment (simulated)
    const paymentResult = await simulatePaymentProcessing(
      paymentMethod,
      paymentDetails
    );

    if (!paymentResult.success) {
      return res.status(400).json({
        success: false,
        message: `Payment processing failed: ${paymentResult.message}`,
      });
    }

    // Create the order
    const shippingInfo = { name, email, phone, address };
    const result = await orderServices.createOrderFromCart(
      userId,
      shippingInfo,
      paymentMethod
    );

    res.status(201).json({
      success: true,
      data: {
        orders: result.orders,
        payment: result.payment,
        orderSummary: result.summary,
      },
      message: "Order placed successfully",
    });
  } catch (error) {
    console.error("Error in processCheckout:", error);

    if (error.message.includes("Cart is empty")) {
      return res.status(400).json({
        success: false,
        message: "Cannot checkout with an empty cart",
      });
    }

    if (error.message.includes("Cart validation failed")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Checkout failed",
    });
  }
};

/**
 * Simulate payment processing
 * @param {string} paymentMethod - Payment method
 * @param {Object} paymentDetails - Payment details
 * @returns {Promise<Object>} - Payment result
 */
const simulatePaymentProcessing = async (paymentMethod, paymentDetails) => {
  // In a real application, this would integrate with a payment gateway
  return new Promise((resolve) => {
    // Simulate processing delay
    setTimeout(() => {
      // Simulate a 95% success rate
      const success = Math.random() < 0.95;

      if (success) {
        resolve({
          success: true,
          transactionId:
            "TX-" + Math.random().toString(36).substring(2, 15).toUpperCase(),
          message: "Payment processed successfully",
        });
      } else {
        resolve({
          success: false,
          message: "Payment declined by processor",
        });
      }
    }, 1000);
  });
};
