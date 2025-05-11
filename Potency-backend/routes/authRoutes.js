// routes/authRoutes.js
import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: "15h" }
    );

    res.json({
      accessToken: newAccessToken,
      refreshToken, // Optionally issue new refresh token
    });
  } catch (error) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
});

export default router;
