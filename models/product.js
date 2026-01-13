// wolf-backend/models/product.js - COMPLETE SCHEMA
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    originalPrice: {
      type: Number,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      default: '',
    },
    brand: {
      type: String,
      default: '2Wolf',
    },
    sku: {
      type: String,
    },
    modelNumber: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      default: 'Unisex',
    },
    images: {
      type: [String],
      default: [],
    },
    
    // ✅ CRITICAL: Features array for bullet points
    features: {
      type: [String],
      default: [],
    },
    
    // ✅ CRITICAL: Product details for specifications table
    productDetails: {
      type: [{
        label: {
          type: String,
          required: true,
        },
        value: {
          type: String,
          required: true,
        }
      }],
      default: [],
    },
    
    // Videos array
    videos: {
      type: [{
        url: String,
        title: String,
        thumbnail: String,
        duration: String,
      }],
      default: [],
    },
    
    // Colors and variants
    colors: {
      type: [{
        name: String,
        code: String,
        image: String,
      }],
      default: [],
    },
    variants: {
      type: [{
        name: String,
        value: String,
        priceAdjustment: Number,
        stock: Number,
      }],
      default: [],
    },
    
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // Basic specifications
    material: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '',
    },
    size: {
      type: String,
      default: '',
    },
    weight: {
      type: String,
      default: '',
    },
    dimensions: {
      type: String,
      default: '',
    },
    warranty: {
      type: String,
      default: '',
    },
    gender: {
      type: String,
      default: '',
    },
    
    // Electronics specific
    processor: {
      type: String,
      default: '',
    },
    ram: {
      type: String,
      default: '',
    },
    storage: {
      type: String,
      default: '',
    },
    screenSize: {
      type: String,
      default: '',
    },
    
    // Watch specific
    movement: {
      type: String,
      default: '',
    },
    bandMaterial: {
      type: String,
      default: '',
    },
    caseStyle: {
      type: String,
      default: '',
    },
    waterResistance: {
      type: String,
      default: '',
    },
    
    // Clothing specific
    fit: {
      type: String,
      default: '',
    },
    pattern: {
      type: String,
      default: '',
    },
    heelType: {
      type: String,
      default: '',
    },
    closureType: {
      type: String,
      default: '',
    },
    
    // Kitchen/Appliance specific
    capacity: {
      type: String,
      default: '',
    },
    powerWattage: {
      type: String,
      default: '',
    },
    voltage: {
      type: String,
      default: '',
    },
    
    // Display flags
    featured: {
      type: Boolean,
      default: false,
    },
    bestSeller: {
      type: Boolean,
      default: false,
    },
    freeDelivery: {
      type: Boolean,
      default: false,
    },
    sellingFast: {
      type: Boolean,
      default: false,
    },
    lowestPrice: {
      type: Boolean,
      default: false,
    },
    showRecentlySold: {
      type: Boolean,
      default: false,
    },
    recentlySoldCount: {
      type: Number,
      default: 0,
    },
    
    // Reviews
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for better search performance
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, subCategory: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ bestSeller: 1 });

const Product = mongoose.model("Product", productSchema);

export default Product;