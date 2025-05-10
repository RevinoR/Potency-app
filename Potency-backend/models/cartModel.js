// models/cartModel.js
import { query } from "../src/db.js";

/**
 * Add an item to the cart
 * @param {number} userId - User ID
 * @param {number} productId - Product ID
 * @param {number} quantity - Quantity to add
 * @returns {Promise} - Added cart item
 */
export const addCartItem = async (userId, productId, quantity) => {
  // Check if item already exists in cart
  const existingItem = await getCartItemByUserAndProduct(userId, productId);

  if (existingItem.rows.length > 0) {
    // Update quantity if item exists
    const newQuantity = existingItem.rows[0].quantity + quantity;
    return updateCartItemQuantity(
      existingItem.rows[0].cart_item_id,
      newQuantity
    );
  }

  // Add new item if it doesn't exist
  const q = {
    text: `INSERT INTO "CartItem" (user_id, product_id, quantity, added_at)
           VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
           RETURNING *`,
    values: [userId, productId, quantity],
  };

  return query(q.text, q.values);
};

/**
 * Get cart items for a user with product details
 * @param {number} userId - User ID
 * @returns {Promise} - Cart items with product info
 */
export const getCartItems = async (userId) => {
  const q = {
    text: `SELECT ci.*, p.name, p.price, p.image, p.subtitle, p.stock
           FROM "CartItem" ci
           JOIN "Product" p ON ci.product_id = p.product_id
           WHERE ci.user_id = $1
           ORDER BY ci.added_at DESC`,
    values: [userId],
  };

  return query(q.text, q.values);
};

/**
 * Get a specific cart item by user and product
 * @param {number} userId - User ID
 * @param {number} productId - Product ID
 * @returns {Promise} - Cart item
 */
export const getCartItemByUserAndProduct = async (userId, productId) => {
  const q = {
    text: `SELECT * FROM "CartItem"
           WHERE user_id = $1 AND product_id = $2`,
    values: [userId, productId],
  };

  return query(q.text, q.values);
};

/**
 * Update cart item quantity
 * @param {number} cartItemId - Cart Item ID
 * @param {number} quantity - New quantity
 * @returns {Promise} - Updated cart item
 */
export const updateCartItemQuantity = async (cartItemId, quantity) => {
  const q = {
    text: `UPDATE "CartItem"
           SET quantity = $1
           WHERE cart_item_id = $2
           RETURNING *`,
    values: [quantity, cartItemId],
  };

  return query(q.text, q.values);
};

/**
 * Remove an item from the cart
 * @param {number} cartItemId - Cart Item ID
 * @param {number} userId - User ID (for security check)
 * @returns {Promise} - Removal result
 */
export const removeCartItem = async (cartItemId, userId) => {
  const q = {
    text: `DELETE FROM "CartItem"
           WHERE cart_item_id = $1 AND user_id = $2
           RETURNING *`,
    values: [cartItemId, userId],
  };

  return query(q.text, q.values);
};

/**
 * Clear all items from a user's cart
 * @param {number} userId - User ID
 * @returns {Promise} - Deletion result
 */
export const clearCart = async (userId) => {
  const q = {
    text: `DELETE FROM "CartItem"
           WHERE user_id = $1
           RETURNING *`,
    values: [userId],
  };

  return query(q.text, q.values);
};

/**
 * Get cart total for a user
 * @param {number} userId - User ID
 * @returns {Promise} - Cart total amount
 */
export const getCartTotal = async (userId) => {
  const q = {
    text: `SELECT SUM(p.price * ci.quantity) as total
           FROM "CartItem" ci
           JOIN "Product" p ON ci.product_id = p.product_id
           WHERE ci.user_id = $1`,
    values: [userId],
  };

  return query(q.text, q.values);
};

/**
 * Get cart item count for a user
 * @param {number} userId - User ID
 * @returns {Promise} - Number of items in cart
 */
export const getCartItemCount = async (userId) => {
  const q = {
    text: `SELECT COUNT(*) as count
           FROM "CartItem"
           WHERE user_id = $1`,
    values: [userId],
  };

  return query(q.text, q.values);
};
