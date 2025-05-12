// controller/checkoutController.js
import * as cartServices from "../services/cartServices.js";
import * as orderServices from "../services/orderServices.js";
import { query } from "../src/db.js";

/**
 * Validate cart for checkout with improved error handling
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const validateCheckout = async (req, res) => {
  try {
    const userId = req.user.id;

    const validatedCart = await cartServices.validateCartForCheckout(userId);

    // Return any stock warnings (items with low stock)
    const stockWarnings = validatedCart.items
      .filter((item) => item.stock < 10)
      .map((item) => ({
        productId: item.product_id,
        name: item.name,
        available: item.stock,
        requested: item.quantity,
      }));

    res.status(200).json({
      success: true,
      data: validatedCart,
      stockWarnings: stockWarnings.length > 0 ? stockWarnings : null,
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
        invalidItems: error.invalidItems || [],
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to validate cart for checkout",
    });
  }
};

/**
 * Process checkout and create order with improved transaction handling
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const processCheckout = async (req, res) => {
  // Begin global transaction
  const client = await query("BEGIN");

  try {
    const userId = req.user.id;
    const { name, email, phone, address, paymentMethod, paymentDetails } =
      req.body;

    // Validate required fields
    if (!name || !email || !phone || !address || !paymentMethod) {
      await query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Missing required checkout information",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^\+?[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s-]/g, ""))) {
      await query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Invalid phone number format",
      });
    }

    // First validate the cart one more time (ensure stock hasn't changed)
    try {
      await cartServices.validateCartForCheckout(userId);
    } catch (cartError) {
      // If validation fails, rollback and return immediately
      await query("ROLLBACK");
      console.error("Cart validation error during checkout:", cartError);

      return res.status(400).json({
        success: false,
        message: cartError.message,
        invalidItems: cartError.invalidItems || [],
      });
    }

    // Process payment (simulated)
    const paymentResult = await simulatePaymentProcessing(
      paymentMethod,
      paymentDetails
    );

    if (!paymentResult.success) {
      await query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: `Payment processing failed: ${paymentResult.message}`,
      });
    }

    // Create the order
    const shippingInfo = { name, email, phone, address };

    // Add payment ID from the processed payment
    const result = await orderServices.createOrderFromCart(
      userId,
      shippingInfo,
      paymentMethod,
      paymentResult.transactionId
    );

    // Orders were created successfully, clear the cart
    await cartServices.clearCart(userId);

    // Everything succeeded, commit the transaction
    await query("COMMIT");

    res.status(201).json({
      success: true,
      data: {
        orders: result.orders,
        payment: {
          ...result.payment,
          transactionId: paymentResult.transactionId,
        },
        orderSummary: result.summary,
      },
      message: "Order placed successfully",
    });
  } catch (error) {
    // Rollback transaction on any error
    await query("ROLLBACK");
    console.error("Error in processCheckout:", error);

    // Send more specific error messages based on error type
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
        invalidItems: error.invalidItems || [],
      });
    }

    if (error.message.includes("Transaction")) {
      return res.status(500).json({
        success: false,
        message:
          "An error occurred during transaction processing. Please try again.",
      });
    }

    if (error.message.includes("Inventory")) {
      return res.status(400).json({
        success: false,
        message:
          "Inventory has changed. Some items are no longer available in the requested quantity.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Checkout failed",
    });
  }
};

/**
 * Simulate payment processing with more realistic behavior and improved error handling
 * @param {string} paymentMethod - Payment method
 * @param {Object} paymentDetails - Payment details
 * @returns {Promise<Object>} - Payment result
 */
const simulatePaymentProcessing = async (paymentMethod, paymentDetails) => {
  // In a real application, this would integrate with a payment gateway
  return new Promise((resolve) => {
    // Simulate processing delay (more realistic timing)
    const processingTime = 1000 + Math.random() * 1500; // 1-2.5 seconds

    setTimeout(() => {
      // Basic validation for different payment methods
      let validationError = null;

      if (paymentMethod === "credit_card") {
        if (
          !paymentDetails?.cardNumber ||
          !paymentDetails?.cardHolderName ||
          !paymentDetails?.expiryMonth ||
          !paymentDetails?.expiryYear ||
          !paymentDetails?.cvv
        ) {
          validationError = "Missing required credit card details";
        } else if (
          !/^[0-9]{13,19}$/.test(paymentDetails.cardNumber.replace(/\s/g, ""))
        ) {
          validationError = "Invalid card number format";
        } else if (!/^[0-9]{3,4}$/.test(paymentDetails.cvv)) {
          validationError = "Invalid CVV format";
        }
      } else if (paymentMethod === "paypal" && !paymentDetails?.email) {
        validationError = "Missing PayPal email";
      } else if (
        paymentMethod === "bank_transfer" &&
        (!paymentDetails?.accountName ||
          !paymentDetails?.accountNumber ||
          !paymentDetails?.bankName)
      ) {
        validationError = "Missing bank transfer details";
      }

      if (validationError) {
        resolve({
          success: false,
          message: validationError,
        });
        return;
      }

      // Simulate a 95% success rate
      const success = Math.random() < 0.95;

      if (success) {
        // Generate a more realistic transaction ID
        const getRandomDigits = (length) =>
          Math.random()
            .toString()
            .substring(2, 2 + length);
        const now = new Date();
        const transactionId = `TX${now.getFullYear()}${String(
          now.getMonth() + 1
        ).padStart(2, "0")}${getRandomDigits(10)}`;

        resolve({
          success: true,
          transactionId,
          message: "Payment processed successfully",
        });
      } else {
        // Provide more specific error messages
        const errorTypes = [
          "Payment declined by processor",
          "Insufficient funds",
          "Card verification failed",
          "Card expired",
          "Payment rejected due to security checks",
        ];
        const errorMessage =
          errorTypes[Math.floor(Math.random() * errorTypes.length)];

        resolve({
          success: false,
          message: errorMessage,
        });
      }
    }, processingTime);
  });
};
