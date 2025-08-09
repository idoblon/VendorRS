import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '../ui/Button';

// Payment form component
const CheckoutForm = ({ amount, onSuccess, onError }: { 
  amount: number; 
  onSuccess: (paymentId: string) => void; 
  onError: (error: string) => void; 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    // Create a payment intent when the component mounts
    const createPaymentIntent = async () => {
      try {
        const token = localStorage.getItem('vrs_token');
        if (!token) {
          onError('Authentication required');
          return;
        }

        const response = await fetch('/api/payments/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ amount, currency: 'inr' })
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setClientSecret(data.clientSecret);
        } else {
          setPaymentError(data.message || 'Failed to initialize payment');
          onError(data.message || 'Failed to initialize payment');
        }
      } catch (error) {
        console.error('Payment intent error:', error);
        setPaymentError('Failed to initialize payment. Please try again.');
        onError('Failed to initialize payment. Please try again.');
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setIsLoading(true);
    setPaymentError('');

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setPaymentError('Card element not found');
      setIsLoading(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        setPaymentError(error.message || 'Payment failed');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else {
        setPaymentError('Payment status unknown. Please contact support.');
        onError('Payment status unknown. Please contact support.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentError('An unexpected error occurred. Please try again.');
      onError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg bg-white">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }}
        />
      </div>

      {paymentError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{paymentError}</p>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || !clientSecret || isLoading}
        isLoading={isLoading}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 py-3 text-base font-medium"
      >
        Pay ₹{amount.toFixed(2)}
      </Button>
    </form>
  );
};

// Main Stripe payment component
interface StripePaymentProps {
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

export function StripePayment({ amount, onSuccess, onError }: StripePaymentProps) {
  const [stripePromise, setStripePromise] = useState<any>(null);

  useEffect(() => {
    // Fetch the publishable key from the backend
    const getPublishableKey = async () => {
      try {
        const token = localStorage.getItem('vrs_token');
        if (!token) return;

        const response = await fetch('/api/payments/config', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (response.ok && data.success) {
          // Initialize Stripe with the publishable key
          setStripePromise(loadStripe(data.publishableKey));
        }
      } catch (error) {
        console.error('Error fetching Stripe config:', error);
        onError('Failed to load payment system. Please try again.');
      }
    };

    getPublishableKey();
  }, [onError]);

  if (!stripePromise) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
        <p className="text-center text-gray-500 mt-4">Loading payment system...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Secure Payment</h3>
      <Elements stripe={stripePromise}>
        <CheckoutForm amount={amount} onSuccess={onSuccess} onError={onError} />
      </Elements>
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Your payment is secured with Stripe. We do not store your card details.
        </p>
      </div>
    </div>
  );
}