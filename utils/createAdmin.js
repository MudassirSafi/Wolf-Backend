// backend/utils/createAdmin.js - FIXED
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "2wolf@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "2Wolfdubai";
    const adminName = process.env.ADMIN_NAME || "2Wolf Admin";

    console.log("🔍 Checking for admin account:", adminEmail);

    let user = await User.findOne({ email: adminEmail });

    if (user) {
      console.log("⚠️  Admin user already exists - updating password");
      
      // Always regenerate password hash to ensure it works
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      user.password = hashedPassword;
      user.role = "admin";
      user.name = adminName;
      
      await user.save();
      console.log("✅ Admin password updated!");
    } else {
      console.log("🆕 Creating new admin user");
      
      // Create fresh hash
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      
      user = new User({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "admin"
        // ✅ Removed isVerified - not in your User model
      });
      
      await user.save();
      console.log("✅ Admin user created!");
    }

    console.log("📧 Email:", adminEmail);
    console.log("🔑 Password:", adminPassword);
    console.log("👤 Role:", user.role);
    
    // Test the password immediately
    const testMatch = await bcrypt.compare(adminPassword, user.password);
    console.log("🧪 Password test:", testMatch ? "✅ WORKS" : "❌ FAILED");
    
    if (!testMatch) {
      console.error("⚠️  WARNING: Password hash verification failed!");
    }
    
  } catch (error) {
    console.error("❌ Admin setup failed:", error.message);
    throw error;
  }
};