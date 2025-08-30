const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Test MongoDB connection and document functionality
async function testDocumentFunctionality() {
  console.log('🧪 Testing PAN Document Upload Functionality\n');
  
  try {
    // Check if MongoDB URI is available
    if (!process.env.MONGODB_URI) {
      console.log('❌ MONGODB_URI environment variable not set');
      console.log('Please set MONGODB_URI in your .env file');
      return;
    }
    
    console.log('✅ MONGODB_URI found in environment variables');
    
    // Test MongoDB connection
    console.log('🔗 Testing MongoDB connection...');
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log('✅ MongoDB connected successfully');
      
      // Test User model and documents field
      const User = require('./backend/models/User');
      
      // Find a user with documents to test
      const userWithDocs = await User.findOne({ 
        documents: { $exists: true, $ne: [] } 
      }).select('name email documents');
      
      if (userWithDocs) {
        console.log('✅ Found user with documents:');
        console.log(`   User: ${userWithDocs.name} (${userWithDocs.email})`);
        console.log(`   Documents count: ${userWithDocs.documents.length}`);
        userWithDocs.documents.forEach((doc, index) => {
          console.log(`   Document ${index + 1}: ${doc.originalName || doc.filename}`);
        });
      } else {
        console.log('ℹ️  No users with documents found in database');
        console.log('   This is expected if no registrations with PAN documents have been made yet');
      }
      
      await mongoose.disconnect();
      console.log('✅ MongoDB connection closed');
      
    } catch (dbError) {
      console.log('❌ MongoDB connection failed:', dbError.message);
      console.log('   Please ensure MongoDB is running and MONGODB_URI is correct');
    }
    
    // Test uploads directory
    console.log('\n📁 Testing uploads directory...');
    const uploadsDir = path.join(__dirname, 'backend', 'uploads');
    if (fs.existsSync(uploadsDir)) {
      console.log('✅ Uploads directory exists:', uploadsDir);
      
      const files = fs.readdirSync(uploadsDir);
      if (files.length > 0) {
        console.log('✅ Found uploaded files:');
        files.forEach(file => {
          const filePath = path.join(uploadsDir, file);
          const stats = fs.statSync(filePath);
          console.log(`   ${file} (${Math.round(stats.size / 1024)} KB)`);
        });
      } else {
        console.log('ℹ️  No files found in uploads directory');
        console.log('   This is expected if no files have been uploaded yet');
      }
    } else {
      console.log('❌ Uploads directory does not exist:', uploadsDir);
      console.log('   The directory should be created automatically during registration');
    }
    
    console.log('\n🎯 Testing Recommendations:');
    console.log('1. Register a new vendor/center with PAN document upload');
    console.log('2. Check backend logs for "File uploaded successfully" messages');
    console.log('3. Verify documents appear in admin Applications view');
    console.log('4. Test file download functionality from user documents');
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }
}

// Run the test
testDocumentFunctionality();
