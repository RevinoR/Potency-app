// authMiddleware.js
import jwt from "jsonwebtoken";
import { query } from "../src/db.js";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Token expired, please log in again" });
      }
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    // Double-check that admin exists in database
    let adminExists;

    if (req.user.id) {
      // Check in Admin table
      adminExists = await query('SELECT * FROM "Admin" WHERE admin_id = $1', [
        req.user.id,
      ]);

      // If not found and role is still admin, check User table
      // (in case admin is stored in User table with admin role)
      if (adminExists.rows.length === 0) {
        adminExists = await query(
          'SELECT * FROM "User" WHERE user_id = $1 AND role = $2',
          [req.user.id, "admin"]
        );
      }
    }

    if (!adminExists || adminExists.rows.length === 0) {
      return res.status(403).json({ message: "Admin record not found" });
    }

    next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
