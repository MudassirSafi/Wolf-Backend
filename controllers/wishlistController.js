// ==========================================
// 📁 FILE 2: wolf-backend/controllers/wishlistController.js
// ==========================================
import Wishlist from '../models/Wishlist.js';
import Product from '../models/product.js';

// Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    console.log('\n=== GET WISHLIST DEBUG START ===');
    console.log('🔍 User ID:', req.user._id);
    console.log('👤 User Email:', req.user.email);
    
    let wishlist = await Wishlist.findOne({ user: req.user._id })
      .populate({
        path: 'products',
        select: 'name price images description discount stock category'
      });

    if (!wishlist) {
      console.log('📝 Creating new wishlist for user');
      wishlist = await Wishlist.create({ 
        user: req.user._id, 
        products: [] 
      });
    }

    console.log('✅ Wishlist found/created:', wishlist.products.length, 'items');
    console.log('=== GET WISHLIST DEBUG END ===\n');

    res.json({
      success: true,
      items: wishlist.products
    });
  } catch (error) {
    console.error('❌ Error getting wishlist:', error);
    console.log('=== GET WISHLIST DEBUG END ===\n');
    res.status(500).json({ 
      success: false,
      message: 'Error fetching wishlist',
      error: error.message 
    });
  }
};

// Add product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    console.log('\n=== ADD TO WISHLIST DEBUG START ===');
    console.log('🔍 User ID:', req.user._id);
    console.log('📦 Product ID from request:', req.body.productId);
    
    const { productId } = req.body;

    if (!productId) {
      console.log('❌ No product ID provided');
      console.log('=== ADD TO WISHLIST DEBUG END ===\n');
      return res.status(400).json({ 
        success: false,
        message: 'Product ID is required' 
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      console.log('❌ Product not found:', productId);
      console.log('=== ADD TO WISHLIST DEBUG END ===\n');
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    console.log('✅ Product found:', product.name);

    // Find or create wishlist
    let wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      console.log('📝 Creating new wishlist');
      wishlist = await Wishlist.create({ 
        user: req.user._id, 
        products: [productId] 
      });
    } else {
      // Check if product already in wishlist
      if (wishlist.products.includes(productId)) {
        console.log('⚠️ Product already in wishlist');
        console.log('=== ADD TO WISHLIST DEBUG END ===\n');
        return res.status(400).json({ 
          success: false,
          message: 'Product already in wishlist' 
        });
      }

      console.log('➕ Adding product to existing wishlist');
      wishlist.products.push(productId);
      await wishlist.save();
    }

    // Populate and return
    await wishlist.populate({
      path: 'products',
      select: 'name price images description discount stock category'
    });

    console.log('✅ Product added successfully. Total items:', wishlist.products.length);
    console.log('=== ADD TO WISHLIST DEBUG END ===\n');

    res.json({
      success: true,
      message: 'Product added to wishlist',
      items: wishlist.products
    });
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error);
    console.log('=== ADD TO WISHLIST DEBUG END ===\n');
    res.status(500).json({ 
      success: false,
      message: 'Server error adding to wishlist',
      error: error.message 
    });
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    console.log('\n=== REMOVE FROM WISHLIST DEBUG START ===');
    console.log('🔍 User ID:', req.user._id);
    console.log('📦 Product ID to remove:', req.params.productId);
    
    const { productId } = req.params;

    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      console.log('❌ Wishlist not found');
      console.log('=== REMOVE FROM WISHLIST DEBUG END ===\n');
      return res.status(404).json({ 
        success: false,
        message: 'Wishlist not found' 
      });
    }

    console.log('📋 Current wishlist items:', wishlist.products.length);
    
    // Remove product
    wishlist.products = wishlist.products.filter(
      id => id.toString() !== productId
    );

    await wishlist.save();

    // Populate and return
    await wishlist.populate({
      path: 'products',
      select: 'name price images description discount stock category'
    });

    console.log('✅ Product removed. Remaining items:', wishlist.products.length);
    console.log('=== REMOVE FROM WISHLIST DEBUG END ===\n');

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      items: wishlist.products
    });
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error);
    console.log('=== REMOVE FROM WISHLIST DEBUG END ===\n');
    res.status(500).json({ 
      success: false,
      message: 'Error removing from wishlist',
      error: error.message 
    });
  }
};

// Clear wishlist
export const clearWishlist = async (req, res) => {
  try {
    console.log('\n=== CLEAR WISHLIST DEBUG START ===');
    console.log('🔍 User ID:', req.user._id);
    
    const wishlist = await Wishlist.findOne({ user: req.user._id });

    if (!wishlist) {
      console.log('⚠️ No wishlist to clear');
      console.log('=== CLEAR WISHLIST DEBUG END ===\n');
      return res.status(404).json({ 
        success: false,
        message: 'Wishlist not found' 
      });
    }

    wishlist.products = [];
    await wishlist.save();

    console.log('✅ Wishlist cleared');
    console.log('=== CLEAR WISHLIST DEBUG END ===\n');

    res.json({
      success: true,
      message: 'Wishlist cleared',
      items: []
    });
  } catch (error) {
    console.error('❌ Error clearing wishlist:', error);
    console.log('=== CLEAR WISHLIST DEBUG END ===\n');
    res.status(500).json({ 
      success: false,
      message: 'Error clearing wishlist',
      error: error.message 
    });
  }
};