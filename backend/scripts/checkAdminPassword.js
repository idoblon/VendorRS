require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const checkAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
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
    
    // Check if the password matches
    const password = process.env.ADMIN_PASSWORD || 'Password123';
    const isMatch = await bcrypt.compare(password, admin.password);
    
    console.log('Password from .env:', password);
    console.log('Password matches:', isMatch ? '✅ Yes' : '❌ No');
    
    // Try with lowercase role
    const adminWithLowercaseRole = {
      ...admin.toObject(),
      role: admin.role.toLowerCase()
    };
    console.log('Admin with lowercase role:', adminWithLowercaseRole.role);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

checkAdminPassword();