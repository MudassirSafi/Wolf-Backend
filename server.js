// ✅ wolf-backend/server.js - COMPLETE FINAL VERSION
import dotenv from "dotenv";

// ✅ Load environment variables FIRST
dotenv.config();

import connectDB from "./config/db.js";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

// Import models and routes
import User from "./models/User.js";
import wishlistRoutes from './routes/wishlistRoutes.js';
import reviewRoutes from "./routes/reviews.js";
import categoryRoutes from './routes/categoryRoutes.js';
import shippingRoutes from './routes/shippingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from "./routes/authRoutes.js";
import oauthRoutes from "./routes/oauthRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import invoiceRoutes from './routes/invoiceRoutes.js';
import { createDefaultAdmin } from "./utils/createAdmin.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ==================== GOOGLE OAUTH CONFIGURATION ====================
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

console.log('\n🔍 ENVIRONMENT CHECK:');
console.log('GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID ? '✅ Loaded' : '❌ MISSING');
console.log('GOOGLE_CLIENT_SECRET:', GOOGLE_CLIENT_SECRET ? '✅ Loaded' : '❌ MISSING');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Using default');
console.log('BACKEND_URL:', BACKEND_URL || 'Using default');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded' : '⚠️  Using default');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Loaded' : '❌ MISSING\n');

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  console.log("✅ Configuring Google OAuth Strategy...");
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: `${BACKEND_URL}/api/auth/google/callback`,
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value.toLowerCase();
          const name = profile.displayName || profile.name?.givenName || "User";
          const googleId = profile.id;

          let user = await User.findOne({ googleId });

          if (user) return done(null, user);

          user = await User.findOne({ email });

          if (user) {
            user.googleId = googleId;
            await user.save();
            return done(null, user);
          }

          const hashedPassword = await bcrypt.hash(
            `google_${googleId}_${Date.now()}_${Math.random()}`,
            10
          );

          user = new User({
            name,
            email,
            googleId,
            password: hashedPassword,
            role: "user",
          });

          await user.save();
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  console.log("✅ Google OAuth Strategy configured successfully!");
  console.log("⚡ Sessions disabled for faster OAuth performance\n");
}

// ==================== MIDDLEWARE SETUP ====================
app.use(helmet());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ✅ CORS Configuration - Allows Vercel + Local
app.use(cors({ 
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "https://2-wolf-1kt2.vercel.app",
    "https://*.vercel.app",
    /\.vercel\.app$/  // ✅ Allow all Vercel subdomains
  ], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Serve static uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ Initialize Passport (without sessions for JWT)
app.use(passport.initialize());

// ==================== DATABASE CONNECTION ====================
console.log('\n🔌 Connecting to MongoDB...');
await connectDB();

// ==================== CREATE DEFAULT ADMIN ====================
console.log('\n🔐 Setting up admin account...');
try {
  await createDefaultAdmin();
  console.log('✅ Admin setup complete!\n');
} catch (error) {
  console.error('❌ Admin setup failed:', error.message);
}

// ==================== API ROUTES ====================
console.log('🛣️  Setting up routes...');

app.use("/api/users", authRoutes);
app.use("/api/auth", oauthRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/invoices', invoiceRoutes);

console.log('✅ Routes configured\n');

// ==================== HEALTH CHECK ROUTES ====================
app.get("/", (req, res) => {
  res.json({ 
    message: "2Wolf Backend API is running!",
    version: "1.0.0",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    googleOAuth: GOOGLE_CLIENT_ID ? "Configured" : "Not Configured",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1,
      googleOAuth: !!GOOGLE_CLIENT_ID,
      stripe: !!process.env.STRIPE_SECRET_KEY,
      uploads: true
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==================== ERROR HANDLERS ====================
// 404 handler
app.use((req, res) => {
  console.log('⚠️  404 Not Found:', req.method, req.url);
  res.status(404).json({ 
    success: false,
    message: "Route not found",
    path: req.url,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  
  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File size too large. Maximum 5MB allowed."
    });
  }
  
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message: "Too many files uploaded. Maximum 10 allowed."
    });
  }
  
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ==================== SERVER START ====================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('='.repeat(60));
  console.log('📁 Uploads directory:', path.join(__dirname, 'uploads'));
  console.log('🔐 Google OAuth:', GOOGLE_CLIENT_ID ? '✅ Ready (Fast Mode)' : '❌ Not Configured');
  console.log('🔑 JWT Secret:', process.env.JWT_SECRET ? '✅ Configured' : '⚠️  Using default');
  console.log('💾 Database:', mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected');
  console.log('🌐 CORS:', 'Enabled for Vercel + Local');
  console.log('='.repeat(60) + '\n');
});

// ==================== GRACEFUL SHUTDOWN ====================
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  console.log("⚠️  Server shutting down due to unhandled promise rejection");
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('💾 MongoDB connection closed');
    process.exit(0);
  });
});