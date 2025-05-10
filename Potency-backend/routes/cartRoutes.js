// routes/cartRoutes.js
import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controller/cartController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { validateCartItem } from "../middleware/validateCartData.js";

const router = express.Router();

// All cart routes require authentication
router.use(verifyToken);

// Get cart contents
router.get("/", getCart);

// Add item to cart
router.post("/", validateCartItem, addToCart);

// Update cart item quantity
router.put("/:id", updateCartItem);

// Remove item from cart
router.delete("/:id", removeFromCart);

// Clear entire cart
router.delete("/", clearCart);

export default router;
