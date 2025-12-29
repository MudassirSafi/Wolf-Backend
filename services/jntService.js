// ============================================
// 📦 PART 1: J&T Express API Service
// wolf-backend/services/jntService.js
// ============================================

import axios from 'axios';
import crypto from 'crypto';

class JNTService {
  constructor() {
    // J&T Express API Configuration
    this.apiKey = process.env.JNT_API_KEY;
    this.apiSecret = process.env.JNT_API_SECRET;
    this.customerCode = process.env.JNT_CUSTOMER_CODE; // Your J&T account code
    
    // UAE Production API (change based on region)
    this.baseURL = process.env.JNT_API_URL || 'https://api.jtjms-sa.com/api';
    
    // Service types
    this.serviceTypes = {
      STANDARD: 'standard',
      EXPRESS: 'express',
      ECONOMY: 'economy'
    };
  }

  // Generate signature for API authentication
  generateSignature(data, timestamp) {
    const stringToSign = `${this.apiKey}${JSON.stringify(data)}${timestamp}${this.apiSecret}`;
    return crypto.createHash('md5').update(stringToSign).digest('hex').toUpperCase();
  }

  // Common headers for all requests
  getHeaders(data) {
    const timestamp = Date.now().toString();
    const signature = this.generateSignature(data, timestamp);
    
    return {
      'Content-Type': 'application/json',
      'apiAccount': this.apiKey,
      'timestamp': timestamp,
      'sign': signature,
      'digest': crypto.createHash('md5').update(JSON.stringify(data)).digest('base64')
    };
  }

  // 1️⃣ CREATE SHIPMENT / WAYBILL
  async createShipment(orderData) {
    try {
      const shipmentData = {
        customerCode: this.customerCode,
        digest: '',
        txLogisticId: orderData.orderId, // Your unique order ID
        orderType: '1', // 1=B2C, 2=C2C, 3=B2B
        serviceType: orderData.serviceType || this.serviceTypes.STANDARD,
        
        // Sender Information (Your warehouse/store)
        sender: {
          name: orderData.sender.name || '2Wolf Store',
          mobile: orderData.sender.mobile,
          phone: orderData.sender.phone || orderData.sender.mobile,
          countryCode: orderData.sender.countryCode || 'AE',
          city: orderData.sender.city,
          area: orderData.sender.area || orderData.sender.city,
          address: orderData.sender.address,
          postCode: orderData.sender.postCode || ''
        },
        
        // Receiver Information (Customer)
        receiver: {
          name: orderData.receiver.name,
          mobile: orderData.receiver.mobile,
          phone: orderData.receiver.phone || orderData.receiver.mobile,
          countryCode: orderData.receiver.countryCode,
          city: orderData.receiver.city,
          area: orderData.receiver.area || orderData.receiver.city,
          address: orderData.receiver.address,
          postCode: orderData.receiver.postCode || '',
          email: orderData.receiver.email || ''
        },
        
        // Package Information
        goodsType: orderData.goodsType || '1', // 1=General goods
        totalQuantity: orderData.totalQuantity || 1,
        weight: orderData.weight || 1.0, // in KG
        itemsName: orderData.itemsName, // Product description
        
        // Declared value for insurance
        insuranceValue: orderData.insuranceValue || 0,
        
        // COD (Cash on Delivery) - if applicable
        codAmount: orderData.codAmount || 0,
        currency: orderData.currency || 'AED',
        
        // Delivery Instructions
        remark: orderData.remark || '',
        
        // Pickup request
        pickupDate: orderData.pickupDate || new Date().toISOString().split('T')[0]
      };

      const headers = this.getHeaders(shipmentData);
      
      const response = await axios.post(
        `${this.baseURL}/order/addOrder`,
        shipmentData,
        { headers }
      );

      if (response.data.code === '1') {
        return {
          success: true,
          data: {
            billCode: response.data.data.billCode, // J&T tracking number
            sortingCode: response.data.data.sortingCode,
            packageCode: response.data.data.packageCode,
            internationalCode: response.data.data.internationalCode,
            shortCode: response.data.data.shortCode,
            orderStatus: 'created',
            estimatedDelivery: this.calculateEstimatedDelivery(orderData)
          }
        };
      } else {
        throw new Error(response.data.msg || 'Failed to create shipment');
      }
    } catch (error) {
      console.error('J&T Create Shipment Error:', error.response?.data || error.message);
      throw new Error(`Failed to create J&T shipment: ${error.message}`);
    }
  }

