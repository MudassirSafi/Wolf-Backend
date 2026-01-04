// backend/utils/createAdmin.js - FIXED FOR ATLAS/RENDER
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "2wolf@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "2Wolfdubai";
    const adminName = process.env.ADMIN_NAME || "2Wolf Admin";

    console.log("🔍 Checking for admin user:", adminEmail);

    // FORCE DELETE any existing/broken admin with this email
    const deleted = await User.deleteMany({ email: adminEmail });
    if (deleted.deletedCount > 0) {
      console.log(`🗑️ Removed ${deleted.deletedCount} old/broken admin record(s)`);
    }

    // Now create fresh admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const admin = new User({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      isVerified: true, // Optional: auto-verify admin
    });

    await admin.save();

    console.log("✅ Default admin created successfully!");
    console.log("📧 Email:", adminEmail);
    console.log("🔑 Password:", adminPassword);
    console.log("⚠️ CHANGE THIS PASSWORD IMMEDIATELY IN PRODUCTION!");
  } catch (error) {
    console.error("❌ Error creating default admin:", error.message);
  }
};