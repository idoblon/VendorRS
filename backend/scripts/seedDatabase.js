require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Import models
const User = require("../models/User");
const DistributionCenter = require("../models/DistributionCenter");
const Product = require("../models/Product");
const Category = require("../models/Category");

const connectDB = async () => {
  console.log(process.env.MONGODB_URI, "this is the uri");
  try {
    await mongoose.connect(
      "mongodb+srv://dinesh:5gxXDiL0v8vbl9qT@cluster0.dlkoqbl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Clear existing data
    await User.deleteMany({});
    await DistributionCenter.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log("🧹 Cleared existing data");

    // Create Admin User with secure credentials
    const admin = await User.create({
      name: "System Administrator",
      email: process.env.ADMIN_EMAIL || "admin@example.com",
      password: "Password123",
      phone: "+91 9999999999",
      role: "ADMIN",
      status: "APPROVED",
      isActive: true,
    });
    console.log("👨‍💼 Created admin user");

     // seed category
    const sampleCategories = [
      { name: "Furniture" },
      { name: "Electronics" },
      { name: "Clothing" },
      { name: "Footwear" },
      { name: "Accessories" },
      { name: "Books" },
      { name: "Sports" },
      { name: "Home & Garden" },
      { name: "Automotive" },
      { name: "Health & Beauty" }
    ];

    const categories = await Category.insertMany(sampleCategories);
    console.log(`📦 Created ${sampleCategories.length} sample categories`);
    // Create Distribution Centers (15 pre-established centers)
    const distributionCenters = [
      {
        name: "Delhi Distribution Center",
        code: "DL001",
        location: "New Delhi",
        address: {
          street: "Sector 18, Noida",
          city: "New Delhi",
          state: "Delhi",
          pincode: "110001",
          country: "India",
        },
        region: "Bagmati Province",
        contactPerson: {
          name: "Rajesh Kumar",
          email: "center1@example.com",
          phone: "+91 9876543210",
          designation: "Center Manager",
        },
        operationalDetails: {
          capacity: 1000,
          currentOrders: 245,
          workingHours: { start: "09:00", end: "18:00" },
          workingDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
        },
        services: ["Storage", "Packaging", "Distribution", "Quality Check"],
        status: "active",
        establishedDate: new Date("2023-01-15"),
        category: categories.find(c => c.name === "Furniture")._id,
        coordinates: { latitude: 28.6139, longitude: 77.209 },
        createdBy: admin._id,
      },
      {
        name: "Mumbai Distribution Center",
        code: "MH001",
        location: "Mumbai",
        address: {
          street: "Andheri East",
          city: "Mumbai",
          state: "Maharashtra",
          pincode: "400069",
          country: "India",
        },
        region: "Madhesh Province",
        contactPerson: {
          name: "Priya Sharma",
          email: "mumbai@vrs.com",
          phone: "+91 9876543211",
          designation: "Operations Head",
        },
        operationalDetails: {
          capacity: 1200,
          currentOrders: 189,
          workingHours: { start: "08:30", end: "19:00" },
          workingDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
        },
        services: [
          "Storage",
          "Packaging",
          "Distribution",
          "Quality Check",
          "Returns Processing",
        ],
        status: "active",
        establishedDate: new Date("2023-02-20"),
        category: categories.find(c => c.name === "Electronics")._id,
        coordinates: { latitude: 19.076, longitude: 72.8777 },
        createdBy: admin._id,
      },
      {
        name: "Bangalore Tech Hub",
        code: "KA001",
        location: "Bangalore",
        address: {
          street: "Electronic City",
          city: "Bangalore",
          state: "Karnataka",
          pincode: "560100",
          country: "India",
        },
        region: "Gandaki Province",
        contactPerson: {
          name: "Amit Patel",
          email: "bangalore@vrs.com",
          phone: "+91 9876543212",
          designation: "Tech Center Lead",
        },
        operationalDetails: {
          capacity: 800,
          currentOrders: 67,
          workingHours: { start: "09:00", end: "18:30" },
          workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        },
        services: ["Storage", "Distribution", "Quality Check"],
        status: "maintenance",
        establishedDate: new Date("2023-03-10"),
        category: categories.find(c => c.name === "Furniture")._id,
        coordinates: { latitude: 12.9716, longitude: 77.5946 },
        createdBy: admin._id,
      },
      {
        name: "Chennai Operations",
        code: "TN001",
        location: "Chennai",
        address: {
          street: "OMR Road",
          city: "Chennai",
          state: "Tamil Nadu",
          pincode: "600096",
          country: "India",
        },
        region: "Province 1",
        contactPerson: {
          name: "Lakshmi Iyer",
          email: "chennai@vrs.com",
          phone: "+91 9876543213",
          designation: "Regional Manager",
        },
        operationalDetails: {
          capacity: 900,
          currentOrders: 156,
          workingHours: { start: "08:00", end: "17:30" },
          workingDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
        },
        services: ["Storage", "Packaging", "Distribution"],
        status: "active",
        establishedDate: new Date("2023-04-05"),
        category: categories.find(c => c.name === "Clothing")._id,
        coordinates: { latitude: 13.0827, longitude: 80.2707 },
        createdBy: admin._id,
      },
      {
        name: "Kolkata Distribution Center",
        code: "WB001",
        location: "Kolkata",
        address: {
          street: "Salt Lake City",
          city: "Kolkata",
          state: "West Bengal",
          pincode: "700064",
          country: "India",
        },
        region: "Lumbini Province",
        contactPerson: {
          name: "Subrata Das",
          email: "kolkata@vrs.com",
          phone: "+91 9876543214",
          designation: "Center Coordinator",
        },
        operationalDetails: {
          capacity: 600,
          currentOrders: 0,
          workingHours: { start: "09:30", end: "18:00" },
          workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        },
        services: ["Storage", "Distribution"],
        status: "inactive",
        establishedDate: new Date("2023-05-12"),
        category: categories.find(c => c.name === "Furniture")._id,
        coordinates: { latitude: 22.5726, longitude: 88.3639 },
        createdBy: admin._id,
      },
      {
        name: "Hyderabad Logistics Hub",
        code: "TS001",
        location: "Hyderabad",
        address: {
          street: "HITEC City",
          city: "Hyderabad",
          state: "Telangana",
          pincode: "500081",
          country: "India",
        },
        region: "Karnali Province",
        contactPerson: {
          name: "Venkat Reddy",
          email: "hyderabad@vrs.com",
          phone: "+91 9876543215",
          designation: "Logistics Head",
        },
        operationalDetails: {
          capacity: 750,
          currentOrders: 123,
          workingHours: { start: "08:30", end: "18:30" },
          workingDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
        },
        services: ["Storage", "Packaging", "Distribution", "Quality Check"],
        status: "active",
        establishedDate: new Date("2023-06-01"),
        category: categories.find(c => c.name === "Clothing")._id,
        coordinates: { latitude: 17.385, longitude: 78.4867 },
        createdBy: admin._id,
      },
      {
        name: "Pune Distribution Center",
        code: "MH002",
        location: "Pune",
        address: {
          street: "Hinjewadi Phase 2",
          city: "Pune",
          state: "Maharashtra",
          pincode: "411057",
          country: "India",
        },
        region: "Sudurpashchim Province",
        contactPerson: {
          name: "Sneha Joshi",
          email: "pune@vrs.com",
          phone: "+91 9876543216",
          designation: "Operations Manager",
        },
        operationalDetails: {
          capacity: 650,
          currentOrders: 89,
          workingHours: { start: "09:00", end: "18:00" },
          workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        },
        services: ["Storage", "Distribution", "Returns Processing"],
        status: "active",
        establishedDate: new Date("2023-07-15"),
        category: categories.find(c => c.name === "Furniture")._id,
        coordinates: { latitude: 18.5204, longitude: 73.8567 },
        createdBy: admin._id,
      },
      {
        name: "Ahmedabad Distribution Center",
        code: "GJ001",
        location: "Ahmedabad",
        address: {
          street: "Sarkhej-Gandhinagar Highway",
          city: "Ahmedabad",
          state: "Gujarat",
          pincode: "380015",
          country: "India",
        },
        region: "Bagmati Province",
        contactPerson: {
          name: "Kiran Shah",
          email: "ahmedabad@vrs.com",
          phone: "+91 9876543217",
          designation: "Center Manager",
        },
        operationalDetails: {
          capacity: 550,
          currentOrders: 67,
          workingHours: { start: "08:00", end: "17:00" },
          workingDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
        },
        services: ["Storage", "Packaging", "Distribution"],
        status: "active",
        establishedDate: new Date("2023-08-10"),
        category: categories.find(c => c.name === "Furniture")._id,
        coordinates: { latitude: 23.0225, longitude: 72.5714 },
        createdBy: admin._id,
      },
      {
        name: "Jaipur Distribution Center",
        code: "RJ001",
        location: "Jaipur",
        address: {
          street: "Malviya Nagar",
          city: "Jaipur",
          state: "Rajasthan",
          pincode: "302017",
          country: "India",
        },
        region: "Madhesh Province",
        contactPerson: {
          name: "Rohit Agarwal",
          email: "jaipur@vrs.com",
          phone: "+91 9876543218",
          designation: "Regional Coordinator",
        },
        operationalDetails: {
          capacity: 450,
          currentOrders: 34,
          workingHours: { start: "09:00", end: "18:00" },
          workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        },
        services: ["Storage", "Distribution"],
        status: "active",
        establishedDate: new Date("2023-09-05"),
        category: categories.find(c => c.name === "Electronics")._id,
        coordinates: { latitude: 26.9124, longitude: 75.7873 },
        createdBy: admin._id,
      },
      {
        name: "Lucknow Distribution Center",
        code: "UP001",
        location: "Lucknow",
        address: {
          street: "Gomti Nagar",
          city: "Lucknow",
          state: "Uttar Pradesh",
          pincode: "226010",
          country: "India",
        },
        region: "Gandaki Province",
        contactPerson: {
          name: "Anita Verma",
          email: "lucknow@vrs.com",
          phone: "+91 9876543219",
          designation: "Operations Head",
        },
        operationalDetails: {
          capacity: 500,
          currentOrders: 78,
          workingHours: { start: "08:30", end: "17:30" },
          workingDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
        },
        services: ["Storage", "Packaging", "Distribution", "Quality Check"],
        status: "active",
        establishedDate: new Date("2023-10-01"),
        category: categories.find(c => c.name === "Health & Beauty")._id,
        coordinates: { latitude: 26.8467, longitude: 80.9462 },
        createdBy: admin._id,
      },
      {
        name: "Bhubaneswar Distribution Center",
        code: "OR001",
        location: "Bhubaneswar",
        address: {
          street: "Patia",
          city: "Bhubaneswar",
          state: "Odisha",
          pincode: "751024",
          country: "India",
        },
        region: "Province 1",
        contactPerson: {
          name: "Prakash Mohanty",
          email: "bhubaneswar@vrs.com",
          phone: "+91 9876543220",
          designation: "Center Manager",
        },
        operationalDetails: {
          capacity: 400,
          currentOrders: 45,
          workingHours: { start: "09:00", end: "18:00" },
          workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        },
        services: ["Storage", "Distribution"],
        status: "active",
        establishedDate: new Date("2023-11-15"),
        category: categories.find(c => c.name === "Electronics")._id,
        coordinates: { latitude: 20.2961, longitude: 85.8245 },
        createdBy: admin._id,
      },
      {
        name: "Indore Distribution Center",
        code: "MP001",
        location: "Indore",
        address: {
          street: "Vijay Nagar",
          city: "Indore",
          state: "Madhya Pradesh",
          pincode: "452010",
          country: "India",
        },
        region: "Lumbini Province",
        contactPerson: {
          name: "Deepak Gupta",
          email: "indore@vrs.com",
          phone: "+91 9876543221",
          designation: "Regional Manager",
        },
        operationalDetails: {
          capacity: 350,
          currentOrders: 56,
          workingHours: { start: "08:00", end: "17:00" },
          workingDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
        },
        services: ["Storage", "Packaging", "Distribution"],
        status: "active",
        establishedDate: new Date("2023-12-01"),
        category: categories.find(c => c.name === "Furniture")._id,
        coordinates: { latitude: 22.7196, longitude: 75.8577 },
        createdBy: admin._id,
      },
      {
        name: "Chandigarh Distribution Center",
        code: "CH001",
        location: "Chandigarh",
        address: {
          street: "Industrial Area Phase 1",
          city: "Chandigarh",
          state: "Chandigarh",
          pincode: "160002",
          country: "India",
        },
        region: "Karnali Province",
        contactPerson: {
          name: "Simran Kaur",
          email: "chandigarh@vrs.com",
          phone: "+91 9876543222",
          designation: "Operations Coordinator",
        },
        operationalDetails: {
          capacity: 300,
          currentOrders: 23,
          workingHours: { start: "09:00", end: "18:00" },
          workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        },
        services: ["Storage", "Distribution", "Quality Check"],
        status: "active",
        establishedDate: new Date("2024-01-10"),
        category: categories.find(c => c.name === "Furniture")._id,
        coordinates: { latitude: 30.7333, longitude: 76.7794 },
        createdBy: admin._id,
      },
      {
        name: "Guwahati Distribution Center",
        code: "AS001",
        location: "Guwahati",
        address: {
          street: "Paltan Bazaar",
          city: "Guwahati",
          state: "Assam",
          pincode: "781008",
          country: "India",
        },
        region: "Sudurpashchim Province",
        contactPerson: {
          name: "Ranjan Bora",
          email: "guwahati@vrs.com",
          phone: "+91 9876543223",
          designation: "Northeast Regional Head",
        },
        operationalDetails: {
          capacity: 250,
          currentOrders: 12,
          workingHours: { start: "08:30", end: "17:30" },
          workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        },
        services: ["Storage", "Distribution"],
        status: "active",
        establishedDate: new Date("2024-02-01"),
        category: categories.find(c => c.name === "Clothing")._id,
        coordinates: { latitude: 26.1445, longitude: 91.7362 },
        createdBy: admin._id,
      },
      {
        name: "Kochi Distribution Center",
        code: "KL001",
        location: "Kochi",
        address: {
          street: "Kakkanad",
          city: "Kochi",
          state: "Kerala",
          pincode: "682030",
          country: "India",
        },
        region: "Province 1",
        contactPerson: {
          name: "Pradeep Nair",
          email: "kochi@vrs.com",
          phone: "+91 9876543224",
          designation: "Coastal Operations Manager",
        },
        operationalDetails: {
          capacity: 400,
          currentOrders: 67,
          workingHours: { start: "08:00", end: "17:00" },
          workingDays: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ],
        },
        services: [
          "Storage",
          "Packaging",
          "Distribution",
          "Returns Processing",
        ],
        status: "active",
        establishedDate: new Date("2024-02-15"),
        category: categories.find(c => c.name === "Clothing")._id,
        coordinates: { latitude: 9.9312, longitude: 76.2673 },
        createdBy: admin._id,
      },
    ];

    const createdCenters = await DistributionCenter.insertMany(
      distributionCenters
    );
    console.log(`🏢 Created ${createdCenters.length} distribution centers`);

    // Create Center Users for each distribution center with secure credentials
    const centerUsers = [];
    for (const center of createdCenters) {
      const centerUser = {
        name: center.contactPerson.name,
        email: center.contactPerson.email,
        password: "Center123",
        phone: center.contactPerson.phone,
        role: "CENTER",
        status: "APPROVED",
        centerId: center._id,
        isActive: true,
      };
      centerUsers.push(centerUser);
    }

    await User.insertMany(centerUsers);
    console.log(`👥 Created ${centerUsers.length} center users`);

    const vendorPassword = "Vendor123";

    const vendors = [
      {
        name: "Rajesh Kumar",
        email: "vendor1@example.com",
        password: vendorPassword,
        phone: "+91 9876543301",
        role: "VENDOR",
        status: "APPROVED",
        businessName: "Kumar Electronics",
        panNumber: "1234567890",
        gstNumber: "27ABCDE1234F1Z5",
        address: "123 Electronics Market, Mumbai, Maharashtra",
        district: "Mumbai",
        bankDetails: {
          bankName: "HDFC Bank",
          accountNumber: "1234567890",
          ifscCode: "HDFC0001234",
          branch: "Mumbai Main",
          holderName: "Rajesh Kumar",
        },
        contactPersons: [
          { name: "Rajesh Kumar", phone: "+91 9876543301", isPrimary: true },
          { name: "Sunita Kumar", phone: "+91 9876543302", isPrimary: false },
        ],
        isActive: true,
      },
      {
        name: "Priya Sharma",
        email: "priya@officesolutions.com",
        password: vendorPassword,
        phone: "+91 9876543311",
        role: "VENDOR",
        status: "APPROVED",
        businessName: "Office Solutions Pvt Ltd",
        panNumber: "567890123",
        gstNumber: "", // GST validation removed, admin will verify
        address: "456 Business Park, Delhi, Delhi",
        district: "New Delhi",
        bankDetails: {
          bankName: "State Bank of India",
          accountNumber: "0987654321",
          ifscCode: "SBI0005678",
          branch: "Delhi Branch",
          holderName: "Priya Sharma",
        },
        contactPersons: [
          { name: "Priya Sharma", phone: "+91 9876543311", isPrimary: true },
        ],
        isActive: true,
      },
      {
        name: "Amit Patel",
        email: "amit@techsupplies.com",
        password: vendorPassword,
        phone: "+91 9876543321",
        role: "VENDOR",
        status: "PENDING",
        businessName: "Tech Supplies Co",
        panNumber: "901234567",
        gstNumber: "", // GST validation removed, admin will verify
        address: "789 Tech Street, Bangalore, Karnataka",
        district: "Bangalore",
        bankDetails: {
          bankName: "ICICI Bank",
          accountNumber: "1122334455",
          ifscCode: "ICICI0009012",
          branch: "Bangalore Electronic City",
          holderName: "Amit Patel",
        },
        contactPersons: [
          { name: "Amit Patel", phone: "+91 9876543321", isPrimary: true },
        ],
        isActive: true,
      },
    ];

    const createdVendors = await User.insertMany(vendors);
    console.log(`🏪 Created ${createdVendors.length} vendor users`);

    // Create Sample Products
    const sampleProducts = [
      {
        name: "Wireless Bluetooth Headphones",
        description:
          "Premium quality wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality.",
        category: "Electronics",
        subcategory: "Audio",
        price: 2500,
        vendorId: createdVendors[0]._id,
        availability: [
          { centerId: createdCenters[0]._id, stock: 50 },
          { centerId: createdCenters[1]._id, stock: 30 },
          { centerId: createdCenters[2]._id, stock: 25 },
        ],
        specifications: {
          dimensions: { length: 20, width: 18, height: 8, unit: "cm" },
          weight: { value: 0.3, unit: "kg" },
          color: "Black",
          brand: "Kumar Electronics",
          warranty: {
            duration: 1,
            unit: "years",
            terms: "Manufacturing defects only",
          },
        },
        images: [
          {
            filename: "headphones1.jpg",
            isPrimary: true,
            url: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg",
          },
        ],
        tags: [
          "wireless",
          "bluetooth",
          "headphones",
          "audio",
          "noise-cancellation",
        ],
        status: "available",
      },
      {
        name: "Portable Bluetooth Speaker",
        description:
          "Compact portable speaker with excellent sound quality, waterproof design, and 12-hour battery life.",
        category: "Electronics",
        subcategory: "Audio",
        price: 1500,
        vendorId: createdVendors[0]._id,
        availability: [
          { centerId: createdCenters[0]._id, stock: 25 },
          { centerId: createdCenters[3]._id, stock: 20 },
        ],
        specifications: {
          dimensions: { length: 15, width: 8, height: 8, unit: "cm" },
          weight: { value: 0.5, unit: "kg" },
          color: "Blue",
          brand: "Kumar Electronics",
          warranty: {
            duration: 6,
            unit: "months",
            terms: "Water damage not covered",
          },
        },
        images: [
          {
            filename: "speaker1.jpg",
            isPrimary: true,
            url: "https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg",
          },
        ],
        tags: ["bluetooth", "speaker", "portable", "waterproof"],
        status: "available",
      },
      {
        name: "Ergonomic Office Chair",
        description:
          "Professional ergonomic office chair with lumbar support, adjustable height, and premium fabric upholstery.",
        category: "Furniture",
        subcategory: "Office Furniture",
        price: 8500,
        vendorId: createdVendors[1]._id,
        availability: [
          { centerId: createdCenters[1]._id, stock: 15 },
          { centerId: createdCenters[4]._id, stock: 10 },
        ],
        specifications: {
          dimensions: { length: 65, width: 65, height: 120, unit: "cm" },
          weight: { value: 18, unit: "kg" },
          color: "Black",
          material: "Fabric and Steel",
          brand: "Office Solutions",
          warranty: {
            duration: 2,
            unit: "years",
            terms: "Mechanical parts only",
          },
        },
        images: [
          {
            filename: "chair1.jpg",
            isPrimary: true,
            url: "https://images.pexels.com/photos/1181433/pexels-photo-1181433.jpeg",
          },
        ],
        tags: ["office", "chair", "ergonomic", "furniture"],
        status: "available",
      },
      {
        name: "LED Desk Lamp",
        description:
          "Adjustable LED desk lamp with USB charging port, touch controls, and multiple brightness levels.",
        category: "Furniture",
        subcategory: "Lighting",
        price: 1200,
        vendorId: createdVendors[1]._id,
        availability: [
          { centerId: createdCenters[0]._id, stock: 30 },
          { centerId: createdCenters[2]._id, stock: 25 },
          { centerId: createdCenters[5]._id, stock: 20 },
        ],
        specifications: {
          dimensions: { length: 40, width: 15, height: 50, unit: "cm" },
          weight: { value: 1.2, unit: "kg" },
          color: "White",
          material: "Plastic and Metal",
          brand: "Office Solutions",
          warranty: {
            duration: 1,
            unit: "years",
            terms: "LED and electronic components",
          },
        },
        images: [
          {
            filename: "lamp1.jpg",
            isPrimary: true,
            url: "https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg",
          },
        ],
        tags: ["led", "lamp", "desk", "lighting", "usb"],
        status: "available",
      },
      {
        name: "Smart Fitness Watch",
        description:
          "Advanced fitness tracking smartwatch with heart rate monitor, GPS, and 7-day battery life.",
        category: "Wearables",
        subcategory: "Smartwatch",
        price: 3500,
        vendorId: createdVendors[2]._id,
        availability: [
          { centerId: createdCenters[2]._id, stock: 15 },
          { centerId: createdCenters[6]._id, stock: 12 },
        ],
        specifications: {
          dimensions: { length: 4.5, width: 4.5, height: 1.2, unit: "cm" },
          weight: { value: 0.05, unit: "kg" },
          color: "Black",
          material: "Aluminum and Silicone",
          brand: "Tech Supplies",
          warranty: {
            duration: 1,
            unit: "years",
            terms: "Water damage not covered",
          },
        },
        images: [
          {
            filename: "watch1.jpg",
            isPrimary: true,
            url: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg",
          },
        ],
        tags: ["smartwatch", "fitness", "gps", "heart-rate"],
        status: "pending_approval",
      },
    ];

    await Product.insertMany(sampleProducts);
    console.log(`📦 Created ${sampleProducts.length} sample products`);

   

    console.log(`
🎉 Database seeding completed successfully!

📊 Summary:
- 1 Admin user created
- ${createdCenters.length} Distribution centers created
- ${centerUsers.length} Center users created  
- ${createdVendors.length} Vendor users created
- ${sampleProducts.length} Sample products created

🔐 Login Credentials:
Credentials are now configured through environment variables for security.
Please check your .env file for the actual values.

🌐 All centers are spread across different regions of India
📍 Each center has realistic operational data and contact information
🛍️ Products are distributed across multiple centers with stock levels
    `);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔒 Database connection closed");
  }
};

// Run the seeding
connectDB().then(() => {
  seedDatabase();
});

module.exports = { seedDatabase };