  // 2️⃣ TRACK SHIPMENT
  async trackShipment(billCode) {
    try {
      const trackingData = {
        customerCode: this.customerCode,
        billCode: billCode // J&T tracking number
      };

      const headers = this.getHeaders(trackingData);
      
      const response = await axios.post(
        `${this.baseURL}/order/track`,
        trackingData,
        { headers }
      );

      if (response.data.code === '1') {
        const details = response.data.data.details || [];
        
        return {
          success: true,
          data: {
            billCode: response.data.data.billCode,
            status: this.mapJNTStatus(response.data.data.lastStatus),
            currentLocation: details[0]?.scanNetworkName || 'N/A',
            history: details.map(d => ({
              time: d.scanTime,
              location: d.scanNetworkName,
              status: d.desc,
              scanType: d.scanType
            })),
            lastUpdate: details[0]?.scanTime || null
          }
        };
      } else {
        throw new Error(response.data.msg || 'Tracking failed');
      }
    } catch (error) {
      console.error('J&T Track Error:', error.response?.data || error.message);
      throw new Error(`Failed to track shipment: ${error.message}`);
    }
  }

  // 3️⃣ CALCULATE SHIPPING RATES
  async calculateShippingRate(rateData) {
    try {
      const requestData = {
        customerCode: this.customerCode,
        sender: {
          countryCode: rateData.senderCountry,
          city: rateData.senderCity,
          postCode: rateData.senderPostCode || ''
        },
        receiver: {
          countryCode: rateData.receiverCountry,
          city: rateData.receiverCity,
          postCode: rateData.receiverPostCode || ''
        },
        weight: rateData.weight || 1.0,
        serviceType: rateData.serviceType || this.serviceTypes.STANDARD
      };

      const headers = this.getHeaders(requestData);
      
      const response = await axios.post(
        `${this.baseURL}/order/getShippingFee`,
        requestData,
        { headers }
      );

      if (response.data.code === '1') {
        return {
          success: true,
          data: {
            baseFee: response.data.data.baseFee,
            fuelSurcharge: response.data.data.fuelSurcharge || 0,
            additionalFee: response.data.data.additionalFee || 0,
            totalFee: response.data.data.totalFee,
            currency: response.data.data.currency || 'AED',
            estimatedDays: response.data.data.estimatedDays || '2-3'
          }
        };
      } else {
        // If API doesn't support rate calculation, return default rates
        return this.getDefaultRates(rateData);
      }
    } catch (error) {
      console.error('J&T Rate Calculation Error:', error.response?.data || error.message);
      // Return default rates as fallback
      return this.getDefaultRates(rateData);
    }
  }

  // Default rates fallback (based on your shipping zones)
  getDefaultRates(rateData) {
    const rates = {
      'AE': { fee: 15, currency: 'AED', days: '2-3' }, // UAE
      'SA': { fee: 25, currency: 'SAR', days: '3-5' }, // Saudi Arabia
      'QA': { fee: 20, currency: 'QAR', days: '3-4' }, // Qatar
      'OM': { fee: 22, currency: 'OMR', days: '3-5' }, // Oman
      'BH': { fee: 18, currency: 'BHD', days: '2-4' }, // Bahrain
      'KW': { fee: 24, currency: 'KWD', days: '3-5' }  // Kuwait
    };

    const country = rateData.receiverCountry;
    const rate = rates[country] || { fee: 30, currency: 'USD', days: '5-7' };

    return {
      success: true,
      data: {
        baseFee: rate.fee,
        fuelSurcharge: 0,
        additionalFee: 0,
        totalFee: rate.fee,
        currency: rate.currency,
        estimatedDays: rate.days
      }
    };
  }

