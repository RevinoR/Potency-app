// routes/userRoutes.js
import express from 'express';
import * as userController from "../controller/userController.js";
import * as authController from "../controller/authController.js";

const router = express.Router();

// Auth routes
router.post('/users', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/logout', authController.logoutUser);

// User routes
router.get('/user', userController.getUsers);
router.get('/user/:id', userController.getUserById);

export default router;
