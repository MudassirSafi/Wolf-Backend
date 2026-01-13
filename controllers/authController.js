// ✅ wolf-backend/controllers/authController.js - COMPLETE VERSION
// REPLACE YOUR ENTIRE FILE WITH THIS
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const JWT_SECRET = process.env.JWT_SECRET || "MuhibAfridi2WolfSecretKey";

// ==================== EMAIL SETUP ====================
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email utility
const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️ Email credentials not configured, skipping email send');
      return { success: false, error: 'Email not configured' };
    }

    const info = await transporter.sendMail({
      from: `"Wolf Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.message };
  }
};

const createToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

// ==================== SIGNUP ====================
export const signup = async (req, res) => {
  try {
    console.log("📝 Signup attempt:", req.body);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
      role: normalizedEmail.includes("admin") ? "admin" : "user",
      cart: [],
      addresses: [],
      notificationSettings: {
        orderUpdates: true,
        promotions: false,
        newsletter: true,
        sms: false
      }
    });

    await user.save();
    const token = createToken(user);

    // Send welcome email
    await sendEmail({
      to: user.email,
      subject: 'Welcome to Wolf Store! 🎉',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">Welcome to Wolf Store!</h2>
          <p>Hi ${user.name},</p>
          <p>Thank you for creating an account with us. We're excited to have you!</p>
          <p>You can now:</p>
          <ul>
            <li>Browse our amazing products</li>
            <li>Add items to your wishlist</li>
            <li>Track your orders</li>
            <li>Save multiple shipping addresses</li>
          </ul>
          <p>Happy shopping!</p>
          <p>Best regards,<br>Wolf Store Team</p>
        </div>
      `
    });

    console.log("✅ User created successfully:", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    res.status(201).json({
      success: true,
      token,
      role: user.role,
      name: user.name,
      email: user.email,
      _id: user._id,
      message: "Account created successfully",
    });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==================== SIGNIN ====================
export const signin = async (req, res) => {
  try {
    console.log("🔐 Signin attempt:", { email: req.body.email });
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log("❌ User not found:", normalizedEmail);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Invalid password for:", normalizedEmail);
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = createToken(user);

    console.log("✅ User signed in successfully:", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      token,
      role: user.role,
      name: user.name,
      email: user.email,
      _id: user._id,
      message: "Signed in successfully",
    });
  } catch (err) {
    console.error("❌ Signin error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ==================== GET USER PROFILE ====================
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
        addresses: user.addresses,
        notificationSettings: user.notificationSettings,
        emailVerified: user.emailVerified
      }
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ==================== UPDATE USER PROFILE ====================
export const updateUserProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();

    await user.save();

    console.log('✅ Profile updated for:', user.email);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ==================== UPLOAD AVATAR ====================
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    const user = await User.findById(req.user._id);
    user.avatar = avatarUrl;
    await user.save();

    console.log('✅ Avatar uploaded for:', user.email);

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar: avatarUrl
    });
  } catch (error) {
    console.error('❌ Upload avatar error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ==================== CHANGE PASSWORD ====================
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide both current and new password' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters' 
      });
    }

    const user = await User.findById(req.user._id);
    
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    await user.save();

    console.log('✅ Password changed for:', user.email);

    // Send email notification
    await sendEmail({
      to: user.email,
      subject: 'Password Changed Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">Password Changed</h2>
          <p>Hi ${user.name},</p>
          <p>Your password has been changed successfully.</p>
          <p>If you did not make this change, please contact us immediately.</p>
          <p>Best regards,<br>Wolf Store Team</p>
        </div>
      `
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ==================== GET ADDRESSES ====================
export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      addresses: user.addresses || []
    });
  } catch (error) {
    console.error('❌ Get addresses error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ==================== ADD ADDRESS ====================
export const addAddress = async (req, res) => {
  try {
    const { fullName, mobile, country, city, address, postCode, email, area, landmark, additionalInfo } = req.body;

    if (!fullName || !mobile || !country || !city || !address) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields (fullName, mobile, country, city, address)' 
      });
    }

    const user = await User.findById(req.user._id);
    
    const newAddress = {
      fullName: fullName.trim(),
      mobile: mobile.trim(),
      email: email || user.email,
      country: country.trim(),
      countryCode: country === 'UAE' ? 'AE' : country === 'Saudi Arabia' ? 'SA' : 'AE',
      city: city.trim(),
      address: address.trim(),
      area: area?.trim() || '',
      postCode: postCode?.trim() || '',
      landmark: landmark?.trim() || '',
      additionalInfo: additionalInfo?.trim() || '',
      isDefault: user.addresses.length === 0 // First address is default
    };

    user.addresses.push(newAddress);
    await user.save();

    console.log('✅ Address added for:', user.email);

    res.json({
      success: true,
      message: 'Address added successfully',
      addresses: user.addresses
    });
  } catch (error) {
    console.error('❌ Add address error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ==================== UPDATE ADDRESS ====================
export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const user = await User.findById(req.user._id);
    const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === id);

    if (addressIndex === -1) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Update address fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        user.addresses[addressIndex][key] = updateData[key];
      }
    });

    await user.save();

    console.log('✅ Address updated for:', user.email);

    res.json({
      success: true,
      message: 'Address updated successfully',
      addresses: user.addresses
    });
  } catch (error) {
    console.error('❌ Update address error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ==================== DELETE ADDRESS ====================
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(req.user._id);
    const initialLength = user.addresses.length;
    
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== id);

    if (user.addresses.length === initialLength) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await user.save();

    console.log('✅ Address deleted for:', user.email);

    res.json({
      success: true,
      message: 'Address deleted successfully',
      addresses: user.addresses
    });
  } catch (error) {
    console.error('❌ Delete address error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ==================== UPDATE NOTIFICATION SETTINGS ====================
export const updateNotificationSettings = async (req, res) => {
  try {
    const settings = req.body;

    const user = await User.findById(req.user._id);
    user.notificationSettings = {
      ...user.notificationSettings,
      ...settings
    };

    await user.save();

    console.log('✅ Notification settings updated for:', user.email);

    res.json({
      success: true,
      message: 'Notification settings updated',
      notificationSettings: user.notificationSettings
    });
  } catch (error) {
    console.error('❌ Update notification settings error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ==================== FORGOT PASSWORD ====================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      // Don't reveal if user exists
      return res.json({ 
        success: true, 
        message: 'If an account exists, a reset link has been sent' 
      });
    }

    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">Password Reset</h2>
          <p>Hi ${user.name},</p>
          <p>You requested to reset your password. Click the button below to proceed:</p>
          <a href="${resetUrl}" style="display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>Wolf Store Team</p>
        </div>
      `
    });

    console.log('✅ Reset email sent to:', user.email);

    res.json({ 
      success: true, 
      message: 'Password reset link sent to your email' 
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ==================== RESET PASSWORD ====================
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters' 
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();

    console.log('✅ Password reset successful for:', user.email);

    // Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Successful',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">Password Reset Successful</h2>
          <p>Hi ${user.name},</p>
          <p>Your password has been reset successfully.</p>
          <p>You can now sign in with your new password.</p>
          <p>Best regards,<br>Wolf Store Team</p>
        </div>
      `
    });

    res.json({
      success: true,
      message: 'Password reset successful. You can now sign in.'
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};