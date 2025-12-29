import Order from "../models/Order.js";
import Product from "../models/product.js";

// ==================== CREATE ORDER ====================
// ==================== CREATE ORDER ====================
export const createOrder = async (req, res) => {
  try {
    const { products, address, paymentMethod, paymentStatus } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ message: "No products provided" });
    }
    if (!address || !paymentMethod) {
      return res.status(400).json({ message: "Address and payment method are required" });
    }

    let total = 0;
    const orderItems = [];

    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      const qty = Number(item.quantity || 0); // requested quantity
      const stock = Number(product.stock || 0); // available stock

      if (!qty || qty <= 0) {
        return res.status(400).json({ message: `Invalid quantity for product ${product.name}` });
      }

      if (qty > stock) {
        return res.status(400).json({
          message: `Insufficient stock for product: ${product.name}. Available: ${stock}, Requested: ${qty}`,
        });
      }

      // add to total
      total += product.price * qty;

      // push to order items
      orderItems.push({
        productId: product._id,
        quantity: qty,
        price: product.price,
      });

      // reduce stock
      product.stock -= qty;
      await product.save();
    }

    const newOrder = await Order.create({
      user: req.user ? req.user._id : null,
      products: orderItems,
      total,
      address,
      paymentMethod,
      paymentStatus: paymentStatus || "Pending",
    });

    res.status(201).json({ success: true, message: "Order created successfully", order: newOrder });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ success: false, message: "Error creating order", error: error.message });
  }
};



// ==================== GET ALL ORDERS (Admin only) ====================
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("products.productId", "name price","",);

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

// ==================== GET ORDER BY ID (Admin only) ====================
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("products.productId", "name price","paymentStatus");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching order",
      error: error.message,
    });
  }
};

// ==================== UPDATE ORDER (Admin only) ====================
export const updateOrder = async (req, res) => {
  try {
    const { status, address, paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (status) order.status = status;
    if (address) order.address = address;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating order",
      error: error.message,
    });
  }
};

// ==================== DELETE ORDER (Admin only) ====================
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting order",
      error: error.message,
    });
  }
};