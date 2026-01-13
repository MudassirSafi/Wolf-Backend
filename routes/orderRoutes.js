// ✅ wolf-backend/routes/orderRoutes.js - COMPLETE VERSION
// REPLACE YOUR ENTIRE FILE WITH THIS
// Keeps YOUR Stripe checkout code + adds email & invoice features
import express from "express";
import { protect, authorize } from "../middlewares/authMiddleware.js";
import Stripe from "stripe";
import Order from "../models/Order.js";
import Product from "../models/product.js";
import User from "../models/User.js";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import nodemailer from "nodemailer";

const router = express.Router();

// ==================== EMAIL SETUP ====================
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️ Email not configured, skipping');
      return { success: false };
    }

    const info = await transporter.sendMail({
      from: `"Wolf Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    
    console.log('✅ Email sent:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false };
  }
};

// ==================== SEND ORDER CONFIRMATION EMAIL ====================
const sendOrderConfirmationEmail = async (user, order) => {
  const productsHtml = order.products.map(p => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px;">${p.productId?.name || p.name || 'Product'}</td>
      <td style="padding: 10px; text-align: center;">${p.quantity}</td>
      <td style="padding: 10px; text-align: right;">AED ${p.price.toFixed(2)}</td>
      <td style="padding: 10px; text-align: right; font-weight: bold;">AED ${(p.price * p.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #f97316; text-align: center;">Order Confirmed! 🎉</h1>
      
      <p style="font-size: 16px;">Hi <strong>${user.name}</strong>,</p>
      <p>Thank you for your order! We're getting it ready to ship.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Order #${order._id.toString().slice(-8)}</h3>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Status:</strong> <span style="color: #f97316;">${order.status}</span></p>
        <p><strong>Payment:</strong> ${order.paymentMethod}</p>
      </div>

      <h3>Order Items</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f97316; color: white;">
            <th style="padding: 12px; text-align: left;">Product</th>
            <th style="padding: 12px; text-align: center;">Qty</th>
            <th style="padding: 12px; text-align: right;">Price</th>
            <th style="padding: 12px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>${productsHtml}</tbody>
      </table>

      <div style="text-align: right; margin: 20px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
        <p style="margin: 8px 0;"><strong>Subtotal:</strong> AED ${(order.subtotal || order.total).toFixed(2)}</p>
        ${order.shippingFee > 0 ? `<p style="margin: 8px 0;"><strong>Shipping:</strong> AED ${order.shippingFee.toFixed(2)}</p>` : ''}
        <p style="margin: 12px 0 0 0; font-size: 20px; color: #f97316;"><strong>Total:</strong> AED ${order.total.toFixed(2)}</p>
      </div>

      ${order.shippingAddress ? `
        <div style="background: #dbeafe; padding: 20px; border-radius: 8px;">
          <h3>Delivery Address</h3>
          <p><strong>${order.shippingAddress.fullName || 'Customer'}</strong></p>
          <p>${order.shippingAddress.address || order.shippingAddress}</p>
          ${order.shippingAddress.city ? `<p>${order.shippingAddress.city}, ${order.shippingAddress.country || ''}</p>` : ''}
          ${order.shippingAddress.mobile ? `<p>📞 ${order.shippingAddress.mobile}</p>` : ''}
        </div>
      ` : ''}

      <p style="margin-top: 30px;">We'll send you another email when your order ships.</p>
      <p>Best regards,<br><strong>Wolf Store Team</strong></p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Order Confirmation - #${order._id.toString().slice(-8)}`,
    html
  });
};

// ==================== SEND ORDER STATUS EMAIL ====================
const sendOrderStatusEmail = async (user, order) => {
  const statusMessages = {
    'Processing': '⏳ Your order is being processed',
    'Confirmed': '✅ Your order has been confirmed',
    'Shipped': '🚚 Your order has been shipped',
    'Out for Delivery': '🏃 Your order is out for delivery',
    'Delivered': '🎉 Your order has been delivered'
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #f97316;">Order Update</h2>
      <p>Hi <strong>${user.name}</strong>,</p>
      <p style="font-size: 18px;">${statusMessages[order.status] || 'Your order status has been updated'}</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Order #${order._id.toString().slice(-8)}</h3>
        <p><strong>Status:</strong> <span style="color: #f97316;">${order.status}</span></p>
        ${order.shipping?.trackingNumber ? `
          <p><strong>Tracking:</strong> ${order.shipping.trackingNumber}</p>
          <p><strong>Carrier:</strong> ${order.shipping.carrier || 'J&T Express'}</p>
        ` : ''}
      </div>

      <p>Thank you for shopping with us!</p>
      <p>Best regards,<br><strong>Wolf Store Team</strong></p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Order ${order.status} - #${order._id.toString().slice(-8)}`,
    html
  });
};

