import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { User, Order, Product, OrderStatus, PaymentStatus } from '../../types';
import { toast } from '../ui/Toaster';

interface VendorDashboardProps {
  user: User;
  onLogout: () => void;
}

export function VendorDashboard({ user, onLogout }: VendorDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data
  const mockOrders: Order[] = [
    {
      id: 'ORD-001',
      centerId: 'center-1',
      vendorId: user.id,
      items: [
        { productId: 'prod-1', productName: 'Wireless Headphones', quantity: 2, price: 2500, total: 5000 }
      ],
      totalAmount: 5000,
      status: OrderStatus.PENDING,
      deliveryDate: '2024-01-25',
      createdDate: '2024-01-20',
      updatedDate: '2024-01-20',
      center: { id: 'center-1', name: 'Delhi Distribution Center', email: 'center@demo.com' } as any
    },
    {
      id: 'ORD-002',
      centerId: 'center-2',
      vendorId: user.id,
      items: [
        { productId: 'prod-2', productName: 'Bluetooth Speaker', quantity: 1, price: 1500, total: 1500 }
      ],
      totalAmount: 1500,
      status: OrderStatus.CONFIRMED,
      deliveryDate: '2024-01-24',
      createdDate: '2024-01-19',
      updatedDate: '2024-01-20',
      center: { id: 'center-2', name: 'Mumbai Center', email: 'mumbai@demo.com' } as any
    }
  ];

  const mockProducts: Product[] = [
    {
      id: 'prod-1',
      vendorId: user.id,
      name: 'Wireless Headphones',
      description: 'Premium quality wireless headphones with noise cancellation',
      price: 2500,
      category: 'Electronics',
      stock: 50,
      status: 'available' as any,
      images: ['https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg'],
      createdDate: '2024-01-15',
      updatedDate: '2024-01-20'
    },
    {
      id: 'prod-2',
      vendorId: user.id,
      name: 'Bluetooth Speaker',
      description: 'Portable bluetooth speaker with excellent sound quality',
      price: 1500,
      category: 'Electronics',
      stock: 25,
      status: 'available' as any,
      images: ['https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg'],
      createdDate: '2024-01-10',
      updatedDate: '2024-01-18'
    }
  ];

  const handleOrderAction = (orderId: string, action: 'confirm' | 'decline' | 'complete') => {
    const actionMessages = {
      confirm: 'Order confirmed successfully',
      decline: 'Order declined',
      complete: 'Order marked as completed'
    };
    
    toast.success(actionMessages[action]);
  };

  const stats = [
    { label: 'Total Orders', value: '24', icon: ShoppingCart, color: 'blue', change: '+12%' },
    { label: 'Revenue', value: '₹45,600', icon: DollarSign, color: 'green', change: '+8%' },
    { label: 'Products', value: '12', icon: Package, color: 'purple', change: '+3' },
    { label: 'Pending Orders', value: '6', icon: Clock, color: 'yellow', change: '-2' }
  ];

  const sidebar = (
    <div className="space-y-1">
      {[
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'products', label: 'Products', icon: Package },
        { id: 'orders', label: 'Orders', icon: ShoppingCart },
        { id: 'payments', label: 'Payments', icon: CreditCard },
        { id: 'messages', label: 'Messages', icon: MessageSquare }
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
              <h1 className="text-2xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user.name}</p>
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
                        <p className="text-sm text-gray-600">{order.center?.name}</p>
                        <p className="text-sm text-gray-600">₹{order.totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                          order.status === OrderStatus.CONFIRMED ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {order.status}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">{order.deliveryDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Product Performance</h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('products')}>
                    Manage
                  </Button>
                </div>
                <div className="space-y-4">
                  {mockProducts.slice(0, 3).map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-600">₹{product.price}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">Stock: {product.stock}</p>
                        <span className="text-xs text-green-600">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        );

      case 'products':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                <p className="text-gray-600 mt-1">Manage your product listings</p>
              </div>
              <Button icon={Package}>
                Add Product
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockProducts.map((product) => (
                <Card key={product.id}>
                  <img 
                    src={product.images[0]} 
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                      <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm" className="flex-1">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <p className="text-gray-600 mt-1">Manage and fulfill your orders</p>
            </div>

            <div className="space-y-4">
              {mockOrders.map((order) => (
                <Card key={order.id}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.id}</h3>
                      <p className="text-sm text-gray-600">{order.center?.name}</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                      order.status === OrderStatus.CONFIRMED ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.productName} × {item.quantity}</span>
                        <span>₹{item.total}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-medium">
                        <span>Total Amount</span>
                        <span>₹{order.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <p>Delivery: {order.deliveryDate}</p>
                      <p>Created: {order.createdDate}</p>
                    </div>
                    {order.status === OrderStatus.PENDING && (
                      <div className="flex space-x-2">
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleOrderAction(order.id, 'decline')}
                        >
                          Decline
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleOrderAction(order.id, 'confirm')}
                        >
                          Confirm
                        </Button>
                      </div>
                    )}
                    {order.status === OrderStatus.CONFIRMED && (
                      <Button 
                        size="sm"
                        onClick={() => handleOrderAction(order.id, 'complete')}
                      >
                        Mark Complete
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
              <p className="text-gray-600 mt-1">Track your payment history and pending amounts</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-gray-900">₹45,600</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </Card>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                    <p className="text-2xl font-bold text-gray-900">₹12,500</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </Card>
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">₹8,900</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-600" />
                </div>
              </Card>
            </div>

            <Card>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
              </div>
              <div className="space-y-4">
                {[
                  { id: 'PAY-001', order: 'ORD-001', amount: 5000, status: 'paid', date: '2024-01-20' },
                  { id: 'PAY-002', order: 'ORD-002', amount: 1500, status: 'pending', date: '2024-01-19' },
                  { id: 'PAY-003', order: 'ORD-003', amount: 3200, status: 'paid', date: '2024-01-18' }
                ].map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{payment.id}</p>
                      <p className="text-sm text-gray-600">Order: {payment.order}</p>
                      <p className="text-sm text-gray-600">{payment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{payment.amount}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        payment.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
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