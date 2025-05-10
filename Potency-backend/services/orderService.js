// services/orderServices.js
import * as orderModel from "../models/orderModel.js";
import * as transactionModel from "../models/transactionModel.js";
import * as productModel from "../models/productModel.js";
import * as cartServices from "./cartServices.js";
import * as cartModel from "../models/cartModel.js";
import { query } from "../src/db.js";

/**
 * Create a new order from cart items
 * @param {number} userId - User ID
 * @param {Object} shippingInfo - Shipping information
 * @param {string} paymentMethod - Payment method
 * @returns {Promise} - Created order details
 */
export const createOrderFromCart = async (
  userId,
  shippingInfo,
  paymentMethod
) => {
  // Start a transaction to ensure all database operations succeed together
  const client = await query("BEGIN");

  try {
    // Validate cart before proceeding
    const { items, summary } = await cartServices.validateCartForCheckout(
      userId
    );

    if (items.length === 0) {
      throw new Error("Cart is empty");
    }

    const orders = [];
    const transactions = [];

    // Create a payment ID (would normally come from payment processor)
    const paymentId =
      "PAY-" + Math.random().toString(36).substring(2, 10).toUpperCase();

    // Process each cart item as a separate order entry
    for (const item of items) {
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

      // 2. Create transaction record
      const transactionData = {
        user_id: userId,
        product_id: item.product_id,
        order_id: order.order_id,
        payment_method: paymentMethod,
        payment_id: paymentId,
      };

      const transactionResult = await transactionModel.createTransaction(
        transactionData
      );
      transactions.push(transactionResult.rows[0]);

      // 3. Update product stock
      const { rows: products } = await productModel.getProductById(
        item.product_id
      );
      if (products.length > 0) {
        const product = products[0];
        await productModel.updateProductStock(
          item.product_id,
          product.stock - item.quantity
        );

        // 4. Increment sold count
        await productModel.incrementSoldCount(item.product_id, item.quantity);
      }
    }

    // 5. Clear the cart
    await cartModel.clearCart(userId);

    // Commit the transaction
    await query("COMMIT");

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
    // Rollback the transaction if any operation fails
    await query("ROLLBACK");
    throw new Error(`OrderService.createOrderFromCart: ${error.message}`);
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
 * Get order details
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
    if (order.user_id !== userId) {
      throw new Error("Unauthorized access to order");
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
 * Update order status (admin only)
 * @param {number} orderId - Order ID
 * @param {string} status - New status
 * @returns {Promise} - Updated order
 */
export const updateOrderStatus = async (orderId, status) => {
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

    const { rows } = await orderModel.updateOrderStatus(orderId, status);

    if (rows.length === 0) {
      throw new Error("Order not found");
    }

    // If order is cancelled, return items to inventory
    if (status === "cancelled") {
      const order = rows[0];
      const { rows: products } = await productModel.getProductById(
        order.product_id
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

    return rows[0];
  } catch (error) {
    throw new Error(`OrderService.updateOrderStatus: ${error.message}`);
  }
};

/**
 * Get all orders for admin
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise} - Orders with pagination info
 */
export const getAllOrders = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    const { rows: orders } = await orderModel.getOrders(limit, offset);
    const { rows: countResult } = await orderModel.getOrderCount();

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
    throw new Error(`OrderService.getAllOrders: ${error.message}`);
  }
};

/**
 * Get orders by status
 * @param {string} status - Order status
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise} - Orders with pagination info
 */
export const getOrdersByStatus = async (status, page = 1, limit = 10) => {
  try {
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
