# VendorRS - Vendor Request System

## Overview
VendorRS is a comprehensive vendor request system that allows users to interact with vendors and request products or services. The system includes user authentication, product management, order processing, and communication features.

## Project Structure
The project is organized into frontend and backend components:

### Frontend
- Built with React, TypeScript, and Vite
- Uses Tailwind CSS for styling
- Includes authentication, dashboards, and payment components

### Backend
- Built with Node.js and Express
- Uses MongoDB for data storage
- Includes RESTful API endpoints for various features

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Git

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd VendorRS
   ```

2. Install dependencies for both frontend and backend:
   ```
   npm install
   cd backend
   npm install
   cd ..
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory with:
     ```
     VITE_API_URL=http://localhost:5000
     ```
   - Create a `.env` file in the backend directory based on `.env.example`

4. Start the application:
   ```
   npm run start
   ```
   This will start both the backend and frontend servers.

## Pushing to GitHub

To push this project to GitHub:

1. Run the provided script:
   ```
   npm run push-to-github
   ```

2. Follow the prompts to enter your GitHub repository URL and commit message.

3. The script will handle initializing the repository, adding files, committing changes, and pushing to GitHub.

## Features

- User authentication (login, signup)
- Multiple user roles (admin, vendor, center)
- Product management
- Order processing
- Real-time messaging
- Payment integration
- Notifications

## License

MIT