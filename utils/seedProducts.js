// ✅ FIXED: Using ES Modules instead of CommonJS
import mongoose from 'mongoose';
import Product from './models/Product.js';
import Brand from './models/Brand.js';
import dotenv from 'dotenv';

dotenv.config();

const products = [
  // Shop by Brand Products - Nike
  {
    name: 'Nike Air Max 270',
    description: 'Comfortable running shoes with Air Max cushioning',
    price: 150,
    category: 'nike',
    brand: 'Nike',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500'],
    stock: 50,
    featured: true,
    rating: 4.5,
    reviewCount: 128
  },
  {
    name: 'Nike Dri-FIT Training Shirt',
    description: 'Moisture-wicking athletic shirt for intense workouts',
    price: 35,
    category: 'nike',
    brand: 'Nike',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'],
    stock: 100,
    featured: false,
    rating: 4.3,
    reviewCount: 89
  },
  {
    name: 'Nike Pro Compression Shorts',
    description: 'High-performance compression shorts for athletes',
    price: 45,
    category: 'nike',
    brand: 'Nike',
    images: ['https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500'],
    stock: 75,
    featured: false,
    rating: 4.6,
    reviewCount: 156
  },

  // Shop by Brand Products - Adidas
  {
    name: 'Adidas Ultraboost 22',
    description: 'Premium running shoes with Boost technology',
    price: 180,
    category: 'adidas',
    brand: 'Adidas',
    images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500'],
    stock: 40,
    featured: true,
    rating: 4.7,
    reviewCount: 203
  },
  {
    name: 'Adidas Essentials Hoodie',
    description: 'Classic comfortable hoodie for everyday wear',
    price: 65,
    category: 'adidas',
    brand: 'Adidas',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500'],
    stock: 80,
    featured: false,
    rating: 4.4,
    reviewCount: 112
  },

  // Best Kitchen Equipments - Cookware
  {
    name: 'Professional Non-Stick Frying Pan Set',
    description: '3-piece premium non-stick frying pan set',
    price: 89.99,
    category: 'cookware',
    brand: 'KitchenPro',
    images: ['https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500'],
    stock: 35,
    featured: true,
    rating: 4.8,
    reviewCount: 245
  },
  {
    name: 'Stainless Steel Pot Set',
    description: '5-piece stainless steel cooking pot set with lids',
    price: 129.99,
    category: 'cookware',
    brand: 'KitchenPro',
    images: ['https://images.unsplash.com/photo-1584990347449-5d3f48b1aea9?w=500'],
    stock: 25,
    featured: false,
    rating: 4.6,
    reviewCount: 178
  },
  {
    name: 'Cast Iron Dutch Oven',
    description: 'Heavy-duty 6-quart cast iron dutch oven',
    price: 79.99,
    category: 'cookware',
    brand: 'HomeChef',
    images: ['https://images.unsplash.com/photo-1585237672215-c691ab86c42b?w=500'],
    stock: 20,
    featured: false,
    rating: 4.9,
    reviewCount: 312
  },

  // Best Kitchen Equipments - Cutlery & Knives
  {
    name: 'Professional Chef Knife Set',
    description: '8-piece professional grade knife set with block',
    price: 159.99,
    category: 'cutlery-knives',
    brand: 'SharpEdge',
    images: ['https://images.unsplash.com/photo-1593618998160-e34014e67546?w=500'],
    stock: 30,
    featured: true,
    rating: 4.7,
    reviewCount: 189
  },
  {
    name: 'Ceramic Knife Set',
    description: '5-piece ultra-sharp ceramic knife collection',
    price: 69.99,
    category: 'cutlery-knives',
    brand: 'SharpEdge',
    images: ['https://images.unsplash.com/photo-1560268047-486a78c916c8?w=500'],
    stock: 45,
    featured: false,
    rating: 4.4,
    reviewCount: 134
  },

  // Best Kitchen Equipments - Small Appliances
  {
    name: 'High-Speed Blender Pro',
    description: '1500W professional blender with multiple speeds',
    price: 199.99,
    category: 'small-appliances',
    brand: 'BlendMaster',
    images: ['https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500'],
    stock: 20,
    featured: true,
    rating: 4.8,
    reviewCount: 267
  },
  {
    name: 'Stand Mixer Deluxe',
    description: '6-quart stand mixer with 10 speeds',
    price: 279.99,
    category: 'small-appliances',
    brand: 'BakePro',
    images: ['https://images.unsplash.com/photo-1578469645742-46cae010e5d4?w=500'],
    stock: 15,
    featured: true,
    rating: 4.9,
    reviewCount: 423
  },
  {
    name: 'Food Processor Multi-Function',
    description: '12-cup food processor with multiple attachments',
    price: 149.99,
    category: 'small-appliances',
    brand: 'ChefAssist',
    images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=500'],
    stock: 25,
    featured: false,
    rating: 4.6,
    reviewCount: 198
  },

  // More products with discount for the deals section
  {
    name: 'Premium Coffee Maker',
    description: 'Programmable coffee maker with thermal carafe',
    price: 89.99,
    discount: 25,
    category: 'small-appliances',
    brand: 'BrewMaster',
    images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500'],
    stock: 30,
    featured: true,
    rating: 4.7,
    reviewCount: 356
  },
  {
    name: 'Electric Kettle Deluxe',
    description: 'Stainless steel electric kettle with temperature control',
    price: 49.99,
    discount: 30,
    category: 'small-appliances',
    brand: 'QuickBoil',
    images: ['https://images.unsplash.com/photo-1563299796-17596ed6b017?w=500'],
    stock: 45,
    featured: false,
    rating: 4.5,
    reviewCount: 223
  },
  {
    name: 'Air Fryer XL',
    description: '5.8 quart digital air fryer with 8 presets',
    price: 129.99,
    discount: 40,
    category: 'small-appliances',
    brand: 'CrispPro',
    images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=500'],
    stock: 18,
    featured: true,
    rating: 4.8,
    reviewCount: 512
  }
];

const brands = [
  {
    name: 'Nike',
    description: 'Leading sports and athletic wear brand',
    logo: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
    featured: true
  },
  {
    name: 'Adidas',
    description: 'Premium sportswear and footwear',
    logo: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=200',
    featured: true
  },
  {
    name: 'KitchenPro',
    description: 'Professional kitchen equipment',
    logo: 'https://via.placeholder.com/200x200?text=KitchenPro',
    featured: true
  },
  {
    name: 'FreshFarm',
    description: 'Organic produce and fresh foods',
    logo: 'https://via.placeholder.com/200x200?text=FreshFarm',
    featured: true
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Brand.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert brands
    await Brand.insertMany(brands);
    console.log(`✅ Seeded ${brands.length} brands`);

    // Insert products
    await Product.insertMany(products);
    console.log(`✅ Seeded ${products.length} products`);

    console.log(`\n🎉 Successfully seeded database!`);
    console.log(`   - ${products.length} products`);
    console.log(`   - ${brands.length} brands\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();