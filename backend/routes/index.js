const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const productRoutes = require('./products');
const orderRoutes = require('./orders');
const vendorAnalyticsRoutes = require('./vendorAnalytics');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/orders', vendorAnalyticsRoutes);

module.exports = router;
