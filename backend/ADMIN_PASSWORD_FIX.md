# Admin Password Fix

## Issue

The admin login was not accessible due to a password mismatch between the stored password hash in the database and the password specified in the `.env` file.

## Diagnosis

1. The `checkAdminPassword.js` script revealed that the admin user existed in the database, but the password from the `.env` file did not match the stored hash.
2. This could happen if:
   - The password in the `.env` file was changed after the admin user was created
   - The admin user was created with a different password than what was in the `.env` file
   - The password hashing process during user creation was different from the one used during login verification

## Solution

A new script `updateAdminPassword.js` was created to update the admin password directly in the database, bypassing the pre-save middleware that might be causing issues:

```javascript
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const updateAdminPassword = async () => {
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
```

## Key Findings

1. The issue was resolved by directly updating the password in the database using `User.updateOne()` instead of using the `save()` method, which triggers the pre-save middleware.
2. After the update, the admin password now matches the one specified in the `.env` file.
3. The admin login should now be accessible using the email and password from the `.env` file.

## Admin Credentials

- Email: `admin@example.com`
- Password: `Password123` (as specified in the `.env` file)

## Recommendations

1. Consider updating the password in the `.env` file to a more secure one for production use.
2. Ensure that the `.env` file is properly secured and not committed to version control.
3. If you need to update the admin password in the future, you can use the `updateAdminPassword.js` script.