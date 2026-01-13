// ==========================================
// 📁 FILE 4: backend/controllers/oauthController.js - OPTIMIZED
// ==========================================
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "MuhibAfridi2WolfSecretKey";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const createToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

export const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    
    if (!user) {
      console.error("❌ No user found in Google callback");
      return res.redirect(`${FRONTEND_URL}/signin?error=oauth_failed`);
    }

    const token = createToken(user);
    
    console.log('\n=== GOOGLE OAUTH CALLBACK ===');
    console.log("✅ OAuth success for:", user.email);
    console.log("👤 User:", { id: user._id, name: user.name, role: user.role });
    
    // ✅ OPTIMIZED: Build redirect URL more efficiently
    const params = new URLSearchParams({
      token,
      role: user.role,
      name: user.name || 'User',
      email: user.email,
      id: user._id.toString()
    });
    
    const redirectUrl = `${FRONTEND_URL}/auth/callback?${params.toString()}`;
    
    console.log("🔄 Redirecting to frontend...");
    console.log('===================\n');
    
    // ✅ Use 302 redirect for faster response
    res.redirect(302, redirectUrl);
  } catch (error) {
    console.error("❌ OAuth callback error:", error);
    res.redirect(`${FRONTEND_URL}/signin?error=oauth_failed`);
  }
};