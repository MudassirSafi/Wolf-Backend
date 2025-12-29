import Product from "../models/product.js";
import slugify from "slugify";

// ✅ Create a new product with Cloudinary image upload (complete version)
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    // Parse imageUrls safely if provided (sent as JSON string from frontend)
    let imageUrls = [];
    if (req.body.imageUrls) {
      try {
        imageUrls = JSON.parse(req.body.imageUrls);
      } catch (e) {
        if (Array.isArray(req.body.imageUrls)) imageUrls = req.body.imageUrls;
        else imageUrls = [];
      }
    }

    // Handle images array directly if sent from ProductImportTool
    if (req.body.images && Array.isArray(req.body.images)) {
      imageUrls = req.body.images;
    }

    // Get uploaded file URLs from Cloudinary/multer (support f.path or f.secure_url)
    const uploadedUrls =
      req.files && req.files.length > 0
        ? req.files.map((f) => f.path || f.secure_url || f.url).filter(Boolean)
        : [];

    // Combine both URL types
    const images = [...(Array.isArray(imageUrls) ? imageUrls : []), ...uploadedUrls];

    // Create slug and avoid duplicates
    let slug = slugify(name, { lower: true, strict: true });
    const exists = await Product.findOne({ slug });
    if (exists) {
      slug = `${slug}-${Date.now()}`; // simple uniquifier
    }

    // Prepare product data with all fields
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
      
      // NEW FIELDS - Amazon style
      features: req.body.features || [],
      productDetails: req.body.productDetails || [],
      colors: req.body.colors || [],
      modelNumber: req.body.modelNumber || '',
      department: req.body.department || 'Unisex',
      variants: req.body.variants || [],
      
      featured: req.body.featured || false,
      bestSeller: req.body.bestSeller || false,
      user: req.user?._id,
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Product creation error:", error);
    // if duplicate key we can return 409
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
    const products = await Product.find();
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

// ✅ Get product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ Always wrap inside an object with "product" key
    res.status(200).json({ product });
  } catch (error) {
    console.error("❌ getProductById Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Update product by ID
export const updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };

    // ✅ Ensure numeric fields are numbers (avoid string errors from frontend)
    if (updates.stock !== undefined) {
      updates.stock = Number(updates.stock);
    }
    if (updates.price !== undefined) {
      updates.price = Number(updates.price);
    }
    if (updates.originalPrice !== undefined) {
      updates.originalPrice = Number(updates.originalPrice);
    }
    if (updates.discount !== undefined) {
      updates.discount = Number(updates.discount);
    }

    // ✅ Handle arrays properly
    if (updates.features && !Array.isArray(updates.features)) {
      updates.features = [];
    }
    if (updates.productDetails && !Array.isArray(updates.productDetails)) {
      updates.productDetails = [];
    }
    if (updates.colors && !Array.isArray(updates.colors)) {
      updates.colors = [];
    }
    if (updates.variants && !Array.isArray(updates.variants)) {
      updates.variants = [];
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true, // returns updated product
      runValidators: true, // validate before update
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Error updating product:", error);
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