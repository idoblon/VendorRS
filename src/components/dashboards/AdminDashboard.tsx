import React, { useState, useEffect } from "react";
import {
  Users,
  Building,
  DollarSign,
  TrendingUp,
  Bell,
  Search,
  Filter,
  Plus,
  LogOut,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Store,
  MapPin,
  Trash2,
  Pause,
  AlertTriangle,
  X,
  MessageCircle,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ApplicationsComponent } from "./ApplicationsComponent";
import axiosInstance from "../../utils/axios";
import { User } from "../../types/index";
import { MessageBox } from "../ui/MessageBox";
import { getUnreadCount } from "../../utils/messageApi";

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

interface Vendor {
  _id: string;
  businessName: string;
  email: string;
  status: string;
  commission?: number;
  name?: string;
  phone?: string;
  address?: string;
  district?: string;
  createdAt?: string;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountHolderName: string;
  };
  contactPersons?: Array<{
    name: string;
    phone: string;
    email: string;
  }>;
}

interface DistributionCenter {
  _id: string;
  name: string;
  location: string;
  status: string;
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [distributionCenters, setDistributionCenters] = useState<
    DistributionCenter[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showCenterModal, setShowCenterModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [totalVendorsCount, setTotalVendorsCount] = useState(0);
  const [activeCentersCount, setActiveCentersCount] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Add new state for vendor details modal
  const [showVendorDetails, setShowVendorDetails] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Add new state for center details modal
  const [showCenterDetails, setShowCenterDetails] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<DistributionCenter | null>(null);

  // Add MessageBox state
  const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Mock data for fallback
  const mockVendors: Vendor[] = [
    {
      _id: "1",
      businessName: "ABC Trading Co.",
      email: "abc@trading.com",
      status: "approved",
      commission: 1500,
    },
    {
      _id: "2",
      businessName: "XYZ Suppliers",
      email: "xyz@suppliers.com",
      status: "pending",
      commission: 0,
    },
  ];

  const mockDistributionCenters: DistributionCenter[] = [
    {
      _id: "1",
      name: "Central Distribution Hub",
      location: "Kathmandu, Bagmati",
      status: "active",
    },
    {
      _id: "2",
      name: "Eastern Regional Center",
      location: "Biratnagar, Koshi",
      status: "active",
    },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch vendors with increased limit
      const vendorResponse = await axiosInstance.get("/api/users/vendors", {
        params: {
          limit: 100, // Increase limit to see all vendors
          page: 1,
        },
      });
      console.log("Vendor API response:", vendorResponse.data);

      if (vendorResponse.data.success && vendorResponse.data.data?.vendors) {
        const vendorData = vendorResponse.data.data.vendors;
        setVendors(vendorData);
        setTotalVendorsCount(vendorData.length);

        // Calculate total commission from approved vendors
        const approvedVendors = vendorData.filter(
          (v: Vendor) => v.status === "APPROVED" // Keep this as APPROVED
        );
        const commission = approvedVendors.reduce(
          (sum: number, vendor: Vendor) => {
            return sum + (vendor.commission || 0);
          },
          0
        );
        setTotalCommission(commission);
      } else {
        console.warn("Using mock vendor data due to API response structure");
        setVendors(mockVendors);
        setTotalVendorsCount(mockVendors.length);
        setTotalCommission(1500);
      }

      // Fetch distribution centers with increased limit
      try {
        const centerResponse = await axiosInstance.get("/api/users/centers", {
          params: {
            limit: 100, // Increase limit to see all centers
            page: 1,
          },
        });
        if (centerResponse.data.success && centerResponse.data.data?.centers) {
          const centerData = centerResponse.data.data.centers;
          setDistributionCenters(centerData);
          // FIX: Change from "active" to "APPROVED" to match database
          const activeCenters = centerData.filter(
            (c: DistributionCenter) => c.status === "APPROVED"
          );
          setActiveCentersCount(activeCenters.length);
        } else {
          setDistributionCenters(mockDistributionCenters);
          setActiveCentersCount(mockDistributionCenters.length);
        }
      } catch (centerError) {
        console.warn("Using mock center data:", centerError);
        setDistributionCenters(mockDistributionCenters);
        setActiveCentersCount(mockDistributionCenters.length);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("Failed to load dashboard data. Using sample data.");

      // Use mock data as fallback
      setVendors(mockVendors);
      setDistributionCenters(mockDistributionCenters);
      setTotalVendorsCount(mockVendors.length);
      setActiveCentersCount(mockDistributionCenters.length);
      setTotalCommission(1500);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axiosInstance.get("/api/notifications", {
        params: { limit: 10 },
      });
      if (response.data.success) {
        setNotifications(response.data.data.notifications);
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await axiosInstance.put("/api/notifications/read-all");
      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await axiosInstance.put(
        `/api/notifications/${notificationId}/read`
      );
      if (response.data.success) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notificationId ? { ...notif, isRead: true } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    fetchData();
    fetchNotifications();
  }, []);

  // Add useEffect to fetch unread message count
  useEffect(() => {
    const fetchUnreadMessageCount = async () => {
      try {
        const count = await getUnreadCount();
        setUnreadMessageCount(count);
      } catch (error) {
        console.error("Error fetching unread message count:", error);
      }
    };

    fetchUnreadMessageCount();
    // Set up interval to refresh count every 30 seconds
    const interval = setInterval(fetchUnreadMessageCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Add new handler functions for vendor and center actions
  const handleVendorAction = async (
    vendorId: string,
    action: "suspend" | "delete"
  ) => {
    try {
      setLoading(true);

      if (action === "suspend") {
        const response = await axiosInstance.put(
          `/api/users/vendors/${vendorId}/status`,
          {
            status: "SUSPENDED", // Use uppercase to match backend
          }
        );

        if (response.data.success) {
          setVendors((prev) =>
            prev.map((vendor) =>
              vendor._id === vendorId
                ? { ...vendor, status: "SUSPENDED" }
                : vendor
            )
          );
          alert("Vendor suspended successfully");
        }
      } else if (action === "delete") {
        if (
          window.confirm(
            "Are you sure you want to delete this vendor? This action cannot be undone."
          )
        ) {
          // Fix: Use the correct endpoint /api/users/:id instead of /api/users/vendors/:id
          const response = await axiosInstance.delete(`/api/users/${vendorId}`);

          if (response.data.success) {
            setVendors((prev) =>
              prev.filter((vendor) => vendor._id !== vendorId)
            );
            setTotalVendorsCount((prev) => prev - 1);
            alert("Vendor deleted successfully");
            // Close vendor details modal if it's open for the deleted vendor
            if (selectedVendor && selectedVendor._id === vendorId) {
              setShowVendorDetails(false);
              setSelectedVendor(null);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Failed to ${action} vendor:`, error);
      alert(`Failed to ${action} vendor. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCenterAction = async (
    centerId: string,
    action: "suspend" | "delete"
  ) => {
    try {
      setLoading(true);

      if (action === "suspend") {
        const response = await axiosInstance.put(
          `/api/users/centers/${centerId}/status`,
          {
            status: "suspended",
          }
        );

        if (response.data.success) {
          setDistributionCenters((prev) =>
            prev.map((center) =>
              center._id === centerId
                ? { ...center, status: "suspended" }
                : center
            )
          );
          alert("Center suspended successfully");
        }
      } else if (action === "delete") {
        if (
          window.confirm(
            "Are you sure you want to delete this distribution center? This action cannot be undone."
          )
        ) {
          const response = await axiosInstance.delete(
            `/api/users/centers/${centerId}`
          );

          if (response.data.success) {
            setDistributionCenters((prev) =>
              prev.filter((center) => center._id !== centerId)
            );
            setActiveCentersCount((prev) => prev - 1);
            alert("Center deleted successfully");
          }
        }
      }
    } catch (error) {
      console.error(`Failed to ${action} center:`, error);
      alert(`Failed to ${action} center. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card
                className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setShowVendorModal(true)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Vendors
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {totalVendorsCount}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </Card>

              <Card
                className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setShowCenterModal(true)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Active Centers
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {activeCentersCount}
                    </p>
                  </div>
                  <Building className="h-8 w-8 text-green-600" />
                </div>
              </Card>

              <Card
                className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setShowCommissionModal(true)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      Total Commission
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      Rs. {totalCommission.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">
                    New vendor application approved
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    2 hours ago
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm">
                    Vendor application pending review
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    4 hours ago
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <Building className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">
                    New distribution center registered
                  </span>
                  <span className="text-xs text-gray-500 ml-auto">
                    1 day ago
                  </span>
                </div>
              </div>
            </Card>
          </div>
        );

      case "applications":
        return <ApplicationsComponent />;

      case "vendors":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Approved Vendors
              </h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors
                .filter((vendor) => vendor.status === "APPROVED") // Changed from "approved" to "APPROVED"
                .filter(
                  (vendor) =>
                    vendor.businessName
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    vendor.email
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                .map((vendor) => (
                  <Card
                    key={vendor._id}
                    className="p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <Store className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {vendor.businessName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {vendor.email}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          Commission:
                        </span>
                        <span className="font-medium text-gray-900">
                          Rs. {vendor.commission?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewVendor(vendor._id)}
                        className="flex-1 flex items-center justify-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleVendorAction(vendor._id, "suspend")
                        }
                        className="flex items-center justify-center space-x-1 text-yellow-600 hover:text-yellow-700 hover:border-yellow-300"
                      >
                        <Pause className="h-4 w-4" />
                        <span>Suspend</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVendorAction(vendor._id, "delete")}
                        className="flex items-center justify-center space-x-1 text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>

            {vendors.filter((vendor) => vendor.status === "APPROVED").length ===
              0 && ( // Also update this condition
              <Card className="p-8 text-center">
                <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Approved Vendors
                </h3>
                <p className="text-gray-600">
                  There are currently no approved vendors in the system.
                </p>
              </Card>
            )}
          </div>
        );

      case "centers":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Distribution Centers
              </h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search centers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {distributionCenters
                .filter((center) => center.status === "APPROVED")
                .filter(
                  (center) =>
                    center.name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    center.location
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase())
                )
                .map((center) => (
                  <Card
                    key={center._id}
                    className="p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Building className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {center.name}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {center.location}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCenter(center._id)}
                        className="flex-1 flex items-center justify-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleCenterAction(center._id, "suspend")
                        }
                        className="flex items-center justify-center space-x-1 text-yellow-600 hover:text-yellow-700 hover:border-yellow-300"
                      >
                        <Pause className="h-4 w-4" />
                        <span>Suspend</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCenterAction(center._id, "delete")}
                        className="flex items-center justify-center space-x-1 text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </Card>
                ))}
            </div>

            {distributionCenters.filter(
              (center) => center.status === "APPROVED"
            ).length === 0 && (
              <Card className="p-8 text-center">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Active Centers
                </h3>
                <p className="text-gray-600">
                  There are currently no active distribution centers in the
                  system.
                </p>
              </Card>
            )}
          </div>
        );

      default:
        return <div>Content for {activeTab}</div>;
    }
  };

  // Add handler for viewing vendor details
  const handleViewVendor = async (vendorId: string) => {
    try {
      setLoading(true);
      console.log("Fetching vendor details for ID:", vendorId);

      const response = await axiosInstance.get(
        `/api/users/vendors/${vendorId}`
      );

      console.log("Vendor details response:", response.data);

      if (response.data.success) {
        setSelectedVendor(response.data.data.vendor);
        setShowVendorDetails(true);
      } else {
        console.error("API returned success: false", response.data);
        alert("Failed to fetch vendor details");
      }
    } catch (error) {
      console.error("Failed to fetch vendor details:", error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error("Error response:", axiosError.response?.data);
        alert(
          `Failed to fetch vendor details: ${
            axiosError.response?.data?.message || "Unknown error"
          }`
        );
      } else {
        alert("Failed to fetch vendor details. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Notifications Button */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="flex items-center space-x-2 relative"
                >
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Notifications</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={markAllAsRead}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          Mark all read
                        </Button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              !notification.isRead ? "bg-blue-50" : ""
                            }`}
                            onClick={() => markAsRead(notification._id)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 mt-1">
                                {notification.type === "VENDOR_APPLICATION" && (
                                  <Users className="h-4 w-4 text-blue-600" />
                                )}
                                {notification.type === "CENTER_APPLICATION" && (
                                  <Building className="h-4 w-4 text-green-600" />
                                )}
                                {notification.type === "ORDER_UPDATE" && (
                                  <CheckCircle className="h-4 w-4 text-purple-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatTime(notification.createdAt)}
                                </p>
                              </div>
                              {!notification.isRead && (
                                <div className="flex-shrink-0">
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <span className="text-sm text-gray-600">
                Welcome, {user.businessName || user.name}
              </span>
              <Button
                onClick={onLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between">
            <div className="flex space-x-8">
              {[
                { id: "overview", label: "Overview", icon: TrendingUp },
                { id: "applications", label: "Applications", icon: Users },
                { id: "vendors", label: "Vendors", icon: Store },
                { id: "centers", label: "Centers", icon: Building },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Messages Button positioned next to Centers */}
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsMessageBoxOpen(true)}
                className="flex items-center space-x-2 relative"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Messages</span>
                {unreadMessageCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                  </span>
                )}
              </Button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p className="text-yellow-800">{error}</p>
          </div>
        )}
        {renderTabContent()}
      </main>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        ></div>
      )}

      {/* Modal Renderings */}
      {showVendorModal && renderVendorModal()}
      {showCenterModal && renderCenterModal()}
      {showCommissionModal && renderCommissionModal()}
      {showVendorDetails && renderVendorDetailsModal()}

      {/* MessageBox Component */}
      <MessageBox
        isOpen={isMessageBoxOpen}
        onClose={() => {
          setIsMessageBoxOpen(false);
          // Refresh unread count when closing
          getUnreadCount().then(setUnreadMessageCount).catch(console.error);
        }}
      />
+      {showCenterDetails && renderCenterDetailsModal()}
    </div>
  );

  // Modal rendering functions
  function renderVendorModal() {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Total Vendors Overview
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVendorModal(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">
                Total Registered Vendors
              </p>
              <p className="text-3xl font-bold text-blue-900">
                {totalVendorsCount}
              </p>
              <p className="text-sm text-blue-600 mt-1">Active in the system</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Approved Vendors
                </h4>
                <p className="text-xl font-bold text-green-600">
                  {vendors.filter((v) => v.status === "APPROVED").length}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Pending Approval
                </h4>
                <p className="text-xl font-bold text-yellow-600">
                  {vendors.filter((v) => v.status === "PENDING").length}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Suspended</h4>
                <p className="text-xl font-bold text-red-600">
                  {vendors.filter((v) => v.status === "SUSPENDED").length}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Recent Vendors</h4>
              {vendors.slice(0, 5).map((vendor, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {vendor.businessName}
                    </p>
                    <p className="text-sm text-gray-600">{vendor.email}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        vendor.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : vendor.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {vendor.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
+
+  function renderCenterDetailsModal() {
+    if (!selectedCenter) return null;
+
+    return (
+      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
+        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
+          <div className="flex items-center justify-between mb-6">
+            <h2 className="text-2xl font-bold text-gray-900">
+              Distribution Center Details
+            </h2>
+            <Button
+              variant="ghost"
+              size="sm"
+              onClick={() => {
+                setShowCenterDetails(false);
+                setSelectedCenter(null);
+              }}
+            >
+              <X className="h-4 w-4" />
+            </Button>
+          </div>
+
+          <div className="space-y-4">
+            <div>
+              <label className="text-sm font-medium text-gray-600">Name</label>
+              <p className="text-gray-900 font-medium">{selectedCenter.name}</p>
+            </div>
+            <div>
+              <label className="text-sm font-medium text-gray-600">Location</label>
+              <p className="text-gray-900">{selectedCenter.location}</p>
+            </div>
+            <div>
+              <label className="text-sm font-medium text-gray-600">Status</label>
+              <p className="text-gray-900">{selectedCenter.status}</p>
+            </div>
+          </div>
+        </div>
+      </div>
+    );
+  }

  function renderCenterModal() {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Distribution Centers Overview
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCenterModal(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">
                Active Distribution Centers
              </p>
              <p className="text-3xl font-bold text-green-900">
                {activeCentersCount}
              </p>
              <p className="text-sm text-green-600 mt-1">
                Currently operational
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Active Centers
                </h4>
                <p className="text-xl font-bold text-green-600">
                  {
                    distributionCenters.filter((c) => c.status === "APPROVED")
                      .length
                  }
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Under Maintenance
                </h4>
                <p className="text-xl font-bold text-yellow-600">
                  {
                    distributionCenters.filter(
                      (c) => c.status === "maintenance"
                    ).length
                  }
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Coverage Areas
                </h4>
                <p className="text-xl font-bold text-blue-600">
                  {
                    new Set(
                      distributionCenters.map((c) =>
                        c.location.split(",")[1]?.trim()
                      )
                    ).size
                  }{" "}
                  Provinces
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">
                Distribution Centers
              </h4>
              {distributionCenters.map((center, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{center.name}</p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {center.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        center.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {center.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderVendorDetailsModal() {
    if (!selectedVendor) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Vendor Details
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowVendorDetails(false);
                setSelectedVendor(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Basic Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Business Name
                  </label>
                  <p className="text-gray-900 font-medium">
                    {selectedVendor.businessName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Email
                  </label>
                  <p className="text-gray-900">{selectedVendor.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Status
                  </label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {selectedVendor.status}
                  </span>
                </div>
                {selectedVendor.name && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Contact Name
                    </label>
                    <p className="text-gray-900">{selectedVendor.name}</p>
                  </div>
                )}
                {selectedVendor.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Phone
                    </label>
                    <p className="text-gray-900">{selectedVendor.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Address Information
              </h3>
              <div className="space-y-3">
                {selectedVendor.address && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Address
                    </label>
                    <p className="text-gray-900">{selectedVendor.address}</p>
                  </div>
                )}
                {selectedVendor.district && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      District
                    </label>
                    <p className="text-gray-900">{selectedVendor.district}</p>
                  </div>
                )}
                {selectedVendor.commission !== undefined && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Commission Earned
                    </label>
                    <p className="text-gray-900 font-bold">
                      Rs. {selectedVendor.commission.toLocaleString()}
                    </p>
                  </div>
                )}
                {selectedVendor.createdAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Registered On
                    </label>
                    <p className="text-gray-900">
                      {new Date(selectedVendor.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bank Details */}
          {selectedVendor.bankDetails && (
            <div className="mt-6 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                Bank Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Bank Name
                  </label>
                  <p className="text-gray-900">
                    {selectedVendor.bankDetails.bankName}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Account Number
                  </label>
                  <p className="text-gray-900">
                    {selectedVendor.bankDetails.accountNumber}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Account Holder
                  </label>
                  <p className="text-gray-900">
                    {selectedVendor.bankDetails.accountHolderName}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Contact Persons */}
          {selectedVendor.contactPersons &&
            selectedVendor.contactPersons.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Contact Persons
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedVendor.contactPersons.map((person, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      <div className="space-y-2">
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Name
                          </label>
                          <p className="text-gray-900">{person.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Phone
                          </label>
                          <p className="text-gray-900">{person.phone}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Email
                          </label>
                          <p className="text-gray-900">{person.email}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Action Buttons */}
          <div className="mt-6 flex space-x-4 justify-end">
            <Button
              variant="outline"
              onClick={() => handleVendorAction(selectedVendor._id, "suspend")}
              className="text-yellow-600 hover:text-yellow-700 hover:border-yellow-300"
            >
              <Pause className="h-4 w-4 mr-2" />
              Suspend Vendor
            </Button>
            <Button
              variant="outline"
              onClick={() => handleVendorAction(selectedVendor._id, "delete")}
              className="text-red-600 hover:text-red-700 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Vendor
            </Button>
          </div>
        </div>
      </div>
    );
  }

  function renderCommissionModal() {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Commission Revenue Overview
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCommissionModal(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">
                Total Commission Collected
              </p>
              <p className="text-3xl font-bold text-purple-900">
                Rs. {totalCommission.toLocaleString()}
              </p>
              <p className="text-sm text-purple-600 mt-1">
                From approved vendors
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Commission Rate
                </h4>
                <p className="text-xl font-bold text-gray-900">5%</p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">This Month</h4>
                <p className="text-xl font-bold text-gray-900">
                  Rs. {Math.round(totalCommission * 0.15).toLocaleString()}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Active Contributors
                </h4>
                <p className="text-xl font-bold text-gray-900">
                  {
                    vendors.filter(
                      (v) => v.status === "APPROVED" && (v.commission || 0) > 0
                    ).length
                  }
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">
                Top Contributing Vendors
              </h4>
              {vendors
                .filter((v) => (v.commission || 0) > 0)
                .sort((a, b) => (b.commission || 0) - (a.commission || 0))
                .slice(0, 5)
                .map((vendor, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {vendor.businessName}
                      </p>
                      <p className="text-sm text-gray-600">{vendor.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">
                        Rs. {vendor.commission?.toLocaleString() || 0}
                        </p>
                      <p className="text-sm text-gray-500">Commission paid</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default AdminDashboard;
