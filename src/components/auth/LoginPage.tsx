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
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.VENDOR);
  const [isLoading, setIsLoading] = useState(false);

  const getDemoUser = (role: UserRole) => {
    const baseUser = {
      id: 'user-1',
      email: 'demo@example.com',
      phone: '+91 9876543210'
    };

    switch (role) {
      case UserRole.VENDOR:
        return {
          ...baseUser,
          name: 'Demo Vendor',
          role: UserRole.VENDOR,
          businessName: 'Tech Solutions Pvt Ltd',
          panNumber: 'ABCDE1234F',
          bankDetails: {
            accountNumber: '1234567890',
            ifscCode: 'HDFC0001234',
            bankName: 'HDFC Bank'
          },
          address: '123 Business Park, Tech City',
          gstNumber: '27ABCDE1234F1Z5',
          status: VendorStatus.APPROVED,
          joinedDate: '2024-01-15'
        };
      case UserRole.CENTER:
        return {
          ...baseUser,
          name: 'Demo Center Manager',
          role: UserRole.CENTER,
          centerName: 'Delhi Distribution Center',
          location: 'New Delhi, India',
          contactPerson: 'John Doe'
        };
      case UserRole.ADMIN:
        return {
          ...baseUser,
          name: 'Demo Admin',
          role: UserRole.ADMIN
        };
      default:
        return {
          ...baseUser,
          name: 'Demo User',
          role: UserRole.VENDOR
        };
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const demoUser = getDemoUser(selectedRole);
      onLogin(demoUser as User);
      setIsLoading(false);
    }, 1000);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.log('Logo failed to load, using fallback');
    const target = e.currentTarget;
    target.style.display = 'none';
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
              onError={handleImageError}
            />
          </div>
        </div>

        <Card className="p-8 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Login As (Demo Mode)
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full px-4 py-3 border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white transition-all"
              >
                <option value={UserRole.VENDOR}>🏢 Vendor Dashboard</option>
                <option value={UserRole.CENTER}>🏬 Distribution Center Dashboard</option>
                <option value={UserRole.ADMIN}>👨‍💼 Admin Dashboard</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select which dashboard you want to access
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
                placeholder="Enter any email (demo mode)"
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
                placeholder="Enter any password (demo mode)"
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Demo Mode:</strong> You can enter any email/password. 
                Use the dropdown above to switch between different dashboard types.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0 py-3 text-base font-medium"
              isLoading={isLoading}
              icon={LogIn}
            >
              Sign In as {selectedRole === UserRole.VENDOR ? 'Vendor' : selectedRole === UserRole.CENTER ? 'Center' : 'Admin'}
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