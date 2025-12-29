// wolf-backend/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "MuhibAfridi2WolfSecretKey";
console.log("🔑 JWT_SECRET used for verifying:", JWT_SECRET.substring(0, 10) + "...");

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('\n=== AUTH MIDDLEWARE DEBUG START ===');
    console.log('1. 🔐 Authorization header present:', !!authHeader);
    console.log('2. 📝 Authorization header:', authHeader ? authHeader.substring(0, 50) + '...' : 'NONE');
    
    // Check if header exists and starts with Bearer
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error('❌ Invalid authorization header format');
      console.log('=== AUTH MIDDLEWARE DEBUG END ===\n');
      return res.status(401).json({ 
        success: false,
        message: "No token, authorization denied." 
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];
    console.log('3. 🎫 Token extracted:', token ? token.substring(0, 30) + '...' : 'NONE');
    console.log('4. 📏 Token length:', token?.length || 0);
    
    if (!token) {
      console.error('❌ Token is empty after split');
      console.log('=== AUTH MIDDLEWARE DEBUG END ===\n');
      return res.status(401).json({ 
        success: false,
        message: "Token not found." 
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
      console.log('5. ✅ Token verified successfully');
      console.log('6. 📦 Decoded payload:', decoded);
    } catch (jwtError) {
      console.error('❌ JWT verification failed:', jwtError.message);
      console.error('❌ JWT error type:', jwtError.name);
      console.log('=== AUTH MIDDLEWARE DEBUG END ===\n');
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          success: false,
          message: "Token expired. Please sign in again." 
        });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          success: false,
          message: "Token invalid." 
        });
      }
      
      return res.status(401).json({ 
        success: false,
        message: "Token verification failed." 
      });
    }
    
    // Fetch user from database
    console.log('7. 🔍 Looking up user with ID:', decoded.id);
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      console.error('❌ User not found in database for ID:', decoded.id);
      console.log('=== AUTH MIDDLEWARE DEBUG END ===\n');
      return res.status(401).json({ 
        success: false,
        message: "User not found." 
      });
    }
    
    console.log('8. ✅ User found:', user.email);
    console.log('9. 👤 User role:', user.role);
    console.log('10. 🆔 User MongoDB _id:', user._id);
    
    // Attach user to request
    req.user = user;
    
    console.log('✅ Authentication successful!');
    console.log('=== AUTH MIDDLEWARE DEBUG END ===\n');
    
    next();
  } catch (err) {
    console.error('❌ Unexpected error in auth middleware:', err);
    console.log('=== AUTH MIDDLEWARE DEBUG END ===\n');
    return res.status(500).json({ 
      success: false,
      message: "Server error in authentication.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: "No user info." 
    });
  }
  
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ 
      success: false,
      message: `Access forbidden. Required role: ${roles.join(' or ')}. Your role: ${req.user.role}` 
    });
  }
  
  next();
};