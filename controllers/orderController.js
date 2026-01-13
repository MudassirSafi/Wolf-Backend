// ✅ wolf-backend/controllers/orderController.js - ENHANCED VERSION
import Order from "../models/Order.js";
import Product from "../models/product.js";
import User from "../models/User.js";
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import nodemailer from "nodemailer";

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email utility
const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️ Email credentials not configured, skipping email send');
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

// Send order confirmation email
const sendOrderConfirmationEmail = async (user, order) => {
  const productsHtml = order.products.map(p => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px;">${p.name}</td>
      <td style="padding: 10px; text-align: center;">${p.quantity}</td>
      <td style="padding: 10px; text-align: right;">AED ${p.price.toFixed(2)}</td>
      <td style="padding: 10px; text-align: right; font-weight: bold;">AED ${(p.price * p.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #f97316; margin: 0;">Order Confirmed! 🎉</h1>
      </div>
      
      <p style="font-size: 16px;">Hi <strong>${user.name}</strong>,</p>
      <p>Thank you for your order! We're getting it ready to ship.</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Order #${order._id}</h3>
        <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
        <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #f97316; font-weight: bold;">${order.status}</span></p>
        <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      </div>

      <h3 style="color: #333; border-bottom: 2px solid #f97316; padding-bottom: 10px;">Order Items</h3>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <thead>
          <tr style="background: #f97316; color: white;">
            <th style="padding: 12px; text-align: left;">Product</th>
            <th style="padding: 12px; text-align: center;">Qty</th>
            <th style="padding: 12px; text-align: right;">Price</th>
            <th style="padding: 12px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${productsHtml}
        </tbody>
      </table>

      <div style="text-align: right; margin: 20px 0; padding: 20px; background: #f9fafb; border-radius: 8px;">
        <p style="margin: 8px 0; font-size: 14px;"><strong>Subtotal:</strong> AED ${order.subtotal.toFixed(2)}</p>
        ${order.shippingFee > 0 ? `<p style="margin: 8px 0; font-size: 14px;"><strong>Shipping:</strong> AED ${order.shippingFee.toFixed(2)}</p>` : ''}
        ${order.tax > 0 ? `<p style="margin: 8px 0; font-size: 14px;"><strong>Tax:</strong> AED ${order.tax.toFixed(2)}</p>` : ''}
        <p style="margin: 12px 0 0 0; font-size: 20px; color: #f97316;"><strong>Total:</strong> AED ${order.total.toFixed(2)}</p>
      </div>

      ${order.shippingAddress ? `
        <div style="background: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1e40af;">Delivery Address</h3>
          <p style="margin: 5px 0;"><strong>${order.shippingAddress.fullName}</strong></p>
          <p style="margin: 5px 0;">${order.shippingAddress.address}</p>
          <p style="margin: 5px 0;">${order.shippingAddress.city}, ${order.shippingAddress.country}</p>
          ${order.shippingAddress.postCode ? `<p style="margin: 5px 0;">Postal Code: ${order.shippingAddress.postCode}</p>` : ''}
          <p style="margin: 5px 0;">📞 ${order.shippingAddress.mobile}</p>
        </div>
      ` : ''}

      <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        We'll send you another email when your order ships.
      </p>
      
      <p style="color: #666;">
        Best regards,<br>
        <strong>Wolf Store Team</strong>
      </p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Order Confirmation - #${order._id.toString().slice(-8)}`,
    html
  });
};

// Send order status update email
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
      <p style="font-size: 18px; color: #333;">${statusMessages[order.status] || 'Your order status has been updated'}</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Order #${order._id.toString().slice(-8)}</h3>
        <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #f97316; font-weight: bold;">${order.status}</span></p>
        ${order.shipping?.trackingNumber ? `
          <p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${order.shipping.trackingNumber}</p>
          <p style="margin: 5px 0;"><strong>Carrier:</strong> ${order.shipping.carrier || 'J&T Express'}</p>
        ` : ''}
        ${order.shipping?.estimatedDelivery ? `
          <p style="margin: 5px 0;"><strong>Estimated Delivery:</strong> ${new Date(order.shipping.estimatedDelivery).toLocaleDateString()}</p>
        ` : ''}
      </div>

      <p>Thank you for shopping with us!</p>
      <p style="color: #666;">
        Best regards,<br>
        <strong>Wolf Store Team</strong>
      </p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Order ${order.status} - #${order._id.toString().slice(-8)}`,
    html
  });
};

