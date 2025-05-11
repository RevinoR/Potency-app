// models/transactionModel.js
import { query } from "../src/db.js";

/**
 * Create a new transaction
 * @param {Object} transactionData - Transaction data
 * @returns {Promise} - Created transaction
 */
export const createTransaction = async (transactionData) => {
  const {
    user_id,
    product_id,
    order_id,
    admin_id = null,
    // Remove payment_method and payment_id from insert since these columns don't exist
  } = transactionData;

  // SQL query modified to match actual database schema
  const q = {
    text: `INSERT INTO "Transaction" 
           (user_id, date, product_id, order_id, admin_id)
           VALUES ($1, CURRENT_DATE, $2, $3, $4)
           RETURNING *`,
    values: [user_id, product_id, order_id, admin_id],
  };

  return query(q.text, q.values);
};

/**
 * Get transactions by user ID
 * @param {number} userId - User ID
 * @returns {Promise} - User's transactions
 */
export const getTransactionsByUser = async (userId) => {
  const q = {
    text: `SELECT t.*, p.name as product_name
           FROM "Transaction" t
           LEFT JOIN "Product" p ON t.product_id = p.product_id
           WHERE t.user_id = $1
           ORDER BY t.date DESC, t.transaction_id DESC`,
    values: [userId],
  };

  return query(q.text, q.values);
};

/**
 * Get transaction by ID
 * @param {number} transactionId - Transaction ID
 * @returns {Promise} - Transaction details
 */
export const getTransactionById = async (transactionId) => {
  const q = {
    text: `SELECT t.*, p.name as product_name, o.email, o.name, o.address
           FROM "Transaction" t
           LEFT JOIN "Product" p ON t.product_id = p.product_id
           LEFT JOIN "Order" o ON t.order_id = o.order_id
           WHERE t.transaction_id = $1`,
    values: [transactionId],
  };

  return query(q.text, q.values);
};

/**
 * Get transactions by order ID
 * @param {number} orderId - Order ID
 * @returns {Promise} - Transaction details
 */
export const getTransactionsByOrderId = async (orderId) => {
  const q = {
    text: `SELECT t.*, p.name as product_name
           FROM "Transaction" t
           LEFT JOIN "Product" p ON t.product_id = p.product_id
           WHERE t.order_id = $1`,
    values: [orderId],
  };

  return query(q.text, q.values);
};

/**
 * Get all transactions for admin
 * @param {number} limit - Limit of transactions
 * @param {number} offset - Offset for pagination
 * @returns {Promise} - Transactions list
 */
export const getTransactions = async (limit = 10, offset = 0) => {
  const q = {
    text: `SELECT t.*, u.email as user_email, p.name as product_name
           FROM "Transaction" t
           LEFT JOIN "User" u ON t.user_id = u.user_id
           LEFT JOIN "Product" p ON t.product_id = p.product_id
           ORDER BY t.date DESC, t.transaction_id DESC
           LIMIT $1 OFFSET $2`,
    values: [limit, offset],
  };

  return query(q.text, q.values);
};

/**
 * Get transaction count
 * @returns {Promise} - Count of transactions
 */
export const getTransactionCount = async () => {
  const q = {
    text: `SELECT COUNT(*) FROM "Transaction"`,
  };

  return query(q.text);
};
