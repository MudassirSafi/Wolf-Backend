/* backend/config/passport.js - CORRECTED EXPORT
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

// ✅ Only configure Google OAuth if credentials are provided
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  console.log("✅ Google OAuth configured");
  
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
          console.log("📧 Google OAuth attempt for:", profile.emails[0].value);
          
          // Extract user info from Google profile
          const email = profile.emails[0].value.toLowerCase();
          const name = profile.displayName || profile.name?.givenName || "User";
          const googleId = profile.id;

          // Check if user already exists by Google ID
          let user = await User.findOne({ googleId });

          if (user) {
            console.log("✅ Existing Google user found");
            return done(null, user);
          }

          // Check if user exists by email
          user = await User.findOne({ email });

          if (user) {
            // Link Google ID to existing account
            user.googleId = googleId;
            await user.save();
            console.log("✅ Linked Google to existing user");
            return done(null, user);
          }

          // Create new user with hashed password
          const randomPassword = `google_${googleId}_${Date.now()}_${Math.random()}`;
          const hashedPassword = await bcrypt.hash(randomPassword, 10);
          
          user = new User({
            name,
            email,
            googleId,
            password: hashedPassword,
            role: "user",
          });

          await user.save();
          console.log("✅ New user created via Google OAuth:", email);
          return done(null, user);
        } catch (error) {
          console.error("❌ Google Strategy Error:", error);
          return done(error, null);
        }
      }
    )
  );
} else {
  console.log("⚠️  Google OAuth NOT configured - Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env");
}

// Serialize and deserialize user (required by passport)
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// ✅ CRITICAL: Export default passport instance (not default export)
export default passport; */