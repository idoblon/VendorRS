import React, { useState } from 'react';
import { LogIn, User as UserIcon, Building2, Shield } from 'lucide-react';
import { User, UserRole, VendorStatus } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.VENDOR);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const demoUsers = {
    [UserRole.VENDOR]: {
      id: 'vendor-1',
      name: 'Rajesh Kumar',
      email: 'vendor@demo.com',
      role: UserRole.VENDOR,
      businessName: 'Kumar Electronics',
      panNumber: 'ABCDE1234F',
      bankDetails: {
        accountNumber: '1234567890',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank'
      },
      address: 'Mumbai, Maharashtra',
      gstNumber: '27ABCDE1234F1Z5',
      status: VendorStatus.APPROVED,
      joinedDate: '2024-01-15',
      phone: '+91 9876543210'
    },
    [UserRole.CENTER]: {
      id: 'center-1',
      name: 'Priya Sharma',
      email: 'center@demo.com',
      role: UserRole.CENTER,
      centerName: 'Delhi Distribution Center',
      location: 'New Delhi, Delhi',
      contactPerson: 'Priya Sharma',
      phone: '+91 9876543211'
    },
    [UserRole.ADMIN]: {
      id: 'admin-1',
      name: 'Admin User',
      email: 'admin@demo.com',
      role: UserRole.ADMIN,
      phone: '+91 9876543212'
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const user = demoUsers[selectedRole];
      onLogin(user);
      setIsLoading(false);
    }, 1000);
  };

  const roleOptions = [
    {
      role: UserRole.VENDOR,
      icon: Building2,
      title: 'Vendor',
      description: 'Manage products and fulfill orders',
      email: 'vendor@demo.com'
    },
    {
      role: UserRole.CENTER,
      icon: UserIcon,
      title: 'Center',
      description: 'Browse products and place orders',
      email: 'center@demo.com'
    },
    {
      role: UserRole.ADMIN,
      icon: Shield,
      title: 'Admin',
      description: 'Manage system and oversee operations',
      email: 'admin@demo.com'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-7 w-7 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Vendor Request System
          </h1>
          <p className="text-lg text-gray-600">
            Streamline vendor relationships and order management
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Choose Your Role</h2>
            <div className="space-y-4">
              {roleOptions.map(({ role, icon: Icon, title, description, email }) => (
                <button
                  key={role}
                  onClick={() => {
                    setSelectedRole(role);
                    setEmail(email);
                  }}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedRole === role
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${
                      selectedRole === role ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{title}</h3>
                      <p className="text-sm text-gray-600">{description}</p>
                      <p className="text-xs text-blue-600 mt-1">{email}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Card className="p-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Sign In</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Demo credentials are pre-filled
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter any password"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                icon={LogIn}
              >
                Sign In as {roleOptions.find(r => r.role === selectedRole)?.title}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Demo Access</h4>
              <p className="text-sm text-gray-600">
                This is a demonstration version. All data is simulated and will reset on page refresh.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}