/**
 * Test script for the bubble sort API endpoint
 */

require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Create a test token for admin user
const createTestToken = async () => {
  // Find the admin user in the database
  const mongoose = require('mongoose');
  const User = require('../models/User');
  
  // Connect to the database if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
  
  // Find the admin user
  const adminUser = await User.findOne({ role: 'ADMIN' });
  
  if (!adminUser) {
    throw new Error('Admin user not found in the database');
  }
  
  const payload = {
    id: adminUser._id, // Use the actual admin ID from the database
    role: 'ADMIN'
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
};

// Test the bubble sort API endpoint
const testBubbleSortAPI = async () => {
  try {
    const token = await createTestToken();
    const baseURL = `http://localhost:${process.env.PORT || 5000}/api`;
    
    console.log('🧪 Testing Bubble Sort API Endpoint');
    console.log('----------------------------------------');
    
    // Test different sorting options
    const sortOptions = [
      { field: 'createdAt', order: 'desc', name: 'Creation Date (newest first)' },
      { field: 'createdAt', order: 'asc', name: 'Creation Date (oldest first)' },
      { field: 'orderSummary.totalAmount', order: 'desc', name: 'Total Amount (highest first)' },
      { field: 'orderSummary.totalAmount', order: 'asc', name: 'Total Amount (lowest first)' },
      { field: 'status', order: 'asc', name: 'Status (alphabetical)' }
    ];
    
    for (const option of sortOptions) {
      console.log(`\n📊 Testing sort by: ${option.name}`);
      
      const response = await axios.get(`${baseURL}/orders/sorted`, {
        params: {
          sortBy: option.field,
          order: option.order,
          limit: 10
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const { success, message, sortingInfo, data } = response.data;
      
      console.log(`✅ API Response: ${success ? 'Success' : 'Failed'}`);
      console.log(`📝 Message: ${message}`);
      console.log(`🔄 Sorting Algorithm: ${sortingInfo.algorithm}`);
      console.log(`🔑 Sorted by: ${sortingInfo.field}`);
      console.log(`📈 Order: ${sortingInfo.order}`);
      console.log(`📦 Results: ${data.length} items`);
      
      if (data.length > 0) {
        // Display first 2 items
        console.log('\n📋 Sample of sorted results:');
        data.slice(0, 2).forEach((item, index) => {
          console.log(`\n  Item ${index + 1}:`);
          console.log(`  - Order ID: ${item._id}`);
          console.log(`  - Order Number: ${item.orderNumber}`);
          console.log(`  - Status: ${item.status}`);
          console.log(`  - Created At: ${new Date(item.createdAt).toLocaleString()}`);
          console.log(`  - Total Amount: ${item.orderSummary?.totalAmount || 'N/A'}`);
        });
      }
    }
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
};

// Run the test
testBubbleSortAPI();