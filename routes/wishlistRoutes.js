// ==========================================
// 📁 FILE 1: wolf-backend/routes/wishlistRoutes.js - FIXED TO MATCH FRONTEND
// ==========================================
import express from 'express';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/product.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ✅ Get user's wishlist - Returns items array for consistency
router.get('/', protect, async (req, res) => {
  try {
    console.log('\n=== GET WISHLIST ===');
    console.log('📋 Fetching wishlist for user:', req.user._id);
    console.log('👤 User email:', req.user.email);
    
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products');
    
    if (!wishlist) {
      console.log('📋 No wishlist found, creating new one');
      wishlist = await Wishlist.create({
        user: req.user._id,
        products: []
      });
    }
    
    console.log('✅ Wishlist found with', wishlist.products.length, 'items');
    console.log('===================\n');
    
    // ✅ Return in format frontend expects: { items: [...] }
    res.json({
      success: true,
      items: wishlist.products
    });
  } catch (error) {
    console.error('❌ Error fetching wishlist:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching wishlist',
      error: error.message
    });
  }
});

// ✅ Add product to wishlist - POST /api/wishlist/add
router.post('/add', protect, async (req, res) => {
  try {
    console.log('\n=== ADD TO WISHLIST ===');
    const { productId } = req.body;
    console.log('➕ Adding product:', productId);
    console.log('👤 User:', req.user._id, '-', req.user.email);
    
    if (!productId) {
      console.log('❌ No productId provided');
      console.log('===================\n');
      return res.status(400).json({ 
        success: false,
        message: 'Product ID is required' 
      });
    }
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      console.log('❌ Product not found:', productId);
      console.log('===================\n');
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    console.log('✅ Product found:', product.name);
    
    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      console.log('📋 Creating new wishlist');
      wishlist = new Wishlist({
        user: req.user._id,
        products: [productId]
      });
    } else {
      // Check if product already in wishlist
      const alreadyExists = wishlist.products.some(
        id => id.toString() === productId
      );
      
      if (alreadyExists) {
        console.log('⚠️ Product already in wishlist');
        console.log('===================\n');
        return res.status(400).json({ 
          success: false,
          message: 'Product already in wishlist' 
        });
      }
      
      console.log('➕ Adding to existing wishlist');
      wishlist.products.push(productId);
    }
    
    await wishlist.save();
    await wishlist.populate('products');
    
    console.log('✅ Product added successfully. Total items:', wishlist.products.length);
    console.log('===================\n');
    
    res.json({ 
      success: true,
      message: 'Product added to wishlist',
      items: wishlist.products
    });
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error);
    console.log('===================\n');
    res.status(500).json({ 
      success: false,
      message: 'Server error adding to wishlist',
      error: error.message
    });
  }
});

// ✅ Remove product from wishlist - DELETE /api/wishlist/remove/:productId
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    console.log('\n=== REMOVE FROM WISHLIST ===');
    const { productId } = req.params;
    console.log('➖ Removing product:', productId);
    console.log('👤 User:', req.user._id, '-', req.user.email);
    
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      console.log('❌ Wishlist not found');
      console.log('===================\n');
      return res.status(404).json({ 
        success: false,
        message: 'Wishlist not found' 
      });
    }
    
    const originalLength = wishlist.products.length;
    wishlist.products = wishlist.products.filter(
      id => id.toString() !== productId
    );
    
    if (originalLength === wishlist.products.length) {
      console.log('⚠️ Product was not in wishlist');
      console.log('===================\n');
      return res.status(404).json({ 
        success: false,
        message: 'Product not found in wishlist' 
      });
    }
    
    await wishlist.save();
    await wishlist.populate('products');
    
    console.log('✅ Product removed. Remaining items:', wishlist.products.length);
    console.log('===================\n');
    
    res.json({ 
      success: true,
      message: 'Product removed from wishlist',
      items: wishlist.products
    });
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error);
    console.log('===================\n');
    res.status(500).json({ 
      success: false,
      message: 'Server error removing from wishlist',
      error: error.message
    });
  }
});

// ✅ Check if product is in wishlist
router.get('/check/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    console.log('🔍 Checking if product', productId, 'is in wishlist for user:', req.user._id);
    
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      return res.json({ 
        success: true,
        inWishlist: false 
      });
    }
    
    const inWishlist = wishlist.products.some(
      id => id.toString() === productId
    );
    
    res.json({ 
      success: true,
      inWishlist 
    });
  } catch (error) {
    console.error('❌ Error checking wishlist:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error checking wishlist',
      error: error.message
    });
  }
});

// ✅ Clear entire wishlist
router.delete('/clear', protect, async (req, res) => {
  try {
    console.log('🗑️ Clearing wishlist for user:', req.user._id);
    
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      return res.status(404).json({ 
        success: false,
        message: 'Wishlist not found' 
      });
    }
    
    wishlist.products = [];
    await wishlist.save();
    
    console.log('✅ Wishlist cleared successfully');
    res.json({ 
      success: true,
      message: 'Wishlist cleared',
      items: []
    });
  } catch (error) {
    console.error('❌ Error clearing wishlist:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error clearing wishlist',
      error: error.message
    });
  }
});

export default router;