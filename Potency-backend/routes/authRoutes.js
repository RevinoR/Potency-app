// authRoutes.js - Updated version
import express from "express";
import {
  loginUser,
  registerUser,
  logoutUser,
  refreshToken,
} from "../controller/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Auth routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyToken, logoutUser);

// Add token refresh endpoint
router.post("/refresh-token", refreshToken);

export default router;
