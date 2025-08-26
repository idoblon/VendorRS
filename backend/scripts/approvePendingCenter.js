require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const approvePendingCenter = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const center = await User.findOneAndUpdate(
      { email: 'basnetkaji@yopmail.com', role: 'CENTER' },
      { status: 'APPROVED' },
      { new: true }
    );
    
    if (center) {
      console.log('✅ Center approved:', center.name);
    } else {
      console.log('❌ Center not found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

approvePendingCenter();