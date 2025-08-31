const express = require('express');
const router = express.Router();
const Stripe = require('stripe');

// Load Stripe secret key from environment variables
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.error('STRIPE_SECRET_KEY is not set in environment variables');
  process.exit(1);
}

const stripe = Stripe(stripeSecretKey);

// POST /api/payments/create-payment-intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, paymentMethodId } = req.body;

    if (!amount || !currency || !paymentMethodId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
});

module.exports = router;
