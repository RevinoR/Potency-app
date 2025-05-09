import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  updateStock,
  deleteProduct,
  getProductImage,
  searchProducts
} from '../controller/productController.js';
import { verifyToken, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/:id', getProductById);
router.get('/:id/image', getProductImage);

// Protected admin routes
router.post('/', verifyToken, isAdmin, createProduct);
router.put('/:id', verifyToken, isAdmin, updateProduct);
router.patch('/:id/stock', verifyToken, isAdmin, updateStock);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);

export default router;
