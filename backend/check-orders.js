const mongoose = require('mongoose');
const Order = require('./models/Order');

async function checkOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vendorrs');

    // Check total orders
    const totalOrders = await Order.countDocuments();
    console.log('Total orders:', totalOrders);

    // Check orders by status
    const deliveredOrders = await Order.countDocuments({ status: 'DELIVERED' });
    const shippedOrders = await Order.countDocuments({ status: 'SHIPPED' });
    const confirmedOrders = await Order.countDocuments({ status: 'CONFIRMED' });

    console.log('Orders by status:');
    console.log('- DELIVERED:', deliveredOrders);
    console.log('- SHIPPED:', shippedOrders);
    console.log('- CONFIRMED:', confirmedOrders);

    // Check orders with relevant statuses
    const relevantOrders = await Order.find({
      status: { $in: ['DELIVERED', 'SHIPPED', 'CONFIRMED'] }
    }).populate('centerId', 'name').populate('vendorId', 'name businessName');

    console.log('\nOrders with relevant statuses:', relevantOrders.length);
    relevantOrders.forEach(order => {
      console.log(`- Order ${order._id}: ${order.centerId?.name || 'Unknown Center'} -> ${order.vendorId?.businessName || order.vendorId?.name || 'Unknown Vendor'} (${order.status}) - ₹${order.orderSummary?.totalAmount || 0}`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkOrders();
