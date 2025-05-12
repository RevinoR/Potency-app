// controller/orderController.js
import * as orderServices from "../services/orderServices.js";

/**
 * Get user's orders
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderServices.getUserOrders(userId);

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error in getUserOrders:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve orders",
    });
  }
};

/**
 * Get order details
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getOrderDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const orderDetails = await orderServices.getOrderDetails(orderId, userId);

    res.status(200).json({
      success: true,
      data: orderDetails,
    });
  } catch (error) {
    console.error("Error in getOrderDetails:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (error.message.includes("Unauthorized")) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this order",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve order details",
    });
  }
};

/**
 * Update order status (admin only)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const updatedOrder = await orderServices.updateOrderStatus(orderId, status);

    res.status(200).json({
      success: true,
      data: updatedOrder,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);

    if (error.message.includes("Invalid order status")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update order status",
    });
  }
};

/**
 * Get all orders (admin only)
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;

    let result;

    if (status) {
      // If status filter is provided
      result = await orderServices.getOrdersByStatus(status, page, limit);
    } else {
      // Get all orders regardless of status
      result = await orderServices.getAllOrders(page, limit);
    }

    res.status(200).json({
      success: true,
      data: result.orders,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve orders",
    });
  }
};
