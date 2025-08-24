import { useState, useEffect } from "react";
import {
  Bell,
  Menu,
  User,
  X,
  MessageCircle,
  LayoutDashboard,
  Users,
  Building,
  FileText,
  Search,
  Eye,
  Filter,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axios";
import { formatTime } from "../../utils/pageTitle";
import { MessageBox } from "../ui/MessageBox";
import { getUnreadCount } from "../../utils/messageApi";
import { VendorStatus } from "../../types/index";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  createdAt: string;
};

type DashboardLayoutProps = {
  children: React.ReactNode;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
};

export function DashboardLayout({
  children,
  activeSection = "overview",
  onSectionChange,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminProfile, setAdminProfile] = useState<any>(null);

  const [isMessageBoxOpen, setIsMessageBoxOpen] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [isVendorListOpen, setIsVendorListOpen] = useState(false);
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [vendorStatusFilter, setVendorStatusFilter] = useState("all");

  // Add these center-related state variables
  const [isCenterListOpen, setIsCenterListOpen] = useState(false);
  const [centerSearchTerm, setCenterSearchTerm] = useState("");
  const [centerStatusFilter, setCenterStatusFilter] = useState("all");

  // Add detail modal states
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [selectedCenter, setSelectedCenter] = useState<any>(null);
  const [isVendorDetailOpen, setIsVendorDetailOpen] = useState(false);
  const [isCenterDetailOpen, setIsCenterDetailOpen] = useState(false);

  const navigate = useNavigate();

  // Add these functions after the navigate declaration
  const handleVendorAction = async (
    vendorId: string,
    action: "approve" | "reject"
  ) => {
    try {
      // Here you would make API call to update vendor status
      console.log(`${action} vendor:`, vendorId);
      // Update local state or refetch data
      // await updateVendorStatus(vendorId, action);
    } catch (error) {
      console.error(`Error ${action}ing vendor:`, error);
    }
  };

  const handleCenterAction = async (
    centerId: string,
    action: "approve" | "reject"
  ) => {
    try {
      // Here you would make API call to update center status
      console.log(`${action} center:`, centerId);
      // Update local state or refetch data
      // await updateCenterStatus(centerId, action);
    } catch (error) {
      console.error(`Error ${action}ing center:`, error);
    }
  };

  const openVendorDetail = (vendor: any) => {
    setSelectedVendor(vendor);
    setIsVendorDetailOpen(true);
  };

  const openCenterDetail = (center: any) => {
    setSelectedCenter(center);
    setIsCenterDetailOpen(true);
  };

  // Mock Nepalese vendor data
  const mockVendors = [
    {
      id: "1",
      _id: "vendor_001",
      name: "Himalayan Spices Co.",
      businessName: "Himalayan Spices Co.",
      email: "contact@himalayanspices.com",
      phone: "+977-9801234567",
      address: "Thamel, Kathmandu",
      district: "Kathmandu",
      panNumber: "PAN123456789",
      status: VendorStatus.APPROVED,
      businessType: "Spices & Herbs",
      commission: 15000,
      joinedDate: "2023-01-15",
      createdAt: "2023-01-15T00:00:00Z",
    },
    {
      id: "2",
      _id: "vendor_002",
      name: "Everest Tea Gardens",
      businessName: "Everest Tea Gardens",
      email: "info@everesttea.com",
      phone: "+977-9812345678",
      address: "Ilam, Eastern Nepal",
      district: "Ilam",
      panNumber: "PAN234567890",
      status: VendorStatus.APPROVED,
      businessType: "Tea & Beverages",
      commission: 22000,
      joinedDate: "2023-02-20",
      createdAt: "2023-02-20T00:00:00Z",
    },
    {
      id: "3",
      _id: "vendor_003",
      name: "Annapurna Handicrafts",
      businessName: "Annapurna Handicrafts",
      email: "sales@annapurnacraft.com",
      phone: "+977-9823456789",
      address: "Bhaktapur Durbar Square",
      district: "Bhaktapur",
      panNumber: "PAN345678901",
      status: VendorStatus.PENDING,
      businessType: "Handicrafts & Art",
      commission: 18000,
      joinedDate: "2023-03-10",
      createdAt: "2023-03-10T00:00:00Z",
    },
    {
      id: "4",
      _id: "vendor_004",
      name: "Mustang Apple Orchard",
      businessName: "Mustang Apple Orchard",
      email: "orders@mustangapples.com",
      phone: "+977-9834567890",
      address: "Jomsom, Mustang",
      district: "Mustang",
      panNumber: "PAN456789012",
      status: VendorStatus.APPROVED,
      businessType: "Fruits & Agriculture",
      commission: 12000,
      joinedDate: "2023-04-05",
      createdAt: "2023-04-05T00:00:00Z",
    },
    {
      id: "5",
      _id: "vendor_005",
      name: "Sherpa Gear Co.",
      businessName: "Sherpa Gear Co.",
      email: "contact@sherpagear.com",
      phone: "+977-9845678901",
      address: "Namche Bazaar, Solukhumbu",
      district: "Solukhumbu",
      panNumber: "PAN567890123",
      status: VendorStatus.APPROVED,
      businessType: "Outdoor Equipment",
      commission: 25000,
      joinedDate: "2023-05-12",
      createdAt: "2023-05-12T00:00:00Z",
    },
    {
      id: "6",
      _id: "vendor_006",
      name: "Pokhara Pashmina House",
      businessName: "Pokhara Pashmina House",
      email: "info@pokharapashmina.com",
      phone: "+977-9856789012",
      address: "Lakeside, Pokhara",
      district: "Kaski",
      panNumber: "PAN678901234",
      status: VendorStatus.REJECTED,
      businessType: "Textiles & Fashion",
      commission: 8000,
      joinedDate: "2023-06-18",
      createdAt: "2023-06-18T00:00:00Z",
    },
    {
      id: "7",
      _id: "vendor_007",
      name: "Lumbini Organic Farm",
      businessName: "Lumbini Organic Farm",
      email: "sales@lumbiniorganic.com",
      phone: "+977-9867890123",
      address: "Lumbini, Rupandehi",
      district: "Rupandehi",
      panNumber: "PAN789012345",
      status: VendorStatus.APPROVED,
      businessType: "Organic Products",
      commission: 16000,
      joinedDate: "2023-07-22",
      createdAt: "2023-07-22T00:00:00Z",
    },
    {
      id: "8",
      _id: "vendor_008",
      name: "Kathmandu Coffee Roasters",
      businessName: "Kathmandu Coffee Roasters",
      email: "hello@ktmcoffee.com",
      phone: "+977-9878901234",
      address: "Jhamsikhel, Lalitpur",
      district: "Lalitpur",
      panNumber: "PAN890123456",
      status: VendorStatus.PENDING,
      businessType: "Coffee & Beverages",
      commission: 14000,
      joinedDate: "2023-08-30",
      createdAt: "2023-08-30T00:00:00Z",
    },
    {
      id: "9",
      _id: "vendor_009",
      name: "Dharan Bamboo Crafts",
      businessName: "Dharan Bamboo Crafts",
      email: "info@dharanbamboo.com",
      phone: "+977-9889012345",
      address: "Dharan, Sunsari",
      district: "Sunsari",
      panNumber: "PAN901234567",
      status: VendorStatus.REJECTED,
      businessType: "Eco-friendly Products",
      commission: 11000,
      joinedDate: "2023-09-15",
      createdAt: "2023-09-15T00:00:00Z",
    },
    {
      id: "10",
      _id: "vendor_010",
      name: "Chitwan Honey Collective",
      businessName: "Chitwan Honey Collective",
      email: "orders@chitwanhoney.com",
      phone: "+977-9890123456",
      address: "Sauraha, Chitwan",
      district: "Chitwan",
      panNumber: "PAN012345678",
      status: VendorStatus.PENDING,
      businessType: "Natural Products",
      commission: 13000,
      joinedDate: "2023-10-08",
      createdAt: "2023-10-08T00:00:00Z",
    },
  ];

  // Mock Nepalese center data
  const mockCenters = [
    {
      id: "1",
      _id: "center_001",
      name: "Kathmandu Central Hub",
      location: "Baneshwor, Kathmandu",
      district: "Kathmandu",
      contactPerson: "Ram Bahadur Shrestha",
      email: "kathmandu@vrsdistribution.com",
      phone: "+977-9801111111",
      capacity: "5000 packages/day",
      status: "active",
      type: "Main Distribution Center",
      coverage: "Kathmandu Valley",
      establishedDate: "2022-01-15",
      createdAt: "2022-01-15T00:00:00Z",
    },
    {
      id: "2",
      _id: "center_002",
      name: "Pokhara Regional Center",
      location: "Mahendrapul, Pokhara",
      district: "Kaski",
      contactPerson: "Sita Gurung",
      email: "pokhara@vrsdistribution.com",
      phone: "+977-9802222222",
      capacity: "2000 packages/day",
      status: "active",
      type: "Regional Distribution Center",
      coverage: "Western Region",
      establishedDate: "2022-03-20",
      createdAt: "2022-03-20T00:00:00Z",
    },
    {
      id: "3",
      _id: "center_003",
      name: "Biratnagar Eastern Hub",
      location: "Traffic Chowk, Biratnagar",
      district: "Morang",
      contactPerson: "Krishna Rai",
      email: "biratnagar@vrsdistribution.com",
      phone: "+977-9803333333",
      capacity: "1500 packages/day",
      status: "active",
      type: "Regional Distribution Center",
      coverage: "Eastern Region",
      establishedDate: "2022-05-10",
      createdAt: "2022-05-10T00:00:00Z",
    },
    {
      id: "4",
      _id: "center_004",
      name: "Nepalgunj Border Center",
      location: "Tribhuvan Chowk, Nepalgunj",
      district: "Banke",
      contactPerson: "Abdul Rahman",
      email: "nepalgunj@vrsdistribution.com",
      phone: "+977-9804444444",
      capacity: "800 packages/day",
      status: "maintenance",
      type: "Border Distribution Center",
      coverage: "Mid-Western Region",
      establishedDate: "2022-07-25",
      createdAt: "2022-07-25T00:00:00Z",
    },
    {
      id: "5",
      _id: "center_005",
      name: "Dhangadhi Far-West Hub",
      location: "Hasanpur Road, Dhangadhi",
      district: "Kailali",
      contactPerson: "Bhim Bahadur Thapa",
      email: "dhangadhi@vrsdistribution.com",
      phone: "+977-9805555555",
      capacity: "1000 packages/day",
      status: "active",
      type: "Regional Distribution Center",
      coverage: "Far-Western Region",
      establishedDate: "2022-09-12",
      createdAt: "2022-09-12T00:00:00Z",
    },
    {
      id: "6",
      _id: "center_006",
      name: "Chitwan Transit Point",
      location: "Bharatpur-10, Chitwan",
      district: "Chitwan",
      contactPerson: "Maya Tharu",
      email: "chitwan@vrsdistribution.com",
      phone: "+977-9806666666",
      capacity: "600 packages/day",
      status: "inactive",
      type: "Transit Point",
      coverage: "Central Region",
      establishedDate: "2023-01-08",
      createdAt: "2023-01-08T00:00:00Z",
    },
    {
      id: "7",
      _id: "center_007",
      name: "Butwal Commercial Hub",
      location: "Traffic Chowk, Butwal",
      district: "Rupandehi",
      contactPerson: "Rajesh Agrawal",
      email: "butwal@vrsdistribution.com",
      phone: "+977-9807777777",
      capacity: "1200 packages/day",
      status: "active",
      type: "Commercial Distribution Center",
      coverage: "Lumbini Province",
      establishedDate: "2023-03-15",
      createdAt: "2023-03-15T00:00:00Z",
    },
    {
      id: "8",
      _id: "center_008",
      name: "Janakpur Cultural Center",
      location: "Janaki Mandir Area, Janakpur",
      district: "Dhanusha",
      contactPerson: "Sunita Yadav",
      email: "janakpur@vrsdistribution.com",
      phone: "+977-9808888888",
      capacity: "900 packages/day",
      status: "pending",
      type: "Cultural Distribution Center",
      coverage: "Madhesh Province",
      establishedDate: "2023-06-20",
      createdAt: "2023-06-20T00:00:00Z",
    },
  ];

  // Filter vendors based on search term and status
  const filteredVendors = mockVendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
      vendor.businessType
        .toLowerCase()
        .includes(vendorSearchTerm.toLowerCase());

    const matchesStatus =
      vendorStatusFilter === "all" ||
      vendor.status.toLowerCase() === vendorStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Center filtering logic
  const filteredCenters = mockCenters.filter((center) => {
    const matchesSearch =
      center.name.toLowerCase().includes(centerSearchTerm.toLowerCase()) ||
      center.location.toLowerCase().includes(centerSearchTerm.toLowerCase()) ||
      center.contactPerson
        .toLowerCase()
        .includes(centerSearchTerm.toLowerCase()) ||
      center.type.toLowerCase().includes(centerSearchTerm.toLowerCase());

    const matchesStatus =
      centerStatusFilter === "all" ||
      center.status.toLowerCase() === centerStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get status counts
  const statusCounts = {
    all: mockVendors.length,
    approved: mockVendors.filter((v) => v.status === VendorStatus.APPROVED)
      .length,
    pending: mockVendors.filter((v) => v.status === VendorStatus.PENDING)
      .length,
    rejected: mockVendors.filter((v) => v.status === VendorStatus.REJECTED)
      .length,
  };

  // Center status counts
  const centerStatusCounts = {
    all: mockCenters.length,
    active: mockCenters.filter((c) => c.status === "active").length,
    inactive: mockCenters.filter((c) => c.status === "inactive").length,
    maintenance: mockCenters.filter((c) => c.status === "maintenance").length,
    pending: mockCenters.filter((c) => c.status === "pending").length,
  };

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const response = await axiosInstance.get("/api/auth/me");
        if (response.data.success) {
          setAdminProfile(response.data.user);
        }
      } catch (error) {
        console.error("Failed to fetch admin profile:", error);
      }
    };

    fetchAdminProfile();
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const appResponse = await axiosInstance.get("/api/notifications", {
          params: { limit: 5, type: "VENDOR_APPLICATION" },
        });

        const centerAppResponse = await axiosInstance.get(
          "/api/notifications",
          {
            params: { limit: 5, type: "CENTER_APPLICATION" },
          }
        );

        let appNotifications = [];
        if (appResponse.data.success) {
          appNotifications = appResponse.data.data.notifications;
        }

        if (centerAppResponse.data.success) {
          appNotifications = [
            ...appNotifications,
            ...centerAppResponse.data.data.notifications,
          ];
        }

        let allNotifications = appNotifications;
        let unreadCount = 0;

        if (appNotifications.length < 10) {
          const generalResponse = await axiosInstance.get(
            "/api/notifications",
            {
              params: { limit: 10 - appNotifications.length },
            }
          );

          if (generalResponse.data.success) {
            const generalNotifications =
              generalResponse.data.data.notifications.filter(
                (n: any) =>
                  n.type !== "VENDOR_APPLICATION" &&
                  n.type !== "CENTER_APPLICATION"
              );

            allNotifications = [...appNotifications, ...generalNotifications];
            unreadCount = generalResponse.data.data.unreadCount;
          }
        }

        if (unreadCount === 0) {
          const unreadResponse = await axiosInstance.get("/api/notifications", {
            params: { unread: true },
          });

          if (unreadResponse.data.success) {
            unreadCount = unreadResponse.data.data.unreadCount;
          }
        }

        const formattedNotifications = allNotifications.map(
          (notification: any) => ({
            id: notification._id,
            title: notification.title,
            message: notification.message,
            time: formatTime(notification.createdAt),
            read: notification.isRead,
            createdAt: notification.createdAt,
          })
        );

        setNotifications(formattedNotifications);
        setUnreadCount(unreadCount);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadCount();
        setUnreadMessageCount(count);
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleSignOut = async () => {
    try {
      await axiosInstance.post("/api/auth/logout");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await axiosInstance.patch(`/api/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put('/api/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-white/20 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-all duration-300 ease-in-out`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100/50 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center gap-3">
            <img src="/image/vrslogo.png" alt="VRS Logo" className="h-8 w-8" />
            <span className="text-xl font-bold text-white tracking-wide">VRS</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 md:hidden"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-6 space-y-3">
          <Link
            to="/admin/dashboard"
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full ${
              activeSection === "overview"
                ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25"
                : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:text-blue-600"
            }`}
            onClick={() => onSectionChange && onSectionChange("overview")}
          >
            <LayoutDashboard className={`h-5 w-5 transition-transform duration-200 ${
              activeSection === "overview" ? "scale-110" : "group-hover:scale-105"
            }`} />
            <span className="font-medium">Overview</span>
          </Link>

          <button
            onClick={() => setIsMessageBoxOpen(true)}
            className="group flex items-center gap-3 px-4 py-3 text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-green-50 hover:text-green-600 transition-all duration-200 w-full text-left"
          >
            <MessageCircle className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
            <span className="font-medium">Messages</span>
            {unreadMessageCount > 0 && (
              <span className="ml-auto bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2.5 py-1 font-semibold shadow-lg animate-pulse">
                {unreadMessageCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setIsVendorListOpen(true)}
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left ${
              activeSection === "vendors"
                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25"
                : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 hover:text-purple-600"
            }`}
          >
            <Users className={`h-5 w-5 transition-transform duration-200 ${
              activeSection === "vendors" ? "scale-110" : "group-hover:scale-105"
            }`} />
            <span className="font-medium">Vendors</span>
            <span className="ml-auto bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs rounded-full px-2.5 py-1 font-semibold shadow-md">
              {mockVendors.length}
            </span>
          </button>

          <button
            onClick={() => setIsCenterListOpen(true)}
            className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left ${
              activeSection === "centers"
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25"
                : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-green-50 hover:text-green-600"
            }`}
          >
            <Building className={`h-5 w-5 transition-transform duration-200 ${
              activeSection === "centers" ? "scale-110" : "group-hover:scale-105"
            }`} />
            <span className="font-medium">Centers</span>
            <span className="ml-auto bg-gradient-to-r from-green-500 to-teal-500 text-white text-xs rounded-full px-2.5 py-1 font-semibold shadow-md">
              {mockCenters.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300 ease-in-out">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20 z-10">
          <div className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-3 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 transition-all duration-200 md:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* Notification Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setNotificationsOpen(!notificationsOpen);
                    setUserMenuOpen(false);
                  }}
                  className="relative p-3 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-100/80 transition-all duration-200 group"
                >
                  <Bell className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full px-2 py-1 font-semibold shadow-lg animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b flex justify-between items-center">
                      <h3 className="font-semibold text-gray-900">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                              !notification.read ? "bg-blue-50" : ""
                            }`}
                            onClick={() => markAsRead(notification.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-sm text-gray-900">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="p-2 border-t">
                        <Link
                          to="/admin/notifications"
                          className="block text-center text-sm text-blue-600 hover:text-blue-800"
                          onClick={() => setNotificationsOpen(false)}
                        >
                          View all notifications
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Admin Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setUserMenuOpen(!userMenuOpen);
                    setNotificationsOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <User className="h-6 w-6" />
                  {adminProfile && (
                    <span className="hidden md:block text-sm font-medium">
                      {adminProfile.name || adminProfile.username || 'Admin'}
                    </span>
                  )}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b">
                      <p className="font-semibold text-gray-900">
                        {adminProfile?.name || adminProfile?.username || "Admin"}
                      </p>
                      <p className="text-sm text-gray-600 break-words">
                        admin@example.com
                      </p>
                      {adminProfile?.role && (
                        <p className="text-xs text-gray-500 mt-1 capitalize">
                          {adminProfile.role}
                        </p>
                      )}
                    </div>
                    <div className="py-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>

      {(userMenuOpen || notificationsOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setUserMenuOpen(false);
            setNotificationsOpen(false);
          }}
        />
      )}

      {/* Overlay for closing message box */}
      {isMessageBoxOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMessageBoxOpen(false)}
        />
      )}

      {/* Vendor List Modal - Opens in Dashboard Content Area */}
      {isVendorListOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-30"
            onClick={() => setIsVendorListOpen(false)}
          />
          <div className="fixed top-20 left-80 right-8 bottom-8 z-50 bg-white shadow-2xl rounded-lg border border-gray-200 transform transition-all duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Vendor Management
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage and review vendor applications
                  </p>
                </div>
                <button
                  onClick={() => setIsVendorListOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Search and Filter Controls */}
              <div className="p-6 border-b bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search vendors by name, email, or business type..."
                      value={vendorSearchTerm}
                      onChange={(e) => setVendorSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5 text-gray-500" />
                    <select
                      value={vendorStatusFilter}
                      onChange={(e) => setVendorStatusFilter(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Status Summary Badges */}
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium shadow-sm">
                    Total: {statusCounts.all}
                  </span>
                  <span className="px-3 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium">
                    Approved: {statusCounts.approved}
                  </span>
                  <span className="px-3 py-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm font-medium">
                    Pending: {statusCounts.pending}
                  </span>
                  <span className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
                    Rejected: {statusCounts.rejected}
                  </span>
                </div>
              </div>

              {/* Vendor List */}
              <div className="flex-1 overflow-y-auto p-6">
                {filteredVendors.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No vendors found
                    </h3>
                    <p className="text-gray-500">
                      {vendorSearchTerm || vendorStatusFilter !== "all"
                        ? "Try adjusting your search criteria or filter"
                        : "No vendors are currently registered"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredVendors.map((vendor) => (
                      <div
                        key={vendor.id}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg mb-1">
                              {vendor.businessName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Owner: {vendor.name}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              vendor.status === VendorStatus.APPROVED
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : vendor.status === VendorStatus.PENDING
                                ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                          >
                            {vendor.status}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 min-w-[80px]">
                              Email:
                            </span>
                            <span className="truncate">{vendor.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 min-w-[80px]">
                              Phone:
                            </span>
                            <span>{vendor.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 min-w-[80px]">
                              Location:
                            </span>
                            <span className="truncate">{vendor.district}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 min-w-[80px]">
                              Business:
                            </span>
                            <span className="truncate">
                              {vendor.businessType}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 min-w-[80px]">
                              Commission:
                            </span>
                            <span className="font-semibold text-green-600">
                              रू {vendor.commission.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 min-w-[80px]">
                              Joined:
                            </span>
                            <span>
                              {new Date(vendor.joinedDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => openVendorDetail(vendor)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium flex-1 justify-center"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Center List Modal */}
      {isCenterListOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-30"
            onClick={() => setIsCenterListOpen(false)}
          />
          <div className="fixed top-20 left-80 right-8 bottom-8 z-50 bg-white shadow-2xl rounded-lg border border-gray-200 transform transition-all duration-300 ease-in-out">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Distribution Centers
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage and review distribution centers
                  </p>
                </div>
                <button
                  onClick={() => setIsCenterListOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Search and Filter Controls */}
              <div className="p-6 border-b bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search centers by name, location, or contact person..."
                      value={centerSearchTerm}
                      onChange={(e) => setCenterSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="flex items-center gap-3">
                    <Filter className="h-5 w-5 text-gray-500" />
                    <select
                      value={centerStatusFilter}
                      onChange={(e) => setCenterStatusFilter(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                {/* Status Summary Badges */}
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium shadow-sm">
                    Total: {centerStatusCounts.all}
                  </span>
                  <span className="px-3 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium">
                    Active: {centerStatusCounts.active}
                  </span>
                  <span className="px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
                    Inactive: {centerStatusCounts.inactive}
                  </span>
                  <span className="px-3 py-2 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-sm font-medium">
                    Maintenance: {centerStatusCounts.maintenance}
                  </span>
                  <span className="px-3 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg text-sm font-medium">
                    Pending: {centerStatusCounts.pending}
                  </span>
                </div>
              </div>

              {/* Center List */}
              <div className="flex-1 overflow-y-auto p-6">
                {filteredCenters.length === 0 ? (
                  <div className="text-center py-12">
                    <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No centers found
                    </h3>
                    <p className="text-gray-500">
                      {centerSearchTerm || centerStatusFilter !== "all"
                        ? "Try adjusting your search criteria or filter"
                        : "No distribution centers are currently available"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCenters.map((center) => (
                      <div
                        key={center.id}
                        className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-green-300"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 text-lg mb-1">
                              {center.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Contact: {center.contactPerson}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              center.status === "active"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : center.status === "pending"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : center.status === "maintenance"
                                ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                : "bg-red-100 text-red-800 border border-red-200"
                            }`}
                          >
                            {center.status}
                          </span>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 min-w-[80px]">
                              Email:
                            </span>
                            <span className="truncate">{center.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 min-w-[80px]">
                              Phone:
                            </span>
                            <span>{center.phone}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 min-w-[80px]">
                              Location:
                            </span>
                            <span className="truncate">{center.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 min-w-[80px]">
                              Type:
                            </span>
                            <span className="truncate">{center.type}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 min-w-[80px]">
                              Capacity:
                            </span>
                            <span className="font-semibold text-green-600">
                              {center.capacity}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700 min-w-[80px]">
                              Coverage:
                            </span>
                            <span className="truncate">{center.coverage}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => openCenterDetail(center)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium flex-1 justify-center"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <MessageBox
        isOpen={isMessageBoxOpen}
        onClose={() => {
          setIsMessageBoxOpen(false);
          getUnreadCount().then(setUnreadMessageCount).catch(console.error);
        }}
      />

      {/* Vendor Detail Modal */}
      {isVendorDetailOpen && selectedVendor && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={() => setIsVendorDetailOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedVendor.businessName}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Vendor Application Details
                  </p>
                </div>
                <button
                  onClick={() => setIsVendorDetailOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Basic Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Owner Name
                        </label>
                        <p className="text-gray-900">{selectedVendor.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Business Name
                        </label>
                        <p className="text-gray-900">
                          {selectedVendor.businessName}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <p className="text-gray-900">{selectedVendor.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Phone
                        </label>
                        <p className="text-gray-900">{selectedVendor.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          PAN Number
                        </label>
                        <p className="text-gray-900">
                          {selectedVendor.panNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Business Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Business Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Business Type
                        </label>
                        <p className="text-gray-900">
                          {selectedVendor.businessType}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Address
                        </label>
                        <p className="text-gray-900">
                          {selectedVendor.address}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          District
                        </label>
                        <p className="text-gray-900">
                          {selectedVendor.district}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Commission
                        </label>
                        <p className="text-gray-900 font-semibold text-green-600">
                          रू {selectedVendor.commission?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Application Date
                        </label>
                        <p className="text-gray-900">
                          {new Date(
                            selectedVendor.joinedDate
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Information */}
                  <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Application Status
                    </h3>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          selectedVendor.status === VendorStatus.APPROVED
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : selectedVendor.status === VendorStatus.PENDING
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {selectedVendor.status}
                      </span>
                      {selectedVendor.status === VendorStatus.PENDING && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              handleVendorAction(selectedVendor.id, "approve");
                              setIsVendorDetailOpen(false);
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            Approve Application
                          </button>
                          <button
                            onClick={() => {
                              handleVendorAction(selectedVendor.id, "reject");
                              setIsVendorDetailOpen(false);
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            Reject Application
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Center Detail Modal */}
      {isCenterDetailOpen && selectedCenter && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={() => setIsCenterDetailOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCenter.name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Distribution Center Details
                  </p>
                </div>
                <button
                  onClick={() => setIsCenterDetailOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-white hover:shadow-sm transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Basic Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Center Name
                        </label>
                        <p className="text-gray-900">{selectedCenter.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Contact Person
                        </label>
                        <p className="text-gray-900">
                          {selectedCenter.contactPerson}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <p className="text-gray-900">{selectedCenter.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Phone
                        </label>
                        <p className="text-gray-900">{selectedCenter.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Operational Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Operational Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Location
                        </label>
                        <p className="text-gray-900">
                          {selectedCenter.location}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Center Type
                        </label>
                        <p className="text-gray-900">{selectedCenter.type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Storage Capacity
                        </label>
                        <p className="text-gray-900 font-semibold text-green-600">
                          {selectedCenter.capacity}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Coverage Area
                        </label>
                        <p className="text-gray-900">
                          {selectedCenter.coverage}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Information */}
                  <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Center Status
                    </h3>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          selectedCenter.status === "active"
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : selectedCenter.status === "pending"
                            ? "bg-blue-100 text-blue-800 border border-blue-200"
                            : selectedCenter.status === "maintenance"
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {selectedCenter.status}
                      </span>
                      {selectedCenter.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              handleCenterAction(selectedCenter.id, "approve");
                              setIsCenterDetailOpen(false);
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            Approve Center
                          </button>
                          <button
                            onClick={() => {
                              handleCenterAction(selectedCenter.id, "reject");
                              setIsCenterDetailOpen(false);
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            Reject Center
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
