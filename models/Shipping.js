// ============================================
// 📦 FULLY FIXED Shipping Model (No Duplicate Indexes)
// wolf-backend/models/Shipping.js
// ============================================

import mongoose from 'mongoose';

const shippingSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true  // ✅ This creates an index automatically
  },
  
  // J&T Tracking Information
  trackingNumber: {
    type: String,
    required: true,
    unique: true  // ✅ This creates an index automatically
  },
  sortingCode: String,
  packageCode: String,
  internationalCode: String,
  shortCode: String,
  
  // Shipment Status
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Failed', 'Returned', 'Cancelled'],
    default: 'Pending'
  },
  
  // Sender Details (Your warehouse)
  sender: {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    countryCode: { type: String, required: true },
    city: { type: String, required: true },
    area: String,
    address: { type: String, required: true },
    postCode: String
  },
  
  // Receiver Details (Customer)
  receiver: {
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    countryCode: { type: String, required: true },
    city: { type: String, required: true },
    area: String,
    address: { type: String, required: true },
    postCode: String,
    email: String
  },
  
  // Package Details
  weight: {
    type: Number,
    required: true,
    min: 0.1
  },
  itemsDescription: String,
  totalQuantity: {
    type: Number,
    default: 1
  },
  
  // Pricing
  shippingFee: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'AED'
  },
  
  // COD (Cash on Delivery)
  codAmount: {
    type: Number,
    default: 0
  },
  
  // Service Type
  serviceType: {
    type: String,
    enum: ['standard', 'express', 'economy'],
    default: 'standard'
  },
  
  // Tracking History
  trackingHistory: [{
    time: Date,
    location: String,
    status: String,
    description: String,
    scanType: String
  }],
  
  // Pickup Information
  pickup: {
    scheduled: { type: Boolean, default: false },
    pickupNo: String,
    pickupDate: Date,
    pickupTime: String,
    pickupStatus: String
  },
  
  // Label Information
  labelUrl: String,
  labelGeneratedAt: Date,
  
  // Estimated and Actual Dates
  estimatedDelivery: Date,
  actualDelivery: Date,
  
  // Additional Info
  remark: String,
  lastTrackedAt: Date,
  
  // ✅ FIXED: Changed from "errors" to "errorLogs"
  errorLogs: [{
    time: { type: Date, default: Date.now },
    message: String,
    code: String
  }]
}, {
  timestamps: true,
  suppressReservedKeysWarning: true
});

// ✅ FIXED: Removed duplicate indexes for order and trackingNumber
// (they already have unique: true which creates indexes)

// Only create indexes for fields that DON'T have unique: true
shippingSchema.index({ status: 1 });
shippingSchema.index({ 'receiver.countryCode': 1 });
shippingSchema.index({ createdAt: -1 });

export default mongoose.model('Shipping', shippingSchema);