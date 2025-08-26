const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  phone: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["ADMIN", "VENDOR", "CENTER"],
    required: true,
  },
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
    default: "PENDING", // ← Real registrations start as PENDING
  },
  // Vendor-specific fields
  businessName: {
    type: String,
    required: function () {
      return this.role === "VENDOR";
    },
  },
  panNumber: {
    type: String,
    required: function () {
      return this.role === "VENDOR" || this.role === "CENTER";
    },
  },
  address: {
    type: String,
    required: function () {
      return this.role === "VENDOR";
    },
  },
  district: {
    type: String,
    required: function () {
      return this.role === "VENDOR";
    },
  },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    branch: String,
    holderName: String,
  },
  contactPersons: [
    {
      name: String,
      phone: String,
      isPrimary: { type: Boolean, default: false },
    },
  ],
  documents: [
    {
      filename: String,
      originalName: String,
      path: String,
      uploadDate: { type: Date, default: Date.now },
    },
  ],
  // Center-specific fields - removed centerId dependency
  province: {
    type: String,
    required: function () {
      return this.role === "CENTER";
    },
  },
  district: {
    type: String,
    required: function () {
      return this.role === "CENTER";
    },
  },
  // Center categories for product matching
  categories: {
    type: [String],
    required: function () {
      return this.role === "CENTER";
    },
    default: [],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt); // ← This hashes the password
    next();
  } catch (error) {
    next(error);
  }
});

// Update updatedAt field before saving
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
// Get user without sensitive information
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model("User", userSchema);
