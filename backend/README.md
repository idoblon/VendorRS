# VRS Backend - Vendor Request System API

A comprehensive Node.js backend API for the Vendor Request System with MongoDB integration, real-time chat functionality, and complete CRUD operations.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization** (JWT-based)
- **Role-based Access Control** (Admin, Vendor, Center)
- **Real-time Chat System** (Socket.IO)
- **File Upload Support** (Multer)
- **Data Validation** (Express Validator)
- **Security Middleware** (Helmet, CORS, Rate Limiting)

### Business Logic
- **Vendor Management** (Registration, Approval, Profile Management)
- **Distribution Center Management** (15 Pre-established Centers)
- **Product Catalog** (Category-based, Multi-center Availability)
- **Order Management** (Complete Order Lifecycle)
- **Real-time Messaging** (Vendor-Center Communication)
- **Admin Dashboard** (Analytics, Reports, System Health)

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## 🛠️ Installation

### 1. Clone and Navigate
```bash
cd c:\Users\hp\Projects\VRS\backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the `.env.example` file to `.env` and update the values:
```bash
cp .env.example .env
```

The `.env.example` file contains all the required environment variables:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/vrs_database

# Server Configuration
PORT=5000
JWT_SECRET=your_secure_jwt_secret_key
FRONTEND_URL=http://localhost:3000

# User Credentials (for database seeding)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password
VENDOR_PASSWORD=your_secure_vendor_password
CENTER_PASSWORD=your_secure_center_password
```

### 4. Start MongoDB
Ensure MongoDB is running on `localhost:27017`

### 5. Seed Database
```bash
npm run seed
```

### 6. Start Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 🗄️ Database Structure

### Pre-seeded Data
- **1 Admin User** (Credentials configured via environment variables)
- **15 Distribution Centers** (Across all regions of Nepal)
- **15 Center Users** (One for each center, credentials configured via environment variables)
- **3 Sample Vendors** (Various approval statuses)
- **5 Sample Products** (Distributed across centers)

### Collections
- **users** - All system users (Admin, Vendors, Centers)
- **distributioncenters** - Pre-established distribution centers
- **products** - Product catalog with multi-center availability
- **orders** - Complete order management
- **messages** - Real-time chat messages
- **conversations** - Chat conversation metadata

## 🔐 Authentication

### Login Endpoints
```bash
# Regular Login
POST /api/auth/login
{
  "email": "your-admin-email@example.com",
  "password": "your-secure-password",
  "role": "ADMIN"
}


{
  "email": "any@email.com",
  "password": "anypassword",
  "role": "VENDOR|CENTER|ADMIN"
}
```

### Credentials
```
All credentials are now configured through environment variables for security.
Please set the following variables in your .env file:

ADMIN_EMAIL - Email for the admin account
ADMIN_PASSWORD - Password for the admin account
VENDOR_PASSWORD - Default password for vendor accounts
CENTER_PASSWORD - Default password for center accounts
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify-token` - Token verification

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/vendors` - Get all vendors (Admin)
- `PUT /api/users/vendors/:id/status` - Update vendor status

### Distribution Centers
- `GET /api/centers` - Get all centers
- `POST /api/centers` - Create center (Admin)
- `PUT /api/centers/:id` - Update center (Admin)
- `PUT /api/centers/:id/status` - Update center status

### Products
- `GET /api/products` - Get products (with filters)
- `POST /api/products` - Create product (Vendor)
- `PUT /api/products/:id` - Update product (Vendor)
- `PUT /api/products/:id/stock` - Update stock levels

### Orders
- `GET /api/orders` - Get orders (role-filtered)
- `POST /api/orders` - Create order (Center)
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/payment` - Update payment status

