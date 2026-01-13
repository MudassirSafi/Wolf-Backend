// ==========================================
// 📁 wolf-backend/utils/emailService.js
// ==========================================
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Wolf Store" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error.message };
  }
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (user, order) => {
  const productsHtml = order.products.map(p => `
    <tr>
      <td>${p.name}</td>
      <td>${p.quantity}</td>
      <td>AED ${p.price.toFixed(2)}</td>
      <td>AED ${(p.price * p.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">Order Confirmed! 🎉</h2>
      <p>Hi ${user.name},</p>
      <p>Thank you for your order. We're getting it ready!</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Order #${order._id}</h3>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Status:</strong> ${order.status}</p>
      </div>

      <h3>Order Items:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f97316; color: white;">
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px;">Qty</th>
            <th style="padding: 10px;">Price</th>
            <th style="padding: 10px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${productsHtml}
        </tbody>
      </table>

      <div style="margin-top: 20px; text-align: right;">
        <p><strong>Subtotal:</strong> AED ${order.subtotal.toFixed(2)}</p>
        <p><strong>Shipping:</strong> AED ${order.shippingFee.toFixed(2)}</p>
        <p style="font-size: 20px; color: #f97316;"><strong>Total:</strong> AED ${order.total.toFixed(2)}</p>
      </div>

      <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3>Delivery Address:</h3>
        <p>${order.shippingAddress.fullName}</p>
        <p>${order.shippingAddress.address}</p>
        <p>${order.shippingAddress.city}, ${order.shippingAddress.country}</p>
        <p>📞 ${order.shippingAddress.mobile}</p>
      </div>

      <p style="margin-top: 30px;">We'll send you another email when your order ships.</p>
      
      <p>Best regards,<br>Wolf Store Team</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Order Confirmation - #${order._id}`,
    html
  });
};

// Send order status update email
export const sendOrderStatusEmail = async (user, order) => {
  const statusMessages = {
    'Processing': 'Your order is being processed',
    'Confirmed': 'Your order has been confirmed',
    'Shipped': 'Your order has been shipped',
    'Out for Delivery': 'Your order is out for delivery',
    'Delivered': 'Your order has been delivered'
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">Order Update</h2>
      <p>Hi ${user.name},</p>
      <p>${statusMessages[order.status] || 'Your order status has been updated'}</p>
      
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Order #${order._id}</h3>
        <p><strong>Status:</strong> ${order.status}</p>
        ${order.shipping?.trackingNumber ? `<p><strong>Tracking:</strong> ${order.shipping.trackingNumber}</p>` : ''}
      </div>

      <p>Thank you for shopping with us!</p>
      <p>Best regards,<br>Wolf Store Team</p>
    </div>
  `;

  return sendEmail({
    to: user.email,
    subject: `Order ${order.status} - #${order._id}`,
    html
  });
};