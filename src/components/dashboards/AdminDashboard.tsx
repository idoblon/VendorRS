import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Building, 
  ShoppingCart, 
  CreditCard,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  DollarSign
} from 'lucide-react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { User, Vendor, Order, OrderStatus, VendorStatus, UserRole } from '../../types';
import { toast } from '../ui/Toaster';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data
  const mockVendors: Vendor[] = [
    {
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
      status: VendorStatus.PENDING,
      joinedDate: '2024-01-15',
      phone: '+91 9876543210'
    },
    {
      id: 'vendor-2',
      name: 'Priya Sharma',
      email: 'priya@demo.com',
      role: UserRole.VENDOR,
      businessName: 'Office Solutions',
      panNumber: 'FGHIJ5678K',
      bankDetails: {
        accountNumber: '0987654321',
        ifscCode: 'SBI0005678',
        bankName: 'State Bank of India'
      },
      address: 'Delhi, Delhi',
      gstNumber: '07FGHIJ5678K2Z8',
      status: VendorStatus.APPROVED,
      joinedDate: '2024-01-10',
      phone: '+91 9876543211'
    }
  ];

  const mockOrders: Order[] = [
    {
      id: 'ORD-001',
      centerId: 'center-1',
      vendorId: 'vendor-1',
      items: [
        { productId: 'prod-1', productName: 'Wireless Headphones', quantity: 2, price: 2500, total: 5000 }
      ],
      totalAmount: 5000,
      status: OrderStatus.PENDING,
      deliveryDate: '2024-01-25',
      createdDate: '2024-01-20',
      updatedDate: '2024-01-20'
    },
    {
      id: 'ORD-002',
      centerId: 'center-2',
      vendorId: 'vendor-2',
      items: [
        { productId: 'prod-3', productName: 'Office Chair', quantity: 1, price: 8500, total: 8500 }
      ],
      totalAmount: 8500,
      status: OrderStatus.CONFIRMED,
      deliveryDate: '2024-01-24',
      createdDate: '2024-01-18',
      updatedDate: '2024-01-19'
    }
  ];

  const handleVendorAction = (vendorId: string, action: 'approve' | 'reject' | 'suspend') => {
    const actionMessages = {
      approve: 'Vendor approved successfully',
      reject: 'Vendor application rejected',
      suspend: 'Vendor account suspended'
    };
    
    toast.success(actionMessages[action]);
  };

  const stats = [
    { label: 'Total Vendors', value: '48', icon: Building, color: 'blue', change: '+12%' },
    { label: 'Active Centers', value: '23', icon: Users, color: 'green', change: '+8%' },
    { label: 'Total Orders', value: '156', icon: ShoppingCart, color: 'purple', change: '+15%' },
    { label: 'Revenue', value: '₹2.4M', icon: DollarSign, color: 'yellow', change: '+22%' }
  ];

  const sidebar = (
    <div className="space-y-1">
      {[
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'vendors', label: 'Vendors', icon: Building },
        { id: 'centers', label: 'Centers', icon: Users },
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'reports', label: 'Reports', icon: BarChart3 }
      ].map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === item.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Icon className="h-5 w-5 mr-3" />
            {item.label}
          </button>
        );
      })}
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">System overview and key metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                      </div>
                      <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                        <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Pending Approvals</h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('vendors')}>
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {mockVendors.filter(v => v.status === VendorStatus.PENDING).map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{vendor.businessName}</p>
                        <p className="text-sm text-gray-600">{vendor.name}</p>
                        <p className="text-sm text-gray-600">{vendor.email}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleVendorAction(vendor.id, 'reject')}
                        >
                          Reject
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleVendorAction(vendor.id, 'approve')}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {mockOrders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{order.id}</p>
                        <p className="text-sm text-gray-600">₹{order.totalAmount.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{order.createdDate}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                        order.status === OrderStatus.CONFIRMED ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-gray-900">Database</span>
                    </div>
                    <span className="text-sm text-green-600">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-gray-900">API Server</span>
                    </div>
                    <span className="text-sm text-green-600">Running</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="text-sm text-gray-900">Payment Gateway</span>
                    </div>
                    <span className="text-sm text-yellow-600">Warning</span>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <Button variant="secondary" className="w-full justify-start" icon={Building}>
                    Review Vendor Applications
                  </Button>
                  <Button variant="secondary" className="w-full justify-start" icon={ShoppingCart}>
                    Process Orders
                  </Button>
                  <Button variant="secondary" className="w-full justify-start" icon={CreditCard}>
                    Reconcile Payments
                  </Button>
                  <Button variant="secondary" className="w-full justify-start" icon={BarChart3}>
                    Generate Report
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'vendors':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vendor Management</h1>
                <p className="text-gray-600 mt-1">Review and manage vendor applications</p>
              </div>
              <div className="flex space-x-2">
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>All Status</option>
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockVendors.map((vendor) => (
                <Card key={vendor.id}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{vendor.businessName}</h3>
                      <p className="text-sm text-gray-600">{vendor.name}</p>
                      <p className="text-sm text-gray-600">{vendor.email}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      vendor.status === VendorStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                      vendor.status === VendorStatus.APPROVED ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {vendor.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><span className="font-medium">PAN:</span> {vendor.panNumber}</p>
                    <p><span className="font-medium">GST:</span> {vendor.gstNumber}</p>
                    <p><span className="font-medium">Bank:</span> {vendor.bankDetails.bankName}</p>
                    <p><span className="font-medium">Address:</span> {vendor.address}</p>
                    <p><span className="font-medium">Joined:</span> {vendor.joinedDate}</p>
                  </div>

                  <div className="flex space-x-2">
                    {vendor.status === VendorStatus.PENDING && (
                      <>
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleVendorAction(vendor.id, 'reject')}
                          icon={XCircle}
                        >
                          Reject
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleVendorAction(vendor.id, 'approve')}
                          icon={CheckCircle}
                        >
                          Approve
                        </Button>
                      </>
                    )}
                    {vendor.status === VendorStatus.APPROVED && (
                      <Button 
                        variant="danger" 
                        size="sm"
                        onClick={() => handleVendorAction(vendor.id, 'suspend')}
                      >
                        Suspend
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                <p className="text-gray-600 mt-1">Monitor all system orders</p>
              </div>
              <div className="flex space-x-2">
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>All Orders</option>
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Completed</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {mockOrders.map((order) => (
                <Card key={order.id}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.id}</h3>
                      <p className="text-sm text-gray-600">Center ID: {order.centerId}</p>
                      <p className="text-sm text-gray-600">Vendor ID: {order.vendorId}</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                      order.status === OrderStatus.CONFIRMED ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.productName} × {item.quantity}</span>
                            <span>₹{item.total.toLocaleString()}</span>
                          </div>
                        ))}
                        <div className="border-t pt-1 mt-2">
                          <div className="flex justify-between font-medium">
                            <span>Total</span>
                            <span>₹{order.totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <p>Delivery Date: {order.deliveryDate}</p>
                        <p>Created: {order.createdDate}</p>
                        <p>Updated: {order.updatedDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button variant="ghost" size="sm">
                      View Full Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600 mt-1">System performance and business insights</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-bold text-green-600">₹245,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Last Month</span>
                    <span className="font-bold text-gray-900">₹198,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Growth</span>
                    <span className="font-bold text-green-600 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +23.7%
                    </span>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Orders</span>
                    <span className="font-bold text-gray-900">156</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Completed</span>
                    <span className="font-bold text-green-600">142</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="font-bold text-green-600">91.0%</span>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Vendors</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Kumar Electronics', orders: 24, revenue: 45600 },
                    { name: 'Office Solutions', orders: 18, revenue: 38200 },
                    { name: 'Tech Supplies', orders: 15, revenue: 29800 }
                  ].map((vendor, index) => (
                    <div key={vendor.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="font-medium text-gray-900">{vendor.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">₹{vendor.revenue.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">{vendor.orders} orders</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Active Users</span>
                    <span className="font-bold text-gray-900">89</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">New Registrations</span>
                    <span className="font-bold text-blue-600">12</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Support Tickets</span>
                    <span className="font-bold text-yellow-600">3</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      default:
        return (
          <Card>
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Feature Coming Soon</h3>
              <p className="text-gray-600">This section is under development.</p>
            </div>
          </Card>
        );
    }
  };

  return (
    <DashboardLayout user={user} sidebar={sidebar} onLogout={onLogout}>
      {renderContent()}
    </DashboardLayout>
  );
}