import React, { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { StripePayment } from './StripePayment';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface PaymentPageProps {
  amount: number;
  orderId?: string;
  onBack: () => void;
  onComplete: () => void;
}

export function PaymentPage({ amount, orderId, onBack, onComplete }: PaymentPageProps) {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [paymentId, setPaymentId] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handlePaymentSuccess = (id: string) => {
    setPaymentId(id);
    setPaymentStatus('success');
    // You might want to update the order status in the backend here
  };

  const handlePaymentError = (error: string) => {
    setErrorMessage(error);
    setPaymentStatus('error');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center">
            <img 
              src="/vrslogo.png" 
              alt="Vendor Request System Logo" 
              className="w-20 h-20 object-contain"
              onError={(e) => {
                console.log('Logo failed to load');
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>

        <Card className="p-8 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          {paymentStatus === 'pending' && (
            <>
              <div className="flex items-center mb-6">
                <button
                  onClick={onBack}
                  className="flex items-center text-orange-600 hover:text-orange-500 font-medium transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </button>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Complete Your Payment
              </h2>
              
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg border border-orange-200 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Amount:</span>
                  <span className="text-xl font-bold text-orange-600">₹{amount.toFixed(2)}</span>
                </div>
                {orderId && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-700">Order ID:</span>
                    <span className="text-sm font-medium text-gray-600">{orderId}</span>
                  </div>
                )}
              </div>

            </>
          )}

          {paymentStatus === 'success' && (
            <div className="text-center">
              <div className="flex items-center justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Payment Successful!
              </h2>
              
              <p className="text-gray-600 mb-6">
                Your payment of ₹{amount.toFixed(2)} has been processed successfully.
              </p>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  Payment ID: <span className="font-medium">{paymentId}</span>
                </p>
                {orderId && (
                  <p className="text-sm text-green-800 mt-1">
                    Order ID: <span className="font-medium">{orderId}</span>
                  </p>
                )}
              </div>
              
              <Button
                onClick={onComplete}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 py-3 text-base font-medium"
              >
                Continue
              </Button>
            </div>
          )}

          {paymentStatus === 'error' && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Payment Failed
              </h2>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800">
                  {errorMessage || 'An error occurred during payment processing. Please try again.'}
                </p>
              </div>
              
              <div className="flex space-x-4">
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setPaymentStatus('pending')}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            © 2024 Vendor Request System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}