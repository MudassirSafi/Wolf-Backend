// ==========================================
// 📁 wolf-backend/routes/shippingRoutes.js
// Shipping & Courier Routes (J&T Express)
// ==========================================

import express from 'express';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import { shippingController } from '../controllers/shippingController.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// Track shipment by tracking number (no auth required)
router.get('/track/:trackingNumber', shippingController.trackShipment);

// Calculate shipping rate
router.post('/calculate-rate', shippingController.calculateRate);

// ==================== PROTECTED ROUTES (Admin Only) ====================

// Create shipment for an order
router.post('/create', protect, authorize('admin'), shippingController.createShipment);

// Get all shipments
router.get('/all', protect, authorize('admin'), shippingController.getAllShipments);

// Get shipping label
router.get('/label/:trackingNumber', protect, authorize('admin'), shippingController.getLabel);

// Schedule pickup
router.post('/schedule-pickup', protect, authorize('admin'), shippingController.schedulePickup);

// Cancel shipment
router.post('/cancel/:trackingNumber', protect, authorize('admin'), shippingController.cancelShipment);

// ==================== WEBHOOK ====================

// J&T webhook for tracking updates (no auth - verified by signature)
router.post('/webhook/jnt', shippingController.handleWebhook);

export default router;