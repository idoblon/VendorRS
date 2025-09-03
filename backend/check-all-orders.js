const mongoose = require('mongoose');
const Order = require('./models/Order');

async function checkAllOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vendorrs');

    // Check all orders regardless of status
    const allOrders = await Order.find({}).populate('centerId', 'name').populate('vendorId', 'name businessName');
    console.log('All orders in database:', allOrders.length);

    if (allOrders.length > 0) {
      console.log('\nAll orders:');
      allOrders.forEach(order => {
        console.log(`- Order ${order._id}: ${order.centerId?.name || 'Unknown Center'} -> ${order.vendorId?.businessName || order.vendorId?.name || 'Unknown Vendor'} (${order.status}) - ₹${order.orderSummary?.totalAmount || 0}`);
      });
    } else {
      console.log('No orders found in database');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAllOrders();
