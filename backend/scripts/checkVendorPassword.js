const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const checkVendorPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check both vendor emails
    const vendorEmails = ['bhaktithapa@yopmail.com', 'yakamagar@yopmail.com'];
    
    for (const email of vendorEmails) {
      console.log('\n' + '='.repeat(50));
      console.log(`Checking vendor: ${email}`);
      console.log('='.repeat(50));
      
      const vendor = await User.findOne({ email });
      
      if (vendor) {
        console.log('Vendor found:');
        console.log('Email:', vendor.email);
        console.log('Business Name:', vendor.businessName);
        console.log('Status:', vendor.status);
        console.log('Role:', vendor.role);
        console.log('Is Active:', vendor.isActive);
        console.log('Password Hash:', vendor.password.substring(0, 20) + '...');
        
        // Test passwords including the actual environment variable
        const testPasswords = [
          process.env.VENDOR_PASSWORD, // This should be the correct one
          'your_secure_vendor_password', // Direct value from .env
          'Password@123', 
          'password', 
          '123456', 
          'admin123',
          'vendor123',
          'Vendor@123',
          'test123',
          'Test@123'
        ];
        
        console.log('\nTesting passwords:');
        console.log('Environment VENDOR_PASSWORD:', process.env.VENDOR_PASSWORD);
        
        for (const testPassword of testPasswords) {
          if (testPassword) { // Only test non-empty passwords
            const isMatch = await bcrypt.compare(testPassword, vendor.password);
            console.log(`Password "${testPassword}" matches:`, isMatch);
            if (isMatch) {
              console.log(`\n🎉 CORRECT PASSWORD FOUND: "${testPassword}"`);
              break;
            }
          }
        }
      } else {
        console.log('Vendor not found');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkVendorPassword();