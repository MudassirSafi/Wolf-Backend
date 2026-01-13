// ✅ wolf-backend/models/User.js - ENHANCED VERSION
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  mobile: { type: String, required: true },
  email: String,
  country: { type: String, required: true },
  countryCode: { type: String, default: 'AE' },
  city: { type: String, required: true },
  address: { type: String, required: true },
  area: String,
  postCode: String,
  landmark: String,
  additionalInfo: String,
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    phone: { 
      type: String, 
      trim: true 
    },
    avatar: { 
      type: String 
    },
    role: { 
      type: String, 
      enum: ["user", "admin"], 
      default: "user" 
    },
    googleId: { 
      type: String, 
      unique: true, 
      sparse: true 
    },
    
    // Cart field for shopping cart functionality
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
          default: 1,
        },
      },
    ],
    
    // Multiple shipping addresses
    addresses: [addressSchema],
    
    // Notification preferences
    notificationSettings: {
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
      newsletter: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    
    // Email verification
    emailVerified: {
      type: Boolean,
      default: false
    },
    
    // Password reset tokens
    resetPasswordToken: String,
    resetPasswordExpire: Date
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);