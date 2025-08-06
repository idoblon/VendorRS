import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Search, 
  ShoppingCart, 
  CreditCard, 
  MessageSquare,
  Filter,
  Star,
  Plus,
  Minus,
  Package
} from 'lucide-react';
import { DashboardLayout } from '../layout/DashboardLayout';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { User, Order, Product, OrderStatus } from '../../types';
import { toast } from '../ui/Toaster';

interface CenterDashboardProps {
  user: User;
  onLogout: () => void;
}

export function CenterDashboard({ user, onLogout }: CenterDashboardProps) {
  const [activeTab, setActiveTab] = useState('marketplace');
  const [cart, setCart] = useState<{[key: string]: number}>({});

  // Mock data
  const mockProducts: Product[] = [
    {
      id: 'prod-1',
      vendorId: 'vendor-1',
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
      vendorId: 'vendor-1',
      name: 'Bluetooth Speaker',
      description: 'Portable bluetooth speaker with excellent sound quality',
      price: 1500,
      category: 'Electronics',
      stock: 25,
      status: 'available' as any,
      images: ['https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg'],
      createdDate: '2024-01-10',
      updatedDate: '2024-01-18'
    },
    {
      id: 'prod-3',
      vendorId: 'vendor-2',
      name: 'Office Chair',
      description: 'Ergonomic office chair with lumbar support',
      price: 8500,
      category: 'Furniture',
      stock: 15,
      status: 'available' as any,
      images: ['https://images.pexels.com/photos/1181433/pexels-photo-1181433.jpeg'],
      createdDate: '2024-01-12',
      updatedDate: '2024-01-19'
    },
    {
      id: 'prod-4',
      vendorId: 'vendor-2',
      name: 'Desk Lamp',
      description: 'Adjustable LED desk lamp with USB charging port',
      price: 1200,
      category: 'Furniture',
      stock: 30,
      status: 'available' as any,
      images: ['https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg'],
      createdDate: '2024-01-08',
      updatedDate: '2024-01-16'
    }
  ];

  const mockOrders: Order[] = [
    {
      id: 'ORD-001',
      centerId: user.id,
      vendorId: 'vendor-1',
      items: [
        { productId: 'prod-1', productName: 'Wireless Headphones', quantity: 2, price: 2500, total: 5000 }
      ],
      totalAmount: 5000,
      status: OrderStatus.PENDING,
      deliveryDate: '2024-01-25',
      createdDate: '2024-01-20',
      updatedDate: '2024-01-20',
      vendor: { id: 'vendor-1', name: 'Kumar Electronics', email: 'vendor@demo.com' } as any
    },
    {
      id: 'ORD-002',
      centerId: user.id,
      vendorId: 'vendor-2',
      items: [
        { productId: 'prod-3', productName: 'Office Chair', quantity: 1, price: 8500, total: 8500 }
      ],
      totalAmount: 8500,
      status: OrderStatus.CONFIRMED,
      deliveryDate: '2024-01-24',
      createdDate: '2024-01-18',
      updatedDate: '2024-01-19',
      vendor: { id: 'vendor-2', name: 'Office Solutions', email: 'office@demo.com' } as any
    }
  ];

  const addToCart = (productId: string) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
    toast.success('Product added to cart');
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const cartItems = Object.keys(cart).length;
  const cartTotal = Object.entries(cart).reduce((total, [productId, quantity]) => {
    const product = mockProducts.find(p => p.id === productId);
    return total + (product ? product.price * quantity : 0);
  }, 0);

  const sidebar = (
    <div className="space-y-1">
      {[
        { id: 'marketplace', label: 'Marketplace', icon: Search },
        { id: 'cart', label: `Cart (${cartItems})`, icon: ShoppingCart },
        { id: 'orders', label: 'My Orders', icon: Package },
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
      case 'marketplace':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
                <p className="text-gray-600 mt-1">Discover products from verified vendors</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="secondary" icon={Filter}>
                  Filter
                </Button>
                <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>All Categories</option>
                  <option>Electronics</option>
                  <option>Furniture</option>
                  <option>Stationery</option>
                </select>
              </div>
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
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{product.name}</h3>
                      <div className="flex items-center text-yellow-400">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">4.5</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                      <span className="text-sm text-gray-600">Stock: {product.stock}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                        {product.category}
                      </span>
                      {cart[product.id] ? (
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(product.id)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-medium">{cart[product.id]}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addToCart(product.id)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          size="sm" 
                          onClick={() => addToCart(product.id)}
                          icon={Plus}
                        >
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'cart':
        const cartProductItems = Object.entries(cart).map(([productId, quantity]) => {
          const product = mockProducts.find(p => p.id === productId);
          return product ? { product, quantity } : null;
        }).filter(Boolean);

        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
              <p className="text-gray-600 mt-1">{cartItems} items in your cart</p>
            </div>

            {cartProductItems.length === 0 ? (
              <Card className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                <p className="text-gray-600 mb-4">Add some products from the marketplace</p>
                <Button onClick={() => setActiveTab('marketplace')}>
                  Browse Products
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {cartProductItems.map(({ product, quantity }) => (
                    <Card key={product!.id}>
                      <div className="flex items-center space-x-4">
                        <img 
                          src={product!.images[0]} 
                          alt={product!.name}
                          className="h-20 w-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{product!.name}</h3>
                          <p className="text-sm text-gray-600">{product!.description}</p>
                          <p className="text-lg font-bold text-gray-900">₹{product!.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(product!.id)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="font-medium w-8 text-center">{quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addToCart(product!.id)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₹{(product!.price * quantity!).toLocaleString()}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div>
                  <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">₹{cartTotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium">₹500</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax (18%)</span>
                        <span className="font-medium">₹{Math.round(cartTotal * 0.18).toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-3">
                        <div className="flex justify-between">
                          <span className="text-lg font-semibold">Total</span>
                          <span className="text-lg font-bold">₹{(cartTotal + 500 + Math.round(cartTotal * 0.18)).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      className="w-full mt-6"
                      onClick={() => {
                        toast.success('Order placed successfully!');
                        setCart({});
                        setActiveTab('orders');
                      }}
                    >
                      Place Order
                    </Button>
                  </Card>
                </div>
              </div>
            )}
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-1">Track your order status and history</p>
            </div>

            <div className="space-y-4">
              {mockOrders.map((order) => (
                <Card key={order.id}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{order.id}</h3>
                      <p className="text-sm text-gray-600">Vendor: {order.vendor?.name}</p>
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
                        <span>₹{item.total.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2">
                      <div className="flex justify-between font-medium">
                        <span>Total Amount</span>
                        <span>₹{order.totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <p>Expected Delivery: {order.deliveryDate}</p>
                      <p>Order Date: {order.createdDate}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="secondary" size="sm">
                        Track Order
                      </Button>
                      {order.status === OrderStatus.CONFIRMED && (
                        <Button 
                          size="sm"
                          onClick={() => toast.success('Payment initiated successfully')}
                        >
                          Make Payment
                        </Button>
                      )}
                    </div>
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
              <p className="text-gray-600 mt-1">Manage your payment methods and history</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <div className="text-center">
                  <CreditCard className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">₹24,500</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Paid Orders</p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <ShoppingCart className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">₹5,000</p>
                </div>
              </Card>
            </div>

            <Card>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
              </div>
              <div className="space-y-4">
                {[
                  { id: 'PAY-001', order: 'ORD-001', amount: 5000, status: 'completed', date: '2024-01-20', method: 'UPI' },
                  { id: 'PAY-002', order: 'ORD-002', amount: 8500, status: 'pending', date: '2024-01-19', method: 'Bank Transfer' },
                  { id: 'PAY-003', order: 'ORD-003', amount: 3200, status: 'completed', date: '2024-01-18', method: 'Credit Card' }
                ].map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{payment.id}</p>
                      <p className="text-sm text-gray-600">Order: {payment.order}</p>
                      <p className="text-sm text-gray-600">{payment.method} • {payment.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">₹{payment.amount.toLocaleString()}</p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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