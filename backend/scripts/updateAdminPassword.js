require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const updateAdminPassword = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/vrs', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ role: 'ADMIN' }).select('+password');
    
    if (!admin) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Admin user found:', admin.email);
    
    // Get password from .env
    const password = process.env.ADMIN_PASSWORD || 'Password123';
    console.log('Password from .env:', password);
    
    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Update the admin password directly in the database
    // Bypass the pre-save middleware by using updateOne
    await User.updateOne(
      { _id: admin._id },
      { $set: { password: hashedPassword } }
    );
    
    console.log('✅ Admin password updated successfully');
    
    // Verify the password
    console.log('Admin password hash after update:', admin.password);
    
    // Manually verify the password
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log('Password matches after update:', isMatch ? '✅ Yes' : '❌ No');
    
    // Try to find the admin user again to verify
    const adminAfterUpdate = await User.findOne({ role: 'ADMIN' }).select('+password');
    console.log('Admin password hash after fetching again:', adminAfterUpdate.password);
    
    // Verify the password again
    const isMatchAfterFetch = await bcrypt.compare(password, adminAfterUpdate.password);
    console.log('Password matches after fetching again:', isMatchAfterFetch ? '✅ Yes' : '❌ No');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

updateAdminPassword();