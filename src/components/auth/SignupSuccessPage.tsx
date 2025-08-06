import React from 'react';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface SignupSuccessPageProps {
  onShowLogin: () => void;
}

export function SignupSuccessPage({ onShowLogin }: SignupSuccessPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/image/vrslogo.png" 
              alt="VRS Logo" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Vendor Request System
          </h1>
        </div>

        <Card className="p-8 text-center shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Application Submitted Successfully!
          </h2>

          <p className="text-gray-600 mb-6">
            Thank you for your vendor registration. Your application has been submitted 
            and is now pending admin approval.
          </p>

          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-orange-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-orange-800 space-y-1 text-left">
              <li>• Admin will review your application</li>
              <li>• You'll receive an email notification about the status</li>
              <li>• If approved, you can start using the vendor portal</li>
              <li>• If additional information is needed, we'll contact you</li>
            </ul>
          </div>

          <Button
            onClick={onShowLogin}
            icon={ArrowLeft}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 py-3 text-base font-medium"
          >
            Back to Sign In
          </Button>

          <div className="mt-6 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-gray-600 font-medium">
              Application ID: <span className="text-orange-600">VR-{Date.now().toString().slice(-6)}</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}