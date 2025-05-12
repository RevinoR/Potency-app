// controller/cartController.js
import * as cartServices from "../services/cartServices.js";

/**
 * Get cart contents
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cart = await cartServices.getCart(userId);

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Error in getCart:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve cart",
    });
  }
};

/**
 * Add item to cart
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // Input validation
    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required",
      });
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be greater than zero",
      });
    }

    const cartItem = await cartServices.addToCart(
      userId,
      productId,
      parseInt(quantity)
    );

    // Get updated cart after adding item
    const cart = await cartServices.getCart(userId);

    res.status(201).json({
      success: true,
      data: {
        addedItem: cartItem,
        cart: cart,
      },
      message: "Item added to cart",
    });
  } catch (error) {
    console.error("Error in addToCart:", error);

    if (error.message.includes("Not enough stock")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("Product not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to add item to cart",
    });
  }
};

/**
 * Update cart item quantity
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = req.params.id;
    const { quantity } = req.body;

    // Input validation
    if (quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "Quantity is required",
      });
    }

    const parsedQuantity = parseInt(quantity);

    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a non-negative number",
      });
    }

    // If quantity is 0, remove the item from cart
    if (parsedQuantity === 0) {
      await cartServices.removeFromCart(userId, cartItemId);

      // Get updated cart after removing item
      const updatedCart = await cartServices.getCart(userId);

      return res.status(200).json({
        success: true,
        data: updatedCart,
        message: "Item removed from cart",
      });
    }

    await cartServices.updateCartItem(userId, cartItemId, parsedQuantity);

    // Get updated cart after updating item
    const updatedCart = await cartServices.getCart(userId);

    res.status(200).json({
      success: true,
      data: updatedCart,
      message: "Cart item updated",
    });
  } catch (error) {
    console.error("Error in updateCartItem:", error);

    if (error.message.includes("Not enough stock")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update cart item",
    });
  }
};

/**
 * Remove item from cart
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItemId = req.params.id;

    await cartServices.removeFromCart(userId, cartItemId);

    // Get updated cart after removing item
    const updatedCart = await cartServices.getCart(userId);

    res.status(200).json({
      success: true,
      data: updatedCart,
      message: "Item removed from cart",
    });
  } catch (error) {
    console.error("Error in removeFromCart:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to remove item from cart",
    });
  }
};

/**
 * Clear cart
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await cartServices.clearCart(userId);

    res.status(200).json({
      success: true,
      data: {
        items: [],
        summary: { subtotal: 0, tax: 0, total: 0, itemCount: 0 },
      },
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Error in clearCart:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to clear cart",
    });
  }
};
