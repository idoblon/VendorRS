import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Building,
  ShoppingCart,
  CreditCard,
  BarChart3,
  TrendingUp,
  DollarSign,
  Plus,
  Edit,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Activity,
  Database,
  Server,
  Wifi,
  Shield,
  Search,
  Eye,
} from "lucide-react";
import { DashboardLayout } from "../layout/DashboardLayout";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { User, Vendor, VendorStatus } from "../../types";
import { toast } from "../ui/Toaster";
import axiosInstance from "../../utils/axios";

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
  status: "active" | "inactive" | "maintenance";
  capacity: number;
  currentOrders: number;
  establishedDate: string;
  region: string;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [actionNotes, setActionNotes] = useState("");

  // Mock data for distribution centers (pre-established by admin)
  const mockCenters: DistributionCenter[] = [
    {
      id: "center-1",
      name: "Kapan Distribution Center",
      location: "Kathmandu",
      address: "Kapan, Baluwakhani",
      contactPerson: "Rajesh Kumar",
      email: "center1@example.com",
      phone: "+977 9876543210",
      status: "active",
      capacity: 1000,
      currentOrders: 245,
      establishedDate: "2023-01-15",
      region: "Nepal",
    },
    {
      id: "center-2",
      name: "Lalitpur Distribution Center",
      location: "Lalitpur",
      address: "Lalitpur, Lagankhel",
      contactPerson: "Priya Sharma",
      email: "mumbai@vrs.com",
      phone: "+977 9876543211",
      status: "active",
      capacity: 1200,
      currentOrders: 189,
      establishedDate: "2023-02-20",
      region: "Central Nepal",
    },
    {
      id: "center-3",
      name: "Dang Tech Hub",
      location: "Dang",
      address: "Dang, Roksol",
      contactPerson: "Amit Shahi",
      email: "dangtechhub@vrs.com",
      phone: "+977 9876543212",
      status: "maintenance",
      capacity: 800,
      currentOrders: 67,
      establishedDate: "2023-03-10",
      region: "Western Nepal",
    },
    {
      id: "center-4",
      name: "Jhapa Operations",
      location: "Jhapa",
      address: "Jhapa, Birtamod",
      contactPerson: "Lakshmi Adhikari",
      email: "opeationjhapa@vrs.com",
      phone: "+977 9876543213",
      status: "active",
      capacity: 900,
      currentOrders: 156,
      establishedDate: "2023-04-05",
      region: "East Neapl",
    },
    {
      id: "center-5",
      name: "Illam Tea",
      location: "Illam",
      address: "Illam, Kanyam",
      contactPerson: "Prem Rai",
      email: "illamtea@vrs.com",
      phone: "+977 9876543214",
      status: "inactive",
      capacity: 600,
      currentOrders: 0,
      establishedDate: "2023-05-12",
      region: "East Nepal",
    },
    {
      id: "center-6",
      name: "Bhaktapur Distribution Center",
      location: "Bhaktapur",
      address: "Bhaktapur, Jochey",
      contactPerson: "Prem Rai",
      email: "bktpur@vrs.com",
      phone: "+977 9876543214",
      status: "active",
      capacity: 600,
      currentOrders: 0,
      establishedDate: "2023-05-12",
      region: "Central Nepal",
    },
    {
      id: "center-7",
      name: "Gulmi Coffee",
      location: "Gulim",
      address: "Gulmi, Resunga",
      contactPerson: "Hirak Raj",
      email: "gulmicoffee@vrs.com",
      phone: "+977 9876543214",
      status: "active",
      capacity: 600,
      currentOrders: 0,
      establishedDate: "2023-05-12",
      region: "Western Nepal",
    },
    {
      id: "center-8",
      name: "Pokhara Electronics",
      location: "Pokhara",
      address: "Pokhara, Lakeside",
      contactPerson: "Rajesh Kumar",
      email: "pokhara@vrs.com",
      phone: "+977 9876543214",
      status: "active",
      capacity: 600,
      currentOrders: 0,
      establishedDate: "2023-05-12",
      region: "Western Nepal",
    },
    {
      id: "center-9",
      name: "Biratnagar Electronics",
      location: "Biratnagar",
      address: "Biratnagar, Birtamod",
      contactPerson: "Rajesh Kumar",
      email: "biratnagar@vrs.com",
      phone: "+977 9876543214",
      status: "active",
      capacity: 600,
      currentOrders: 0,
      establishedDate: "2023-05-12",
      region: "East Nepal",
    },
    {
      id: "center-10",
      name: "Dharan Loktantra",
      location: "Dharan",
      address: "Dharan, Gurkhachowk",
      contactPerson: "Seti Rai",
      email: "loktantra@vrs.com",
      phone: "+977 9876543214",
      status: "active",
      capacity: 600,
      currentOrders: 0,
      establishedDate: "2023-05-12",
      region: "East Nepal",
    },
  ];

  // Mock data removed - using real API data instead

  // Mock data removed - using real API data instead

  // Fetch vendors from the backend
  const fetchVendors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get("/api/users/vendors");
      if (response.data.success) {
        setVendors(response.data.data.vendors);
      } else {
        setError(response.data.message || "Failed to fetch vendors");
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while fetching vendors"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Load vendors when component mounts or when activeTab changes to vendors or dashboard
  useEffect(() => {
    if (activeTab === "vendors" || activeTab === "dashboard") {
      fetchVendors();
    }
  }, [activeTab]);

  const handleVendorAction = async (
    vendorId: string,
    action: "approve" | "reject" | "suspend" | "reactivate",
    notes?: string
  ) => {
    const statusMap = {
      approve: "APPROVED",
      reject: "REJECTED",
      suspend: "SUSPENDED",
      reactivate: "APPROVED",
    };

    const actionMessages = {
      approve:
        "Vendor approved successfully. A notification has been sent to the vendor.",
      reject:
        "Vendor application rejected. A notification has been sent to the vendor.",
      suspend:
        "Vendor account suspended. A notification has been sent to the vendor.",
      reactivate:
        "Vendor account reactivated. A notification has been sent to the vendor.",
    };

    try {
      console.log('Making vendor status update request:', {
        vendorId,
        action,
        status: statusMap[action],
        notes: notes || "",
      });
      
      // Make API call to update vendor status
      const response = await axiosInstance.put(
        `/api/users/vendors/${vendorId}/status`,
        {
          status: statusMap[action],
          notes: notes || "",
        }
      );

      if (response.data.success) {
        toast.success(actionMessages[action]);

        // Refresh the vendor list after successful action
        fetchVendors();
      } else {
        toast.error(response.data.message || "Failed to update vendor status");
      }
    } catch (error) {
      console.error("Error updating vendor status:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while updating vendor status"
      );
    }
  };

  const handleCenterAction = (
    centerId: string,
    action: "activate" | "deactivate" | "maintenance" | "delete"
  ) => {
    const actionMessages = {
      activate: "Distribution center activated",
      deactivate: "Distribution center deactivated",
      maintenance: "Distribution center set to maintenance mode",
      delete: "Distribution center deleted",
    };

    toast.success(actionMessages[action]);
  };

  const stats = [
    {
      label: "Total Vendors",
      value: "48",
      icon: Building,
      color: "blue",
      change: "+12%",
      description: "Active vendors",
    },
    {
      label: "Distribution Centers",
      value: "5",
      icon: Users,
      color: "green",
      change: "+1",
      description: "Operational centers",
    },
    {
      label: "System Revenue",
      value: "₹24.5M",
      icon: DollarSign,
      color: "yellow",
      change: "+22%",
      description: "Total processed",
    },
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
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { id: "system-health", label: "System Health", icon: Activity },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-r-2 border-blue-600"
                    : "text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-slate-900"
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
            { id: "vendors", label: "Vendors", icon: Building },
            { id: "centers", label: "Distribution Centers", icon: Users },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-r-2 border-blue-600"
                    : "text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-slate-900"
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
            { id: "reports", label: "Reports & Analytics", icon: BarChart3 },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-r-2 border-blue-600"
                    : "text-slate-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-slate-900"
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
          <div className="space-y-6 bg-gradient-to-br from-blue-50/30 to-indigo-50/30 min-h-screen -m-6 p-6">
            {/* Page Title */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-xl shadow-lg">
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-blue-100 mt-2">
                System overview and management console
              </p>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={stat.label}
                    className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-blue-50/50 border-blue-200"
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
                          <TrendingUp className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium ml-1 text-emerald-600">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Vendor Approvals */}
              <Card className="bg-gradient-to-br from-white to-amber-50/50 border-amber-200 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Pending Vendor Approvals
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("vendors")}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Loading vendors...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-4">
                      <p className="text-red-500">{error}</p>
                    </div>
                  ) : vendors.filter((v) => v.status === VendorStatus.PENDING)
                      .length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">
                        No pending vendor applications
                      </p>
                    </div>
                  ) : (
                    vendors
                      .filter((v) => v.status === VendorStatus.PENDING)
                      .map((vendor) => (
                        <Card
                          key={vendor.id}
                          className="hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4"
                        >
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="space-y-3 flex-1">
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                  {vendor.businessName}
                                </h3>
                                <p className="text-sm text-slate-600 flex items-center mt-1">
                                  <Building className="h-4 w-4 mr-1" />
                                  {vendor.name}
                                </p>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-slate-500">
                                    Contact Information
                                  </p>
                                  <p className="font-medium text-slate-900">
                                    {vendor.email}
                                  </p>
                                  <p className="font-medium text-slate-900">
                                    {vendor.phone}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-slate-500">
                                    Business Details
                                  </p>
                                  <p className="font-medium text-slate-900">
                                    PAN: {vendor.panNumber}
                                  </p>
                                  <p className="font-medium text-slate-900">
                                    GST: {vendor.gstNumber}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <p className="text-slate-500">Address</p>
                                <p className="font-medium text-slate-900">
                                  {vendor.address}
                                </p>
                              </div>

                              <div>
                                <p className="text-slate-500">Bank Details</p>
                                <p className="font-medium text-slate-900">
                                  {vendor.bankDetails?.bankName || 'Not provided'}
                                </p>
                              </div>

                              <div>
                                <p className="text-slate-500">
                                  Application Date
                                </p>
                                <p className="font-medium text-slate-900">
                                  {new Date(
                                    vendor.joinedDate
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openVendorModal(vendor)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View Details
                              </Button>
                              <span
                                className={`px-3 py-1 text-sm font-medium rounded-full ${
                                  vendor.status === VendorStatus.APPROVED
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : vendor.status === VendorStatus.PENDING
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : vendor.status === VendorStatus.SUSPENDED
                                    ? "bg-gray-100 text-gray-800 border border-gray-200"
                                    : "bg-red-100 text-red-800 border border-red-200"
                                }`}
                              >
                                {vendor.status}
                              </span>
                            </div>
                          </div>
                        </Card>
                      ))
                  )}
                </div>
              </Card>

              {/* Distribution Center Status */}
              <Card className="bg-gradient-to-br from-white to-green-50/50 border-green-200 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Distribution Centers
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab("centers")}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    Manage All
                  </Button>
                </div>
                <div className="space-y-4">
                  {mockCenters.slice(0, 3).map((center) => (
                    <div
                      key={center.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            center.status === "active"
                              ? "bg-emerald-400"
                              : center.status === "maintenance"
                              ? "bg-amber-400"
                              : "bg-red-400"
                          }`}
                        ></div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {center.name}
                          </p>
                          <p className="text-sm text-slate-600">
                            {center.location}
                          </p>
                          <p className="text-sm text-slate-500">
                            {center.currentOrders}/{center.capacity} orders
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          center.status === "active"
                            ? "bg-emerald-100 text-emerald-800"
                            : center.status === "maintenance"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
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
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  System Health
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center space-x-3">
                      <Database className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-medium text-slate-900">
                        Database
                      </span>
                    </div>
                    <span className="text-sm font-medium text-emerald-600">
                      Healthy
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center space-x-3">
                      <Server className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-medium text-slate-900">
                        API Server
                      </span>
                    </div>
                    <span className="text-sm font-medium text-emerald-600">
                      Running
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-amber-600" />
                      <span className="text-sm font-medium text-slate-900">
                        Payment Gateway
                      </span>
                    </div>
                    <span className="text-sm font-medium text-amber-600">
                      Warning
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-200">
                    <div className="flex items-center space-x-3">
                      <Wifi className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-medium text-slate-900">
                        Network
                      </span>
                    </div>
                    <span className="text-sm font-medium text-emerald-600">
                      Stable
                    </span>
                  </div>
                </div>
              </Card>

              {/* Quick Actions card removed as requested */}
            </div>
          </div>
        );

      case "centers":
        return (
          <div className="space-y-6 bg-gradient-to-br from-green-50/30 to-emerald-50/30 min-h-screen -m-6 p-6">
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-6 rounded-xl shadow-lg">
              <h1 className="text-3xl font-bold">Distribution Centers</h1>
              <p className="text-green-100 mt-2">
                Manage pre-established distribution centers
              </p>
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
              <Button
                icon={Plus}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 border-0"
              >
                Add New Center
              </Button>
            </div>

            {/* Centers Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockCenters.map((center) => (
                <Card
                  key={center.id}
                  className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-green-50/50 border-green-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {center.name}
                      </h3>
                      <p className="text-sm text-slate-600 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {center.location}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        center.status === "active"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : center.status === "maintenance"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                    >
                      {center.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Contact Person</p>
                        <p className="font-medium text-slate-900">
                          {center.contactPerson}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Region</p>
                        <p className="font-medium text-slate-900">
                          {center.region}
                        </p>
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
                        <span className="text-sm font-medium text-slate-700">
                          Capacity Utilization
                        </span>
                        <span className="text-sm font-bold text-slate-900">
                          {center.currentOrders}/{center.capacity}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (center.currentOrders / center.capacity) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {Math.round(
                          (center.currentOrders / center.capacity) * 100
                        )}
                        % utilized
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
                    {center.status === "inactive" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleCenterAction(center.id, "activate")
                        }
                        className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border-0"
                      >
                        Activate
                      </Button>
                    )}
                    {center.status === "active" && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() =>
                            handleCenterAction(center.id, "maintenance")
                          }
                          className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 border-0"
                        >
                          Maintenance
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() =>
                            handleCenterAction(center.id, "deactivate")
                          }
                          className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 border-0"
                        >
                          Deactivate
                        </Button>
                      </>
                    )}
                    {center.status === "maintenance" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleCenterAction(center.id, "activate")
                        }
                        className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border-0"
                      >
                        Reactivate
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Edit}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={Eye}
                      className="text-slate-600 hover:text-slate-700 hover:bg-slate-50"
                    >
                      Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case "system-health":
        return (
          <div className="space-y-6 bg-gradient-to-br from-slate-50/30 to-gray-50/30 min-h-screen -m-6 p-6">
            <div className="bg-gradient-to-r from-slate-600 to-gray-700 text-white p-6 rounded-xl shadow-lg">
              <h1 className="text-3xl font-bold">System Health</h1>
              <p className="text-slate-100 mt-2">
                Monitor system performance and infrastructure
              </p>
            </div>

            {/* System Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  name: "Database",
                  status: "healthy",
                  uptime: "99.9%",
                  icon: Database,
                  color: "emerald",
                },
                {
                  name: "API Server",
                  status: "running",
                  uptime: "99.8%",
                  icon: Server,
                  color: "blue",
                },
                {
                  name: "Payment Gateway",
                  status: "warning",
                  uptime: "98.5%",
                  icon: Shield,
                  color: "amber",
                },
                {
                  name: "Network",
                  status: "stable",
                  uptime: "99.7%",
                  icon: Wifi,
                  color: "green",
                },
              ].map((service) => {
                const Icon = service.icon;
                return (
                  <Card
                    key={service.name}
                    className="hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`p-2 rounded-full bg-${service.color}-100`}
                      >
                        <Icon className={`h-5 w-5 text-${service.color}-600`} />
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          service.status === "healthy" ||
                          service.status === "running" ||
                          service.status === "stable"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {service.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-slate-900">
                      {service.name}
                    </h3>
                    <p className="text-sm text-slate-600">
                      Uptime: {service.uptime}
                    </p>
                  </Card>
                );
              })}
            </div>

            {/* Detailed System Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Performance Metrics
                </h3>
                <div className="space-y-4">
                  {[
                    { metric: "Response Time", value: "245ms", status: "good" },
                    { metric: "CPU Usage", value: "34%", status: "good" },
                    { metric: "Memory Usage", value: "67%", status: "warning" },
                    { metric: "Disk Usage", value: "23%", status: "good" },
                    { metric: "Active Users", value: "1,247", status: "good" },
                    { metric: "Error Rate", value: "0.02%", status: "good" },
                  ].map((item) => (
                    <div
                      key={item.metric}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <span className="text-sm font-medium text-slate-700">
                        {item.metric}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900">
                          {item.value}
                        </span>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            item.status === "good"
                              ? "bg-emerald-400"
                              : "bg-amber-400"
                          }`}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Recent System Events
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      time: "10:30 AM",
                      event: "Database backup completed",
                      type: "success",
                    },
                    {
                      time: "09:45 AM",
                      event: "Payment gateway maintenance started",
                      type: "warning",
                    },
                    {
                      time: "09:15 AM",
                      event: "New vendor registration: Kumar Electronics",
                      type: "info",
                    },
                    {
                      time: "08:30 AM",
                      event: "System health check passed",
                      type: "success",
                    },
                    {
                      time: "08:00 AM",
                      event: "Daily report generated",
                      type: "info",
                    },
                  ].map((event, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          event.type === "success"
                            ? "bg-emerald-400"
                            : event.type === "warning"
                            ? "bg-amber-400"
                            : "bg-blue-400"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">
                          {event.event}
                        </p>
                        <p className="text-xs text-slate-500">{event.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        );

      case "vendors":
        return (
          <div className="space-y-6 bg-gradient-to-br from-amber-50/30 to-orange-50/30 min-h-screen -m-6 p-6">
            <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white p-6 rounded-xl shadow-lg">
              <h1 className="text-3xl font-bold">Vendor Management</h1>
              <p className="text-amber-100 mt-2">
                Review and manage vendor applications and accounts
              </p>
            </div>

            {/* Vendor Management Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>

            {/* Pending Applications Section */}
            <Card className="bg-gradient-to-br from-white to-amber-50/50 border-amber-200 shadow-lg mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Pending Vendor Applications
                </h2>
              </div>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Loading vendors...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-4">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : vendors.filter((v) => v.status === VendorStatus.PENDING)
                    .length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">
                      No pending vendor applications
                    </p>
                  </div>
                ) : (
                  vendors
                    .filter((v) => v.status === VendorStatus.PENDING)
                    .map((vendor) => (
                      <Card
                        key={vendor.id}
                        className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-amber-50/50 border-amber-200 p-4"
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900">
                                {vendor.businessName}
                              </h3>
                              <p className="text-sm text-slate-600 flex items-center mt-1">
                                <Building className="h-4 w-4 mr-1" />
                                {vendor.name}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-slate-500">
                                  Contact Information
                                </p>
                                <p className="font-medium text-slate-900">
                                  {vendor.email}
                                </p>
                                <p className="font-medium text-slate-900">
                                  {vendor.phone}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500">
                                  Business Details
                                </p>
                                <p className="font-medium text-slate-900">
                                  PAN: {vendor.panNumber}
                                </p>
                                <p className="font-medium text-slate-900">
                                  GST: {vendor.gstNumber}
                                </p>
                              </div>
                            </div>

                            <div>
                              <p className="text-slate-500">Address</p>
                              <p className="font-medium text-slate-900">
                                {vendor.address}
                              </p>
                            </div>

                            <div>
                              <p className="text-slate-500">Bank Details</p>
                              <p className="font-medium text-slate-900">
                                {vendor.bankDetails?.bankName || 'Not provided'}
                              </p>
                            </div>

                            <div>
                              <p className="text-slate-500">Application Date</p>
                              <p className="font-medium text-slate-900">
                                {new Date(
                                  vendor.joinedDate
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openVendorModal(vendor)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            <span
                              className={`px-3 py-1 text-sm font-medium rounded-full ${
                                vendor.status === VendorStatus.APPROVED
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : vendor.status === VendorStatus.PENDING
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : vendor.status === VendorStatus.SUSPENDED
                                  ? "bg-gray-100 text-gray-800 border border-gray-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                              }`}
                            >
                              {vendor.status}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))
                )}
              </div>
            </Card>

            {/* All Vendors Section */}
            <Card className="bg-gradient-to-br from-white to-blue-50/50 border-blue-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  All Vendors
                </h2>
              </div>
              <div className="space-y-4">
                {isLoading ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Loading vendors...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-4">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : vendors
                    .filter(
                      (v) => filterStatus === "all" || v.status === filterStatus
                    )
                    .filter(
                      (v) =>
                        v.businessName
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        v.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        v.email.toLowerCase().includes(searchTerm.toLowerCase())
                    ).length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No vendors found</p>
                  </div>
                ) : (
                  vendors
                    .filter(
                      (v) => filterStatus === "all" || v.status === filterStatus
                    )
                    .filter(
                      (v) =>
                        v.businessName
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        v.name
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()) ||
                        v.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((vendor) => (
                      <Card
                        key={vendor.id}
                        className={`hover:shadow-xl transition-all duration-300 p-4 ${
                          vendor.status === VendorStatus.APPROVED
                            ? "bg-gradient-to-br from-white to-green-50/50 border-green-200"
                            : vendor.status === VendorStatus.REJECTED
                            ? "bg-gradient-to-br from-white to-red-50/50 border-red-200"
                            : vendor.status === VendorStatus.SUSPENDED
                            ? "bg-gradient-to-br from-white to-gray-50/50 border-gray-200"
                            : "bg-gradient-to-br from-white to-amber-50/50 border-amber-200"
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            <div className="flex justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-slate-900">
                                  {vendor.businessName}
                                </h3>
                                <p className="text-sm text-slate-600 flex items-center mt-1">
                                  <Building className="h-4 w-4 mr-1" />
                                  {vendor.name}
                                </p>
                              </div>
                              <span
                                className={`px-3 py-1 text-sm font-medium rounded-full ${
                                  vendor.status === VendorStatus.APPROVED
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                    : vendor.status === VendorStatus.PENDING
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : vendor.status === VendorStatus.SUSPENDED
                                    ? "bg-gray-100 text-gray-800 border border-gray-200"
                                    : "bg-red-100 text-red-800 border border-red-200"
                                }`}
                              >
                                {vendor.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-slate-500">
                                  Contact Information
                                </p>
                                <p className="font-medium text-slate-900">
                                  {vendor.email}
                                </p>
                                <p className="font-medium text-slate-900">
                                  {vendor.phone}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-500">
                                  Business Details
                                </p>
                                <p className="font-medium text-slate-900">
                                  PAN: {vendor.panNumber}
                                </p>
                                <p className="font-medium text-slate-900">
                                  GST: {vendor.gstNumber}
                                </p>
                              </div>
                            </div>

                            <div>
                              <p className="text-slate-500">Address</p>
                              <p className="font-medium text-slate-900">
                                {vendor.address}
                              </p>
                            </div>

                            <div>
                              <p className="text-slate-500">Joined Date</p>
                              <p className="font-medium text-slate-900">
                                {new Date(
                                  vendor.joinedDate
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openVendorModal(vendor)}
                              className="text-slate-600 hover:text-slate-700 hover:bg-slate-50 flex items-center"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                )}
              </div>
            </Card>
          </div>
        );

      // Default case for other tabs
      default:
        return (
          <Card className="bg-gradient-to-br from-white to-blue-50/50 border-blue-200 shadow-lg">
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

  // Function to open vendor detail modal
  const openVendorModal = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setActionNotes("");
    setShowVendorModal(true);
  };

  // Function to close vendor detail modal
  const closeVendorModal = () => {
    setShowVendorModal(false);
    setSelectedVendor(null);
    setActionNotes("");
  };

  // Function to handle vendor action with notes
  const handleVendorActionWithNotes = (
    action: "approve" | "reject" | "suspend" | "reactivate"
  ) => {
    if (selectedVendor) {
      handleVendorAction(selectedVendor.id, action, actionNotes);
      closeVendorModal();

      // Refresh vendors list after action
      setTimeout(() => {
        fetchVendors();
      }, 1000);
    }
  };

  return (
    <DashboardLayout user={user} sidebar={sidebar} onLogout={onLogout}>
      {renderContent()}

      {/* Vendor Detail Modal */}
      {showVendorModal && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">
                  Vendor Application Details
                </h3>
                <button
                  onClick={closeVendorModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">
                    Business Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">Business Name</p>
                      <p className="font-medium text-slate-900">
                        {selectedVendor.businessName}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Owner/Manager</p>
                      <p className="font-medium text-slate-900">
                        {selectedVendor.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Status</p>
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full inline-block ${
                          selectedVendor.status === VendorStatus.APPROVED
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : selectedVendor.status === VendorStatus.PENDING
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : selectedVendor.status === VendorStatus.SUSPENDED
                            ? "bg-gray-100 text-gray-800 border border-gray-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {selectedVendor.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Application Date</p>
                      <p className="font-medium text-slate-900">
                        {new Date(
                          selectedVendor.joinedDate
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">
                    Contact Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">Email</p>
                      <p className="font-medium text-slate-900">
                        {selectedVendor.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Phone</p>
                      <p className="font-medium text-slate-900">
                        {selectedVendor.phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Address</p>
                      <p className="font-medium text-slate-900">
                        {selectedVendor.address}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">District</p>
                      <p className="font-medium text-slate-900">
                        {selectedVendor.district}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">
                    Business Details
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-slate-500">PAN Number</p>
                      <p className="font-medium text-slate-900">
                        {selectedVendor.panNumber}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">
                    Bank Details
                  </h4>
                  <div className="space-y-3">
                    {selectedVendor.bankDetails ? (
                      <>
                        <div>
                          <p className="text-sm text-slate-500">Bank Name</p>
                          <p className="font-medium text-slate-900">
                            {selectedVendor.bankDetails.bankName}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">
                            Account Number
                          </p>
                          <p className="font-medium text-slate-900">
                            {selectedVendor.bankDetails.accountNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">
                            Account Holder
                          </p>
                          <p className="font-medium text-slate-900">
                            {selectedVendor.bankDetails.holderName}
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-slate-500">No bank details provided</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedVendor.status === VendorStatus.PENDING && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">
                    Application Decision
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="notes"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Notes (will be included in notification to vendor)
                      </label>
                      <textarea
                        id="notes"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter any notes or feedback for the vendor..."
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="danger"
                        onClick={() => handleVendorActionWithNotes("reject")}
                        className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 border-0"
                      >
                        Reject Application
                      </Button>
                      <Button
                        onClick={() => handleVendorActionWithNotes("approve")}
                        className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border-0"
                      >
                        Approve Application
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {selectedVendor.status === VendorStatus.APPROVED && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">
                    Account Actions
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="notes"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Notes (will be included in notification to vendor)
                      </label>
                      <textarea
                        id="notes"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter reason for suspension..."
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="danger"
                        onClick={() => handleVendorActionWithNotes("suspend")}
                        className="bg-gradient-to-r from-gray-500 to-slate-600 hover:from-gray-600 hover:to-slate-700 border-0"
                      >
                        Suspend Account
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {selectedVendor.status === VendorStatus.SUSPENDED && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-slate-900 mb-4 border-b pb-2">
                    Account Actions
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="notes"
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Notes (will be included in notification to vendor)
                      </label>
                      <textarea
                        id="notes"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter reason for reactivation..."
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                      ></textarea>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        onClick={() =>
                          handleVendorActionWithNotes("reactivate")
                        }
                        className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 border-0"
                      >
                        Reactivate Account
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
