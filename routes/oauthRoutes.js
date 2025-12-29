// backend/routes/oauthRoutes.js - FIXED (Google Only)
import express from "express";
import passport from 'passport';
import { googleCallback } from "../controllers/oauthController.js";

const router = express.Router();

// Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    session: false 
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { 
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/signin?error=google_failed`,
    session: false 
  }),
  googleCallback
);

export default router;