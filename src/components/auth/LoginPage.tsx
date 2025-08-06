import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { User, UserRole, VendorStatus } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onShowSignup?: () => void;
}

export function LoginPage({ onLogin, onShowSignup }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const demoUser = {
    id: 'user-1',
    name: 'Demo User',
    email: 'demo@example.com',
    role: UserRole.VENDOR,
    businessName: 'Demo Business',
    panNumber: 'ABCDE1234F',
    bankDetails: {
      accountNumber: '1234567890',
      ifscCode: 'HDFC0001234',
      bankName: 'HDFC Bank'
    },
    address: 'Demo Address',
    gstNumber: '27ABCDE1234F1Z5',
    status: VendorStatus.APPROVED,
    joinedDate: '2024-01-15',
    phone: '+91 9876543210'
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      onLogin(demoUser);
      setIsLoading(false);
    }, 1000);
  };

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
          <p className="text-lg text-gray-600">
            Streamline vendor relationships and order management
          </p>
        </div>

        <Card className="p-8 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-900">Sign In</h3>
              <p className="text-sm text-gray-600 mt-2">
                Enter your credentials to access the system
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 py-3 text-base font-medium"
              isLoading={isLoading}
              icon={LogIn}
            >
              Sign In
            </Button>
          </form>

          {onShowSignup && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={onShowSignup}
                  className="text-orange-600 hover:text-orange-500 font-medium transition-colors"
                >
                  Sign up here
                </button>
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}