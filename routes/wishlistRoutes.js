// wolf-backend/routes/wishlistRoutes.js
import express from 'express';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/product.js';
import { protect } from '../middlewares/authMiddleware.js'; // ✅ Using your existing auth middleware

const router = express.Router();

// ✅ Get user's wishlist
router.get('/', protect, async (req, res) => {
  try {
    console.log('📋 Fetching wishlist for user:', req.user._id);
    
    const wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate('products');
    
    if (!wishlist) {
      console.log('📋 No wishlist found, returning empty array');
      return res.json([]);
    }
    
    console.log('✅ Wishlist found with', wishlist.products.length, 'items');
    res.json(wishlist.products);
  } catch (error) {
    console.error('❌ Error fetching wishlist:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error fetching wishlist' 
    });
  }
});

// ✅ Add product to wishlist
router.post('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    console.log('➕ Adding product', productId, 'to wishlist for user:', req.user._id);
    
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      console.log('❌ Product not found:', productId);
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      console.log('📋 Creating new wishlist for user');
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
        return res.status(400).json({ 
          success: false,
          message: 'Product already in wishlist' 
        });
      }
      
      wishlist.products.push(productId);
    }
    
    await wishlist.save();
    await wishlist.populate('products');
    
    console.log('✅ Product added to wishlist successfully');
    res.json({ 
      success: true,
      message: 'Product added to wishlist',
      wishlist: wishlist.products 
    });
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error adding to wishlist' 
    });
  }
});

// ✅ Remove product from wishlist
router.delete('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    console.log('➖ Removing product', productId, 'from wishlist for user:', req.user._id);
    
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      console.log('❌ Wishlist not found');
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
      return res.status(404).json({ 
        success: false,
        message: 'Product not found in wishlist' 
      });
    }
    
    await wishlist.save();
    await wishlist.populate('products');
    
    console.log('✅ Product removed from wishlist successfully');
    res.json({ 
      success: true,
      message: 'Product removed from wishlist',
      wishlist: wishlist.products 
    });
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error removing from wishlist' 
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
      console.log('📋 No wishlist found');
      return res.json({ 
        success: true,
        inWishlist: false 
      });
    }
    
    const inWishlist = wishlist.products.some(
      id => id.toString() === productId
    );
    
    console.log('✅ Product in wishlist:', inWishlist);
    res.json({ 
      success: true,
      inWishlist 
    });
  } catch (error) {
    console.error('❌ Error checking wishlist:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error checking wishlist' 
    });
  }
});

// ✅ Clear entire wishlist
router.delete('/', protect, async (req, res) => {
  try {
    console.log('🗑️ Clearing wishlist for user:', req.user._id);
    
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      console.log('❌ Wishlist not found');
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
      message: 'Wishlist cleared' 
    });
  } catch (error) {
    console.error('❌ Error clearing wishlist:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error clearing wishlist' 
    });
  }
});

export default router;