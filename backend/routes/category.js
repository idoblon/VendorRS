const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { validateDistributionCenter, validateObjectId, validatePagination } = require('../middleware/validation');
const User = require('../models/User');
const Category = require("../models/Category")

const router = express.Router();



router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



module.exports = router;