// ==================== GENERATE INVOICE PDF ====================
const generateInvoice = async (order) => {
  try {
    const invoiceDir = path.join(process.cwd(), 'invoices');
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }

    const filename = `invoice-${order._id}.pdf`;
    const filepath = path.join(invoiceDir, filename);

    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Header
    doc
      .fontSize(24)
      .fillColor('#f97316')
      .text('INVOICE', 50, 50)
      .fillColor('#000')
      .fontSize(10)
      .text('Wolf Store', 50, 85)
      .text('Dubai, UAE', 50, 100);

    doc
      .fontSize(10)
      .text(`Invoice #: ${order._id.toString().slice(-8)}`, 400, 85, { align: 'right' })
      .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 400, 100, { align: 'right' });

    // Customer Info
    doc
      .fontSize(12)
      .fillColor('#f97316')
      .text('Bill To:', 50, 160)
      .fillColor('#000')
      .fontSize(10);

    if (order.shippingAddress) {
      const addr = order.shippingAddress;
      doc
        .text(addr.fullName || 'Customer', 50, 180)
        .text(addr.address || addr, 50, 195);
      if (addr.city) doc.text(`${addr.city}, ${addr.country || ''}`, 50, 210);
      if (addr.mobile) doc.text(addr.mobile, 50, 225);
    }

    // Table Header
    const tableTop = 270;
    doc
      .fontSize(10)
      .fillColor('#fff')
      .rect(50, tableTop - 5, 500, 25)
      .fill('#f97316')
      .fillColor('#fff')
      .text('Item', 55, tableTop)
      .text('Qty', 300, tableTop, { width: 50, align: 'center' })
      .text('Price', 360, tableTop, { width: 80, align: 'right' })
      .text('Total', 450, tableTop, { width: 90, align: 'right' });

    // Table Items
    let y = tableTop + 30;
    doc.fillColor('#000');
    
    order.products.forEach((item, index) => {
      if (index % 2 === 0) {
        doc.rect(50, y - 5, 500, 25).fill('#f9fafb');
      }

      const productName = item.productId?.name || item.name || 'Product';
      doc
        .fillColor('#000')
        .fontSize(9)
        .text(productName, 55, y, { width: 230 })
        .text(item.quantity.toString(), 300, y, { width: 50, align: 'center' })
        .text(`AED ${item.price.toFixed(2)}`, 360, y, { width: 80, align: 'right' })
        .text(`AED ${(item.price * item.quantity).toFixed(2)}`, 450, y, { width: 90, align: 'right' });
      
      y += 30;
    });

    // Totals
    y += 20;
    const subtotal = order.subtotal || order.total;
    doc
      .fontSize(10)
      .text('Subtotal:', 360, y, { width: 80, align: 'right' })
      .text(`AED ${subtotal.toFixed(2)}`, 450, y, { width: 90, align: 'right' });

    if (order.shippingFee > 0) {
      y += 20;
      doc
        .text('Shipping:', 360, y, { width: 80, align: 'right' })
        .text(`AED ${order.shippingFee.toFixed(2)}`, 450, y, { width: 90, align: 'right' });
    }

    y += 25;
    doc
      .rect(350, y - 5, 200, 30)
      .fill('#f97316')
      .fillColor('#fff')
      .fontSize(12)
      .text('TOTAL:', 360, y + 5, { width: 80, align: 'right' })
      .text(`AED ${order.total.toFixed(2)}`, 450, y + 5, { width: 90, align: 'right' });

    // Footer
    doc
      .fillColor('#666')
      .fontSize(8)
      .text('Thank you for your business!', 50, y + 70, { align: 'center', width: 500 });

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    return `/invoices/${filename}`;
  } catch (error) {
    console.error('Invoice generation error:', error);
    throw error;
  }
};

