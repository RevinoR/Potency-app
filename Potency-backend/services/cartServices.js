// services/cartServices.js
import * as cartModel from "../models/cartModel.js";
import * as productModel from "../models/productModel.js";

/**
 * Add a product to the cart
 * @param {number} userId - User ID
 * @param {number} productId - Product ID
 * @param {number} quantity - Quantity to add
 * @returns {Promise} - Updated cart
 */
export const addToCart = async (userId, productId, quantity) => {
  try {
    // Check if product exists and has enough stock
    const { rows: products } = await productModel.getProductById(productId);

    if (products.length === 0) {
      throw new Error("Product not found");
    }

    const product = products[0];

    if (product.stock < quantity) {
      throw new Error(
        `Not enough stock available. Only ${product.stock} items left.`
      );
    }

    // Get existing cart item if any
    const { rows: cartItems } = await cartModel.getCartItemByUserAndProduct(
      userId,
      productId
    );

    // Calculate new total quantity
    const existingQuantity = cartItems.length > 0 ? cartItems[0].quantity : 0;
    const newTotalQuantity = existingQuantity + quantity;

    // Recheck stock availability with total quantity
    if (product.stock < newTotalQuantity) {
      throw new Error(
        `Not enough stock available. Only ${product.stock} items left (you already have ${existingQuantity} in your cart).`
      );
    }

    // Add to cart
    const result = await cartModel.addCartItem(userId, productId, quantity);
    return result.rows[0];
  } catch (error) {
    throw new Error(`CartService.addToCart: ${error.message}`);
  }
};

/**
 * Get user's cart items with product details
 * @param {number} userId - User ID
 * @returns {Promise} - Cart items with details
 */
export const getCart = async (userId) => {
  try {
    const { rows: cartItems } = await cartModel.getCartItems(userId);

    // Calculate totals
    let subtotal = 0;
    cartItems.forEach((item) => {
      item.total = item.price * item.quantity;
      subtotal += item.total;
    });

    // Assuming tax rate of 10%
    const taxRate = 0.1;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return {
      items: cartItems,
      summary: {
        subtotal,
        tax,
        total,
        itemCount: cartItems.length,
      },
    };
  } catch (error) {
    throw new Error(`CartService.getCart: ${error.message}`);
  }
};

/**
 * Update cart item quantity
 * @param {number} userId - User ID
 * @param {number} cartItemId - Cart Item ID
 * @param {number} quantity - New quantity
 * @returns {Promise} - Updated cart item
 */
export const updateCartItem = async (userId, cartItemId, quantity) => {
  try {
    // First, get the cart item to verify ownership and get product details
    const { rows: cartItems } = await cartModel.getCartItems(userId);
    const cartItem = cartItems.find(
      (item) => item.cart_item_id === parseInt(cartItemId)
    );

    if (!cartItem) {
      throw new Error("Cart item not found or does not belong to user");
    }

    // Check stock availability
    const { rows: products } = await productModel.getProductById(
      cartItem.product_id
    );

    if (products.length === 0) {
      throw new Error("Product not found");
    }

    const product = products[0];

    if (product.stock < quantity) {
      throw new Error(
        `Not enough stock available. Only ${product.stock} items left.`
      );
    }

    // Update quantity
    const result = await cartModel.updateCartItemQuantity(cartItemId, quantity);
    return result.rows[0];
  } catch (error) {
    throw new Error(`CartService.updateCartItem: ${error.message}`);
  }
};

/**
 * Remove an item from the cart
 * @param {number} userId - User ID
 * @param {number} cartItemId - Cart Item ID
 * @returns {Promise} - Removed cart item
 */
export const removeFromCart = async (userId, cartItemId) => {
  try {
    const result = await cartModel.removeCartItem(cartItemId, userId);

    if (result.rows.length === 0) {
      throw new Error("Cart item not found or does not belong to user");
    }

    return result.rows[0];
  } catch (error) {
    throw new Error(`CartService.removeFromCart: ${error.message}`);
  }
};

/**
 * Clear all items from a user's cart
 * @param {number} userId - User ID
 * @returns {Promise} - Result of clearing cart
 */
export const clearCart = async (userId) => {
  try {
    const result = await cartModel.clearCart(userId);
    return result.rows;
  } catch (error) {
    throw new Error(`CartService.clearCart: ${error.message}`);
  }
};

/**
 * Validate cart for checkout
 * @param {number} userId - User ID
 * @returns {Promise} - Validated cart data or error
 */
export const validateCartForCheckout = async (userId) => {
  try {
    const { items, summary } = await getCart(userId);

    if (items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Check stock for each item
    const stockIssues = [];
    const invalidItems = [];

    for (const item of items) {
      const { rows: products } = await productModel.getProductById(
        item.product_id
      );

      if (products.length === 0) {
        const issue = `Product "${item.name}" is no longer available`;
        stockIssues.push(issue);
        invalidItems.push({
          productId: item.product_id,
          name: item.name,
          issue: "no_longer_available",
          message: issue,
        });
        continue;
      }

      const product = products[0];

      if (product.stock < item.quantity) {
        const issue = `Not enough stock for "${item.name}". Available: ${product.stock}, Requested: ${item.quantity}`;
        stockIssues.push(issue);
        invalidItems.push({
          productId: item.product_id,
          name: item.name,
          issue: "insufficient_stock",
          available: product.stock,
          requested: item.quantity,
          message: issue,
        });
      }

      // Check if price has changed
      if (product.price !== item.price) {
        const issue = `Price for "${item.name}" has changed from ${item.price} to ${product.price}`;
        stockIssues.push(issue);
        invalidItems.push({
          productId: item.product_id,
          name: item.name,
          issue: "price_changed",
          oldPrice: item.price,
          newPrice: product.price,
          message: issue,
        });
      }
    }

    if (stockIssues.length > 0) {
      const error = new Error(
        `Cart validation failed: ${stockIssues.join("; ")}`
      );
      error.invalidItems = invalidItems;
      throw error;
    }

    return { items, summary };
  } catch (error) {
    // Pass along any custom error properties
    if (error.invalidItems) {
      throw error;
    }
    throw new Error(`CartService.validateCartForCheckout: ${error.message}`);
  }
};
