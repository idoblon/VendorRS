const mongoose = require('mongoose');
const User = require('./models/User');

async function checkCenters() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vendorrs');
    const centers = await User.find({ role: 'CENTER', status: 'APPROVED', isActive: true });
    console.log('Found centers:', centers.length);
    centers.forEach(center => {
      console.log('-', center.name, '(', center.district, ')');
    });
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkCenters();
