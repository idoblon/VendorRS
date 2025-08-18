# Environment Variables Setup

## Stripe API Keys

This project uses Stripe for payment processing. To ensure security when pushing to GitHub, follow these steps:

### Frontend (.env file)

1. Create a `.env` file in the project root with the following content:

```
# Stripe API Keys
VITE_STRIPE_PUBLISHABLE_KEY=your_publishable_key
```

### Backend (.env file)

1. Create a `.env` file in the `backend` directory with the following content:

```
# Stripe
STRIPE_API_KEY=your_publishable_key
STRIPE_API_SECRET=your_secret_key
```

### Security Notes

- **NEVER commit `.env` files to version control**
- Both `.env` files are already included in `.gitignore`
- When deploying, set these environment variables in your hosting platform
- For local development, you can copy the values from `.env.example` files

### Checking for Hardcoded Keys

Before pushing to GitHub, run this command to check for any hardcoded Stripe keys:

```bash
git grep -n "(sk_test_|sk_live_|pk_test_|pk_live_)"
```

If any keys are found, replace them with environment variable references.