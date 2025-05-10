// controller/productController.js
import multer from "multer";
import path from "path";
import fs from "fs";
import * as productService from "../services/productServices.js";

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Set up multer with validation
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Not an image! Please upload only images."), false);
    }
  },
});

// Get all products with pagination
export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Add validation for page and limit
    if (page < 1 || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid pagination parameters. Page must be >= 1 and limit must be between 1 and 100",
      });
    }

    const products = await productService.getAllProducts(page, limit);

    // Always return success true, even if no products are found
    return res.status(200).json({
      success: true,
      data: products.data || [],
      pagination: products.pagination,
    });
  } catch (error) {
    console.error("Error in getProducts:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await productService.getProductById(productId);

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error in getProductById:", error);

    if (error.message.includes("Product not found")) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Create new product
export const createProduct = async (req, res) => {
  const uploadMiddleware = upload.single("image");

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    try {
      let productData = {
        name: req.body.name,
        price: req.body.price,
        type: req.body.type || "general",
        stock: req.body.stock || 0,
        subtitle: req.body.subtitle || "",
        description: req.body.description || "",
      };

      // Validate required fields
      if (!productData.name || !productData.price) {
        return res.status(400).json({
          success: false,
          message: "Name and price are required fields",
        });
      }

      if (req.file) {
        const imageBuffer = fs.readFileSync(req.file.path);
        productData.image = imageBuffer;
        fs.unlinkSync(req.file.path);
      }

      const product = await productService.createProduct(productData);

      return res.status(201).json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error("Error in createProduct:", error);

      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  });
};

// Update product
export const updateProduct = async (req, res) => {
  const uploadMiddleware = upload.single("image");

  uploadMiddleware(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    try {
      const productId = parseInt(req.params.id);

      if (isNaN(productId) || productId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      // Check if at least one field is provided for update
      if (Object.keys(req.body).length === 0 && !req.file) {
        return res.status(400).json({
          success: false,
          message: "No update data provided",
        });
      }

      let updateData = {};

      if (req.body.name) updateData.name = req.body.name;
      if (req.body.price) updateData.price = req.body.price;
      if (req.body.type !== undefined) updateData.type = req.body.type;
      if (req.body.stock !== undefined)
        updateData.stock = parseInt(req.body.stock);
      if (req.body.subtitle !== undefined)
        updateData.subtitle = req.body.subtitle;
      if (req.body.description !== undefined)
        updateData.description = req.body.description;

      if (req.file) {
        const imageBuffer = fs.readFileSync(req.file.path);
        updateData.image = imageBuffer;
        fs.unlinkSync(req.file.path);
      }

      const product = await productService.updateProduct(productId, updateData);

      return res.status(200).json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error("Error in updateProduct:", error);

      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      if (error.message.includes("Product not found")) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  });
};

// Update product stock
export const updateStock = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const { stock } = req.body;

    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Stock value is required",
      });
    }

    const stockValue = parseInt(stock);
    if (isNaN(stockValue) || stockValue < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock value must be a non-negative number",
      });
    }

    const product = await productService.updateProductStock(
      productId,
      stockValue
    );

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Error in updateStock:", error);

    if (error.message.includes("Product not found")) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await productService.deleteProduct(productId);

    return res.status(200).json({
      success: true,
      data: product,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteProduct:", error);

    if (error.message.includes("Product not found")) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Get product image
export const getProductImage = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);

    if (isNaN(productId) || productId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await productService.getProductById(productId);

    if (!product.image) {
      return res.status(404).json({
        success: false,
        message: "Image not found for this product",
      });
    }

    res.set("Content-Type", "image/jpeg");
    res.set("Cache-Control", "public, max-age=86400"); // Cache for 24 hours
    return res.send(product.image);
  } catch (error) {
    console.error("Error in getProductImage:", error);

    if (error.message.includes("Product not found")) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// Search products
export const searchProducts = async (req, res) => {
  try {
    const { term } = req.query;

    if (!term) {
      return res.status(400).json({
        success: false,
        message: "Search term is required",
      });
    }

    const products = await productService.searchProducts(term);

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Error in searchProducts:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
