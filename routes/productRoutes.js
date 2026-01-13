// ================================================
// ✅ wolf-backend/routes/productRoutes.js - COMPLETE FINAL VERSION
// COPY THIS ENTIRE FILE AND REPLACE YOUR EXISTING productRoutes.js
// ================================================
import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import Product from "../models/product.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// ==================== GET FEATURED PRODUCTS ====================
// GET /api/products/featured/latest
// PUBLIC - No authentication required
router.get("/featured/latest", async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error("❌ Get featured products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured products",
      error: error.message
    });
  }
});

// ==================== GET ALL PRODUCTS ====================
// GET /api/products
// PUBLIC - No authentication required
router.get("/", async (req, res) => {
  try {
    const { category, search, sort, bestSeller, featured, limit } = req.query;

    console.log('📊 Received filters:', { category, search, sort, bestSeller, featured, limit });

    // Build query object
    let query = {};

    // Category filter with case-insensitive partial match
    if (category && category !== "All") {
      query.$or = [
        { category: { $regex: category, $options: "i" } },
        { subCategory: { $regex: category, $options: "i" } }
      ];
      console.log('🔍 Category filter applied:', category);
    }

    // Search filter - search in product name
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Best Seller filter
    if (bestSeller === "true") {
      query.bestSeller = true;
    }

    // Featured filter
    if (featured === "true") {
      query.featured = true;
    }

    console.log('🔎 Final query:', JSON.stringify(query, null, 2));

    // Build sorting options
    let sortOption = { createdAt: -1 }; // default: newest first

    if (sort === "price-asc") {
      sortOption = { price: 1 };
    } else if (sort === "price-desc") {
      sortOption = { price: -1 };
    } else if (sort === "name-asc") {
      sortOption = { name: 1 };
    } else if (sort === "name-desc") {
      sortOption = { name: -1 };
    }

    // Execute query with sorting and optional limit
    const products = await Product.find(query)
      .sort(sortOption)
      .limit(limit ? parseInt(limit) : 0);

    console.log(`✅ Found ${products.length} products`);
    
    // Log first product's category for debugging
    if (products.length > 0) {
      console.log('📦 Sample product category:', products[0].category);
    }

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error("❌ Get products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message
    });
  }
});

// ==================== GET PRODUCT BY ID ====================
// GET /api/products/:id
// PUBLIC - No authentication required
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    console.log('📦 Retrieved product:', {
      name: product.name,
      id: product._id,
      category: product.category,
      imagesCount: product.images?.length || 0,
      videosCount: product.videos?.length || 0
    });

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error("❌ Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message
    });
  }
});

// ==================== CREATE PRODUCT (ADMIN ONLY) ====================
// POST /api/products
// PROTECTED - Requires admin authentication
router.post(
  "/",
  protect,                      // ✅ Step 1: Authenticate user
  authorize("admin"),           // ✅ Step 2: Check if user is admin
  upload.array("images", 10),   // ✅ Step 3: Handle up to 10 image uploads
  createProduct                 // ✅ Step 4: Execute controller function
);

// ==================== UPDATE PRODUCT (ADMIN ONLY) ====================
// PUT /api/products/:id
// PROTECTED - Requires admin authentication
router.put(
  "/:id",
  protect,                      // ✅ Authenticate user
  authorize("admin"),           // ✅ Check if admin
  upload.array("images", 10),   // ✅ Handle image uploads
  updateProduct                 // ✅ Execute controller function
);

// ==================== DELETE PRODUCT (ADMIN ONLY) ====================
// DELETE /api/products/:id
// PROTECTED - Requires admin authentication
router.delete(
  "/:id",
  protect,                      // ✅ Authenticate user
  authorize("admin"),           // ✅ Check if admin
  deleteProduct                 // ✅ Execute controller function
);

// ==================== BULK DELETE PRODUCTS (ADMIN ONLY) ====================
// DELETE /api/products/bulk/delete
// PROTECTED - Requires admin authentication
router.post(
  "/bulk/delete",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { productIds } = req.body;

      if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Please provide an array of product IDs"
        });
      }

      const result = await Product.deleteMany({
        _id: { $in: productIds }
      });

      console.log(`🗑️ Bulk deleted ${result.deletedCount} products`);

      res.json({
        success: true,
        message: `Successfully deleted ${result.deletedCount} product(s)`,
        deletedCount: result.deletedCount
      });
    } catch (error) {
      console.error("❌ Bulk delete error:", error);
      res.status(500).json({
        success: false,
        message: "Error deleting products",
        error: error.message
      });
    }
  }
);

// ==================== TOGGLE FEATURED STATUS (ADMIN ONLY) ====================
// PATCH /api/products/:id/featured
// PROTECTED - Requires admin authentication
router.patch(
  "/:id/featured",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }

      product.featured = !product.featured;
      await product.save();

      console.log(`⭐ Toggled featured status for ${product.name}: ${product.featured}`);

      res.json({
        success: true,
        message: `Product ${product.featured ? 'marked as' : 'removed from'} featured`,
        product
      });
    } catch (error) {
      console.error("❌ Toggle featured error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating product",
        error: error.message
      });
    }
  }
);

// ==================== TOGGLE BESTSELLER STATUS (ADMIN ONLY) ====================
// PATCH /api/products/:id/bestseller
// PROTECTED - Requires admin authentication
router.patch(
  "/:id/bestseller",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }

      product.bestSeller = !product.bestSeller;
      await product.save();

      console.log(`🏆 Toggled bestseller status for ${product.name}: ${product.bestSeller}`);

      res.json({
        success: true,
        message: `Product ${product.bestSeller ? 'marked as' : 'removed from'} bestseller`,
        product
      });
    } catch (error) {
      console.error("❌ Toggle bestseller error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating product",
        error: error.message
      });
    }
  }
);

// ==================== UPDATE STOCK (ADMIN ONLY) ====================
// PATCH /api/products/:id/stock
// PROTECTED - Requires admin authentication
router.patch(
  "/:id/stock",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { stock } = req.body;

      if (stock === undefined || stock < 0) {
        return res.status(400).json({
          success: false,
          message: "Valid stock quantity required"
        });
      }

      const product = await Product.findById(req.params.id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found"
        });
      }

      const oldStock = product.stock;
      product.stock = stock;
      await product.save();

      console.log(`📦 Updated stock for ${product.name}: ${oldStock} → ${stock}`);

      res.json({
        success: true,
        message: "Stock updated successfully",
        product
      });
    } catch (error) {
      console.error("❌ Update stock error:", error);
      res.status(500).json({
        success: false,
        message: "Error updating stock",
        error: error.message
      });
    }
  }
);

export default router;