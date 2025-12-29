// routes/adminRoutes.js
import express from 'express';
import axios from 'axios';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// ==========================================
// LEGAL & SAFE PRODUCT IMPORT METHODS
// ==========================================

// Method 1: Manual Data Entry (Recommended)
router.post('/import-product-manual', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, description, price, images, category, stock, brand } = req.body;

    const product = {
      name,
      description,
      price: parseFloat(price) || 0,
      images: images || [],
      category: category || 'perfumes',
      stock: parseInt(stock) || 0,
      brand: brand || '2Wolf',
      featured: false,
      createdAt: new Date()
    };

    res.json({
      success: true,
      product,
      message: 'Product data prepared for saving'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to process product data',
      error: error.message 
    });
  }
});

// Method 2: Paste Product Details (AI-Enhanced)
router.post('/import-product-text', protect, authorize('admin'), async (req, res) => {
  try {
    const { productText, sourceUrl } = req.body;

    // Simple text parsing (you can enhance with AI later)
    const lines = productText.split('\n').filter(line => line.trim());
    
    const product = {
      name: lines[0] || 'New Product',
      description: lines.slice(1).join('\n') || '',
      price: 0,
      images: [],
      category: 'perfumes',
      stock: 10,
      sourceUrl: sourceUrl || '',
      imported: true,
      createdAt: new Date()
    };

    // Try to extract price from text
    const priceMatch = productText.match(/\$(\d+\.?\d*)/);
    if (priceMatch) {
      product.price = parseFloat(priceMatch[1]);
    }

    res.json({
      success: true,
      product,
      message: 'Text parsed successfully. Review and edit before saving.'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to parse product text',
      error: error.message 
    });
  }
});

// Method 3: Amazon Product Advertising API (Official)
// You need to sign up at: https://affiliate-program.amazon.com/assoc_credentials/home
router.post('/import-from-amazon-api', protect, authorize('admin'), async (req, res) => {
  try {
    const { asin } = req.body; // Amazon Standard Identification Number

    // Check if API credentials are configured
    if (!process.env.AMAZON_ACCESS_KEY || !process.env.AMAZON_SECRET_KEY) {
      return res.status(400).json({
        success: false,
        message: 'Amazon API credentials not configured. Please add AMAZON_ACCESS_KEY and AMAZON_SECRET_KEY to .env file',
        setupGuide: 'Visit https://affiliate-program.amazon.com to get API keys'
      });
    }

    // Amazon Product Advertising API v5 implementation would go here
    // This requires aws4 signing and proper authentication
    
    res.json({
      success: false,
      message: 'Amazon API integration requires setup',
      setupInstructions: [
        '1. Sign up for Amazon Associates Program',
        '2. Get your Access Key and Secret Key',
        '3. Add to .env: AMAZON_ACCESS_KEY and AMAZON_SECRET_KEY',
        '4. Install required packages: npm install aws4 crypto-js'
      ]
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Amazon API error',
      error: error.message 
    });
  }
});

// Method 4: Image URL Importer (Legal - Public URLs)
router.post('/import-images', protect, authorize('admin'), async (req, res) => {
  try {
    const { imageUrls } = req.body;

    if (!Array.isArray(imageUrls)) {
      return res.status(400).json({
        success: false,
        message: 'imageUrls must be an array'
      });
    }

    // Validate image URLs
    const validImages = [];
    for (const url of imageUrls) {
      try {
        const response = await axios.head(url, { timeout: 5000 });
        if (response.headers['content-type']?.startsWith('image/')) {
          validImages.push(url);
        }
      } catch (err) {
        console.log(`Invalid image URL: ${url}`);
      }
    }

    res.json({
      success: true,
      validImages,
      message: `${validImages.length} valid images found`
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to validate images',
      error: error.message 
    });
  }
});

// Method 5: Bulk Import via CSV
router.post('/import-products-csv', protect, authorize('admin'), async (req, res) => {
  try {
    const { products } = req.body; // Array of product objects

    if (!Array.isArray(products)) {
      return res.status(400).json({
        success: false,
        message: 'products must be an array'
      });
    }

    const processedProducts = products.map(p => ({
      name: p.name || 'Unnamed Product',
      description: p.description || '',
      price: parseFloat(p.price) || 0,
      images: Array.isArray(p.images) ? p.images : [p.images].filter(Boolean),
      category: p.category || 'perfumes',
      stock: parseInt(p.stock) || 0,
      brand: p.brand || '2Wolf',
      imported: true,
      createdAt: new Date()
    }));

    res.json({
      success: true,
      products: processedProducts,
      count: processedProducts.length,
      message: 'Products ready to be saved'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to process CSV data',
      error: error.message 
    });
  }
});

// Method 6: AI-Powered Product Generator (Claude API)
router.post('/generate-product-ai', protect, authorize('admin'), async (req, res) => {
  try {
    const { prompt, category } = req.body;

    // Example: "Generate a luxury perfume product description for men"
    
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(400).json({
        success: false,
        message: 'AI generation requires ANTHROPIC_API_KEY in .env file'
      });
    }

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Generate a product listing for an e-commerce perfume store. ${prompt}. 
          
          Return ONLY valid JSON in this exact format:
          {
            "name": "Product Name",
            "description": "Detailed product description",
            "price": 99.99,
            "category": "${category || 'perfumes'}",
            "stock": 50,
            "tags": ["tag1", "tag2"]
          }`
        }]
      },
      {
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );

    const aiText = response.data.content[0].text;
    const jsonMatch = aiText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const product = JSON.parse(jsonMatch[0]);
      res.json({
        success: true,
        product,
        message: 'AI-generated product created successfully'
      });
    } else {
      throw new Error('Failed to parse AI response');
    }

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'AI generation failed',
      error: error.message 
    });
  }
});

export default router;