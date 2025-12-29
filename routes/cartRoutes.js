// ✅ wolf-backend/routes/cartRoutes.js
// Fixed and converted to ES6 modules
import express from "express";
import { protect } from "../middlewares/authMiddleware.js"; 
import User from "../models/User.js";
import Product from "../models/product.js";

const router = express.Router();

// ==================== GET USER CART ====================
// GET /api/cart - Get logged-in user's cart
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id; // From JWT token
    const user = await User.findById(userId).populate("cart.product");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ 
      success: true,
      cart: user.cart || [] 
    });
  } catch (err) {
    console.error("Cart GET error:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching cart" 
    });
  }
});

// ==================== ADD/UPDATE CART ITEM ====================
// POST /api/cart - Add or update product in cart
router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user.id; // From JWT token
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ 
        success: false,
        message: "Product ID and quantity are required" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }

    // Check if product already in cart
    const existingItemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      user.cart[existingItemIndex].quantity += quantity;
      
      // Remove if quantity becomes 0 or negative
      if (user.cart[existingItemIndex].quantity <= 0) {
        user.cart.splice(existingItemIndex, 1);
      }
    } else if (quantity > 0) {
      // Add new item
      user.cart.push({ product: productId, quantity });
    }

    await user.save();

    // Return updated cart with populated products
    const populatedUser = await User.findById(userId).populate("cart.product");
    
    res.json({ 
      success: true,
      cart: populatedUser.cart,
      message: "Cart updated successfully"
    });
  } catch (err) {
    console.error("Cart POST error:", err);
    res.status(500).json({ 
      success: false,
      message: "Error updating cart" 
    });
  }
});

// ==================== REMOVE SPECIFIC ITEM ====================
// DELETE /api/cart/:productId - Remove specific item from cart
router.delete("/:productId", protect, async (req, res) => {
  try {
    const userId = req.user.id; // From JWT token
    const { productId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Remove item from cart
    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );
    
    await user.save();

    const populatedUser = await User.findById(userId).populate("cart.product");
    
    res.json({ 
      success: true,
      cart: populatedUser.cart,
      message: "Item removed from cart"
    });
  } catch (err) {
    console.error("Cart DELETE error:", err);
    res.status(500).json({ 
      success: false,
      message: "Error removing item" 
    });
  }
});

// ==================== CLEAR ENTIRE CART ====================
// DELETE /api/cart - Clear entire cart
router.delete("/", protect, async (req, res) => {
  try {
    const userId = req.user.id; // From JWT token
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    user.cart = [];
    await user.save();

    res.json({ 
      success: true,
      cart: [],
      message: "Cart cleared successfully"
    });
  } catch (err) {
    console.error("Cart clear error:", err);
    res.status(500).json({ 
      success: false,
      message: "Error clearing cart" 
    });
  }
});

export default router;