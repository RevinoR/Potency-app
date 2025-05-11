// services/cartServices.js
import * as cartModel from "../models/cartModel.js";
import * as productModel from "../models/productModel.js";
import { query } from "../src/db.js";

/**
 * Add a product to the cart with improved transaction handling
 * @param {number} userId - User ID
 * @param {number} productId - Product ID
 * @param {number} quantity - Quantity to add
 * @returns {Promise} - Updated cart
 */
export const addToCart = async (userId, productId, quantity) => {
  // Begin transaction to ensure consistency
  const client = await query("BEGIN");

  try {
    // Check if product exists and has enough stock with FOR UPDATE to lock the row
    const { rows: products } = await query(
      'SELECT * FROM "Product" WHERE product_id = $1 FOR UPDATE',
      [productId]
    );

    if (products.length === 0) {
      await query("ROLLBACK");
      throw new Error("Product not found");
    }

    const product = products[0];

    // Get existing cart item if any
    const { rows: cartItems } = await cartModel.getCartItemByUserAndProduct(
      userId,
      productId
    );

    // Calculate new total quantity
    const existingQuantity = cartItems.length > 0 ? cartItems[0].quantity : 0;
    const newTotalQuantity = existingQuantity + quantity;

    // Validate stock availability
    if (product.stock < newTotalQuantity) {
      await query("ROLLBACK");
      throw new Error(
        `Not enough stock available. Only ${product.stock} items left (you already have ${existingQuantity} in your cart).`
      );
    }

    // Add to cart
    const result = await cartModel.addCartItem(userId, productId, quantity);

    // Commit transaction
    await query("COMMIT");

    return result.rows[0];
  } catch (error) {
    // Rollback transaction on any error
    await query("ROLLBACK");
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
    let itemCount = 0;

    cartItems.forEach((item) => {
      // Ensure valid quantity and price
      const quantity = parseInt(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;

      item.total = price * quantity;
      subtotal += item.total;
      itemCount += quantity;
    });

    // Calculate tax (10%)
    const taxRate = 0.1;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return {
      items: cartItems,
      summary: {
        subtotal,
        tax,
        total,
        itemCount,
      },
    };
  } catch (error) {
    throw new Error(`CartService.getCart: ${error.message}`);
  }
};

/**
 * Update cart item quantity with transaction
 * @param {number} userId - User ID
 * @param {number} cartItemId - Cart Item ID
 * @param {number} quantity - New quantity
 * @returns {Promise} - Updated cart item
 */
export const updateCartItem = async (userId, cartItemId, quantity) => {
  // Begin transaction
  const client = await query("BEGIN");

  try {
    // First, get the cart item to verify ownership and get product details
    const { rows: cartItems } = await cartModel.getCartItems(userId);
    const cartItem = cartItems.find(
      (item) => item.cart_item_id === parseInt(cartItemId)
    );

    if (!cartItem) {
      await query("ROLLBACK");
      throw new Error("Cart item not found or does not belong to user");
    }

    // Check stock availability with row locking
    const { rows: products } = await query(
      'SELECT * FROM "Product" WHERE product_id = $1 FOR UPDATE',
      [cartItem.product_id]
    );

    if (products.length === 0) {
      await query("ROLLBACK");
      throw new Error("Product not found");
    }

    const product = products[0];

    // Validate stock
    if (product.stock < quantity) {
      await query("ROLLBACK");
      throw new Error(
        `Not enough stock available. Only ${product.stock} items left.`
      );
    }

    // Update quantity
    const result = await cartModel.updateCartItemQuantity(cartItemId, quantity);

    // Commit transaction
    await query("COMMIT");

    return result.rows[0];
  } catch (error) {
    // Rollback transaction on any error
    await query("ROLLBACK");
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
 * Validate cart for checkout with enhanced validation
 * @param {number} userId - User ID
 * @returns {Promise} - Validated cart data or error
 */
export const validateCartForCheckout = async (userId) => {
  // Begin transaction to ensure consistent reads
  const client = await query("BEGIN");

  try {
    // Get cart with current items
    const { rows: cartItems } = await cartModel.getCartItems(userId);

    if (cartItems.length === 0) {
      await query("ROLLBACK");
      throw new Error("Cart is empty");
    }

    // Check stock and price for each item with row locking
    const stockIssues = [];
    const invalidItems = [];
    let subtotal = 0;

    for (const item of cartItems) {
      // Lock the product row to ensure consistent validation
      const { rows: products } = await query(
        'SELECT * FROM "Product" WHERE product_id = $1 FOR UPDATE',
        [item.product_id]
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

      // Check stock availability
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
      if (parseFloat(product.price) !== parseFloat(item.price)) {
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

      // Calculate subtotal with current item price
      subtotal += item.price * item.quantity;
    }

    if (stockIssues.length > 0) {
      await query("ROLLBACK");
      const error = new Error(
        `Cart validation failed: ${stockIssues.join("; ")}`
      );
      error.invalidItems = invalidItems;
      throw error;
    }

    // Calculate summary with validated prices
    const taxRate = 0.1;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    const summary = {
      subtotal,
      tax,
      total,
      itemCount: cartItems.length,
    };

    // Commit transaction
    await query("COMMIT");

    return { items: cartItems, summary };
  } catch (error) {
    // Rollback transaction on any error
    await query("ROLLBACK");

    // Pass along any custom error properties
    if (error.invalidItems) {
      throw error;
    }
    throw new Error(`CartService.validateCartForCheckout: ${error.message}`);
  }
};
