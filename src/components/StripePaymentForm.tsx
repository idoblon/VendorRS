import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from './ui/Button';

interface StripePaymentFormProps {
  amount: number;
  currency?: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}

export function StripePaymentForm({
  amount,
  currency = 'usd',
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get currency symbol
  const getCurrencySymbol = (currency: string) => {
    switch (currency.toLowerCase()) {
      case 'usd':
        return '$';
      case 'eur':
        return '€';
      case 'gbp':
        return '£';
      case 'npr':
        return 'रू';
      case 'inr':
        return '₹';
      default:
        return '$';
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const { error: confirmError, paymentIntent } =
        await stripe.confirmPayment({
          elements,
          redirect: 'if_required',
        });

      if (confirmError) {
        setError(confirmError.message || 'Payment confirmation failed');
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else if (paymentIntent && paymentIntent.status === 'requires_action') {
        // Handle additional authentication if required
        const { error: actionError } = await stripe.confirmPayment({
          elements,
          redirect: 'if_required',
        });

        if (actionError) {
          setError(actionError.message || 'Payment authentication failed');
        } else {
          onSuccess(paymentIntent.id);
        }
      } else {
        onError('Payment not completed');
      }
    } catch (err) {
      setError('An error occurred during payment');
      console.error('Payment error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {isProcessing ? 'Processing...' : `Pay ${getCurrencySymbol(currency)} ${amount.toLocaleString()}`}
      </Button>
    </form>
  );
}
