const path = require('path');

// Add backend node_modules to the path
require('module').Module._initPaths();

async function checkAdminUsers() {
  try {
    // Get the User model from backend
    const User = require('./backend/models/User');

    // Connect to MongoDB
    const mongoose = require('mongoose');
    await mongoose.connect('mongodb://localhost:27017/vrs', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Find all admin users
    const adminUsers = await User.find({ role: 'ADMIN' }).select('-password');
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found in the database');
    } else {
      console.log(`✅ Found ${adminUsers.length} admin user(s):`);
      adminUsers.forEach((user, index) => {
        console.log(`\nAdmin ${index + 1}:`);
        console.log(`  ID: ${user._id}`);
        console.log(`  Name: ${user.name}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Status: ${user.status}`);
        console.log(`  Active: ${user.isActive}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    const mongoose = require('mongoose');
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

checkAdminUsers();
