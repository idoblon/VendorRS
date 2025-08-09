# MongoDB Atlas Setup Guide

Since MongoDB is not installed locally, we'll use MongoDB Atlas, which provides a free tier cloud database service.

## Steps to Set Up MongoDB Atlas

1. **Create a MongoDB Atlas Account**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
   - Sign up for a free account

2. **Create a New Cluster**:
   - After logging in, click "Build a Database"
   - Choose the "FREE" tier (M0)
   - Select your preferred cloud provider (AWS, Google Cloud, or Azure)
   - Choose a region closest to your location
   - Click "Create Cluster" (this may take a few minutes)

3. **Set Up Database Access**:
   - In the left sidebar, click "Database Access"
   - Click "Add New Database User"
   - Create a username and password (save these credentials)
   - Set privileges to "Read and Write to Any Database"
   - Click "Add User"

4. **Set Up Network Access**:
   - In the left sidebar, click "Network Access"
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development purposes)
   - Click "Confirm"

5. **Get Your Connection String**:
   - Go back to your cluster and click "Connect"
   - Select "Connect your application"
   - Choose "Node.js" as your driver and version "4.1 or later"
   - Copy the connection string
   - Replace `<password>` with your database user's password

6. **Update Your .env File**:
   - Open the `.env` file in the backend directory
   - Replace the existing `MONGODB_URI` value with your Atlas connection string

## Example Connection String

```
MONGODB_URI=mongodb+srv://yourusername:yourpassword@cluster0.xxxxx.mongodb.net/vrs_database?retryWrites=true&w=majority
```

## Testing the Connection

After updating your .env file, you can test the connection by running:

```bash
npm run dev
```

You should see a message indicating successful connection to MongoDB Atlas.

## Seeding the Database

Once connected, seed the database with initial data:

```bash
npm run seed
```

This will populate your MongoDB Atlas database with the necessary collections and documents for the VRS system.