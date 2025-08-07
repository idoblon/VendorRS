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
  DollarSign,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Activity,
  Database,
  Server,
  Wifi,
  Shield,
  Settings,
  Download,
  Filter,
  Search,
  Eye
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

interface DistributionCenter {
  id: string;
  name: string;
  location: string;
  address: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive' | 'maintenance';
  capacity: number;
  currentOrders: number;
  establishedDate: string;
  region: string;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for distribution centers (pre-established by admin)
  const mockCenters: DistributionCenter[] = [
    {
      id: 'center-1',
      name: 'Delhi Distribution Center',
      location: 'New Delhi',
      address: 'Sector 18, Noida, Uttar Pradesh 201301',
      contactPerson: 'Rajesh Kumar',
      email: 'delhi@vrs.com',
      phone: '+91 9876543210',
      status: 'active',
      capacity: 1000,
      currentOrders: 245,
      establishedDate: '2023-01-15',
      region: 'North India'
    },
    {
      id: 'center-2',
      name: 'Mumbai Distribution Center',
      location: 'Mumbai',
      address: 'Andheri East, Mumbai, Maharashtra 400069',
      contactPerson: 'Priya Sharma',
      email: 'mumbai@vrs.com',
      phone: '+91 9876543211',
      status: 'active',
      capacity: 1200,
      currentOrders: 189,
      establishedDate: '2023-02-20',
      region: 'West India'
    },
    {
      id: 'center-3',
      name: 'Bangalore Tech Hub',
      location: 'Bangalore',
      address: 'Electronic City, Bangalore, Karnataka 560100',
      contactPerson: 'Amit Patel',
      email: 'bangalore@vrs.com',
      phone: '+91 9876543212',
      status: 'maintenance',
      capacity: 800,
      currentOrders: 67,
      establishedDate: '2023-03-10',
      region: 'South India'
    },
    {
      id: 'center-4',
      name: 'Chennai Operations',
      location: 'Chennai',
      address: 'OMR Road, Chennai, Tamil Nadu 600096',
      contactPerson: 'Lakshmi Iyer',
      email: 'chennai@vrs.com',
      phone: '+91 9876543213',
      status: 'active',
      capacity: 900,
      currentOrders: 156,
      establishedDate: '2023-04-05',
      region: 'South India'
    },
    {
      id: 'center-5',
      name: 'Kolkata Distribution Center',
      location: 'Kolkata',
      address: 'Salt Lake City, Kolkata, West Bengal 700064',
      contactPerson: 'Subrata Das',
      email: 'kolkata@vrs.com',
      phone: '+91 9876543214',
      status: 'inactive',
      capacity: 600,
      currentOrders: 0,
      establishedDate: '2023-05-12',
      region: 'East India'
    }
  ];

