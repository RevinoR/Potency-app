// routes/checkoutRoutes.js
import express from "express";
import {
  validateCheckout,
  processCheckout,
} from "../controller/checkoutController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { validateCheckoutData } from "../middleware/validateCheckoutData.js";

const router = express.Router();

// All checkout routes require authentication
router.use(verifyToken);

// Validate cart before checkout
router.get("/validate", validateCheckout);

// Process checkout
router.post("/process", validateCheckoutData, processCheckout);

export default router;
