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
    const { amount, currency = 'usd' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }

    // Validate currency and convert amount to smallest currency unit
    let amountInSmallestUnit;
    const validCurrencies = ['usd', 'eur', 'gbp', 'npr', 'inr', 'cad', 'aud'];

    if (!validCurrencies.includes(currency.toLowerCase())) {
      return res.status(400).json({
        message: `Unsupported currency: ${currency}. Supported currencies: ${validCurrencies.join(', ')}`
      });
    }

    // Convert amount to smallest currency unit based on currency
    switch (currency.toLowerCase()) {
      case 'usd':
      case 'eur':
      case 'gbp':
      case 'cad':
      case 'aud':
        amountInSmallestUnit = Math.round(amount * 100); // cents
        break;
      case 'npr':
      case 'inr':
        amountInSmallestUnit = Math.round(amount * 100); // paisa (same as cents)
        break;
      default:
        amountInSmallestUnit = Math.round(amount * 100);
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInSmallestUnit,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        originalAmount: amount.toString(),
        currency: currency.toUpperCase(),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: amountInSmallestUnit,
      currency: currency.toLowerCase(),
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      message: error.message || 'Internal Server Error',
      type: error.type || 'unknown_error'
    });
  }
});

module.exports = router;