### Messages
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/conversations/:id/messages` - Get messages
- `POST /api/messages` - Send message
- `POST /api/messages/conversations/:id/mark-read` - Mark as read

### Admin
- `GET /api/admin/dashboard` - Dashboard data
- `GET /api/admin/analytics` - Detailed analytics
- `GET /api/admin/system-health` - System health status
- `POST /api/admin/bulk-actions/vendors` - Bulk vendor actions

## 🔄 Real-time Features (Socket.IO)

### Connection
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'your-jwt-token' }
});
```

### Events
- `send_message` - Send real-time message
- `join_conversation` - Join conversation room
- `typing_start/stop` - Typing indicators
- `order_update` - Order status updates
- `user_online/offline` - User presence

## 🏗️ Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection
├── middleware/
│   ├── auth.js              # Authentication middleware
│   └── validation.js        # Input validation
├── models/
│   ├── User.js              # User model
│   ├── DistributionCenter.js # Center model
│   ├── Product.js           # Product model
│   ├── Order.js             # Order model
│   ├── Message.js           # Message model
│   └── Conversation.js      # Conversation model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User management
│   ├── centers.js           # Center management
│   ├── products.js          # Product management
│   ├── orders.js            # Order management
│   ├── messages.js          # Messaging system
│   └── admin.js             # Admin operations
├── scripts/
│   └── seedDatabase.js      # Database seeding
├── socket/
│   └── socketHandler.js     # Real-time chat handler
├── server.js                # Main server file
├── package.json             # Dependencies
└── .env                     # Environment variables
```

## 🔧 Configuration

### Environment Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/vrs_database

# Server
PORT=5000
NODE_ENV=development

# Security
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# CORS
FRONTEND_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

## 📊 Distribution Centers

The system includes 15 pre-established distribution centers across India:

### North India
- Delhi Distribution Center (DL001)
- Jaipur Distribution Center (RJ001)
- Lucknow Distribution Center (UP001)
- Chandigarh Distribution Center (CH001)

### South India
- Bangalore Tech Hub (KA001)
- Chennai Operations (TN001)
- Hyderabad Logistics Hub (TS001)
- Kochi Distribution Center (KL001)

### West India
- Mumbai Distribution Center (MH001)
- Pune Distribution Center (MH002)
- Ahmedabad Distribution Center (GJ001)

### East India
- Kolkata Distribution Center (WB001)
- Bhubaneswar Distribution Center (OR001)

### Central India
- Indore Distribution Center (MP001)

### Northeast India
- Guwahati Distribution Center (AS001)

## 🚦 API Testing

### Health Check
```bash
GET http://localhost:5000/health
```



## 🔒 Security Features

- **JWT Authentication** with secure token generation
- **Password Hashing** using bcryptjs
- **Rate Limiting** to prevent abuse
- **CORS Protection** with configurable origins
- **Input Validation** using express-validator
- **Helmet Security** headers
- **Role-based Authorization** for all endpoints

## 📈 Performance Features

- **Database Indexing** for efficient queries
- **Pagination** for large datasets
- **Query Optimization** with MongoDB aggregation
- **Connection Pooling** for database connections
- **Graceful Shutdown** handling

## 🐛 Error Handling

- **Global Error Handler** with detailed logging
- **Validation Error Formatting** for client consumption
- **Database Error Handling** with user-friendly messages
- **JWT Error Handling** for authentication issues

## 📝 Logging

- **Request Logging** with timestamps and IP addresses
- **Error Logging** with stack traces in development
- **Database Connection Logging** with status updates
- **Socket Connection Logging** for real-time features

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production`
2. Use secure JWT secret
3. Configure MongoDB Atlas or production database
4. Set up reverse proxy (nginx)
5. Enable SSL/TLS
6. Configure monitoring and logging

### Docker Support (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper validation for new endpoints
3. Include error handling
4. Update documentation
5. Test thoroughly before committing

## 📞 Support

For issues or questions:
- Check the logs in the console
- Verify MongoDB is running
- Ensure all environment variables are set
- Test with the provided demo credentials

---

**VRS Backend** - Powering the complete Vendor Request System with MongoDB integration and real-time capabilities.