// Generate invoice PDF
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
      .text('Dubai, UAE', 50, 100)
      .text('info@wolfstore.com', 50, 115);

    // Invoice details
    doc
      .fontSize(10)
      .text(`Invoice #: ${order._id.toString().slice(-8)}`, 400, 85, { align: 'right' })
      .text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 400, 100, { align: 'right' })
      .text(`Status: ${order.status}`, 400, 115, { align: 'right' });

    // Customer Info
    doc
      .fontSize(12)
      .fillColor('#f97316')
      .text('Bill To:', 50, 160)
      .fillColor('#000')
      .fontSize(10);

    if (order.shippingAddress) {
      doc
        .text(order.shippingAddress.fullName, 50, 180)
        .text(order.shippingAddress.address, 50, 195)
        .text(`${order.shippingAddress.city}, ${order.shippingAddress.country}`, 50, 210)
        .text(order.shippingAddress.mobile, 50, 225);
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
      if (y > 700) {
        doc.addPage();
        y = 50;
      }

      if (index % 2 === 0) {
        doc.rect(50, y - 5, 500, 25).fill('#f9fafb');
      }

      doc
        .fillColor('#000')
        .fontSize(9)
        .text(item.name, 55, y, { width: 230 })
        .text(item.quantity.toString(), 300, y, { width: 50, align: 'center' })
        .text(`AED ${item.price.toFixed(2)}`, 360, y, { width: 80, align: 'right' })
        .text(`AED ${(item.price * item.quantity).toFixed(2)}`, 450, y, { width: 90, align: 'right' });
      
      y += 30;
    });

    // Totals
    y += 20;
    doc
      .fontSize(10)
      .text('Subtotal:', 360, y, { width: 80, align: 'right' })
      .text(`AED ${order.subtotal.toFixed(2)}`, 450, y, { width: 90, align: 'right' });

    if (order.shippingFee > 0) {
      y += 20;
      doc
        .text('Shipping:', 360, y, { width: 80, align: 'right' })
        .text(`AED ${order.shippingFee.toFixed(2)}`, 450, y, { width: 90, align: 'right' });
    }

    if (order.tax > 0) {
      y += 20;
      doc
        .text('Tax:', 360, y, { width: 80, align: 'right' })
        .text(`AED ${order.tax.toFixed(2)}`, 450, y, { width: 90, align: 'right' });
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
      .text('Thank you for your business!', 50, y + 70, { align: 'center', width: 500 })
      .text('For any questions, contact us at info@wolfstore.com', 50, y + 85, { align: 'center', width: 500 });

    doc.end();

    // Wait for file to be written
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

// ==================== CREATE ORDER ====================
export const createOrder = async (req, res) => {
  try {
    const { 
      products, 
      shippingAddress,
      paymentMethod, 
      paymentStatus,
      subtotal,
      shippingFee,
      tax,
      total
    } = req.body;

    console.log('📦 Creating order:', { userId: req.user?._id, productsCount: products?.length });

    // Validation
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "No products provided" });
    }
    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({ message: "Shipping address and payment method are required" });
    }

    let calculatedSubtotal = 0;
    const enrichedProducts = [];

    // Process each product
    for (const item of products) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ 
          message: `Product not found: ${item.productId}` 
        });
      }

      const qty = Number(item.quantity || 0);
      const stock = Number(product.stock || 0);

      if (!qty || qty <= 0) {
        return res.status(400).json({ 
          message: `Invalid quantity for product ${product.name}` 
        });
      }

      if (qty > stock) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${stock}, Requested: ${qty}`,
        });
      }

      calculatedSubtotal += product.price * qty;

      enrichedProducts.push({
        productId: product._id,
        quantity: qty,
        price: product.price,
        name: product.name,
        image: product.images?.[0] || ''
      });

      // Reduce stock
      product.stock -= qty;
      await product.save();
    }

    // Create order
    const newOrder = await Order.create({
      user: req.user._id,
      products: enrichedProducts,
      subtotal: subtotal || calculatedSubtotal,
      shippingFee: shippingFee || 0,
      tax: tax || 0,
      total: total || calculatedSubtotal + (shippingFee || 0) + (tax || 0),
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentStatus || (paymentMethod === 'COD' ? 'Pending' : 'Paid'),
      paidAt: paymentMethod !== 'COD' ? new Date() : null,
      status: 'Pending'
    });

    // Generate invoice
    try {
      const invoicePath = await generateInvoice(newOrder);
      newOrder.invoice = {
        filename: path.basename(invoicePath),
        originalName: path.basename(invoicePath),
        path: invoicePath,
        uploadedAt: new Date()
      };
      await newOrder.save();
      console.log('✅ Invoice generated:', invoicePath);
    } catch (invoiceError) {
      console.error('⚠️ Invoice generation failed:', invoiceError);
    }

    // Populate order
    const populatedOrder = await Order.findById(newOrder._id)
      .populate('products.productId', 'name images price')
      .populate('user', 'name email');

    // Send confirmation email
    const user = await User.findById(req.user._id);
    if (user.notificationSettings?.orderUpdates !== false) {
      await sendOrderConfirmationEmail(user, populatedOrder);
    }

    console.log('✅ Order created successfully:', newOrder._id);

    res.status(201).json({ 
      success: true, 
      message: "Order created successfully", 
      order: populatedOrder 
    });
  } catch (error) {
    console.error("❌ Create order error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error creating order", 
      error: error.message 
    });
  }
};

// ==================== GET ALL ORDERS (Admin only) ====================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("products.productId", "name price images")
      .sort({ createdAt: -1 });

    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'Pending').length,
      processing: orders.filter(o => o.status === 'Processing').length,
      shipped: orders.filter(o => o.status === 'Shipped').length,
      delivered: orders.filter(o => o.status === 'Delivered').length,
      cancelled: orders.filter(o => o.cancellation?.cancelled).length,
      totalRevenue: orders
        .filter(o => o.paymentStatus === 'Paid')
        .reduce((sum, o) => sum + o.total, 0)
    };

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
      stats
    });
  } catch (error) {
    console.error("❌ Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// ==================== GET USER'S ORDERS ====================
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('products.productId', 'name images price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("❌ Get my orders error:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

// ==================== GET ORDER BY ID ====================
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("products.productId", "name price images description");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("❌ Get order by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
};

// ==================== UPDATE ORDER (Admin only) ====================
export const updateOrder = async (req, res) => {
  try {
    const { status, address, paymentStatus, trackingNumber, carrier, estimatedDelivery } = req.body;

    const order = await Order.findById(req.params.id)
      .populate('user', 'name email notificationSettings');
      
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update fields
    if (status) order.status = status;
    if (address) order.shippingAddress = address;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    // Update shipping info
    if (trackingNumber || carrier || estimatedDelivery) {
      order.shipping = {
        ...order.shipping,
        trackingNumber: trackingNumber || order.shipping?.trackingNumber,
        carrier: carrier || order.shipping?.carrier,
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

    console.log('✅ Order updated:', order._id);

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("❌ Update order error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order",
      error: error.message,
    });
  }
};

// ==================== DELETE ORDER (Admin only) ====================
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.deleteOne();

    console.log('✅ Order deleted:', req.params.id);

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete order error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting order",
      error: error.message,
    });
  }
};

// ==================== GET ORDER INVOICE ====================
export const getOrderInvoice = async (req, res) => {
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
    console.error("❌ Get invoice error:", error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};