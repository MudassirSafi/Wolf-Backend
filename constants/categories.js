// backend/constants/categories.js
export const PRODUCT_CATEGORIES = {
  // Kitchen & Dining
  KITCHEN: "kitchen",
  FOOD_PREPARATION: "food-preparation",
  BAKEWARE: "bakeware",
  COFFEE_TEA_ESPRESSO: "coffee-tea-espresso",
  CONTAINERS_STORAGE: "containers-storage",
  COOKWARE: "cookware",
  HEATING_COOLING: "heating-cooling",
  KITCHEN_LINEN: "kitchen-linen",
  LARGE_APPLIANCES: "large-household-appliances",
  SMALL_APPLIANCES: "small-appliances",
  TABLEWARE: "tableware",
  TOOLS_GADGETS: "tools-gadgets",
  WATER_COOLERS: "water-coolers-filters",

  // Electronics
  ELECTRONICS: "electronics",
  COMPUTERS_LAPTOPS: "computers-laptops",
  MOBILE_PHONES: "mobile-phones",
  CAMERAS: "cameras",
  AUDIO_HEADPHONES: "audio-headphones",
  TVS_HOME_THEATER: "tvs-home-theater",
  GAMING: "gaming",
  WEARABLE_TECH: "wearable-technology",

  // Fashion
  FASHION: "fashion",
  MENS_CLOTHING: "mens-clothing",
  WOMENS_CLOTHING: "womens-clothing",
  MENS_SHOES: "mens-shoes",
  WOMENS_SHOES: "womens-shoes",
  WATCHES: "watches",
  JEWELRY: "jewelry",
  BAGS_LUGGAGE: "bags-luggage",

  // Home & Garden
  HOME_GARDEN: "home-garden",
  FURNITURE: "furniture",
  BEDDING: "bedding",
  BATH: "bath",
  HOME_DECOR: "home-decor",
  GARDEN_OUTDOOR: "garden-outdoor",
  TOOLS_HOME_IMPROVEMENT: "tools-home-improvement",

  // Sports & Outdoors
  SPORTS: "sports-outdoors",
  EXERCISE_FITNESS: "exercise-fitness",
  OUTDOOR_RECREATION: "outdoor-recreation",
  SPORTS_EQUIPMENT: "sports-equipment",
  ATHLETIC_CLOTHING: "athletic-clothing",

  // Toys & Games
  TOYS: "toys-games",
  LEARNING_TOYS: "learning-toys",
  BUILDING_BLOCKS: "building-blocks",
  DOLLS_ACCESSORIES: "dolls-accessories",
  OUTDOOR_PLAY: "outdoor-play",
  BOARD_GAMES: "board-games",

  // Beauty & Personal Care
  BEAUTY: "beauty-personal-care",
  SKINCARE: "skincare",
  MAKEUP: "makeup",
  HAIR_CARE: "hair-care",
  FRAGRANCES: "fragrances",
  PERSONAL_CARE: "personal-care",

  // Automotive
  AUTOMOTIVE: "automotive",
  CAR_ACCESSORIES: "car-accessories",
  TOOLS_EQUIPMENT: "tools-equipment",
  OILS_FLUIDS: "oils-fluids",
  REPLACEMENT_PARTS: "replacement-parts"
};

