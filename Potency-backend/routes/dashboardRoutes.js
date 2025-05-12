import express from "express";
import { getDashboardStats } from "../controller/dashboardController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected admin route for dashboard statistics
router.get("/stats", verifyToken, isAdmin, getDashboardStats);

export default router;
