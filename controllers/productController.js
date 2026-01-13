// wolf-backend/controllers/productController.js - COMPLETE FIX
import Product from "../models/product.js";
import slugify from "slugify";

// ✅ Create a new product with proper array handling
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    // Parse imageUrls safely
    let imageUrls = [];
    if (req.body.imageUrls) {
      try {
        imageUrls = JSON.parse(req.body.imageUrls);
      } catch (e) {
        if (Array.isArray(req.body.imageUrls)) imageUrls = req.body.imageUrls;
        else imageUrls = [];
      }
    }

    if (req.body.images && Array.isArray(req.body.images)) {
      imageUrls = req.body.images;
    }

    const uploadedUrls =
      req.files && req.files.length > 0
        ? req.files.map((f) => f.path || f.secure_url || f.url).filter(Boolean)
        : [];

    const images = [...(Array.isArray(imageUrls) ? imageUrls : []), ...uploadedUrls];

    // ✅ CRITICAL FIX: Handle videos properly
    let videos = [];
    if (req.body.videos) {
      try {
        videos = typeof req.body.videos === 'string' ? JSON.parse(req.body.videos) : req.body.videos;
        if (!Array.isArray(videos)) videos = [];
      } catch (e) {
        console.error('Error parsing videos:', e);
        videos = [];
      }
    }

    // Create slug
    let slug = slugify(name, { lower: true, strict: true });
    const exists = await Product.findOne({ slug });
    if (exists) {
      slug = `${slug}-${Date.now()}`;
    }

    // ✅ CRITICAL FIX: Handle features array properly
    let features = [];
    if (req.body.features) {
      if (typeof req.body.features === 'string') {
        try {
          // Try to parse as JSON first
          const parsed = JSON.parse(req.body.features);
          features = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          // If not JSON, split by comma or newline
          features = req.body.features
            .split(/[\n,]/)
            .map(f => f.trim())
            .filter(f => f.length > 0);
        }
      } else if (Array.isArray(req.body.features)) {
        features = req.body.features.filter(f => f && f.trim().length > 0);
      }
    }

    // ✅ CRITICAL FIX: Handle productDetails array properly
    let productDetails = [];
    if (req.body.productDetails) {
      if (typeof req.body.productDetails === 'string') {
        try {
          const parsed = JSON.parse(req.body.productDetails);
          if (Array.isArray(parsed)) {
            productDetails = parsed.filter(d => d && d.label && d.value);
          }
        } catch (e) {
          console.error('Error parsing productDetails:', e);
        }
      } else if (Array.isArray(req.body.productDetails)) {
        productDetails = req.body.productDetails.filter(d => d && d.label && d.value);
      }
    }

    // Prepare product data
    const productData = {
      name,
      slug,
      description: description || '',
      price: Number(price || 0),
      originalPrice: req.body.originalPrice ? Number(req.body.originalPrice) : undefined,
      stock: Number(req.body.stock || 0),
      discount: Number(req.body.discount || 0),
      category,
      subCategory: req.body.subCategory || '',
      brand: req.body.brand || '2Wolf',
      sku: req.body.sku || undefined,
      images,
      videos,
      
      // Basic specs
      material: req.body.material || '',
      size: req.body.size || '',
      color: req.body.color || '',
      gender: req.body.gender || '',
      weight: req.body.weight || '',
      dimensions: req.body.dimensions || '',
      warranty: req.body.warranty || '',
      
      // Electronics
      processor: req.body.processor || '',
      ram: req.body.ram || '',
      storage: req.body.storage || '',
      screenSize: req.body.screenSize || '',
      
      // Watch
      movement: req.body.movement || '',
      bandMaterial: req.body.bandMaterial || '',
      caseStyle: req.body.caseStyle || '',
      waterResistance: req.body.waterResistance || '',
      
      // Clothing
      fit: req.body.fit || '',
      pattern: req.body.pattern || '',
      heelType: req.body.heelType || '',
      closureType: req.body.closureType || '',
      
      // Kitchen
      capacity: req.body.capacity || '',
      powerWattage: req.body.powerWattage || '',
      voltage: req.body.voltage || '',
      
      // ✅ CRITICAL: Properly set arrays
      features: features,
      productDetails: productDetails,
      colors: req.body.colors || [],
      modelNumber: req.body.modelNumber || '',
      department: req.body.department || 'Unisex',
      variants: req.body.variants || [],
      
      featured: req.body.featured || false,
      bestSeller: req.body.bestSeller || false,
      
      freeDelivery: req.body.freeDelivery !== undefined ? req.body.freeDelivery : false,
      sellingFast: req.body.sellingFast !== undefined ? req.body.sellingFast : false,
      lowestPrice: req.body.lowestPrice !== undefined ? req.body.lowestPrice : false,
      showRecentlySold: req.body.showRecentlySold !== undefined ? req.body.showRecentlySold : false,
      recentlySoldCount: Number(req.body.recentlySoldCount || 0),
      
      user: req.user?._id,
    };

    console.log('📦 Creating product with:');
    console.log('  - Features count:', features.length);
    console.log('  - Features:', features);
    console.log('  - ProductDetails count:', productDetails.length);
    console.log('  - ProductDetails:', productDetails);
    console.log('  - Videos count:', videos.length);

    const product = await Product.create(productData);

    // ✅ CRITICAL: Verify what was actually saved
    const savedProduct = await Product.findById(product._id).lean();
    console.log('✅ Saved product features:', savedProduct.features);
    console.log('✅ Saved product productDetails:', savedProduct.productDetails);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: savedProduct,
    });
  } catch (error) {
    console.error("❌ Product creation error:", error);
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Product with same slug already exists",
        error: error.message,
      });
    }
    res.status(500).json({
      success: false,
      message: "Error creating product",
      error: error.message,
    });
  }
};

