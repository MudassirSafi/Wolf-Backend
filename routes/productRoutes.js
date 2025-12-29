// ================================================
// ✅ wolf-backend/routes/productRoutes.js (UPDATED)
// ================================================
import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import Product from "../models/product.js";

const router = express.Router();

// ==================== GET FEATURED PRODUCTS ====================
// GET /api/products/featured/latest
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
    console.error("Get featured products error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured products",
      error: error.message
    });
  }
});

// ==================== GET ALL PRODUCTS ====================
// GET /api/products
router.get("/", async (req, res) => {
  try {
    const { category, search, sort, bestSeller, featured, limit } = req.query;

    console.log('📊 Received filters:', { category, search, sort, bestSeller, featured, limit }); // ✅ Debug

    // Build query
    let query = {};

    // ✅ UPDATED: Category filter with case-insensitive partial match
    if (category && category !== "All") {
      query.$or = [
        { category: { $regex: category, $options: "i" } },
        { subCategory: { $regex: category, $options: "i" } }
      ];
      console.log('🔍 Category filter applied:', category); // ✅ Debug
    }

    // Search filter
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

    console.log('🔎 Final query:', JSON.stringify(query, null, 2)); // ✅ Debug

    // Build sorting rules
    let sortOption = { createdAt: -1 }; // default: newest first

    if (sort === "price-asc") {
      sortOption = { price: 1 };
    } else if (sort === "price-desc") {
      sortOption = { price: -1 };
    }

    const products = await Product.find(query)
      .sort(sortOption)
      .limit(limit ? parseInt(limit) : 0);

    console.log(`✅ Found ${products.length} products`); // ✅ Debug
    
    // ✅ Log first product's category for debugging
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
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message
    });
  }
});

// ==================== CREATE PRODUCT (ADMIN) ====================
router.post("/", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, description, price, stock, discount, category, brand, images, sku, featured, bestSeller } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: "Name and price are required"
      });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      stock: stock || 0,
      discount: discount || 0,
      category,
      brand,
      images: images || [],
      sku, // ✅ Added
      featured: featured || false, // ✅ Added
      bestSeller: bestSeller || false, // ✅ Added
      user: req.user ? req.user.id : null
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product
    });
  } catch (error) {
    console.error("Create product error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Product with this slug already exists"
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message
    });
  }
});

// ==================== UPDATE PRODUCT (ADMIN) ====================
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, description, price, stock, discount, category, brand, images, sku, featured, bestSeller } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    if (name && name !== product.name) {
      product.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (discount !== undefined) product.discount = discount;
    if (category) product.category = category;
    if (brand) product.brand = brand;
    if (images) product.images = images;
    if (sku) product.sku = sku; // ✅ Added
    if (featured !== undefined) product.featured = featured; // ✅ Added
    if (bestSeller !== undefined) product.bestSeller = bestSeller; // ✅ Added

    await product.save();

    res.json({
      success: true,
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating product",
      error: error.message
    });
  }
});

// ==================== DELETE PRODUCT (ADMIN) ====================
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message
    });
  }
});

export default router;
