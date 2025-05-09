// src/services/productService.js
import * as productModel from '../models/productModel.js';
import * as imageService from '../services/imageServices.js';

export const getAllProducts = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;
    const { rows: products } = await productModel.getAllProducts(limit, offset);
    const { rows: countRows } = await productModel.getTotalProductCount();
    
    return {
      data: products,
      pagination: {
        total: parseInt(countRows[0].count),
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(parseInt(countRows[0].count) / limit)
      }
    };
  } catch (error) {
    throw new Error(`ProductService.getAllProducts: ${error.message}`);
  }
};

export const getProductById = async (id) => {
  try {
    const { rows } = await productModel.getProductById(id);
    if (rows.length === 0) throw new Error('Product not found');
    return rows[0];
  } catch (error) {
    throw new Error(`ProductService.getProductById: ${error.message}`);
  }
};

export const createProduct = async (productData, imageFile) => {
  try {
    const productPayload = {
      ...productData,
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock) || 0,
    };

    if (imageFile) {
      productPayload.image = await imageService.imageFileToBuffer(imageFile.path);
    }

    const { rows } = await productModel.createProduct(productPayload);
    return rows[0];
  } catch (error) {
    throw new Error(`ProductService.createProduct: ${error.message}`);
  }
};

export const updateProduct = async (id, updates, imageFile) => {
  try {
    const updatePayload = {
      ...updates,
      price: updates.price ? parseFloat(updates.price) : undefined,
      stock: updates.stock ? parseInt(updates.stock) : undefined,
    };

    if (imageFile) {
      updatePayload.image = await imageService.imageFileToBuffer(imageFile.path);
    }

    const { rows } = await productModel.updateProduct(id, updatePayload);
    if (rows.length === 0) throw new Error('Product not found');
    return rows[0];
  } catch (error) {
    throw new Error(`ProductService.updateProduct: ${error.message}`);
  }
};

export const updateProductStock = async (id, stock) => {
  try {
    const { rows } = await productModel.updateProductStock(id, parseInt(stock));
    if (rows.length === 0) throw new Error('Product not found');
    return rows[0];
  } catch (error) {
    throw new Error(`ProductService.updateStock: ${error.message}`);
  }
};

export const searchProducts = async (searchTerm) => {
  try {
    const { rows } = await productModel.searchProducts(searchTerm);
    return rows;
  } catch (error) {
    throw new Error(`ProductService.searchProducts: ${error.message}`);
  }
};

export const deleteProduct = async (id) => {
  try {
    const { rows } = await productModel.deleteProduct(id);
    if (rows.length === 0) throw new Error('Product not found');
    return rows[0];
  } catch (error) {
    throw new Error(`ProductService.deleteProduct: ${error.message}`);
  }
};
