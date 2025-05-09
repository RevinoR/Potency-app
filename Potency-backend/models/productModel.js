// src/models/productModel.js
import { query } from '../src/db.js';

/**
 * Get all products with pagination
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise} - Paginated products
 */
export const getAllProducts = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  const q = {
    text: 'SELECT * FROM "Product" ORDER BY product_id DESC LIMIT $1 OFFSET $2',
    values: [limit, offset],
  };
  return query(q.text, q.values); // This should return { rows: [...] }
};


/**
 * Get total product count
 * @returns {Promise} - Total count of products
 */
export const getTotalProductCount = async () => {
  const q = {
    text: 'SELECT COUNT(*) FROM "Product"',
  };
  return query(q.text);
};

/**
 * Get product by ID
 * @param {number} id - Product ID
 * @returns {Promise} - Product details
 */
export const getProductById = async (id) => {
  const q = {
    text: 'SELECT * FROM "Product" WHERE product_id = $1',
    values: [id],
  };
  return query(q.text, q.values);
};

/**
 * Create new product
 * @param {Object} product - Product object
 * @returns {Promise} - Created product
 */
// In productModel.js - Update createProduct
export const createProduct = async (product) => {
  const { name, price, type, stock, image, subtitle, description } = product;
  const q = {
    text: `INSERT INTO "Product"
      (name, price, type, stock, sold, image, subtitle, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
    values: [name, price, type, stock, 1, image, subtitle, description],
  };
  return query(q.text, q.values);
};






/**
 * Update product by ID
 * @param {number} id - Product ID
 * @param {Object} updates - Product update fields
 * @returns {Promise} - Updated product
 */
export const updateProduct = async (id, updates) => {
  const { name, price, type, stock, image, subtitle, description } = updates;
  const q = {
    text: `UPDATE "Product"
      SET name = COALESCE($1, name),
          price = COALESCE($2, price),
          type = COALESCE($3, type),
          stock = COALESCE($4, stock),
          image = COALESCE($5, image),
          subtitle = COALESCE($6, subtitle),
          description = COALESCE($7, description)
      WHERE product_id = $8
      RETURNING *`,
    values: [name, price, type, stock, image, subtitle, description, id],
  };
  return query(q.text, q.values);
};

/**
 * Update product stock
 * @param {number} id - Product ID
 * @param {number} stock - New stock value
 * @returns {Promise} - Updated product
 */
export const updateProductStock = async (id, stock) => {
  const q = {
    text: 'UPDATE "Product" SET stock = $1 WHERE product_id = $2 RETURNING *',
    values: [stock, id],
  };
  return query(q.text, q.values);
};

/**
 * Increment sold count
 * @param {number} id - Product ID
 * @param {number} quantity - Quantity sold
 * @returns {Promise} - Updated product
 */
export const incrementSoldCount = async (id, quantity = 1) => {
  const q = {
    text: 'UPDATE "Product" SET sold = sold + $1 WHERE product_id = $2 RETURNING *',
    values: [quantity, id],
  };
  return query(q.text, q.values);
};

/**
 * Delete product by ID
 * @param {number} id - Product ID
 * @returns {Promise} - Deletion result
 */
export const deleteProduct = async (id) => {
  const q = {
    text: 'DELETE FROM "Product" WHERE product_id = $1 RETURNING *',
    values: [id],
  };
  return query(q.text, q.values);
};

/**
 * Search products
 * @param {string} searchTerm - Search term
 * @returns {Promise} - Matching products
 */
export const searchProducts = async (searchTerm) => {
  const q = {
    text: `SELECT * FROM "Product"
      WHERE name ILIKE $1
      OR description ILIKE $1
      OR subtitle ILIKE $1`,
    values: [`%${searchTerm}%`],
  };
  return query(q.text, q.values);
};
