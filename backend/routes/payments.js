const express = require('express');
const Stripe = require('stripe')
const { authenticate, authorize } = require('../middleware/auth');
const Order = require('../models/Order');

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// @route   POST /api/payments/create-payment-intent
// @desc    Create a payment intent for Stripe
// @access  Private
router.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount, currency = 'inr' } = req.body; // amount in cents, e.g., 2500 for ₹25.00

    if (!amount || !currency) {
      return res.status(400).json({ success: false, message: "Amount and currency required" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 160,
      currency,
      automatic_payment_methods: { enabled: true }, // supports card, wallets, etc.
    });

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe PaymentIntent Error:", error);
    res.status(500).json({ success: false, message: "Payment initialization failed" });
  }
});

// @route   POST /api/payments/webhook
// @desc    Handle Stripe webhook events
// @access  Public
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful:', paymentIntent.id);
      
      // Update order status if orderId is present in metadata
      if (paymentIntent.metadata.orderId && paymentIntent.metadata.orderId !== 'direct-payment') {
        try {
          const order = await Order.findById(paymentIntent.metadata.orderId);
          if (order) {
            order.paymentStatus = 'PAID';
            order.paymentDetails = {
              transactionId: paymentIntent.id,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency,
              paymentMethod: 'stripe',
              paymentDate: new Date()
            };
            await order.save();
            console.log(`Order ${order._id} marked as paid`);
          }
        } catch (error) {
          console.error('Error updating order after payment:', error);
        }
      }
      break;
    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object;
      console.log('Payment failed:', failedPaymentIntent.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({received: true});
});

// @route   GET /api/payments/config
// @desc    Get Stripe publishable key
// @access  Private
router.get('/config', authenticate, (req, res) => {
  res.json({
    success: true,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
});

module.exports = router;