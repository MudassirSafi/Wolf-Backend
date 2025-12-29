// ==========================================
// 📁 wolf-backend/routes/orderRoutes.js
// Using YOUR original working approach
// ==========================================
import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import Stripe from "stripe";
import Order from "../models/Order.js";
import Product from "../models/product.js";

const router = express.Router();

// ==================== CREATE STRIPE CHECKOUT SESSION ====================
router.post("/create-checkout-session", protect, async (req, res) => {
  try {
    console.log('\n=== CREATE CHECKOUT SESSION START ===');
    console.log('🔐 User:', req.user.email);
    console.log('📦 Items:', req.body.items);

    const { items, shippingInfo } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "No items provided" 
      });
    }

    // Check Stripe key (YOUR ORIGINAL WAY - WORKS!)
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error("❌ Stripe secret key is missing!");
      return res.status(500).json({ 
        success: false, 
        message: "Payment system not configured. Add STRIPE_SECRET_KEY to .env" 
      });
    }

    // Initialize Stripe INSIDE the route (YOUR ORIGINAL WAY)
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    // Validate stock availability
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.name}`
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${product.name}. Available: ${product.stock}`
        });
      }
    }

    // Calculate total and prepare order products
    let total = 0;
    const orderProducts = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      total += product.price * item.quantity;
      orderProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Create pending order in database BEFORE payment
    const pendingOrder = await Order.create({
      user: req.user._id,
      products: orderProducts,
      total,
      address: shippingInfo?.address || shippingInfo?.fullName || 'Address to be updated',
      paymentMethod: 'Stripe',
      paymentStatus: 'Pending',
      status: 'Pending'
    });

    console.log('📝 Pending order created:', pendingOrder._id);

    // Prepare line items for Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/order-success?session_id={CHECKOUT_SESSION_ID}&order_id=${pendingOrder._id}`,
      cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/checkout`,
      customer_email: req.user.email,
      metadata: { 
        userId: req.user._id.toString(),
        orderId: pendingOrder._id.toString(),
        userName: req.user.name
      }
    });

    // Update order with Stripe session ID
    pendingOrder.stripeSessionId = session.id;
    await pendingOrder.save();

    console.log('✅ Stripe session created:', session.id);
    console.log('=== CREATE CHECKOUT SESSION END ===\n');

    res.json({ 
      success: true, 
      sessionId: session.id,
      url: session.url,
      orderId: pendingOrder._id
    });
  } catch (error) {
    console.error("❌ Checkout session error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ==================== VERIFY PAYMENT & UPDATE ORDER ====================
router.get("/verify-payment/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    console.log('\n=== VERIFY PAYMENT START ===');
    console.log('🔍 Session ID:', sessionId);

    // Initialize Stripe INSIDE the route
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return res.status(500).json({
        success: false,
        message: "Payment system not configured"
      });
    }
    const stripe = new Stripe(stripeSecretKey);

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log('💳 Payment status:', session.payment_status);
    console.log('📦 Metadata:', session.metadata);

    // Find order by session ID
    const order = await Order.findOne({ stripeSessionId: sessionId })
      .populate('products.productId', 'name price images stock');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // If payment successful, update order and reduce stock
    if (session.payment_status === 'paid' && order.paymentStatus !== 'Paid') {
      console.log('✅ Payment confirmed! Updating order...');

      // Update payment status
      order.paymentStatus = 'Paid';
      order.status = 'Processing';
      order.paidAt = new Date();

      // Reduce stock for each product
      for (const item of order.products) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock -= item.quantity;
          await product.save();
          console.log(`📦 Reduced stock for ${product.name}: ${item.quantity} units`);
        }
      }

      await order.save();
      console.log('✅ Order updated successfully!');
    }

    console.log('=== VERIFY PAYMENT END ===\n');

    res.json({
      success: true,
      paymentStatus: session.payment_status,
      order: order
    });
  } catch (error) {
    console.error("❌ Verify payment error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== GET ALL ORDERS (ADMIN) ====================
router.get("/", protect, authorize("admin"), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("products.productId", "name price images")
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: orders.length, 
      orders 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ==================== GET USER ORDERS ====================
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("products.productId", "name price images")
      .sort({ createdAt: -1 });

    res.json({ 
      success: true, 
      count: orders.length, 
      orders 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ==================== GET ORDER BY ID ====================
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("products.productId", "name price images");

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    // Check authorization
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ 
        success: false, 
        message: "Not authorized" 
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ==================== UPDATE ORDER STATUS (ADMIN) ====================
router.put("/:id/status", protect, authorize("admin"), async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    order.status = status;
    await order.save();

    res.json({ 
      success: true, 
      message: "Order status updated", 
      order 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ==================== DELETE ORDER (ADMIN) ====================
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    await order.deleteOne();
    res.json({ 
      success: true, 
      message: "Order deleted" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export default router;