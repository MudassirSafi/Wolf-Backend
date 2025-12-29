// backend/utils/createAdmin.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "2wolf@gmail.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "2Wolfdubai";
    const adminName = process.env.ADMIN_NAME || "2Wolf Admin";
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log("✅ Default admin already exists:", adminEmail);
      return;
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const admin = new User({
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();
    console.log("✅ Default admin created successfully!");
    console.log("📧 Email:", adminEmail);
    console.log("🔑 Password:", adminPassword);
    console.log("⚠️  Remember to change the password in production!");
  } catch (error) {
    console.error("❌ Error creating default admin:", error);
  }
};