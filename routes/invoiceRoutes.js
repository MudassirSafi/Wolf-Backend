// backend/routes/invoiceRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import Order from '../models/Order.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/invoices/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'invoice-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|jpg|jpeg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF and image files are allowed!'));
    }
  }
});

// Upload invoice for an order (Admin only)
router.post('/upload/:orderId', protect, authorize('admin'), upload.single('invoice'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Save invoice path
    order.invoice = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/invoices/${req.file.filename}`,
      uploadedAt: new Date()
    };

    await order.save();

    res.json({
      success: true,
      message: 'Invoice uploaded successfully',
      invoice: order.invoice
    });
  } catch (error) {
    console.error('Error uploading invoice:', error);
    res.status(500).json({ message: 'Error uploading invoice', error: error.message });
  }
});

// Get invoice for an order
router.get('/:orderId', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or is admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this invoice' });
    }

    if (!order.invoice) {
      return res.status(404).json({ message: 'Invoice not found for this order' });
    }

    res.json({
      success: true,
      invoice: order.invoice
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ message: 'Error fetching invoice', error: error.message });
  }
});

// Delete invoice (Admin only)
router.delete('/:orderId', protect, authorize('admin'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.invoice = undefined;
    await order.save();

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ message: 'Error deleting invoice', error: error.message });
  }
});

export default router;