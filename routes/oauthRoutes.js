// ==========================================
// 📁 FILE 3: backend/routes/oauthRoutes.js - ADD THIS CHECK
// ==========================================
import express from "express";
import passport from "passport";
import { googleCallback } from "../controllers/oauthController.js";

const router = express.Router();

// ✅ Initiate Google OAuth
router.get(
  "/google",
  (req, res, next) => {
    console.log('🔐 Starting Google OAuth flow...');
    next();
  },
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    session: false  // ✅ Disable sessions for faster response
  })
);

// ✅ Google OAuth callback
router.get(
  "/google/callback",
  (req, res, next) => {
    console.log('📥 Google OAuth callback received');
    next();
  },
  passport.authenticate("google", { 
    failureRedirect: process.env.FRONTEND_URL + "/signin?error=oauth_failed",
    session: false  // ✅ Disable sessions
  }),
  googleCallback
);

export default router;

