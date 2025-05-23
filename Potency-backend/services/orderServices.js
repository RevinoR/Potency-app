// services/orderServices.js
import * as orderModel from "../models/orderModel.js";
import * as transactionModel from "../models/transactionModel.js";
import * as productModel from "../models/productModel.js";
import * as cartServices from "./cartServices.js";
import * as cartModel from "../models/cartModel.js";
import { query } from "../src/db.js";

/**
 * Create a new order from cart items with improved transaction handling
 * @param {number} userId - User ID
 * @param {Object} shippingInfo - Shipping information
 * @param {string} paymentMethod - Payment method
 * @param {string} paymentId - Payment transaction ID
 * @returns {Promise} - Created order details
 */
export const createOrderFromCart = async (
  userId,
  shippingInfo,
  paymentMethod,
  paymentId = null
) => {
  // Transaction is now handled at the controller level
  try {
    // Validate cart before proceeding - this is done with transaction in the controller
    const { items, summary } = await cartServices.validateCartForCheckout(
      userId
    );

    if (items.length === 0) {
      throw new Error("Cart is empty");
    }

    const orders = [];
    const transactions = [];

    // Process each cart item as a separate order entry
    for (const item of items) {
      // Lock the product for update to prevent concurrent modifications
      const { rows: products } = await query(
        'SELECT * FROM "Product" WHERE product_id = $1 FOR UPDATE',
        [item.product_id]
      );

      if (products.length === 0) {
        throw new Error(`Product "${item.name}" is no longer available`);
      }

      const product = products[0];

      // Final stock check
      if (product.stock < item.quantity) {
        throw new Error(
          `Inventory error: Not enough stock for "${item.name}". Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }

      // 1. Create order record
      const orderData = {
        user_id: userId,
        email: shippingInfo.email,
        name: shippingInfo.name,
        phone_number: shippingInfo.phone,
        product: item.name,
        address: shippingInfo.address,
        quantity: item.quantity,
        price: item.price * item.quantity, // total price for this item
        product_id: item.product_id,
        status: "pending",
      };

      const orderResult = await orderModel.createOrder(orderData);
      const order = orderResult.rows[0];
      orders.push(order);

      // 2. Create transaction record - MODIFIED to remove payment_method and payment_id
      const transactionData = {
        user_id: userId,
        product_id: item.product_id,
        order_id: order.order_id,
        // Remove payment_method and payment_id from the transaction data
        // since these columns don't exist in the database
      };

      const transactionResult = await transactionModel.createTransaction(
        transactionData
      );
      transactions.push(transactionResult.rows[0]);

      // 3. Update product stock - using the latest product data to prevent race conditions
      await productModel.updateProductStock(
        item.product_id,
        product.stock - item.quantity
      );

      // 4. Increment sold count
      await productModel.incrementSoldCount(item.product_id, item.quantity);
    }

    // Note: Cart clearing is now done in the controller after successful transaction

    return {
      orders,
      transactions,
      summary,
      payment: {
        method: paymentMethod,
        id: paymentId,
        total: summary.total,
        date: new Date(),
      },
    };
  } catch (error) {
    // Add prefix to distinguish between different types of errors
    if (error.message.includes("Inventory")) {
      throw new Error(`Inventory: ${error.message}`);
    } else if (error.message.includes("Transaction")) {
      throw new Error(`Transaction: ${error.message}`);
    } else {
      throw new Error(`OrderService.createOrderFromCart: ${error.message}`);
    }
  }
};

/**
 * Get orders for a user
 * @param {number} userId - User ID
 * @returns {Promise} - User's orders
 */
export const getUserOrders = async (userId) => {
  try {
    const { rows } = await orderModel.getOrdersByUser(userId);
    return rows;
  } catch (error) {
    throw new Error(`OrderService.getUserOrders: ${error.message}`);
  }
};

/**
 * Get order details with improved access control
 * @param {number} orderId - Order ID
 * @param {number} userId - User ID (for security check)
 * @returns {Promise} - Order details
 */
export const getOrderDetails = async (orderId, userId) => {
  try {
    const { rows } = await orderModel.getOrderById(orderId);

    if (rows.length === 0) {
      throw new Error("Order not found");
    }

    const order = rows[0];

    // Security check: ensure the order belongs to the user
    // Skip this check for admin users
    if (order.user_id !== userId) {
      // Check if the user is an admin
      const { rows: adminCheck } = await query(
        'SELECT role FROM "User" WHERE user_id = $1',
        [userId]
      );

      if (adminCheck.length === 0 || adminCheck[0].role !== "admin") {
        throw new Error("Unauthorized access to order");
      }
    }

    // Get transaction details for this order
    const { rows: transactions } =
      await transactionModel.getTransactionsByOrderId(orderId);

    return {
      order,
      transactions,
    };
  } catch (error) {
    throw new Error(`OrderService.getOrderDetails: ${error.message}`);
  }
};

/**
 * Update order status (admin only) with improved transaction handling
 * @param {number} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise} - Updated order
 */
export const updateOrderStatus = async (orderId, status) => {
  // Start a transaction to ensure stock updates are atomic
  const client = await query("BEGIN");

  try {
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      await query("ROLLBACK");
      throw new Error(
        `Invalid order status. Valid statuses are: ${validStatuses.join(", ")}`
      );
    }

    // Get the current order to check its current status
    const { rows: currentOrderRows } = await orderModel.getOrderById(orderId);

    if (currentOrderRows.length === 0) {
      await query("ROLLBACK");
      throw new Error("Order not found");
    }

    const currentOrder = currentOrderRows[0];
    const currentStatus = currentOrder.status;

    // Don't allow status change if already cancelled or delivered (terminal states)
    if (currentStatus === "cancelled" && status !== "cancelled") {
      await query("ROLLBACK");
      throw new Error("Cannot change status of a cancelled order");
    }

    if (currentStatus === "delivered" && status !== "delivered") {
      await query("ROLLBACK");
      throw new Error("Cannot change status of a delivered order");
    }

    // Update the order status
    const { rows } = await orderModel.updateOrderStatus(orderId, status);

    if (rows.length === 0) {
      await query("ROLLBACK");
      throw new Error("Order not found");
    }

    const order = rows[0];

    // If order is cancelled, return items to inventory
    if (status === "cancelled" && currentStatus !== "cancelled") {
      // Lock the product row for update
      const { rows: products } = await query(
        'SELECT * FROM "Product" WHERE product_id = $1 FOR UPDATE',
        [order.product_id]
      );

      if (products.length > 0) {
        const product = products[0];
        // Increase stock
        await productModel.updateProductStock(
          order.product_id,
          product.stock + order.quantity
        );
        // Decrease sold count
        await productModel.incrementSoldCount(
          order.product_id,
          -order.quantity
        );
      }
    }

    // Commit the transaction
    await query("COMMIT");

    return order;
  } catch (error) {
    // Rollback the transaction if any operation fails
    await query("ROLLBACK");
    throw new Error(`OrderService.updateOrderStatus: ${error.message}`);
  }
};

/**
 * Get all orders for admin with improved pagination and filtering
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.status - Filter by status
 * @param {string} options.search - Search term
 * @param {string} options.sortBy - Sort field
 * @param {string} options.sortOrder - Sort order (ASC/DESC)
 * @returns {Promise} - Orders with pagination info
 */
export const getAllOrders = async ({
  page = 1,
  limit = 10,
  status,
  search,
  sortBy = "date",
  sortOrder = "DESC",
} = {}) => {
  try {
    const offset = (page - 1) * limit;

    // Build the where clause
    let whereClause = "";
    const params = [];
    let paramCount = 0;

    if (status && status !== "all") {
      paramCount++;
      whereClause += `WHERE status = $${paramCount}`;
      params.push(status);
    }

    if (search) {
      paramCount++;
      const searchCondition = `WHERE (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR product ILIKE $${paramCount} OR order_id::text ILIKE $${paramCount})`;
      whereClause = whereClause
        ? `${whereClause} AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR product ILIKE $${paramCount} OR order_id::text ILIKE $${paramCount})`
        : searchCondition;
      params.push(`%${search}%`);
    }

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as count FROM "Order" ${whereClause}`;
    const { rows: countResult } = await query(countQuery, params);
    const totalOrders = parseInt(countResult[0].count);

    // Add limit and offset to params
    paramCount++;
    params.push(limit);
    paramCount++;
    params.push(offset);

    // Get orders with pagination
    const ordersQuery = `
      SELECT 
        order_id,
        name,
        email,
        phone_number,
        product,
        price,
        quantity,
        status,
        date,
        address,
        user_id,
        product_id
      FROM "Order"
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT $${paramCount - 1} OFFSET $${paramCount}
    `;

    const { rows: orders } = await query(ordersQuery, params);

    return {
      orders,
      pagination: {
        total: totalOrders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
        limit,
      },
    };
  } catch (error) {
    throw new Error(`OrderService.getAllOrders: ${error.message}`);
  }
};

/**
 * Get orders by status with improved validation
 * @param {string} status - Order status
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise} - Orders with pagination info
 */
export const getOrdersByStatus = async (status, page = 1, limit = 10) => {
  try {
    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      throw new Error(
        `Invalid order status. Valid statuses are: ${validStatuses.join(", ")}`
      );
    }

    const offset = (page - 1) * limit;
    const { rows: orders } = await orderModel.getOrdersByStatus(
      status,
      limit,
      offset
    );

    // Get count of orders with this status
    const { rows: countResult } = await query(
      'SELECT COUNT(*) FROM "Order" WHERE status = $1',
      [status]
    );

    const totalOrders = parseInt(countResult[0].count);

    return {
      orders,
      pagination: {
        total: totalOrders,
        page,
        limit,
        pages: Math.ceil(totalOrders / limit),
      },
    };
  } catch (error) {
    throw new Error(`OrderService.getOrdersByStatus: ${error.message}`);
  }
};

/**
 * Get order statistics
 * @returns {Promise} - Order statistics by status
 */
export const getOrderStats = async () => {
  try {
    // Get total orders count
    const { rows: totalResult } = await query(
      'SELECT COUNT(*) as total FROM "Order"'
    );

    // Get orders count by status
    const { rows: statusResult } = await query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM "Order"
      GROUP BY status
    `);

    // Initialize stats object
    const stats = {
      total: parseInt(totalResult[0].total),
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    // Populate stats from query results
    statusResult.forEach((row) => {
      if (stats.hasOwnProperty(row.status)) {
        stats[row.status] = parseInt(row.count);
      }
    });

    return stats;
  } catch (error) {
    throw new Error(`OrderService.getOrderStats: ${error.message}`);
  }
};

/**
 * Update order notes
 * @param {number} orderId - Order ID
 * @param {string} notes - Order notes
 * @returns {Promise} - Updated order
 */
export const updateOrderNotes = async (orderId, notes) => {
  try {
    // Note: This assumes you have a notes column in your Order table
    // If you don't have this column, you might need to add it or create a separate OrderNotes table
    const { rows } = await query(
      `UPDATE "Order" SET notes = $1 WHERE order_id = $2 RETURNING *`,
      [notes, orderId]
    );

    if (rows.length === 0) {
      throw new Error("Order not found");
    }

    return rows[0];
  } catch (error) {
    throw new Error(`OrderService.updateOrderNotes: ${error.message}`);
  }
};

/**
 * Update order tracking number
 * @param {number} orderId - Order ID
 * @param {string} trackingNumber - Tracking number
 * @returns {Promise} - Updated order
 */
export const updateOrderTracking = async (orderId, trackingNumber) => {
  try {
    // Note: This assumes you have a tracking_number column in your Order table
    // If you don't have this column, you might need to add it
    const { rows } = await query(
      `UPDATE "Order" SET tracking_number = $1 WHERE order_id = $2 RETURNING *`,
      [trackingNumber, orderId]
    );

    if (rows.length === 0) {
      throw new Error("Order not found");
    }

    return rows[0];
  } catch (error) {
    throw new Error(`OrderService.updateOrderTracking: ${error.message}`);
  }
};

/**
 * Bulk update orders
 * @param {Array} orderIds - Array of order IDs
 * @param {string} action - Bulk action (approve, ship, deliver, cancel)
 * @returns {Promise} - Updated orders
 */
export const bulkUpdateOrders = async (orderIds, action) => {
  try {
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      throw new Error("Order IDs array is required");
    }

    let status;

    switch (action) {
      case "approve":
        status = "processing";
        break;
      case "ship":
        status = "shipped";
        break;
      case "deliver":
        status = "delivered";
        break;
      case "cancel":
        status = "cancelled";
        break;
      default:
        throw new Error(`Invalid action: ${action}`);
    }

    // Create placeholders for the IN clause
    const placeholders = orderIds.map((_, index) => `$${index + 2}`).join(",");

    const { rows } = await query(
      `UPDATE "Order" 
       SET status = $1 
       WHERE order_id IN (${placeholders}) 
       RETURNING order_id, status`,
      [status, ...orderIds]
    );

    return rows;
  } catch (error) {
    throw new Error(`OrderService.bulkUpdateOrders: ${error.message}`);
  }
};
