const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');

async function checkData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/vrs_db');

    console.log('=== CENTERS CHECK ===');
    const centers = await User.find({ role: 'CENTER' });
    console.log('Total centers found:', centers.length);

    const approvedCenters = await User.find({ role: 'CENTER', status: 'APPROVED' });
    console.log('Approved centers:', approvedCenters.length);

    if (approvedCenters.length > 0) {
      console.log('Sample approved center:', {
        id: approvedCenters[0]._id,
        name: approvedCenters[0].name,
        businessName: approvedCenters[0].businessName,
        status: approvedCenters[0].status
      });
    }

    console.log('\n=== ORDERS CHECK ===');
    const orders = await Order.find({});
    console.log('Total orders found:', orders.length);

    const relevantOrders = await Order.find({
      status: { $in: ['DELIVERED', 'SHIPPED', 'CONFIRMED'] }
    });
    console.log('Orders with relevant status:', relevantOrders.length);

    if (relevantOrders.length > 0) {
      console.log('Sample order:', {
        id: relevantOrders[0]._id,
        status: relevantOrders[0].status,
        totalAmount: relevantOrders[0].orderSummary?.totalAmount,
        centerId: relevantOrders[0].centerId,
        vendorId: relevantOrders[0].vendorId
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkData();
