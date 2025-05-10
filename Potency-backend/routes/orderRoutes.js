// routes/orderRoutes.js
import express from "express";
import {
  getUserOrders,
  getOrderDetails,
  updateOrderStatus,
  getAllOrders,
} from "../controller/orderController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// All order routes require authentication
router.use(verifyToken);

// User order routes
router.get("/user", getUserOrders);
router.get("/user/:id", getOrderDetails);

// Admin-only routes
router.get("/", isAdmin, getAllOrders);
router.put("/:id/status", isAdmin, updateOrderStatus);

export default router;