// ✅ Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().lean();
    
    console.log('📦 Fetched products count:', products.length);
    
    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// ✅ CRITICAL FIX: Get product by ID with detailed logging
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: "Product not found" 
      });
    }

    console.log('📦 Retrieved product:', product.name);
    console.log('   Features type:', typeof product.features, 'isArray:', Array.isArray(product.features));
    console.log('   Features:', product.features);
    console.log('   ProductDetails type:', typeof product.productDetails, 'isArray:', Array.isArray(product.productDetails));
    console.log('   ProductDetails:', product.productDetails);
    console.log('   Description length:', product.description?.length || 0);

    // ✅ CRITICAL: Ensure arrays are properly formatted
    const responseProduct = {
      ...product,
      features: Array.isArray(product.features) ? product.features : [],
      productDetails: Array.isArray(product.productDetails) ? product.productDetails : [],
      videos: Array.isArray(product.videos) ? product.videos : [],
      colors: Array.isArray(product.colors) ? product.colors : [],
      variants: Array.isArray(product.variants) ? product.variants : [],
    };

    res.status(200).json({ 
      success: true,
      product: responseProduct
    });
  } catch (error) {
    console.error("❌ getProductById Error:", error.message);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// ✅ Update product with proper array handling
export const updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };

    // Ensure numeric fields
    if (updates.stock !== undefined) updates.stock = Number(updates.stock);
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.originalPrice !== undefined) updates.originalPrice = Number(updates.originalPrice);
    if (updates.discount !== undefined) updates.discount = Number(updates.discount);
    if (updates.recentlySoldCount !== undefined) updates.recentlySoldCount = Number(updates.recentlySoldCount);

    // ✅ CRITICAL: Handle features array
    if (updates.features !== undefined) {
      if (typeof updates.features === 'string') {
        try {
          const parsed = JSON.parse(updates.features);
          updates.features = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
          updates.features = updates.features
            .split(/[\n,]/)
            .map(f => f.trim())
            .filter(f => f.length > 0);
        }
      } else if (!Array.isArray(updates.features)) {
        updates.features = [];
      }
    }

    // ✅ CRITICAL: Handle productDetails array
    if (updates.productDetails !== undefined) {
      if (typeof updates.productDetails === 'string') {
        try {
          const parsed = JSON.parse(updates.productDetails);
          updates.productDetails = Array.isArray(parsed) ? parsed.filter(d => d && d.label && d.value) : [];
        } catch (e) {
          updates.productDetails = [];
        }
      } else if (!Array.isArray(updates.productDetails)) {
        updates.productDetails = [];
      }
    }

    // Handle other arrays
    if (updates.videos !== undefined) {
      if (typeof updates.videos === 'string') {
        try {
          updates.videos = JSON.parse(updates.videos);
        } catch (e) {
          updates.videos = [];
        }
      }
      if (!Array.isArray(updates.videos)) updates.videos = [];
    }

    if (updates.colors && !Array.isArray(updates.colors)) updates.colors = [];
    if (updates.variants && !Array.isArray(updates.variants)) updates.variants = [];

    console.log('🔄 Updating product with:');
    console.log('  - Features:', updates.features);
    console.log('  - ProductDetails:', updates.productDetails);

    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      updates, 
      {
        new: true,
        runValidators: true,
      }
    ).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    console.log('✅ Updated successfully');
    console.log('  - Features count:', product.features?.length || 0);
    console.log('  - ProductDetails count:', product.productDetails?.length || 0);

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(400).json({
      success: false,
      message: "Error updating product",
      error: error.message,
    });
  }
};

// ✅ Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting product",
      error: error.message,
    });
  }
};