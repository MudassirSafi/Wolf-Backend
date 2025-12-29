// ============================================
// 📦 PART 3: Updated Order Model with Shipping
// wolf-backend/models/Order.js (REPLACE YOUR EXISTING)
// ============================================

import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        name: String, // Store product name at order time
        image: String // Store product image at order time
      },
    ],
    
    // Pricing
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },

    // In your Order model (models/Order.js), add this field:
invoice: {
  filename: String,
  originalName: String,
  path: String,
  uploadedAt: Date
},
    
    // Shipping Address (Enhanced)
    shippingAddress: {
      fullName: { type: String, required: true },
      mobile: { type: String, required: true },
      email: String,
      countryCode: { type: String, required: true }, // 'AE', 'SA', 'QA', etc.
      country: { type: String, required: true },
      city: { type: String, required: true },
      area: String,
      address: { type: String, required: true },
      postCode: String,
      landmark: String,
      additionalInfo: String
    },
    
    // Payment
    paymentMethod: {
      type: String,
      enum: ["Stripe", "Card", "COD", "stripe", "card", "cod"],
      default: "Stripe",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    stripeSessionId: {
      type: String,
      sparse: true
    },
    paidAt: {
      type: Date
    },
    
    // Order Status
    status: {
      type: String,
      enum: ["Pending", "Processing", "Confirmed", "Shipped", "Out for Delivery", "Delivered", "Cancelled", "Returned"],
      default: "Pending",
    },
    
    // Shipping Information
    shipping: {
      carrier: {
        type: String,
        default: 'J&T Express'
      },
      trackingNumber: String,
      serviceType: {
        type: String,
        enum: ['standard', 'express', 'economy'],
        default: 'standard'
      },
      estimatedDelivery: Date,
      actualDelivery: Date,
      currentLocation: String,
      lastTrackedAt: Date
    },
    
    // Order Notes
    customerNote: String,
    adminNote: String,
    
    // Cancellation
    cancellation: {
      cancelled: { type: Boolean, default: false },
      reason: String,
      cancelledAt: Date,
      cancelledBy: String // 'customer' or 'admin'
    },
    
    // Weight for shipping calculation
    totalWeight: {
      type: Number,
      default: 1.0 // in KG
    }
  },
  { timestamps: true }
);

// Index for faster queries
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'shipping.trackingNumber': 1 });
orderSchema.index({ paymentStatus: 1 });

export default mongoose.model("Order", orderSchema);
