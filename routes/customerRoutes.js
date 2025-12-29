// backend/routes/customerRoutes.js
import express from 'express';
import User from '../models/User.js';
import Order from '../models/Order.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get all customers (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    console.log('📊 Fetching customers...');
    
    // Get all users with role 'user'
    const users = await User.find({ role: 'user' })
      .select('-password')
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${users.length} users`);

    // Get order stats for each customer
    const customersWithStats = await Promise.all(
      users.map(async (user) => {
        try {
          // Find orders where user field matches this user's _id
          const orders = await Order.find({ user: user._id });

          console.log(`📦 User ${user.email}: ${orders.length} orders`);

          const totalOrders = orders.length;
          
          // Calculate total spent from the total field
          const totalSpent = orders.reduce((sum, order) => {
            return sum + (order.total || 0);
          }, 0);

          console.log(`💰 User ${user.email}: $${totalSpent.toFixed(2)} spent`);

          return {
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone || 'N/A',
            orders: totalOrders,
            totalOrders,
            spent: totalSpent,
            totalSpent,
            joined: user.createdAt,
            createdAt: user.createdAt,
            address: user.address || null
          };
        } catch (err) {
          console.error(`❌ Error processing user ${user.email}:`, err);
          return {
            _id: user._id,
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone || 'N/A',
            orders: 0,
            totalOrders: 0,
            spent: 0,
            totalSpent: 0,
            joined: user.createdAt,
            createdAt: user.createdAt,
            address: user.address || null
          };
        }
      })
    );

    console.log('✅ Sending customer data with stats');
    res.json(customersWithStats);
  } catch (error) {
    console.error('❌ Error fetching customers:', error);
    res.status(500).json({ message: 'Error fetching customers', error: error.message });
  }
});

// Get single customer by ID (admin only)
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Find all orders for this user
    const orders = await Order.find({ user: user._id })
      .populate('products.productId', 'name image')
      .sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    const customerData = {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || 'N/A',
      orders: totalOrders,
      totalOrders,
      spent: totalSpent,
      totalSpent,
      joined: user.createdAt,
      createdAt: user.createdAt,
      address: user.address || null,
      orderHistory: orders.map(order => ({
        _id: order._id,
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt,
        products: order.products
      }))
    };

    res.json(customerData);
  } catch (error) {
    console.error('❌ Error fetching customer:', error);
    res.status(500).json({ message: 'Error fetching customer', error: error.message });
  }
});

// Search customers (admin only)
router.get('/search', protect, authorize('admin'), async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query required' });
    }

    const users = await User.find({
      role: 'user',
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ]
    }).select('-password');

    // Get order stats for search results
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.find({ user: user._id });
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);

        return {
          _id: user._id,
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || 'N/A',
          orders: totalOrders,
          totalOrders,
          spent: totalSpent,
          totalSpent,
          joined: user.createdAt,
          createdAt: user.createdAt
        };
      })
    );

    res.json(usersWithStats);
  } catch (error) {
    console.error('❌ Error searching customers:', error);
    res.status(500).json({ message: 'Error searching customers', error: error.message });
  }
});

export default router;