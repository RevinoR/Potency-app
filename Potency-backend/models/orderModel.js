// models/orderModel.js
import { query } from "../src/db.js";

/**
 * Create a new order
 * @param {Object} orderData - Order data
 * @returns {Promise} - Created order
 */
export const createOrder = async (orderData) => {
  const {
    user_id,
    email,
    name,
    phone_number,
    product,
    address,
    quantity,
    price,
    product_id,
    status = "pending",
  } = orderData;

  const q = {
    text: `INSERT INTO "Order" 
           (user_id, email, name, phone_number, date, product, address, quantity, price, product_id, status)
           VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, $7, $8, $9, $10)
           RETURNING *`,
    values: [
      user_id,
      email,
      name,
      phone_number,
      product,
      address,
      quantity,
      price,
      product_id,
      status,
    ],
  };

  return query(q.text, q.values);
};

/**
 * Get orders by user ID
 * @param {number} userId - User ID
 * @returns {Promise} - User's orders
 */
export const getOrdersByUser = async (userId) => {
  const q = {
    text: `SELECT o.*, p.name as product_name, p.image, p.subtitle
           FROM "Order" o
           LEFT JOIN "Product" p ON o.product_id = p.product_id
           WHERE o.user_id = $1
           ORDER BY o.date DESC, o.order_id DESC`,
    values: [userId],
  };

  return query(q.text, q.values);
};

/**
 * Get order by ID
 * @param {number} orderId - Order ID
 * @returns {Promise} - Order details
 */
export const getOrderById = async (orderId) => {
  const q = {
    text: `SELECT o.*, p.name as product_name, p.image, p.subtitle
           FROM "Order" o
           LEFT JOIN "Product" p ON o.product_id = p.product_id
           WHERE o.order_id = $1`,
    values: [orderId],
  };

  return query(q.text, q.values);
};

/**
 * Update order status
 * @param {number} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise} - Updated order
 */
export const updateOrderStatus = async (orderId, status) => {
  const q = {
    text: `UPDATE "Order"
           SET status = $1
           WHERE order_id = $2
           RETURNING *`,
    values: [status, orderId],
  };

  return query(q.text, q.values);
};

/**
 * Get orders for admin dashboard
 * @param {number} limit - Limit of orders
 * @param {number} offset - Offset for pagination
 * @returns {Promise} - Orders list
 */
export const getOrders = async (limit = 10, offset = 0) => {
  const q = {
    text: `SELECT o.*, u.email as user_email, p.name as product_name
           FROM "Order" o
           LEFT JOIN "User" u ON o.user_id = u.user_id
           LEFT JOIN "Product" p ON o.product_id = p.product_id
           ORDER BY o.date DESC, o.order_id DESC
           LIMIT $1 OFFSET $2`,
    values: [limit, offset],
  };

  return query(q.text, q.values);
};

/**
 * Get order count
 * @returns {Promise} - Order count
 */
export const getOrderCount = async () => {
  const q = {
    text: `SELECT COUNT(*) FROM "Order"`,
  };

  return query(q.text);
};

/**
 * Get orders by status
 * @param {string} status - Order status
 * @param {number} limit - Limit of orders
 * @param {number} offset - Offset for pagination
 * @returns {Promise} - Orders with specified status
 */
export const getOrdersByStatus = async (status, limit = 10, offset = 0) => {
  const q = {
    text: `SELECT o.*, u.email as user_email, p.name as product_name
           FROM "Order" o
           LEFT JOIN "User" u ON o.user_id = u.user_id
           LEFT JOIN "Product" p ON o.product_id = p.product_id
           WHERE o.status = $1
           ORDER BY o.date DESC, o.order_id DESC
           LIMIT $2 OFFSET $3`,
    values: [status, limit, offset],
  };

  return query(q.text, q.values);
};