export const CATEGORY_HIERARCHY = {
  "Kitchen & Dining": [
    { value: PRODUCT_CATEGORIES.KITCHEN, label: "All Kitchen" },
    { value: PRODUCT_CATEGORIES.FOOD_PREPARATION, label: "Food Preparation" },
    { value: PRODUCT_CATEGORIES.BAKEWARE, label: "Bakeware" },
    { value: PRODUCT_CATEGORIES.COFFEE_TEA_ESPRESSO, label: "Coffee, Tea & Espresso" },
    { value: PRODUCT_CATEGORIES.CONTAINERS_STORAGE, label: "Containers & Storage" },
    { value: PRODUCT_CATEGORIES.COOKWARE, label: "Cookware" },
    { value: PRODUCT_CATEGORIES.HEATING_COOLING, label: "Heating & Cooling" },
    { value: PRODUCT_CATEGORIES.KITCHEN_LINEN, label: "Kitchen Linen" },
    { value: PRODUCT_CATEGORIES.LARGE_APPLIANCES, label: "Large Household Appliances" },
    { value: PRODUCT_CATEGORIES.SMALL_APPLIANCES, label: "Small Appliances" },
    { value: PRODUCT_CATEGORIES.TABLEWARE, label: "Tableware" },
    { value: PRODUCT_CATEGORIES.TOOLS_GADGETS, label: "Tools & Gadgets" },
    { value: PRODUCT_CATEGORIES.WATER_COOLERS, label: "Water Coolers, Filters & Cartridges" }
  ],
  "Electronics": [
    { value: PRODUCT_CATEGORIES.ELECTRONICS, label: "All Electronics" },
    { value: PRODUCT_CATEGORIES.COMPUTERS_LAPTOPS, label: "Computers & Laptops" },
    { value: PRODUCT_CATEGORIES.MOBILE_PHONES, label: "Mobile Phones" },
    { value: PRODUCT_CATEGORIES.CAMERAS, label: "Cameras" },
    { value: PRODUCT_CATEGORIES.AUDIO_HEADPHONES, label: "Audio & Headphones" },
    { value: PRODUCT_CATEGORIES.TVS_HOME_THEATER, label: "TVs & Home Theater" },
    { value: PRODUCT_CATEGORIES.GAMING, label: "Gaming" },
    { value: PRODUCT_CATEGORIES.WEARABLE_TECH, label: "Wearable Technology" }
  ],
  "Fashion": [
    { value: PRODUCT_CATEGORIES.FASHION, label: "All Fashion" },
    { value: PRODUCT_CATEGORIES.MENS_CLOTHING, label: "Men's Clothing" },
    { value: PRODUCT_CATEGORIES.WOMENS_CLOTHING, label: "Women's Clothing" },
    { value: PRODUCT_CATEGORIES.MENS_SHOES, label: "Men's Shoes" },
    { value: PRODUCT_CATEGORIES.WOMENS_SHOES, label: "Women's Shoes" },
    { value: PRODUCT_CATEGORIES.WATCHES, label: "Watches" },
    { value: PRODUCT_CATEGORIES.JEWELRY, label: "Jewelry" },
    { value: PRODUCT_CATEGORIES.BAGS_LUGGAGE, label: "Bags & Luggage" }
  ],
  "Home & Garden": [
    { value: PRODUCT_CATEGORIES.HOME_GARDEN, label: "All Home & Garden" },
    { value: PRODUCT_CATEGORIES.FURNITURE, label: "Furniture" },
    { value: PRODUCT_CATEGORIES.BEDDING, label: "Bedding" },
    { value: PRODUCT_CATEGORIES.BATH, label: "Bath" },
    { value: PRODUCT_CATEGORIES.HOME_DECOR, label: "Home Decor" },
    { value: PRODUCT_CATEGORIES.GARDEN_OUTDOOR, label: "Garden & Outdoor" },
    { value: PRODUCT_CATEGORIES.TOOLS_HOME_IMPROVEMENT, label: "Tools & Home Improvement" }
  ],
  "Sports & Outdoors": [
    { value: PRODUCT_CATEGORIES.SPORTS, label: "All Sports" },
    { value: PRODUCT_CATEGORIES.EXERCISE_FITNESS, label: "Exercise & Fitness" },
    { value: PRODUCT_CATEGORIES.OUTDOOR_RECREATION, label: "Outdoor Recreation" },
    { value: PRODUCT_CATEGORIES.SPORTS_EQUIPMENT, label: "Sports Equipment" },
    { value: PRODUCT_CATEGORIES.ATHLETIC_CLOTHING, label: "Athletic Clothing" }
  ],
  "Toys & Games": [
    { value: PRODUCT_CATEGORIES.TOYS, label: "All Toys" },
    { value: PRODUCT_CATEGORIES.LEARNING_TOYS, label: "Learning Toys" },
    { value: PRODUCT_CATEGORIES.BUILDING_BLOCKS, label: "Building Blocks" },
    { value: PRODUCT_CATEGORIES.DOLLS_ACCESSORIES, label: "Dolls & Accessories" },
    { value: PRODUCT_CATEGORIES.OUTDOOR_PLAY, label: "Outdoor Play" },
    { value: PRODUCT_CATEGORIES.BOARD_GAMES, label: "Board Games" }
  ],
  "Beauty & Personal Care": [
    { value: PRODUCT_CATEGORIES.BEAUTY, label: "All Beauty" },
    { value: PRODUCT_CATEGORIES.SKINCARE, label: "Skincare" },
    { value: PRODUCT_CATEGORIES.MAKEUP, label: "Makeup" },
    { value: PRODUCT_CATEGORIES.HAIR_CARE, label: "Hair Care" },
    { value: PRODUCT_CATEGORIES.FRAGRANCES, label: "Fragrances" },
    { value: PRODUCT_CATEGORIES.PERSONAL_CARE, label: "Personal Care" }
  ],
  "Automotive": [
    { value: PRODUCT_CATEGORIES.AUTOMOTIVE, label: "All Automotive" },
    { value: PRODUCT_CATEGORIES.CAR_ACCESSORIES, label: "Car Accessories" },
    { value: PRODUCT_CATEGORIES.TOOLS_EQUIPMENT, label: "Tools & Equipment" },
    { value: PRODUCT_CATEGORIES.OILS_FLUIDS, label: "Oils & Fluids" },
    { value: PRODUCT_CATEGORIES.REPLACEMENT_PARTS, label: "Replacement Parts" }
  ]
};

// For validation
export const VALID_CATEGORIES = Object.values(PRODUCT_CATEGORIES);

// Get all categories as flat array for dropdown
export const getCategoryOptions = () => {
  const options = [];
  Object.entries(CATEGORY_HIERARCHY).forEach(([mainCategory, subCategories]) => {
    options.push({ value: '', label: `--- ${mainCategory} ---`, disabled: true });
    options.push(...subCategories);
  });
  return options;
};