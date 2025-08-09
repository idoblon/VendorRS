import React, { useState } from 'react';
import { PaymentPage } from './PaymentPage';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export function PaymentDemo() {
  const [showPayment, setShowPayment] = useState(false);
  const [amount, setAmount] = useState(100);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const handleStartPayment = () => {
    setShowPayment(true);
  };

  const handleBack = () => {
    setShowPayment(false);
  };

  const handleComplete = () => {
    setPaymentComplete(true);
    setShowPayment(false);
  };

  const handleReset = () => {
    setPaymentComplete(false);
    setAmount(100);
  };

  if (showPayment) {
    return (
      <PaymentPage 
        amount={amount} 
        onBack={handleBack} 
        onComplete={handleComplete} 
      />
    );
  }

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Payment Demo
          </h1>
        </div>

        <Card className="p-8 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          {paymentComplete ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Thank You!
              </h2>
              
              <p className="text-gray-600 mb-6">
                Your payment has been processed successfully.
              </p>
              
              <Button
                onClick={handleReset}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 py-3 text-base font-medium"
              >
                Start New Payment
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Test Payment
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all"
                  min="1"
                  step="1"
                />
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Test Card Information</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Card Number: 4242 4242 4242 4242</li>
                  <li>• Expiry: Any future date</li>
                  <li>• CVC: Any 3 digits</li>
                  <li>• ZIP: Any 5 digits</li>
                </ul>
              </div>
              
              <Button
                onClick={handleStartPayment}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 py-3 text-base font-medium"
              >
                Proceed to Payment
              </Button>
            </>
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