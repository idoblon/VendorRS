# Database Seeding Script

This directory contains a comprehensive seeding script to populate the MongoDB database with sample data for development and testing purposes.

## Available Script

### seedDatabase.js
The main comprehensive seeding script that creates:
- Admin user with proper credentials
- 14 sample categories with subcategories
- 5 Distribution Center users (Kathmandu, Pokhara, Biratnagar, Chitwan, Butwal)
- 5 Vendor users with complete business information
- 6 sample products with detailed specifications and availability
- Conversations and messages between vendors and centers
- Notifications for different scenarios
- Sample orders with complete order details

## How to Run

To seed the database with sample data, run the following command from the project root:

```bash
node backend/scripts/seedDatabase.js
```

### Command Line Options
- `--safe`: Interactive mode with confirmation prompts
- `--minimal`: Minimal seeding (not yet implemented)

## What Gets Created

### Users
- **1 Admin user**: System Administrator (admin@example.com)
- **5 Distribution Centers**: 
  - Kathmandu Distribution Center
  - Pokhara Distribution Center  
  - Biratnagar Distribution Center
  - Chitwan Distribution Center
  - Butwal Distribution Center
- **5 Vendors**:
  - Nepal Spices & Herbs Co.
  - Trekking Gear Nepal
  - Nepal Handicrafts
  - Organic Farm Nepal
  - Tech Solutions Nepal

### Categories
14 comprehensive categories with subcategories:
- Electronics (Mobile Phones, Laptops, Audio, Cameras)
- Clothing (Men's Wear, Women's Wear, Ethnic Wear, Kids Wear)
- Books (Fiction, Non-Fiction, Educational, Technical)
- Sports (Outdoor, Indoor, Fitness, Team Sports)
- Accessories (Bags, Jewelry, Watches, Scarves)
- Furniture (Living Room, Bedroom, Office, Outdoor)
- Footwear (Casual, Formal, Sports, Traditional)
- Home & Garden (Tools, Plants, Decor, Kitchen)
- Automotive (Parts, Accessories, Tools, Care Products)
- Health & Beauty (Skincare, Makeup, Health Supplements, Personal Care)
- Spices & Herbs (Whole Spices, Ground Spices, Herbs, Spice Mixes)
- Grains & Pulses (Rice, Wheat, Lentils, Beans)
- Beverages (Tea, Coffee, Juices, Soft Drinks)
- Snacks & Sweets (Traditional Sweets, Chips, Cookies, Nuts)

### Products
- **Organic Turmeric Powder** (Nepal Spices & Herbs Co.)
- **Himalayan Black Tea** (Nepal Spices & Herbs Co.)
- **Trekking Backpack 40L** (Trekking Gear Nepal)
- **Traditional Dhaka Top** (Nepal Handicrafts)
- **Organic Honey** (Organic Farm Nepal)
- **Wireless Bluetooth Headphones** (Tech Solutions Nepal)

### Conversations & Messages
- Sample conversation between Kathmandu Center and Nepal Spices & Herbs Co.
- 5 realistic messages demonstrating order negotiation

### Notifications
- Message notifications for vendors and centers
- System notification for admin

### Orders
- **Order 1**: Kathmandu Center → Nepal Spices & Herbs Co. (Turmeric Powder & Black Tea)
- **Order 2**: Pokhara Center → Trekking Gear Nepal (Trekking Backpacks)

## Features

### Safety Features
- **Backup System**: Creates automatic backup before clearing data
- **Confirmation Prompt**: Asks for confirmation before clearing existing data
- **Error Handling**: Comprehensive error handling with detailed logging

### Comprehensive Reporting
- Shows all approved vendors and centers with their details
- Displays products by vendor with stock information
- Provides complete login credentials for testing
- Shows detailed summary of all created entities

### Environment Variables
The script uses the following environment variables (set in `.env` file):
- `MONGODB_URI`: MongoDB connection string
- `ADMIN_EMAIL`: Admin email (default: admin@example.com)
- `ADMIN_PASSWORD`: Admin password (default: Password@123)
- `CENTER_PASSWORD`: Center user password (default: Password@123)
- `VENDOR_PASSWORD`: Vendor user password (default: Password@123)

## Notes
- All vendors and centers are created with **APPROVED** status
- Passwords can be customized via environment variables
- The script creates backups in the `backend/backups/` directory
- Make sure your MongoDB connection is properly configured in the .env file
