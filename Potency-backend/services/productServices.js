// src/services/productServices.js
import * as productModel from "../models/productModel.js";
import * as imageService from "../services/imageServices.js";

export const getAllProducts = async (page = 1, limit = 10) => {
  try {
    // Calculate offset - this was the issue, we were passing (page, limit) to a function expecting (limit, offset)
    const offset = (page - 1) * limit;

    // Get products with correct parameter order (limit, offset)
    const { rows: products } = await productModel.getAllProducts(limit, offset);

    // Get total count
    const { rows: countRows } = await productModel.getTotalProductCount();

    const total = countRows.length > 0 ? parseInt(countRows[0].count) : 0;

    return {
      data: products,
      pagination: {
        total: total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("ProductService.getAllProducts error:", error);
    // Return empty data with pagination instead of throwing error
    return {
      data: [],
      pagination: {
        total: 0,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: 0,
      },
    };
  }
};

export const getProductById = async (id) => {
  try {
    const { rows } = await productModel.getProductById(id);
    if (rows.length === 0) throw new Error("Product not found");
    return rows[0];
  } catch (error) {
    throw new Error(`ProductService.getProductById: ${error.message}`);
  }
};

export const createProduct = async (productData) => {
  try {
    const productPayload = {
      ...productData,
      price: parseFloat(productData.price),
      stock: parseInt(productData.stock) || 0,
    };

    const { rows } = await productModel.createProduct(productPayload);
    return rows[0];
  } catch (error) {
    throw new Error(`ProductService.createProduct: ${error.message}`);
  }
};

export const updateProduct = async (id, updates) => {
  try {
    const updatePayload = {
      ...updates,
      price: updates.price ? parseFloat(updates.price) : undefined,
      stock: updates.stock !== undefined ? parseInt(updates.stock) : undefined,
    };

    const { rows } = await productModel.updateProduct(id, updatePayload);
    if (rows.length === 0) throw new Error("Product not found");
    return rows[0];
  } catch (error) {
    throw new Error(`ProductService.updateProduct: ${error.message}`);
  }
};

export const updateProductStock = async (id, stock) => {
  try {
    const { rows } = await productModel.updateProductStock(id, parseInt(stock));
    if (rows.length === 0) throw new Error("Product not found");
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
    if (rows.length === 0) throw new Error("Product not found");
    return rows[0];
  } catch (error) {
    throw new Error(`ProductService.deleteProduct: ${error.message}`);
  }
};