  // 4️⃣ PRINT SHIPPING LABEL (Get Label URL)
  async getShippingLabel(billCode) {
    try {
      const labelData = {
        customerCode: this.customerCode,
        billCode: billCode,
        type: '1' // 1=PDF, 2=Image
      };

      const headers = this.getHeaders(labelData);
      
      const response = await axios.post(
        `${this.baseURL}/order/getPrintInfo`,
        labelData,
        { headers }
      );

      if (response.data.code === '1') {
        return {
          success: true,
          data: {
            labelUrl: response.data.data.labelUrl,
            labelBase64: response.data.data.labelBase64 || null,
            expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
          }
        };
      } else {
        throw new Error(response.data.msg || 'Failed to get label');
      }
    } catch (error) {
      console.error('J&T Label Error:', error.response?.data || error.message);
      throw new Error(`Failed to get shipping label: ${error.message}`);
    }
  }

  // 5️⃣ SCHEDULE PICKUP
  async schedulePickup(pickupData) {
    try {
      const requestData = {
        customerCode: this.customerCode,
        pickupDate: pickupData.pickupDate, // YYYY-MM-DD
        pickupTime: pickupData.pickupTime || '09:00-18:00',
        address: {
          name: pickupData.name,
          mobile: pickupData.mobile,
          countryCode: pickupData.countryCode,
          city: pickupData.city,
          area: pickupData.area,
          address: pickupData.address,
          postCode: pickupData.postCode || ''
        },
        totalQuantity: pickupData.totalQuantity || 1,
        remark: pickupData.remark || ''
      };

      const headers = this.getHeaders(requestData);
      
      const response = await axios.post(
        `${this.baseURL}/order/createPickup`,
        requestData,
        { headers }
      );

      if (response.data.code === '1') {
        return {
          success: true,
          data: {
            pickupNo: response.data.data.pickupNo,
            pickupStatus: 'scheduled',
            pickupDate: pickupData.pickupDate,
            pickupTime: pickupData.pickupTime
          }
        };
      } else {
        throw new Error(response.data.msg || 'Failed to schedule pickup');
      }
    } catch (error) {
      console.error('J&T Pickup Error:', error.response?.data || error.message);
      throw new Error(`Failed to schedule pickup: ${error.message}`);
    }
  }

  // 6️⃣ CANCEL SHIPMENT
  async cancelShipment(billCode, reason) {
    try {
      const cancelData = {
        customerCode: this.customerCode,
        billCode: billCode,
        reason: reason || 'Customer request'
      };

      const headers = this.getHeaders(cancelData);
      
      const response = await axios.post(
        `${this.baseURL}/order/cancel`,
        cancelData,
        { headers }
      );

      if (response.data.code === '1') {
        return {
          success: true,
          message: 'Shipment cancelled successfully'
        };
      } else {
        throw new Error(response.data.msg || 'Failed to cancel shipment');
      }
    } catch (error) {
      console.error('J&T Cancel Error:', error.response?.data || error.message);
      throw new Error(`Failed to cancel shipment: ${error.message}`);
    }
  }

  // Helper: Map J&T status to your system
  mapJNTStatus(jntStatus) {
    const statusMap = {
      'CREATED': 'Pending',
      'PICKUP': 'Processing',
      'IN_TRANSIT': 'Shipped',
      'OUT_FOR_DELIVERY': 'Out for Delivery',
      'DELIVERED': 'Delivered',
      'FAILED': 'Failed',
      'RETURNED': 'Returned',
      'CANCELLED': 'Cancelled'
    };
    return statusMap[jntStatus] || 'Processing';
  }

  // Helper: Calculate estimated delivery date
  calculateEstimatedDelivery(orderData) {
    const daysMap = {
      'AE': 3,  // UAE: 2-3 days
      'SA': 5,  // Saudi: 3-5 days
      'QA': 4,  // Qatar: 3-4 days
      'OM': 5,  // Oman: 3-5 days
      'BH': 4,  // Bahrain: 2-4 days
      'KW': 5   // Kuwait: 3-5 days
    };

    const days = daysMap[orderData.receiver.countryCode] || 7;
    const estimated = new Date();
    estimated.setDate(estimated.getDate() + days);
    
    return estimated.toISOString();
  }

  // 7️⃣ VERIFY WEBHOOK SIGNATURE (for tracking updates)
  verifyWebhookSignature(payload, receivedSignature) {
    const calculatedSignature = crypto
      .createHash('md5')
      .update(`${JSON.stringify(payload)}${this.apiSecret}`)
      .digest('hex')
      .toUpperCase();
    
    return calculatedSignature === receivedSignature;
  }
}

export default new JNTService();


