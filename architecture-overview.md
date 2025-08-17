# Vendor Request System (VRS) - Architectural Overview

## System Components

```mermaid
graph TD
    A[Frontend - React/TypeScript] --> B[Backend API - Node.js/Express]
    B --> C[MongoDB Database]
    B --> D[Socket.IO - Real-time Communication]
    B --> E[JWT Authentication]
    B --> F[File Storage]
    G[Admin Users] --> A
    H[Vendor Users] --> A
    I[Center Users] --> A
    J[Payment Gateway] --> B
    K[Email Service] --> B

    subgraph "Frontend"
        A
    end

    subgraph "Backend"
        B
        D
        E
    end

    subgraph "External Services"
        J
        K
    end

    subgraph "Data Storage"
        C
        F
    end

    subgraph "User Roles"
        G
        H
        I
    end
```

## Key Features

1. **User Management**
   - Role-based access control (Admin, Vendor, Center)
   - Authentication and authorization
   - User profile management

2. **Product Management**
   - Product catalog with categories
   - Multi-center availability tracking
   - Stock management

3. **Order Management**
   - Complete order lifecycle
   - Status tracking
   - Payment processing

4. **Real-time Communication**
   - Chat system between vendors and centers
   - Order update notifications
   - Online status indicators

5. **Admin Dashboard**
   - Vendor application review
   - System analytics and reporting
   - Center management

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **File Storage**: Local/Multer
- **Payment Processing**: Stripe
- **Email Service**: Nodemailer