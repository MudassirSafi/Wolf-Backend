// ✅ wolf-backend/seeders/categorySeeder.js
import mongoose from "mongoose";
import Product from "../models/product.js";
import dotenv from "dotenv";

dotenv.config();

const categoryProducts = [
  // ============ MEN'S FASHION ============
  {
    name: "Classic Polo Shirt",
    slug: "classic-polo-shirt",
    description: "Premium cotton polo shirt for men",
    price: 29.99,
    stock: 50,
    discount: 30,
    category: "Men's Fashion",
    subCategory: "Polos",
    brand: "StyleCraft",
    images: ["https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500"],
  },
  {
    name: "Luxury Watch Gold",
    slug: "luxury-watch-gold",
    description: "Elegant gold-plated watch",
    price: 299.99,
    stock: 25,
    discount: 40,
    category: "Men's Fashion",
    subCategory: "Watches",
    brand: "TimeMax",
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"],
  },
  {
    name: "Aviator Sunglasses",
    slug: "aviator-sunglasses",
    description: "Classic aviator style sunglasses",
    price: 89.99,
    stock: 40,
    discount: 25,
    category: "Men's Fashion",
    subCategory: "Sunglasses",
    brand: "VisionPro",
    images: ["https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500"],
  },
  {
    name: "Leather Oxford Shoes",
    slug: "leather-oxford-shoes",
    description: "Premium leather formal shoes",
    price: 129.99,
    stock: 30,
    discount: 35,
    category: "Men's Fashion",
    subCategory: "Shoes",
    brand: "FootElite",
    images: ["https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500"],
  },

  // ============ FITNESS GEAR ============
  {
    name: "Men's Running Shoes",
    slug: "mens-running-shoes",
    description: "Lightweight running shoes with cushioning",
    price: 79.99,
    stock: 60,
    discount: 20,
    category: "Fitness",
    subCategory: "Men's Shoes",
    brand: "AthleticPro",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"],
  },
  {
    name: "Women's Yoga Shoes",
    slug: "womens-yoga-shoes",
    description: "Flexible yoga and fitness shoes",
    price: 59.99,
    stock: 45,
    discount: 15,
    category: "Fitness",
    subCategory: "Women's Shoes",
    brand: "FlexFit",
    images: ["https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=500"],
  },
  {
    name: "Men's Sports T-Shirt",
    slug: "mens-sports-tshirt",
    description: "Breathable athletic t-shirt",
    price: 24.99,
    stock: 80,
    discount: 30,
    category: "Fitness",
    subCategory: "Men's Clothes",
    brand: "ActiveWear",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"],
  },
  {
    name: "Women's Fitness Leggings",
    slug: "womens-fitness-leggings",
    description: "High-waist compression leggings",
    price: 39.99,
    stock: 70,
    discount: 25,
    category: "Fitness",
    subCategory: "Women's Clothes",
    brand: "FitStyle",
    images: ["https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=500"],
  },

  // ============ APPLIANCES ============
  {
    name: "Digital Air Fryer",
    slug: "digital-air-fryer",
    description: "5L capacity air fryer with digital controls",
    price: 89.99,
    stock: 35,
    discount: 40,
    category: "Appliances",
    subCategory: "Air Fryers",
    brand: "KitchenMaster",
    images: ["https://images.unsplash.com/photo-1585515320310-259814833e62?w=500"],
  },
  {
    name: "HEPA Air Purifier",
    slug: "hepa-air-purifier",
    description: "3-stage air purification system",
    price: 149.99,
    stock: 20,
    discount: 30,
    category: "Appliances",
    subCategory: "Air Purifiers",
    brand: "PureAir",
    images: ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500"],
  },
  {
    name: "Electric Pressure Cooker",
    slug: "electric-pressure-cooker",
    description: "6-quart programmable pressure cooker",
    price: 79.99,
    stock: 40,
    discount: 35,
    category: "Appliances",
    subCategory: "Cookers",
    brand: "CookFast",
    images: ["https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=500"],
  },
  {
    name: "High-Speed Blender",
    slug: "high-speed-blender",
    description: "1200W professional blender",
    price: 69.99,
    stock: 50,
    discount: 40,
    category: "Appliances",
    subCategory: "Blenders & Juicers",
    brand: "BlendPro",
    images: ["https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500"],
  },

  // ============ TOYS ============
  {
    name: "Educational Tablet",
    slug: "educational-tablet",
    description: "Kids learning tablet with games",
    price: 49.99,
    stock: 60,
    discount: 20,
    category: "Toys",
    subCategory: "Learning Toys",
    brand: "LearnKids",
    images: ["https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=500"],
  },
  {
    name: "LEGO Building Set",
    slug: "lego-building-set",
    description: "500-piece creative building blocks",
    price: 39.99,
    stock: 75,
    discount: 15,
    category: "Toys",
    subCategory: "Building Blocks",
    brand: "BuildMaster",
    images: ["https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=500"],
  },
  {
    name: "Fashion Doll Set",
    slug: "fashion-doll-set",
    description: "Doll with accessories and outfits",
    price: 29.99,
    stock: 55,
    discount: 25,
    category: "Toys",
    subCategory: "Dolls & Accessories",
    brand: "DollWorld",
    images: ["https://images.unsplash.com/photo-1582580042712-4d8d7a836154?w=500"],
  },
  {
    name: "Kids Trampoline",
    slug: "kids-trampoline",
    description: "Indoor/outdoor mini trampoline",
    price: 119.99,
    stock: 25,
    discount: 30,
    category: "Toys",
    subCategory: "Outdoor Play",
    brand: "JumpFun",
    images: ["https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=500"],
  },

  // Additional products for Hero Section
  {
    name: "Premium Headphones",
    slug: "premium-headphones",
    description: "Noise-cancelling over-ear headphones",
    price: 199.99,
    stock: 40,
    discount: 20,
    category: "Electronics",
    subCategory: "Audio",
    brand: "SoundMax",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"],
  },
  {
    name: "Leather Wallet",
    slug: "leather-wallet",
    description: "Genuine leather bifold wallet",
    price: 49.99,
    stock: 65,
    discount: 25,
    category: "Accessories",
    subCategory: "Wallets",
    brand: "LeatherCraft",
    images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=500"],
  },
  {
    name: "Silver Bracelet",
    slug: "silver-bracelet",
    description: "Sterling silver chain bracelet",
    price: 89.99,
    stock: 30,
    discount: 15,
    category: "Jewelry",
    subCategory: "Bracelets",
    brand: "JewelCraft",
    images: ["https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=500"],
  },
];

async function seedCategoryProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    // Clear existing products
    await Product.deleteMany({});
    console.log("🗑️  Cleared existing products");

    // Insert new products
    await Product.insertMany(categoryProducts);
    console.log(`✅ Inserted ${categoryProducts.length} category products`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
}

seedCategoryProducts();