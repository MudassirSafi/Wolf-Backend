const mongoose = require('mongoose');
const Product = require('./models/Product');
const Brand = require('./models/Brand');
require('dotenv').config();

const products = [
  // Shop by Brand Products - Nike
  {
    name: 'Nike Air Max 270',
    description: 'Comfortable running shoes with Air Max cushioning',
    price: 150,
    category: 'nike',
    brand: 'Nike',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    stock: 50,
    featured: true
  },
  {
    name: 'Nike Dri-FIT Training Shirt',
    description: 'Moisture-wicking athletic shirt for intense workouts',
    price: 35,
    category: 'nike',
    brand: 'Nike',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500',
    stock: 100,
    featured: false
  },
  {
    name: 'Nike Pro Compression Shorts',
    description: 'High-performance compression shorts for athletes',
    price: 45,
    category: 'nike',
    brand: 'Nike',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=500',
    stock: 75,
    featured: false
  },

  // Shop by Brand Products - Adidas
  {
    name: 'Adidas Ultraboost 22',
    description: 'Premium running shoes with Boost technology',
    price: 180,
    category: 'adidas',
    brand: 'Adidas',
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500',
    stock: 40,
    featured: true
  },
  {
    name: 'Adidas Essentials Hoodie',
    description: 'Classic comfortable hoodie for everyday wear',
    price: 65,
    category: 'adidas',
    brand: 'Adidas',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
    stock: 80,
    featured: false
  },

  // Best Kitchen Equipments - Cookware
  {
    name: 'Professional Non-Stick Frying Pan Set',
    description: '3-piece premium non-stick frying pan set',
    price: 89.99,
    category: 'cookware',
    brand: 'KitchenPro',
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500',
    stock: 35,
    featured: true
  },
  {
    name: 'Stainless Steel Pot Set',
    description: '5-piece stainless steel cooking pot set with lids',
    price: 129.99,
    category: 'cookware',
    brand: 'KitchenPro',
    image: 'https://images.unsplash.com/photo-1584990347449-5d3f48b1aea9?w=500',
    stock: 25,
    featured: false
  },
  {
    name: 'Cast Iron Dutch Oven',
    description: 'Heavy-duty 6-quart cast iron dutch oven',
    price: 79.99,
    category: 'cookware',
    brand: 'HomeChef',
    image: 'https://images.unsplash.com/photo-1585237672215-c691ab86c42b?w=500',
    stock: 20,
    featured: false
  },

  // Best Kitchen Equipments - Cutlery & Knives
  {
    name: 'Professional Chef Knife Set',
    description: '8-piece professional grade knife set with block',
    price: 159.99,
    category: 'cutlery-knives',
    brand: 'SharpEdge',
    image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=500',
    stock: 30,
    featured: true
  },
  {
    name: 'Ceramic Knife Set',
    description: '5-piece ultra-sharp ceramic knife collection',
    price: 69.99,
    category: 'cutlery-knives',
    brand: 'SharpEdge',
    image: 'https://images.unsplash.com/photo-1560268047-486a78c916c8?w=500',
    stock: 45,
    featured: false
  },

  // Best Kitchen Equipments - Small Appliances
  {
    name: 'High-Speed Blender Pro',
    description: '1500W professional blender with multiple speeds',
    price: 199.99,
    category: 'small-appliances',
    brand: 'BlendMaster',
    image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500',
    stock: 20,
    featured: true
  },
  {
    name: 'Stand Mixer Deluxe',
    description: '6-quart stand mixer with 10 speeds',
    price: 279.99,
    category: 'small-appliances',
    brand: 'BakePro',
    image: 'https://images.unsplash.com/photo-1578469645742-46cae010e5d4?w=500',
    stock: 15,
    featured: true
  },
  {
    name: 'Food Processor Multi-Function',
    description: '12-cup food processor with multiple attachments',
    price: 149.99,
    category: 'small-appliances',
    brand: 'ChefAssist',
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500',
    stock: 25,
    featured: false
  },

  // Best Kitchen Equipments - Bakeware
  {
    name: 'Non-Stick Baking Sheet Set',
    description: '4-piece professional baking sheet set',
    price: 45.99,
    category: 'bakeware',
    brand: 'BakeEasy',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500',
    stock: 60,
    featured: false
  },
  {
    name: 'Silicone Baking Molds Set',
    description: '12-piece silicone mold collection for baking',
    price: 34.99,
    category: 'bakeware',
    brand: 'BakeEasy',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
    stock: 50,
    featured: false
  },

  // SuperMarket - Fresh Produce
  {
    name: 'Organic Mixed Vegetables Pack',
    description: 'Fresh organic seasonal vegetables (2kg)',
    price: 12.99,
    category: 'fresh-produce',
    brand: 'FreshFarm',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=500',
    stock: 100,
    featured: true
  },
  {
    name: 'Premium Fruit Basket',
    description: 'Selection of fresh seasonal fruits (3kg)',
    price: 19.99,
    category: 'fresh-produce',
    brand: 'FreshFarm',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500',
    stock: 80,
    featured: true
  },
  {
    name: 'Fresh Herb Bundle',
    description: 'Assorted fresh herbs - basil, mint, cilantro',
    price: 5.99,
    category: 'fresh-produce',
    brand: 'GreenLeaf',
    image: 'https://images.unsplash.com/photo-1509587584298-0f3b3a3a1797?w=500',
    stock: 120,
    featured: false
  },

  // SuperMarket - Dairy & Eggs
  {
    name: 'Organic Whole Milk',
    description: 'Fresh organic whole milk (1 gallon)',
    price: 5.99,
    category: 'dairy-eggs',
    brand: 'DairyFresh',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=500',
    stock: 150,
    featured: false
  },
  {
    name: 'Greek Yogurt Pack',
    description: 'Low-fat Greek yogurt 4-pack',
    price: 6.99,
    category: 'dairy-eggs',
    brand: 'YogurtPlus',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500',
    stock: 90,
    featured: false
  },
  {
    name: 'Farm Fresh Eggs',
    description: 'Free-range large eggs (12 count)',
    price: 4.99,
    category: 'dairy-eggs',
    brand: 'HappyHens',
    image: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500',
    stock: 200,
    featured: true
  },
  {
    name: 'Artisan Cheese Selection',
    description: 'Premium cheese variety pack (500g)',
    price: 14.99,
    category: 'dairy-eggs',
    brand: 'CheeseHouse',
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500',
    stock: 45,
    featured: false
  },

  // SuperMarket - Meat & Seafood
  {
    name: 'Premium Beef Steaks',
    description: 'Choice grade ribeye steaks (1 lb)',
    price: 18.99,
    category: 'meat-seafood',
    brand: 'MeatMarket',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=500',
    stock: 40,
    featured: true
  },
  {
    name: 'Fresh Chicken Breast',
    description: 'Boneless skinless chicken breast (2 lbs)',
    price: 12.99,
    category: 'meat-seafood',
    brand: 'PoultryFarm',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=500',
    stock: 70,
    featured: false
  },
  {
    name: 'Wild Caught Salmon Fillets',
    description: 'Fresh Atlantic salmon fillets (1 lb)',
    price: 22.99,
    category: 'meat-seafood',
    brand: 'SeaHarvest',
    image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500',
    stock: 30,
    featured: true
  },

  // SuperMarket - Bakery
  {
    name: 'Artisan Sourdough Bread',
    description: 'Freshly baked sourdough loaf',
    price: 5.99,
    category: 'bakery',
    brand: 'BakeryFresh',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
    stock: 50,
    featured: true
  },
  {
    name: 'Croissant Pack',
    description: 'Butter croissants 6-pack',
    price: 7.99,
    category: 'bakery',
    brand: 'BakeryFresh',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500',
    stock: 40,
    featured: false
  },
  {
    name: 'Chocolate Chip Cookies',
    description: 'Homemade style cookies (12 count)',
    price: 6.99,
    category: 'bakery',
    brand: 'SweetTreats',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500',
    stock: 60,
    featured: false
  },

  // SuperMarket - Pantry Staples
  {
    name: 'Premium Basmati Rice',
    description: 'Long grain basmati rice (5 lbs)',
    price: 12.99,
    category: 'pantry-staples',
    brand: 'GrainMaster',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500',
    stock: 100,
    featured: false
  },
  {
    name: 'Extra Virgin Olive Oil',
    description: 'Cold-pressed olive oil (750ml)',
    price: 15.99,
    category: 'pantry-staples',
    brand: 'OliveGold',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500',
    stock: 80,
    featured: true
  },
  {
    name: 'Organic Pasta Collection',
    description: 'Assorted pasta shapes 4-pack',
    price: 9.99,
    category: 'pantry-staples',
    brand: 'PastaPerfect',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500',
    stock: 90,
    featured: false
  },

  // SuperMarket - Beverages
  {
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice (1L)',
    price: 6.99,
    category: 'beverages',
    brand: 'FreshSqueeze',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500',
    stock: 120,
    featured: true
  },
  {
    name: 'Sparkling Water Pack',
    description: 'Natural sparkling water 12-pack',
    price: 8.99,
    category: 'beverages',
    brand: 'PureSpring',
    image: 'https://images.unsplash.com/photo-1534353436294-0dbd4bddc19f?w=500',
    stock: 150,
    featured: false
  },
  {
    name: 'Premium Green Tea',
    description: 'Organic green tea bags (100 count)',
    price: 11.99,
    category: 'beverages',
    brand: 'TeaTime',
    image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500',
    stock: 70,
    featured: false
  },

  // SuperMarket - Snacks
  {
    name: 'Mixed Nuts Premium',
    description: 'Roasted and salted mixed nuts (1 lb)',
    price: 13.99,
    category: 'snacks',
    brand: 'NutHouse',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=500',
    stock: 85,
    featured: true
  },
  {
    name: 'Tortilla Chips',
    description: 'Lightly salted tortilla chips (16 oz)',
    price: 4.99,
    category: 'snacks',
    brand: 'CrunchTime',
    image: 'https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=500',
    stock: 110,
    featured: false
  },
  {
    name: 'Popcorn Variety Pack',
    description: 'Gourmet popcorn 4-flavor pack',
    price: 8.99,
    category: 'snacks',
    brand: 'PopCorn Co',
    image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500',
    stock: 95,
    featured: false
  },

  // SuperMarket - Frozen Foods
  {
    name: 'Premium Ice Cream Selection',
    description: 'Artisan ice cream 4-flavor pack',
    price: 16.99,
    category: 'frozen-foods',
    brand: 'CreamDream',
    image: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=500',
    stock: 60,
    featured: true
  },
  {
    name: 'Frozen Vegetable Mix',
    description: 'Mixed vegetables for cooking (2 lbs)',
    price: 5.99,
    category: 'frozen-foods',
    brand: 'FrozenFresh',
    image: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=500',
    stock: 130,
    featured: false
  },
  {
    name: 'Frozen Pizza Collection',
    description: 'Gourmet frozen pizzas 3-pack',
    price: 14.99,
    category: 'frozen-foods',
    brand: 'PizzaPerfect',
    image: 'https://images.unsplash.com/photo-1571020786154-15c0129d0d09?w=500',
    stock: 75,
    featured: false
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
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Brand.deleteMany({});
    console.log('Cleared existing data');

    // Insert brands
    await Brand.insertMany(brands);
    console.log('Brands seeded');

    // Insert products
    await Product.insertMany(products);
    console.log('Products seeded');

    console.log(`✅ Successfully seeded ${products.length} products and ${brands.length} brands`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();