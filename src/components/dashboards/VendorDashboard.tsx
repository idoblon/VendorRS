import React, { useEffect, useState } from "react";
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
  DollarSign,
  Eye,
  Edit,
  Plus,
  BarChart3,
  Users,
  Calendar,
  Filter,
  Search,
  Download,
  Bell,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import { DashboardLayout } from "../layout/DashboardLayout";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { User, Order, Product, OrderStatus, PaymentStatus } from "../../types";
import { toast } from "../ui/Toaster";
import ProductCatalog from "../vendor/productCatalog";
import VendorOrderList from "../vendor/vendor-orders";
import axiosInstance from "../../utils/axios";
interface VendorDashboardProps {
  user: User;
  onLogout: () => void;
}

export function VendorDashboard({ user, onLogout }: VendorDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [vendorAnalytics, setVendorAnalytics] = useState(null);

  useEffect(() => {
    async function getAnalytics() {
      const response = await axiosInstance.get(
        "/api/orders/analytics/" + user._id
      );
      const formattedStats = mapApiDataToStats(response.data.data);
        setVendorAnalytics(formattedStats);
    }
    getAnalytics();
  }, []);

  // Enhanced mock data - Orders placed by vendor to centers
  const mockOrders: Order[] = [
    {
      id: "ORD-001",
      centerId: "center-1",
      vendorId: user.id,
      items: [
        {
          productId: "prod-1",
          productName: "Wireless Headphones",
          quantity: 2,
          price: 2500,
          total: 5000,
        },
      ],
      totalAmount: 5000,
      status: OrderStatus.PENDING,
      deliveryDate: "2024-01-25",
      createdDate: "2024-01-20",
      updatedDate: "2024-01-20",
      center: {
        id: "center-1",
        name: "Delhi Distribution Center",
        email: "center@demo.com",
      } as any,
    },
    {
      id: "ORD-002",
      centerId: "center-2",
      vendorId: user.id,
      items: [
        {
          productId: "prod-2",
          productName: "Bluetooth Speaker",
          quantity: 1,
          price: 1500,
          total: 1500,
        },
      ],
      totalAmount: 1500,
      status: OrderStatus.CONFIRMED,
      deliveryDate: "2024-01-24",
      createdDate: "2024-01-19",
      updatedDate: "2024-01-20",
      center: {
        id: "center-2",
        name: "Mumbai Center",
        email: "mumbai@demo.com",
      } as any,
    },
    {
      id: "ORD-003",
      centerId: "center-3",
      vendorId: user.id,
      items: [
        {
          productId: "prod-3",
          productName: "Smart Watch",
          quantity: 3,
          price: 3500,
          total: 10500,
        },
      ],
      totalAmount: 10500,
      status: OrderStatus.COMPLETED,
      deliveryDate: "2024-01-22",
      createdDate: "2024-01-18",
      updatedDate: "2024-01-22",
      center: {
        id: "center-3",
        name: "Bangalore Tech Hub",
        email: "bangalore@demo.com",
      } as any,
    },
    {
      id: "ORD-004",
      centerId: "center-4",
      vendorId: user.id,
      items: [
        {
          productId: "prod-4",
          productName: "Laptop Stand",
          quantity: 5,
          price: 800,
          total: 4000,
        },
      ],
      totalAmount: 4000,
      status: OrderStatus.IN_PROGRESS,
      deliveryDate: "2024-01-26",
      createdDate: "2024-01-21",
      updatedDate: "2024-01-21",
      center: {
        id: "center-4",
        name: "Chennai Operations",
        email: "chennai@demo.com",
      } as any,
    },
  ];

  const mockProducts: Product[] = [
    {
      id: "prod-1",
      vendorId: user.id,
      name: "Wireless Headphones",
      description:
        "Premium quality wireless headphones with noise cancellation",
      price: 2500,
      category: "Electronics",
      stock: 50,
      status: "available" as any,
      images: [
        "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg",
      ],
      createdDate: "2024-01-15",
      updatedDate: "2024-01-20",
    },
    {
      id: "prod-2",
      vendorId: user.id,
      name: "Bluetooth Speaker",
      description: "Portable bluetooth speaker with excellent sound quality",
      price: 1500,
      category: "Electronics",
      stock: 25,
      status: "available" as any,
      images: [
        "https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg",
      ],
      createdDate: "2024-01-10",
      updatedDate: "2024-01-18",
    },
    {
      id: "prod-3",
      vendorId: user.id,
      name: "Smart Watch",
      description:
        "Advanced fitness tracking smartwatch with heart rate monitor",
      price: 3500,
      category: "Wearables",
      stock: 15,
      status: "available" as any,
      images: [
        "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg",
      ],
      createdDate: "2024-01-12",
      updatedDate: "2024-01-19",
    },
    {
      id: "prod-4",
      vendorId: user.id,
      name: "Laptop Stand",
      description: "Ergonomic adjustable laptop stand for better posture",
      price: 800,
      category: "Accessories",
      stock: 75,
      status: "available" as any,
      images: [
        "https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg",
      ],
      createdDate: "2024-01-08",
      updatedDate: "2024-01-16",
    },
    {
      id: "prod-5",
      vendorId: user.id,
      name: "USB-C Hub",
      description:
        "Multi-port USB-C hub with HDMI, USB 3.0, and charging support",
      price: 1200,
      category: "Accessories",
      stock: 5,
      status: "available" as any,
      images: [
        "https://images.pexels.com/photos/163100/circuit-circuit-board-resistor-computer-163100.jpeg",
      ],
      createdDate: "2024-01-05",
      updatedDate: "2024-01-14",
    },
  ];

  // Mock notifications
  const mockNotifications = [
    {
      id: 1,
      title: "Order Confirmed",
      message: "Order ORD-001 confirmed by Delhi Distribution Center",
      type: "success",
      time: "2 hours ago",
    },
    {
      id: 2,
      title: "Low Stock Alert",
      message: "USB-C Hub stock is running low (5 remaining)",
      type: "warning",
      time: "4 hours ago",
    },
    {
      id: 3,
      title: "Order Delivered",
      message: "Order ORD-003 delivered successfully from Bangalore Tech Hub",
      type: "success",
      time: "1 day ago",
    },
  ];

  // Mock analytics data
  const salesData = [
    { month: "Jan", sales: 12000, orders: 15 },
    { month: "Feb", sales: 18000, orders: 22 },
    { month: "Mar", sales: 25000, orders: 31 },
    { month: "Apr", sales: 22000, orders: 28 },
    { month: "May", sales: 30000, orders: 38 },
    { month: "Jun", sales: 35000, orders: 42 },
  ];

  const handleOrderAction = (orderId: string, action: "cancel" | "reorder") => {
    const actionMessages = {
      cancel: "Order cancelled successfully",
      reorder: "Order placed again successfully",
    };

    toast.success(actionMessages[action]);
  };

  function mapApiDataToStats(apiData:any) {
    return apiData
      .map((item:any) => {
        switch (item.name) {
          case "Total Orders Placed":
            return {
              label: "Orders Placed",
              value: item.value,
              icon: ShoppingCart,
              color: "cyan",
              change: "+12%", // you can add dynamic changes if you have data
              trend: "up",
              description: "to centers",
            };
          case "Total Amount Spent":
            return {
              label: "Total Spent",
              value: `₹${item.value.toLocaleString()}`,
              icon: DollarSign,
              color: "blue",
              change: "+18%",
              trend: "up",
              description: "vs last month",
            };
          case "Total Products Ordered":
            return {
              label: "Products Ordered",
              value: item.value,
              icon: Package,
              color: "indigo",
              change: "+3",
              trend: "up",
              description: "different items",
            };
          default:
            return null;
        }
      })
      .filter(Boolean);
  }

  const sidebar = (
    <div className="space-y-6">
      {/* Main Navigation */}
      <div>
        <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Main
        </h3>
        <div className="space-y-1">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-cyan-100 to-blue-100 text-blue-800 border-r-2 border-blue-600"
                    : "text-slate-600 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-slate-900"
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
          Business
        </h3>
        <div className="space-y-1">
          {[
            { id: "products", label: "Product Catalog", icon: Package },
            { id: "orders", label: "My Orders", icon: ShoppingCart },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-cyan-100 to-blue-100 text-blue-800 border-r-2 border-blue-600"
                    : "text-slate-600 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 hover:text-slate-900"
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
      case "dashboard":
        return (
          <div className="space-y-6 bg-gradient-to-br from-cyan-50/30 to-blue-50/30 min-h-screen -m-6 p-6">
            {/* Page Title */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white p-6 rounded-xl shadow-lg">
              <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
              <p className="text-cyan-100 mt-2">Welcome back, {user.name}</p>
            </div>

            {/* Enhanced Stats Cards - Now 3 cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendorAnalytics &&
                vendorAnalytics.map((stat) => {
                  const Icon = stat.icon;
                  const TrendIcon =
                    stat.trend === "up" ? ArrowUpRight : ArrowDownRight;
                  return (
                    <Card
                      key={stat.label}
                      className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-cyan-50/50 border-cyan-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-600">
                            {stat.label}
                          </p>
                          <p className="text-2xl font-bold text-slate-900 mt-1">
                            {stat.value}
                          </p>
                          <div className="flex items-center mt-2">
                            <TrendIcon
                              className={`h-4 w-4 ${
                                stat.trend === "up"
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }`}
                            />
                            <span
                              className={`text-sm font-medium ml-1 ${
                                stat.trend === "up"
                                  ? "text-emerald-600"
                                  : "text-red-600"
                              }`}
                            >
                              {stat.change}
                            </span>
                            <span className="text-sm text-slate-500 ml-1">
                              {stat.description}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`p-3 rounded-full bg-gradient-to-br from-${stat.color}-100 to-${stat.color}-200`}
                        >
                          <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>

           
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Orders Placed */}
              <div className="lg:col-span-2">
                <Card className="bg-gradient-to-br from-white to-cyan-50/50 border-cyan-200 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Recent Orders Placed
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("orders")}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      View All
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {mockOrders.slice(0, 4).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg hover:from-cyan-100 hover:to-blue-100 transition-all duration-300 border border-cyan-200"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              order.status === OrderStatus.PENDING
                                ? "bg-amber-400"
                                : order.status === OrderStatus.CONFIRMED
                                ? "bg-blue-400"
                                : order.status === OrderStatus.COMPLETED
                                ? "bg-emerald-400"
                                : "bg-purple-400"
                            }`}
                          ></div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {order.id}
                            </p>
                            <p className="text-sm text-slate-600">
                              To: {order.center?.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              Placed: {order.createdDate}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-slate-900">
                            ₹{order.totalAmount.toLocaleString()}
                          </p>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              order.status === OrderStatus.PENDING
                                ? "bg-amber-100 text-amber-800"
                                : order.status === OrderStatus.CONFIRMED
                                ? "bg-blue-100 text-blue-800"
                                : order.status === OrderStatus.COMPLETED
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Notifications & Alerts */}
              <div>
                <Card className="bg-gradient-to-br from-white to-blue-50/50 border-blue-200 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Notifications
                    </h2>
                    <Bell className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="space-y-3">
                    {mockNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start space-x-3 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg border border-cyan-200"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === "info"
                              ? "bg-blue-400"
                              : notification.type === "warning"
                              ? "bg-amber-400"
                              : "bg-emerald-400"
                          }`}
                        ></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-slate-600">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Available Products */}
                <Card className="mt-6 bg-gradient-to-br from-white to-cyan-50/50 border-cyan-200 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Available Products
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("products")}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      Browse
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {mockProducts.slice(0, 3).map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-all duration-300"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg object-cover border-2 border-cyan-200"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {product.name}
                          </p>
                          <p className="text-sm text-blue-600">
                            ₹{product.price}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-900">
                            {product.stock}
                          </p>
                          <p className="text-xs text-slate-500">available</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        );
      case "products":
        return <ProductCatalog />;
      case "orders":
        return <VendorOrderList vendorId={user._id} />;
      default:
        return (
          <Card className="bg-gradient-to-br from-white to-cyan-50/50 border-cyan-200 shadow-lg">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-slate-900 mb-2">
                Feature Coming Soon
              </h3>
              <p className="text-slate-600">
                This section is under development.
              </p>
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