// ==================== YOUR ORIGINAL STRIPE CHECKOUT (ENHANCED) ====================
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

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error("❌ Stripe secret key is missing!");
      return res.status(500).json({ 
        success: false, 
        message: "Payment system not configured. Add STRIPE_SECRET_KEY to .env" 
      });
    }

    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    // Validate stock
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

    // Calculate total and prepare products
    let subtotal = 0;
    const orderProducts = [];
    
    for (const item of items) {
      const product = await Product.findById(item.productId);
      subtotal += product.price * item.quantity;
      orderProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
        name: product.name,
        image: product.images?.[0] || ''
      });
    }

    // Create pending order
    const pendingOrder = await Order.create({
      user: req.user._id,
      products: orderProducts,
      subtotal,
      shippingFee: 0,
      tax: 0,
      total: subtotal,
      shippingAddress: shippingInfo || { 
        fullName: req.user.name,
        address: 'To be updated',
        mobile: req.user.phone || 'N/A',
        country: 'UAE',
        city: 'Dubai'
      },
      paymentMethod: 'Stripe',
      paymentStatus: 'Pending',
      status: 'Pending'
    });

    console.log('📝 Pending order created:', pendingOrder._id);

    // Prepare Stripe line items
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

    // Create Stripe session
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

// ==================== YOUR VERIFY PAYMENT (ENHANCED WITH EMAIL & INVOICE) ====================
router.get("/verify-payment/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    console.log('\n=== VERIFY PAYMENT START ===');
    console.log('🔍 Session ID:', sessionId);

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return res.status(500).json({
        success: false,
        message: "Payment system not configured"
      });
    }
    const stripe = new Stripe(stripeSecretKey);

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log('💳 Payment status:', session.payment_status);

    const order = await Order.findOne({ stripeSessionId: sessionId })
      .populate('products.productId', 'name price images stock')
      .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // If payment successful, update order
    if (session.payment_status === 'paid' && order.paymentStatus !== 'Paid') {
      console.log('✅ Payment confirmed! Updating order...');

      order.paymentStatus = 'Paid';
      order.status = 'Processing';
      order.paidAt = new Date();

      // Reduce stock
      for (const item of order.products) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock -= item.quantity;
          await product.save();
          console.log(`📦 Reduced stock for ${product.name}`);
        }
      }

      await order.save();

      // ✅ GENERATE INVOICE
      try {
        const invoicePath = await generateInvoice(order);
        order.invoice = {
          filename: path.basename(invoicePath),
          originalName: path.basename(invoicePath),
          path: invoicePath,
          uploadedAt: new Date()
        };
        await order.save();
        console.log('✅ Invoice generated');
      } catch (invoiceError) {
        console.error('⚠️ Invoice generation failed:', invoiceError);
      }

      // ✅ SEND CONFIRMATION EMAIL
      const user = await User.findById(order.user);
      if (user && user.notificationSettings?.orderUpdates !== false) {
        await sendOrderConfirmationEmail(user, order);
      }

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

    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'Pending').length,
      processing: orders.filter(o => o.status === 'Processing').length,
      shipped: orders.filter(o => o.status === 'Shipped').length,
      delivered: orders.filter(o => o.status === 'Delivered').length,
      totalRevenue: orders
        .filter(o => o.paymentStatus === 'Paid')
        .reduce((sum, o) => sum + o.total, 0)
    };

    res.json({ 
      success: true, 
      count: orders.length, 
      orders,
      stats
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

// ==================== GET ORDER INVOICE ====================
router.get("/:id/invoice", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check authorization
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!order.invoice?.path) {
      return res.status(404).json({ 
        success: false, 
        message: 'Invoice not generated yet' 
      });
    }

    res.json({
      success: true,
      invoice: order.invoice
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// ==================== UPDATE ORDER STATUS (ADMIN) - WITH EMAIL ====================
router.put("/:id/status", protect, authorize("admin"), async (req, res) => {
  try {
    const { status, trackingNumber, carrier, estimatedDelivery } = req.body;
    
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email notificationSettings');
      
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: "Order not found" 
      });
    }

    if (status) order.status = status;

    // Update shipping info
    if (trackingNumber || carrier || estimatedDelivery) {
      order.shipping = {
        ...order.shipping,
        trackingNumber: trackingNumber || order.shipping?.trackingNumber,
        carrier: carrier || order.shipping?.carrier || 'J&T Express',
        estimatedDelivery: estimatedDelivery || order.shipping?.estimatedDelivery,
        lastTrackedAt: new Date()
      };
    }

    // Set delivery date if delivered
    if (status === 'Delivered' && !order.shipping?.actualDelivery) {
      order.shipping.actualDelivery = new Date();
    }

    await order.save();

    // Send email notification
    if (status && order.user.notificationSettings?.orderUpdates !== false) {
      await sendOrderStatusEmail(order.user, order);
    }

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