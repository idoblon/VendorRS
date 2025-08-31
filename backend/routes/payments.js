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
    const { amount, currency = 'usd', customerEmail } = req.body;

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

    // Prepare payment intent data
    const paymentIntentData = {
      amount: amountInSmallestUnit,
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        originalAmount: amount.toString(),
        currency: currency.toUpperCase(),
      },
    };

    // If customer email is provided, create or find customer
    if (customerEmail) {
      try {
        // Check if customer already exists with this email
        const existingCustomers = await stripe.customers.list({
          email: customerEmail,
          limit: 1,
        });

        let customer;
        if (existingCustomers.data.length > 0) {
          customer = existingCustomers.data[0];
        } else {
          // Create new customer
          customer = await stripe.customers.create({
            email: customerEmail,
            name: customerEmail.split('@')[0], // Use part before @ as name
          });
        }

        paymentIntentData.customer = customer.id;
        paymentIntentData.metadata.customerEmail = customerEmail;
      } catch (customerError) {
        console.error('Error creating/finding customer:', customerError);
        // Continue without customer if there's an error
      }
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: amountInSmallestUnit,
      currency: currency.toLowerCase(),
      customerId: paymentIntent.customer || null,
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
