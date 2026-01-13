// ✅ wolf-backend/routes/authRoutes.js - ENHANCED VERSION
import express from "express";
import { 
  signup, 
  signin,
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  updateNotificationSettings,
  forgotPassword,
  resetPassword
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads/avatars';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer setup for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// ==================== PUBLIC ROUTES ====================
// POST /api/users/signup
router.post("/signup", signup);

// POST /api/users/signin
router.post("/signin", signin);

// POST /api/users/forgot-password
router.post("/forgot-password", forgotPassword);

// POST /api/users/reset-password/:token
router.post("/reset-password/:token", resetPassword);

// ==================== PROTECTED ROUTES (Require Authentication) ====================
// Profile routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.put('/change-password', protect, changePassword);

// Address routes
router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);

// Notification settings
router.put('/notification-settings', protect, updateNotificationSettings);

export default router;