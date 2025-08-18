# Database Seeding Scripts

This directory contains scripts to populate the MongoDB database with sample data for development and testing purposes.

## Available Scripts

### 1. seedDatabase.js
The main seeding script that creates:
- Admin user
- Sample categories
- Vendor users with business information
- Distribution center users
- Conversations between vendors and centers
- Messages within conversations
- Notifications for users
- Products for vendors
- Orders between vendors and centers

### 2. seedSampleData.js
A separate script with the same functionality as seedDatabase.js, created for testing purposes.

## How to Run

To seed the database with sample data, run either of the following commands from the `backend` directory:

```bash
node scripts/seedDatabase.js
```

or

```bash
node scripts/seedSampleData.js
```

## What Gets Created

### Users
- 1 Admin user
- 3 Vendor users (Nepal Spices & Herbs Co., Trekking Gear Nepal, Nepal Handicrafts)
- 3 Distribution Center users (Kathmandu, Pokhara, Biratnagar)

### Categories
14 sample categories including:
- Furniture
- Electronics
- Clothing
- Footwear
- Accessories
- Books
- Sports
- Home & Garden
- Automotive
- Health & Beauty
- Spices & Herbs
- Grains & Pulses
- Beverages
- Snacks & Sweets

### Conversations
- 3 conversations between vendors and distribution centers
- Each conversation has sample messages

### Notifications
- 3 sample notifications for different scenarios:
  - New vendor application
  - New center application
  - Order status update

### Products
- 4 sample products:
  - Premium Turmeric Powder
  - Cumin Seeds
  - Trekking Backpack 40L
  - Handwoven Thangka Painting

### Orders
- 2 sample orders:
  - Order from Kathmandu Center to Nepal Spices & Herbs
  - Order from Pokhara Center to Trekking Gear Nepal

## Notes
- Running these scripts will clear all existing data in the database
- Make sure your MongoDB connection is properly configured in the .env file
- The scripts use the passwords defined in the .env file or default to "Password@123"