  // Mock data for vendors
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
    },
    {
      id: 'vendor-3',
      name: 'Amit Patel',
      email: 'amit@demo.com',
      role: UserRole.VENDOR,
      businessName: 'Tech Supplies Co',
      panNumber: 'KLMNO9012P',
      bankDetails: {
        accountNumber: '1122334455',
        ifscCode: 'ICICI0009012',
        bankName: 'ICICI Bank'
      },
      address: 'Bangalore, Karnataka',
      gstNumber: '29KLMNO9012P3Z1',
      status: VendorStatus.APPROVED,
      joinedDate: '2024-01-05',
      phone: '+91 9876543212'
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

  const handleCenterAction = (centerId: string, action: 'activate' | 'deactivate' | 'maintenance' | 'delete') => {
    const actionMessages = {
      activate: 'Distribution center activated',
      deactivate: 'Distribution center deactivated',
      maintenance: 'Distribution center set to maintenance mode',
      delete: 'Distribution center deleted'
    };
    
    toast.success(actionMessages[action]);
  };

  const stats = [
    { label: 'Total Vendors', value: '48', icon: Building, color: 'blue', change: '+12%', description: 'Active vendors' },
    { label: 'Distribution Centers', value: '5', icon: Users, color: 'green', change: '+1', description: 'Operational centers' },
    { label: 'Total Orders', value: '1,256', icon: ShoppingCart, color: 'purple', change: '+15%', description: 'This month' },
    { label: 'System Revenue', value: '₹24.5M', icon: DollarSign, color: 'yellow', change: '+22%', description: 'Total processed' }
  ];

  const sidebar = (
    <div className="space-y-6">
      {/* System Management */}
      <div>
        <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          System
        </h3>
        <div className="space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'system-health', label: 'System Health', icon: Activity }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-r-2 border-blue-600'
                    : 'text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-slate-900'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Management */}
      <div>
        <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          User Management
        </h3>
        <div className="space-y-1">
          {[
            { id: 'vendors', label: 'Vendors', icon: Building },
            { id: 'centers', label: 'Distribution Centers', icon: Users }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-r-2 border-blue-600'
                    : 'text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-slate-900'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Business Operations */}
      <div>
        <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Operations
        </h3>
        <div className="space-y-1">
          {[
            { id: 'orders', label: 'Orders', icon: ShoppingCart },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-r-2 border-blue-600'
                    : 'text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-slate-900'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 min-h-screen -m-6 p-6">
            {/* Page Title */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg">
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-blue-100 mt-2">System overview and management console</p>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/50 border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                        <div className="flex items-center mt-2">
                          <TrendingUp className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium ml-1 text-emerald-600">{stat.change}</span>
                          <span className="text-sm text-slate-500 ml-1">{stat.description}</span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-full bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200`}>
                        <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Vendor Approvals */}
              <Card className="bg-gradient-to-br from-white to-amber-50/50 border-amber-200 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Pending Vendor Approvals</h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('vendors')} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {mockVendors.filter(v => v.status === VendorStatus.PENDING).map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                      <div>
                        <p className="font-medium text-slate-900">{vendor.businessName}</p>
                        <p className="text-sm text-slate-600">{vendor.name}</p>
                        <p className="text-sm text-slate-600">{vendor.email}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="danger" 
                          size="sm"
                          onClick={() => handleVendorAction(vendor.id, 'reject')}
                          className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 border-0"
                        >
                          Reject
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleVendorAction(vendor.id, 'approve')}
                          className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border-0"
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Distribution Center Status */}
              <Card className="bg-gradient-to-br from-white to-green-50/50 border-green-200 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">Distribution Centers</h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('centers')} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    Manage All
                  </Button>
                </div>
                <div className="space-y-4">
                  {mockCenters.slice(0, 3).map((center) => (
                    <div key={center.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          center.status === 'active' ? 'bg-emerald-400' :
                          center.status === 'maintenance' ? 'bg-amber-400' :
                          'bg-red-400'
                        }`}></div>
                        <div>
                          <p className="font-medium text-slate-900">{center.name}</p>
                          <p className="text-sm text-slate-600">{center.location}</p>
                          <p className="text-sm text-slate-500">{center.currentOrders}/{center.capacity} orders</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        center.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        center.status === 'maintenance' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {center.status}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* System Health & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-white to-slate-50 border-slate-200 shadow-lg">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">System Health</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center space-x-3">
                      <Database className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-medium text-slate-900">Database</span>
                    </div>
                    <span className="text-sm font-medium text-emerald-600">Healthy</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center space-x-3">
                      <Server className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-medium text-slate-900">API Server</span>
                    </div>
                    <span className="text-sm font-medium text-emerald-600">Running</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-amber-600" />
                      <span className="text-sm font-medium text-slate-900">Payment Gateway</span>
                    </div>
                    <span className="text-sm font-medium text-amber-600">Warning</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center space-x-3">
                      <Wifi className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-medium text-slate-900">Network</span>
                    </div>
                    <span className="text-sm font-medium text-emerald-600">Stable</span>
                  </div>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-white to-blue-50/50 border-blue-200 shadow-lg">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Button 
                    variant="secondary" 
                    className="w-full justify-start bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 border-0" 
                    icon={Building}
                    onClick={() => setActiveTab('vendors')}
                  >
                    Review Vendor Applications
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full justify-start bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 border-0" 
                    icon={Plus}
                    onClick={() => setActiveTab('centers')}
                  >
                    Add Distribution Center
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full justify-start bg-gradient-to-r from-purple-500 to-violet-600 text-white hover:from-purple-600 hover:to-violet-700 border-0" 
                    icon={ShoppingCart}
                    onClick={() => setActiveTab('orders')}
                  >
                    Monitor Orders
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="w-full justify-start bg-gradient-to-r from-orange-500 to-red-600 text-white hover:from-orange-600 hover:to-red-700 border-0" 
                    icon={BarChart3}
                    onClick={() => setActiveTab('reports')}
                  >
                    Generate Reports
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'centers':
        return (
          <div className="space-y-6 bg-gradient-to-br from-green-50/30 to-emerald-50/30 min-h-screen -m-6 p-6">
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 rounded-xl shadow-lg">
              <h1 className="text-3xl font-bold">Distribution Centers</h1>
              <p className="text-green-100 mt-2">Manage pre-established distribution centers</p>
            </div>

            {/* Center Management Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search centers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <Button icon={Plus} className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0">
                Add New Center
              </Button>
            </div>

            {/* Centers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockCenters.map((center) => (
                <Card key={center.id} className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-green-50/50 border-green-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{center.name}</h3>
                      <p className="text-sm text-slate-600 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {center.location}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      center.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      center.status === 'maintenance' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {center.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Contact Person</p>
                        <p className="font-medium text-slate-900">{center.contactPerson}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Region</p>
                        <p className="font-medium text-slate-900">{center.region}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-slate-600">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {center.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {center.phone}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 p-3 rounded-lg border border-slate-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700">Capacity Utilization</span>
                        <span className="text-sm font-bold text-slate-900">
                          {center.currentOrders}/{center.capacity}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full" 
                          style={{ width: `${(center.currentOrders / center.capacity) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {Math.round((center.currentOrders / center.capacity) * 100)}% utilized
                      </p>
                    </div>

                    <div className="text-sm text-slate-600">
                      <p className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Established: {center.establishedDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {center.status === 'inactive' && (
                      <Button 
                        size="sm"
                        onClick={() => handleCenterAction(center.id, 'activate')}
                        className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border-0"
                      >
                        Activate
                      </Button>
                    )}
                    {center.status === 'active' && (
                      <>
                        <Button 
                          variant="secondary"
                          size="sm"
                          onClick={() => handleCenterAction(center.id, 'maintenance')}
                          className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 border-0"
                        >
                          Maintenance
                        </Button>
                        <Button 
                          variant="danger"
                          size="sm"
                          onClick={() => handleCenterAction(center.id, 'deactivate')}
                          className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 border-0"
                        >
                          Deactivate
                        </Button>
                      </>
                    )}
                    {center.status === 'maintenance' && (
                      <Button 
                        size="sm"
                        onClick={() => handleCenterAction(center.id, 'activate')}
                        className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border-0"
                      >
                        Reactivate
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" icon={Edit} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" icon={Eye} className="text-slate-600 hover:text-slate-700 hover:bg-slate-50">
                      Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'system-health':
        return (
          <div className="space-y-6 bg-gradient-to-br from-slate-50/30 to-gray-50/30 min-h-screen -m-6 p-6">
            <div className="bg-gradient-to-r from-slate-600 to-gray-700 text-white p-6 rounded-xl shadow-lg">
              <h1 className="text-3xl font-bold">System Health</h1>
              <p className="text-slate-100 mt-2">Monitor system performance and infrastructure</p>
            </div>

            {/* System Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { name: 'Database', status: 'healthy', uptime: '99.9%', icon: Database, color: 'emerald' },
                { name: 'API Server', status: 'running', uptime: '99.8%', icon: Server, color: 'blue' },
                { name: 'Payment Gateway', status: 'warning', uptime: '98.5%', icon: Shield, color: 'amber' },
                { name: 'Network', status: 'stable', uptime: '99.7%', icon: Wifi, color: 'green' }
              ].map((service) => {
                const Icon = service.icon;
                return (
                  <Card key={service.name} className="hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-full bg-${service.color}-100`}>
                        <Icon className={`h-5 w-5 text-${service.color}-600`} />
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        service.status === 'healthy' || service.status === 'running' || service.status === 'stable' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {service.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900">{service.name}</h3>
                    <p className="text-sm text-slate-600">Uptime: {service.uptime}</p>
                  </Card>
                );
              })}
            </div>

            {/* Detailed System Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  {[
                    { metric: 'Response Time', value: '245ms', status: 'good' },
                    { metric: 'CPU Usage', value: '34%', status: 'good' },
                    { metric: 'Memory Usage', value: '67%', status: 'warning' },
                    { metric: 'Disk Usage', value: '23%', status: 'good' },
                    { metric: 'Active Users', value: '1,247', status: 'good' },
                    { metric: 'Error Rate', value: '0.02%', status: 'good' }
                  ].map((item) => (
                    <div key={item.metric} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm font-medium text-slate-700">{item.metric}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">{item.value}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          item.status === 'good' ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent System Events</h3>
                <div className="space-y-3">
                  {[
                    { time: '10:30 AM', event: 'Database backup completed', type: 'success' },
                    { time: '09:45 AM', event: 'Payment gateway maintenance started', type: 'warning' },
                    { time: '09:15 AM', event: 'New vendor registration: Kumar Electronics', type: 'info' },
                    { time: '08:30 AM', event: 'System health check passed', type: 'success' },
                    { time: '08:00 AM', event: 'Daily report generated', type: 'info' }
                  ].map((event, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        event.type === 'success' ? 'bg-emerald-400' :
                        event.type === 'warning' ? 'bg-amber-400' :
                        'bg-blue-400'
                      }`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{event.event}</p>
                        <p className="text-xs text-slate-500">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        );

      // Keep existing cases for vendors, orders, payments, reports...
      default:
        return (
          <Card className="bg-gradient-to-br from-white to-blue-50/50 border-blue-200 shadow-lg">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-slate-900 mb-2">Feature Coming Soon</h3>
              <p className="text-slate-600">This section is under development.</p>
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