// ✅ wolf-backend/models/Product.js - FIXED (No Duplicate Index)
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
      // ✅ REMOVED: index: true (keeping only schema.index below)
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    images: [
      {
        type: String,
      },
    ],
    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
      // ✅ REMOVED: index: true
    },
    subCategory: {
      type: String,
      trim: true,
      // ✅ REMOVED: index: true
    },
    brand: {
      type: String,
      default: "2Wolf",
      trim: true,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true
    },
    
    // Basic specifications
    material: String,
    size: String,
    color: String,
    gender: String,
    weight: String,
    dimensions: String,
    warranty: String,
    
    // Electronics specific
    processor: String,
    ram: String,
    storage: String,
    screenSize: String,
    
    // Watch specific
    movement: String,
    bandMaterial: String,
    caseStyle: String,
    waterResistance: String,
    
    // Clothing specific
    fit: String,
    pattern: String,
    heelType: String,
    closureType: String,
    
    // Kitchen specific
    capacity: String,
    powerWattage: String,
    voltage: String,
    
    // NEW FIELDS - Amazon style
    features: [{
      type: String
    }],
    productDetails: [{
      label: String,
      value: String
    }],
    colors: [{
      name: String,
      image: String
    }],
    modelNumber: String,
    department: {
      type: String,
      default: "Unisex"
    },
    
    // Variants
    variants: [{
      name: String,
      value: String,
      priceAdjustment: Number,
      stock: Number
    }],
    
    featured: {
      type: Boolean,
      default: false,
      // ✅ REMOVED: index: true
    },
    bestSeller: {
      type: Boolean,
      default: false,
      // ✅ REMOVED: index: true
    },
    
    freeDelivery: {
      type: Boolean,
      default: false
    },
    sellingFast: {
      type: Boolean,
      default: false
    },
    lowestPrice: {
      type: Boolean,
      default: false
    },
    showRecentlySold: {
      type: Boolean,
      default: false
    },
    recentlySoldCount: {
      type: Number,
      default: 0
    },
    
    rating: {
      type: Number,
      default: 4,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for discounted price
productSchema.virtual('discountedPrice').get(function() {
  if (this.discount > 0) {
    return this.price - (this.price * this.discount / 100);
  }
  return this.price;
});

// Auto-generate slug from name before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// ✅ Create indexes using schema.index() - NO DUPLICATES
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ subCategory: 1 });
productSchema.index({ category: 1, bestSeller: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ bestSeller: 1 });

export default mongoose.model("Product", productSchema);