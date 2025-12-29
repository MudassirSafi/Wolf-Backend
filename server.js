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

const app = express();

// ✅ Configure Passport Google Strategy
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

console.log('\n🔍 ENVIRONMENT CHECK:');
console.log('GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID ? '✅ Loaded' : '❌ MISSING');
console.log('GOOGLE_CLIENT_SECRET:', GOOGLE_CLIENT_SECRET ? '✅ Loaded' : '❌ MISSING');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL || 'Using default');
console.log('BACKEND_URL:', BACKEND_URL || 'Using default\n');

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

  console.log("✅ Google OAuth Strategy configured successfully!\n");
}

// ✅ Middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));

// ✅ Initialize Passport
app.use(passport.initialize());

// ✅ MongoDB connection
await connectDB();

// ✅ Routes
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

app.use('/uploads', express.static('uploads'));

// ✅ Health check
app.get("/", (req, res) => {
  res.json({ 
    message: "2Wolf Backend API is running!",
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    googleOAuth: GOOGLE_CLIENT_ID ? "Configured" : "Not Configured"
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    services: {
      database: mongoose.connection.readyState === 1,
      googleOAuth: !!GOOGLE_CLIENT_ID,
      stripe: !!process.env.STRIPE_SECRET_KEY
    }
  });
});

// ✅ 404 handler
app.use((req, res) => res.status(404).json({ message: "Route not found" }));

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ 
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ✅ Server start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔐 Google OAuth: ${GOOGLE_CLIENT_ID ? '✅ Ready' : '❌ Not Configured'}\n`);
});
