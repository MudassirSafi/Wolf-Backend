// backend/controllers/oauthController.js - CLEAN (Google Only)
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret_dev_change_this";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const createToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

// Google OAuth Callback
export const googleCallback = async (req, res) => {
  try {
    // User is already attached to req.user by passport
    const user = req.user;
    
    if (!user) {
      console.error("❌ No user found in Google callback");
      return res.redirect(`${FRONTEND_URL}/signin?error=oauth_failed`);
    }

    const token = createToken(user);
    
    // DEBUG: Show what secret is being used
console.log("🔑 JWT_SECRET used for signing:", JWT_SECRET.substring(0, 10) + "...");
console.log("🎫 Token created:", token.substring(0, 30) + "...");

    console.log("✅ Google OAuth success for:", user.email);
    console.log("🔄 Redirecting to:", `${FRONTEND_URL}/auth/callback`);
    
    // Redirect to frontend with token and role
    res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&role=${user.role}`);
  } catch (error) {
    console.error("❌ Google OAuth callback error:", error);
    res.redirect(`${FRONTEND_URL}/signin?error=oauth_failed`);
  }
};