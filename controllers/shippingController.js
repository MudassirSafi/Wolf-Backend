// ============================================
// 📦 PART 4: Shipping Controller
// wolf-backend/controllers/shippingController.js
// ============================================

import jntService from '../services/jntService.js';
import Shipping from '../models/Shipping.js';
import Order from '../models/Order.js';
import product from '../models/product.js';

export const shippingController = {
  
  // 1️⃣ CREATE SHIPMENT FOR AN ORDER
  async createShipment(req, res) {
    try {
      const { orderId } = req.body;
      
      // Get order with products
      const order = await Order.findById(orderId).populate('products.productId');
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Check if shipment already exists
      const existingShipment = await Shipping.findOne({ order: orderId });
      if (existingShipment) {
        return res.status(400).json({ 
          message: 'Shipment already exists for this order',
          trackingNumber: existingShipment.trackingNumber
        });
      }
      
      // Prepare items description
      const itemsName = order.products
        .map(p => `${p.name || p.productId.name} (x${p.quantity})`)
        .join(', ');
      
      // Create shipment with J&T
      const shipmentData = {
        orderId: order._id.toString(),
        serviceType: order.shipping?.serviceType || 'standard',
        
        // Your warehouse details (from env or config)
        sender: {
          name: process.env.WAREHOUSE_NAME || '2Wolf Store',
          mobile: process.env.WAREHOUSE_MOBILE,
          countryCode: process.env.WAREHOUSE_COUNTRY || 'AE',
          city: process.env.WAREHOUSE_CITY || 'Dubai',
          area: process.env.WAREHOUSE_AREA || 'Dubai',
          address: process.env.WAREHOUSE_ADDRESS,
          postCode: process.env.WAREHOUSE_POSTCODE || ''
        },
        
        // Customer details
        receiver: {
          name: order.shippingAddress.fullName,
          mobile: order.shippingAddress.mobile,
          email: order.shippingAddress.email,
          countryCode: order.shippingAddress.countryCode,
          city: order.shippingAddress.city,
          area: order.shippingAddress.area || order.shippingAddress.city,
          address: order.shippingAddress.address,
          postCode: order.shippingAddress.postCode || ''
        },
        
        // Package details
        totalQuantity: order.products.reduce((sum, p) => sum + p.quantity, 0),
        weight: order.totalWeight || 1.0,
        itemsName: itemsName,
        
        // COD if payment method is COD
        codAmount: order.paymentMethod === 'COD' ? order.total : 0,
        currency: 'AED',
        
        insuranceValue: order.total,
        remark: order.customerNote || ''
      };
      
      // Call J&T API
      const jntResponse = await jntService.createShipment(shipmentData);
      
      if (!jntResponse.success) {
        throw new Error('Failed to create J&T shipment');
      }
      
      // Save shipping record in database
      const shipping = new Shipping({
        order: orderId,
        trackingNumber: jntResponse.data.billCode,
        sortingCode: jntResponse.data.sortingCode,
        packageCode: jntResponse.data.packageCode,
        internationalCode: jntResponse.data.internationalCode,
        shortCode: jntResponse.data.shortCode,
        status: 'Processing',
        sender: shipmentData.sender,
        receiver: shipmentData.receiver,
        weight: shipmentData.weight,
        itemsDescription: itemsName,
        totalQuantity: shipmentData.totalQuantity,
        shippingFee: order.shippingFee,
        currency: shipmentData.currency,
        codAmount: shipmentData.codAmount,
        serviceType: shipmentData.serviceType,
        estimatedDelivery: jntResponse.data.estimatedDelivery,
        remark: shipmentData.remark
      });
      
      await shipping.save();
      
      // Update order with shipping info
      order.shipping = {
        carrier: 'J&T Express',
        trackingNumber: jntResponse.data.billCode,
        serviceType: shipmentData.serviceType,
        estimatedDelivery: jntResponse.data.estimatedDelivery
      };
      order.status = 'Processing';
      await order.save();
      
      res.status(201).json({
        message: 'Shipment created successfully',
        trackingNumber: jntResponse.data.billCode,
        estimatedDelivery: jntResponse.data.estimatedDelivery,
        shipping: shipping
      });
      
    } catch (error) {
      console.error('Create Shipment Error:', error);
      res.status(500).json({ 
        message: 'Failed to create shipment', 
        error: error.message 
      });
    }
  },
  
  // 2️⃣ TRACK SHIPMENT
  async trackShipment(req, res) {
    try {
      const { trackingNumber } = req.params;
      
      // Get from J&T API
      const trackingData = await jntService.trackShipment(trackingNumber);
      
      if (!trackingData.success) {
        return res.status(404).json({ message: 'Tracking information not found' });
      }
      
      // Update database
      const shipping = await Shipping.findOne({ trackingNumber }).populate('order');
      
      if (shipping) {
        shipping.status = trackingData.data.status;
        shipping.trackingHistory = trackingData.data.history;
        shipping.lastTrackedAt = new Date();
        
        // Update current location from latest tracking
        if (trackingData.data.currentLocation) {
          shipping.receiver.area = trackingData.data.currentLocation;
        }
        
        // If delivered, set actual delivery date
        if (trackingData.data.status === 'Delivered' && !shipping.actualDelivery) {
          shipping.actualDelivery = new Date();
        }
        
        await shipping.save();
        
        // Update order status
        if (shipping.order) {
          shipping.order.status = trackingData.data.status;
          shipping.order.shipping.currentLocation = trackingData.data.currentLocation;
          shipping.order.shipping.lastTrackedAt = new Date();
          
          if (trackingData.data.status === 'Delivered') {
            shipping.order.shipping.actualDelivery = new Date();
          }
          
          await shipping.order.save();
        }
      }
      
      res.json({
        success: true,
        tracking: trackingData.data,
        order: shipping?.order || null
      });
      
    } catch (error) {
      console.error('Track Shipment Error:', error);
      res.status(500).json({ 
        message: 'Failed to track shipment', 
        error: error.message 
      });
    }
  },
  
  // 3️⃣ CALCULATE SHIPPING RATE
  async calculateRate(req, res) {
    try {
      const { 
        receiverCountry, 
        receiverCity, 
        weight, 
        serviceType 
      } = req.body;
      
      const rateData = {
        senderCountry: process.env.WAREHOUSE_COUNTRY || 'AE',
        senderCity: process.env.WAREHOUSE_CITY || 'Dubai',
        receiverCountry,
        receiverCity,
        weight: weight || 1.0,
        serviceType: serviceType || 'standard'
      };
      
      const rateResult = await jntService.calculateShippingRate(rateData);
      
      res.json({
        success: true,
        rate: rateResult.data
      });
      
    } catch (error) {
      console.error('Calculate Rate Error:', error);
      res.status(500).json({ 
        message: 'Failed to calculate shipping rate', 
        error: error.message 
      });
    }
  },
  
  // 4️⃣ GET SHIPPING LABEL
  async getLabel(req, res) {
    try {
      const { trackingNumber } = req.params;
      
      const labelData = await jntService.getShippingLabel(trackingNumber);
      
      if (!labelData.success) {
        return res.status(404).json({ message: 'Label not found' });
      }
      
      // Update shipping record
      await Shipping.findOneAndUpdate(
        { trackingNumber },
        { 
          labelUrl: labelData.data.labelUrl,
          labelGeneratedAt: new Date()
        }
      );
      
      res.json({
        success: true,
        label: labelData.data
      });
      
    } catch (error) {
      console.error('Get Label Error:', error);
      res.status(500).json({ 
        message: 'Failed to get shipping label', 
        error: error.message 
      });
    }
  },
  
  // 5️⃣ SCHEDULE PICKUP
  async schedulePickup(req, res) {
    try {
      const { 
        pickupDate, 
        pickupTime, 
        totalQuantity, 
        remark 
      } = req.body;
      
      const pickupData = {
        pickupDate,
        pickupTime: pickupTime || '09:00-18:00',
        name: process.env.WAREHOUSE_NAME || '2Wolf Store',
        mobile: process.env.WAREHOUSE_MOBILE,
        countryCode: process.env.WAREHOUSE_COUNTRY || 'AE',
        city: process.env.WAREHOUSE_CITY || 'Dubai',
        area: process.env.WAREHOUSE_AREA || 'Dubai',
        address: process.env.WAREHOUSE_ADDRESS,
        postCode: process.env.WAREHOUSE_POSTCODE || '',
        totalQuantity: totalQuantity || 1,
        remark: remark || ''
      };
      
      const pickupResult = await jntService.schedulePickup(pickupData);
      
      if (!pickupResult.success) {
        return res.status(400).json({ message: 'Failed to schedule pickup' });
      }
      
      res.json({
        success: true,
        pickup: pickupResult.data
      });
      
    } catch (error) {
      console.error('Schedule Pickup Error:', error);
      res.status(500).json({ 
        message: 'Failed to schedule pickup', 
        error: error.message 
      });
    }
  },
  
  // 6️⃣ CANCEL SHIPMENT
  async cancelShipment(req, res) {
    try {
      const { trackingNumber } = req.params;
      const { reason } = req.body;
      
      const cancelResult = await jntService.cancelShipment(trackingNumber, reason);
      
      if (!cancelResult.success) {
        return res.status(400).json({ message: 'Failed to cancel shipment' });
      }
      
      // Update database
      const shipping = await Shipping.findOneAndUpdate(
        { trackingNumber },
        { 
          status: 'Cancelled',
          'errors': {
            $push: {
              time: new Date(),
              message: `Cancelled: ${reason}`,
              code: 'CANCELLED'
            }
          }
        },
        { new: true }
      ).populate('order');
      
      // Update order
      if (shipping && shipping.order) {
        shipping.order.status = 'Cancelled';
        shipping.order.cancellation = {
          cancelled: true,
          reason: reason,
          cancelledAt: new Date(),
          cancelledBy: 'admin'
        };
        await shipping.order.save();
      }
      
      res.json({
        success: true,
        message: 'Shipment cancelled successfully'
      });
      
    } catch (error) {
      console.error('Cancel Shipment Error:', error);
      res.status(500).json({ 
        message: 'Failed to cancel shipment', 
        error: error.message 
      });
    }
  },
  
  // 7️⃣ GET ALL SHIPMENTS (Admin)
  async getAllShipments(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status, 
        countryCode 
      } = req.query;
      
      const query = {};
      if (status) query.status = status;
      if (countryCode) query['receiver.countryCode'] = countryCode;
      
      const shipments = await Shipping.find(query)
        .populate('order', 'total paymentStatus createdAt')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);
      
      const total = await Shipping.countDocuments(query);
      
      res.json({
        success: true,
        shipments,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total
      });
      
    } catch (error) {
      console.error('Get Shipments Error:', error);
      res.status(500).json({ 
        message: 'Failed to get shipments', 
        error: error.message 
      });
    }
  },
  
  // 8️⃣ WEBHOOK HANDLER (for J&T tracking updates)
  async handleWebhook(req, res) {
    try {
      const signature = req.headers['x-jnt-signature'];
      const payload = req.body;
      
      // Verify webhook signature
      const isValid = jntService.verifyWebhookSignature(payload, signature);
      
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid signature' });
      }
      
      // Process webhook data
      const { billCode, status, scanTime, scanType, desc, scanNetworkName } = payload;
      
      // Update shipping record
      const shipping = await Shipping.findOne({ trackingNumber: billCode }).populate('order');
      
      if (shipping) {
        // Add to tracking history
        shipping.trackingHistory.push({
          time: new Date(scanTime),
          location: scanNetworkName,
          status: desc,
          scanType: scanType
        });
        
        // Update status
        shipping.status = jntService.mapJNTStatus(status);
        shipping.lastTrackedAt = new Date();
        
        // If delivered
        if (shipping.status === 'Delivered' && !shipping.actualDelivery) {
          shipping.actualDelivery = new Date();
        }
        
        await shipping.save();
        
        // Update order
        if (shipping.order) {
          shipping.order.status = shipping.status;
          shipping.order.shipping.currentLocation = scanNetworkName;
          shipping.order.shipping.lastTrackedAt = new Date();
          
          if (shipping.status === 'Delivered') {
            shipping.order.shipping.actualDelivery = new Date();
          }
          
          await shipping.order.save();
        }
      }
      
      // Respond to J&T webhook
      res.json({ success: true, message: 'Webhook processed' });
      
    } catch (error) {
      console.error('Webhook Error:', error);
      res.status(500).json({ message: 'Webhook processing failed' });
    }
  }
};


