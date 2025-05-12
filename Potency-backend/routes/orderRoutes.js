// routes/orderRoutes.js
import express from "express";
import {
  getUserOrders,
  getOrderDetails,
  updateOrderStatus,
  getAllOrders,
  getOrderStats,
  updateOrderNotes,
  updateOrderTracking,
  bulkUpdateOrders,
} from "../controller/orderController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All order routes require authentication
router.use(verifyToken);

// User order routes
router.get("/user", getUserOrders);
router.get("/user/:id", getOrderDetails);

// Admin-only routes
router.get("/stats", isAdmin, getOrderStats); // New route for order statistics
router.get("/", isAdmin, getAllOrders);
router.get("/:id", isAdmin, getOrderDetails); // New route for admin to get any order
router.put("/:id/status", isAdmin, updateOrderStatus);
router.put("/:id/notes", isAdmin, updateOrderNotes); // New route for updating notes
router.put("/:id/tracking", isAdmin, updateOrderTracking); // New route for updating tracking
router.put("/bulk", isAdmin, bulkUpdateOrders); // New route for bulk operations

export default router;
