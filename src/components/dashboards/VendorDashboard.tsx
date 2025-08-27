import { useState, useEffect } from "react";
import {
  Package,
  ShoppingCart,
  Users,
  Bell,
  TrendingUp,
  DollarSign,
  Plus,
  Star,
  MapPin,
  LogOut,
  X,
  CreditCard,
  BarChart3,
  Search,
  Loader2,
  Percent,
  HandCoins,
  MessageCircle,
  Archive,
  AlertCircle,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { getVendorAnalytics } from "../../utils/vendorApi";
import {
  getCentersByCategory,
  getCenterCategories,
} from "../../utils/centerApi";
import {
  getProducts,
  getProductCategories,
  Product,
} from "../../utils/productApi";
import { User } from "../../types/index";

interface VendorDashboardProps {
  user: User;
  vendorName?: string;
  onLogout?: () => void;
}

export function VendorDashboard({
  user,
  vendorName = "ABC Trading Co.",
  onLogout,
}: VendorDashboardProps) {
  // Add debug logging
  console.log("VendorDashboard - User data:", user);
  console.log("VendorDashboard - User email:", user?.email);
  console.log("VendorDashboard - Business name:", user?.businessName);
  const [activeTab, setActiveTab] = useState("marketplace");
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Add search state variables
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Add product state variables
  const [products, setProducts] = useState<Product[]>([]);
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  // Add message modal state
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Add message composition states
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [messageSubject, setMessageSubject] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Add stats modal states
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showSpentModal, setShowSpentModal] = useState(false);
  const [showCentersModal, setShowCentersModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);

  // Handle message sending
  const handleSendMessage = async () => {
    if (
      !selectedRecipient ||
      !messageSubject.trim() ||
      !messageContent.trim()
    ) {
      alert("Please fill in all fields");
      return;
    }

    setIsSendingMessage(true);
    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert(`Message sent successfully to ${selectedRecipient}!`);

      // Reset form
      setSelectedRecipient("");
      setMessageSubject("");
      setMessageContent("");
      setShowMessageModal(false);
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Order details modal
  const renderOrdersModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Orders Placed Details
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowOrdersModal(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Total Orders</p>
              <p className="text-2xl font-bold text-blue-900">89</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Completed</p>
              <p className="text-2xl font-bold text-green-900">76</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-orange-600 font-medium">In Progress</p>
              <p className="text-2xl font-bold text-orange-900">13</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 p-3 text-left">
                    Order ID
                  </th>
                  <th className="border border-gray-200 p-3 text-left">
                    Center
                  </th>
                  <th className="border border-gray-200 p-3 text-left">
                    Amount
                  </th>
                  <th className="border border-gray-200 p-3 text-left">
                    Status
                  </th>
                  <th className="border border-gray-200 p-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {myOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="border border-gray-200 p-3">{order.id}</td>
                    <td className="border border-gray-200 p-3">
                      {order.center}
                    </td>
                    <td className="border border-gray-200 p-3">
                      {order.amount}
                    </td>
                    <td className="border border-gray-200 p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "In Transit"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="border border-gray-200 p-3">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSpentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Total Spent Breakdown
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSpentModal(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600 font-medium">
              Total Amount Spent
            </p>
            <p className="text-3xl font-bold text-green-900">रू 1,85,000</p>
            <p className="text-sm text-green-600 mt-1">+8% from last month</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">This Month</h4>
              <p className="text-xl font-bold text-gray-900">रू 45,000</p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Last Month</h4>
              <p className="text-xl font-bold text-gray-900">रू 42,000</p>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Category Breakdown</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>Rice & Grains</span>
                <span className="font-medium">रू 85,000</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>Pulses & Legumes</span>
                <span className="font-medium">रू 45,000</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>Spices & Seasonings</span>
                <span className="font-medium">रू 35,000</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span>Others</span>
                <span className="font-medium">रू 20,000</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCentersModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Connected Centers
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCentersModal(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm text-orange-600 font-medium">Total Centers</p>
            <p className="text-3xl font-bold text-orange-900">15</p>
            <p className="text-sm text-orange-600 mt-1">+3 new this month</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: "Kathmandu Food Center",
                location: "Kathmandu",
                orders: 25,
                status: "Active",
              },
              {
                name: "Pokhara Grain Hub",
                location: "Pokhara",
                orders: 18,
                status: "Active",
              },
              {
                name: "Chitwan Supply Co.",
                location: "Chitwan",
                orders: 12,
                status: "Active",
              },
              {
                name: "Butwal Distribution",
                location: "Butwal",
                orders: 8,
                status: "Active",
              },
              {
                name: "Biratnagar Wholesale",
                location: "Biratnagar",
                orders: 15,
                status: "Active",
              },
              {
                name: "Dharan Food Market",
                location: "Dharan",
                orders: 6,
                status: "Pending",
              },
            ].map((center, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{center.name}</h4>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {center.location}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  {center.orders} orders
                </p>
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                    center.status === "Active"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {center.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPendingModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Pending Orders
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPendingModal(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <div className="bg-purple-50 p-4 rounded-lg">
            <p className="text-sm text-purple-600 font-medium">
              Pending Orders
            </p>
            <p className="text-3xl font-bold text-purple-900">7</p>
            <p className="text-sm text-purple-600 mt-1">-2 from last week</p>
          </div>
          <div className="space-y-3">
            {[
              {
                id: "PO-004",
                center: "Lalitpur Food Center",
                amount: "रू 15,000",
                items: "Organic Rice, Lentils",
                date: "2024-01-16",
              },
              {
                id: "PO-005",
                center: "Bhaktapur Grain Store",
                amount: "रू 22,000",
                items: "Wheat Flour, Spices",
                date: "2024-01-16",
              },
              {
                id: "PO-006",
                center: "Janakpur Supply Hub",
                amount: "रू 18,500",
                items: "Basmati Rice, Oil",
                date: "2024-01-17",
              },
              {
                id: "PO-007",
                center: "Hetauda Distribution",
                amount: "रू 12,000",
                items: "Pulses, Salt",
                date: "2024-01-17",
              },
              {
                id: "PO-008",
                center: "Birgunj Wholesale",
                amount: "रू 28,000",
                items: "Mixed Grains",
                date: "2024-01-18",
              },
              {
                id: "PO-009",
                center: "Nepalgunj Food Market",
                amount: "रू 16,500",
                items: "Rice, Spices",
                date: "2024-01-18",
              },
              {
                id: "PO-010",
                center: "Dhangadhi Supply Co.",
                amount: "रू 20,000",
                items: "Wheat, Lentils",
                date: "2024-01-19",
              },
            ].map((order) => (
              <div key={order.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-gray-900">{order.id}</h4>
                  <span className="text-lg font-bold text-purple-600">
                    {order.amount}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{order.center}</p>
                <p className="text-sm text-gray-500 mt-1">{order.items}</p>
                <p className="text-xs text-gray-400 mt-2">{order.date}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDiscountModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Discount Received
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDiscountModal(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <div className="bg-indigo-50 p-4 rounded-lg">
            <p className="text-sm text-indigo-600 font-medium">
              Total Discounts
            </p>
            <p className="text-3xl font-bold text-indigo-900">रू 12,500</p>
            <p className="text-sm text-indigo-600 mt-1">+5% from last month</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Recent Discounts</h4>
            {[
              {
                type: "Bulk Order Discount",
                amount: "रू 3,500",
                percentage: "15%",
                date: "2024-01-15",
              },
              {
                type: "Seasonal Discount",
                amount: "रू 2,800",
                percentage: "10%",
                date: "2024-01-12",
              },
              {
                type: "Loyalty Discount",
                amount: "रू 2,200",
                percentage: "8%",
                date: "2024-01-10",
              },
              {
                type: "Early Payment Discount",
                amount: "रू 1,900",
                percentage: "5%",
                date: "2024-01-08",
              },
              {
                type: "Volume Discount",
                amount: "रू 2,100",
                percentage: "12%",
                date: "2024-01-05",
              },
            ].map((discount, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{discount.type}</p>
                  <p className="text-sm text-gray-600">{discount.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-600">{discount.amount}</p>
                  <p className="text-sm text-gray-500">{discount.percentage}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCommissionModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Commission Paid to Admin
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
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600 font-medium">
              Total Commission Paid
            </p>
            <p className="text-3xl font-bold text-red-900">रू 8,750</p>
            <p className="text-sm text-red-600 mt-1">+3% from last month</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">
                Commission Rate
              </h4>
              <p className="text-xl font-bold text-gray-900">5%</p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">This Month</h4>
              <p className="text-xl font-bold text-gray-900">रू 2,250</p>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Commission History</h4>
            {[
              {
                month: "January 2024",
                sales: "रू 45,000",
                commission: "रू 2,250",
                date: "2024-01-31",
              },
              {
                month: "December 2023",
                sales: "रू 42,000",
                commission: "रू 2,100",
                date: "2023-12-31",
              },
              {
                month: "November 2023",
                sales: "रू 38,000",
                commission: "रू 1,900",
                date: "2023-11-30",
              },
              {
                month: "October 2023",
                sales: "रू 41,000",
                commission: "रू 2,050",
                date: "2023-10-31",
              },
              {
                month: "September 2023",
                sales: "रू 36,000",
                commission: "रू 1,800",
                date: "2023-09-30",
              },
            ].map((record, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{record.month}</p>
                  <p className="text-sm text-gray-600">Sales: {record.sales}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-red-600">{record.commission}</p>
                  <p className="text-sm text-gray-500">{record.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderInventoryModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Total Inventory
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInventoryModal(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <div className="bg-teal-50 p-4 rounded-lg">
            <p className="text-sm text-teal-600 font-medium">
              Total Inventory Items
            </p>
            <p className="text-3xl font-bold text-teal-900">1,245</p>
            <p className="text-sm text-teal-600 mt-1">
              +15 new items this month
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">In Stock</h4>
              <p className="text-xl font-bold text-green-600">1,180</p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Low Stock</h4>
              <p className="text-xl font-bold text-yellow-600">45</p>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Out of Stock</h4>
              <p className="text-xl font-bold text-red-600">20</p>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Inventory by Category</h4>
            {[
              {
                category: "Rice & Grains",
                items: 450,
                inStock: 425,
                lowStock: 15,
                outOfStock: 10,
              },
              {
                category: "Pulses & Legumes",
                items: 320,
                inStock: 305,
                lowStock: 12,
                outOfStock: 3,
              },
              {
                category: "Spices & Seasonings",
                items: 280,
                inStock: 270,
                lowStock: 8,
                outOfStock: 2,
              },
              {
                category: "Oils & Fats",
                items: 125,
                inStock: 115,
                lowStock: 7,
                outOfStock: 3,
              },
              {
                category: "Others",
                items: 70,
                inStock: 65,
                lowStock: 3,
                outOfStock: 2,
              },
            ].map((category, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-gray-900">
                    {category.category}
                  </h5>
                  <span className="text-lg font-bold text-gray-900">
                    {category.items} items
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <p className="text-green-600 font-medium">
                      {category.inStock}
                    </p>
                    <p className="text-gray-500">In Stock</p>
                  </div>
                  <div className="text-center">
                    <p className="text-yellow-600 font-medium">
                      {category.lowStock}
                    </p>
                    <p className="text-gray-500">Low Stock</p>
                  </div>
                  <div className="text-center">
                    <p className="text-red-600 font-medium">
                      {category.outOfStock}
                    </p>
                    <p className="text-gray-500">Out of Stock</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Message Modal
  const renderMessageModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200">
        {/* Header with Cross Mark */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <div className="flex items-center">
            <MessageCircle className="h-6 w-6 mr-3" />
            <h3 className="text-xl font-bold">Compose Message</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowMessageModal(false);
              setSelectedRecipient("");
              setMessageSubject("");
              setMessageContent("");
            }}
            className="text-white border-white hover:bg-white hover:text-orange-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Message Composition Form */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="space-y-6">
            {/* Recipient Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send To *
              </label>
              <select
                value={selectedRecipient}
                onChange={(e) => setSelectedRecipient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Select recipient...</option>
                <option value="admin">System Administrator</option>
                <optgroup label="Distribution Centers">
                  <option value="center-kathmandu">
                    Kathmandu Distribution Center
                  </option>
                  <option value="center-pokhara">
                    Pokhara Distribution Center
                  </option>
                  <option value="center-chitwan">
                    Chitwan Distribution Center
                  </option>
                  <option value="center-butwal">
                    Butwal Distribution Center
                  </option>
                  <option value="center-biratnagar">
                    Biratnagar Distribution Center
                  </option>
                </optgroup>
              </select>
            </div>

            {/* Subject Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                placeholder="Enter message subject"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {/* Message Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Type your message here..."
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Quick Message Templates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Templates
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMessageSubject("Product Inquiry");
                    setMessageContent(
                      "Hello,\n\nI would like to inquire about the availability of specific products in your center. Could you please provide information about current stock levels and pricing?\n\nThank you."
                    );
                  }}
                  className="text-left justify-start"
                >
                  Product Inquiry
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMessageSubject("Order Support");
                    setMessageContent(
                      "Hello,\n\nI need assistance with my recent order. Could you please help me with the status and any issues that might have occurred?\n\nThank you."
                    );
                  }}
                  className="text-left justify-start"
                >
                  Order Support
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMessageSubject("Partnership Opportunity");
                    setMessageContent(
                      "Hello,\n\nI would like to discuss potential partnership opportunities and how we can work together to improve our business relationship.\n\nThank you."
                    );
                  }}
                  className="text-left justify-start"
                >
                  Partnership
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMessageSubject("Technical Support");
                    setMessageContent(
                      "Hello,\n\nI am experiencing technical difficulties with the platform. Could you please provide assistance or guidance?\n\nThank you."
                    );
                  }}
                  className="text-left justify-start"
                >
                  Technical Support
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMessageModal(false);
                  setSelectedRecipient("");
                  setMessageSubject("");
                  setMessageContent("");
                }}
                disabled={isSendingMessage}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendMessage}
                disabled={
                  isSendingMessage ||
                  !selectedRecipient ||
                  !messageSubject.trim() ||
                  !messageContent.trim()
                }
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isSendingMessage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Analytics rendering function
  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Business Analytics
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Orders Placed
              </p>
              <p className="text-2xl font-bold text-gray-900">89</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Amount Spent
              </p>
              <p className="text-2xl font-bold text-gray-900">रू 1,85,000</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Discounts Received
              </p>
              <p className="text-2xl font-bold text-gray-900">रू 12,000</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Commission Paid
              </p>
              <p className="text-2xl font-bold text-gray-900">रू 9,250</p>
            </div>
            <CreditCard className="h-8 w-8 text-purple-600" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">
          Analytics Breakdown
        </h4>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">Total Orders Placed</span>
            <span className="font-bold">89</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">Total Amount Spent</span>
            <span className="font-bold">रू 1,85,000</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">Total Discounts Received</span>
            <span className="font-bold text-green-600">रू 12,000</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">Total Commission Paid</span>
            <span className="font-bold text-red-600">रू 9,250</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="font-medium">Total Products Ordered</span>
            <span className="font-bold">450</span>
          </div>
        </div>
      </Card>
    </div>
  );

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setIsLoadingProducts(true);
        setProductError(null);
        
        // Fetch product categories first
        const categories = await getProductCategories();
        setProductCategories(categories);
        
        // Fetch ALL products from all centers without any filters
        const productsData = await getProducts();
        console.log('Fetched products:', productsData); // Debug log
        setProducts(productsData.products || productsData.data || []);
        
        // Don't set any default category - show all products initially
        setSelectedCategory('');
      } catch (error) {
        console.error('Error fetching product data:', error);
        setProductError(`Failed to load products: ${error.message}`);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProductData();
  }, []);

  // Filter products by category - show all if no category selected
  const filteredProducts = selectedCategory 
    ? products.filter(product => product.category === selectedCategory)
    : products;

  // Use real vendor profile data from the logged-in user
  const vendorProfile = {
    businessName: user.businessName || vendorName,
    ownerName: user.name || "Unknown",
    email: user.email || "No email provided",
    phone: user.phone || "No phone provided",
    address: user.address || "No address provided",
    district: user.district || "No district provided",
    panNumber: user.panNumber || "No PAN provided",
    joinedDate: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : "Unknown",
    status: user.status || "Unknown",
    bankDetails: user.bankDetails || {
      bankName: "No bank details provided",
      accountNumber: "N/A",
      holderName: "N/A",
    },
    documents: [
      { name: "PAN Card", type: "PDF Document", id: "doc1" },
      { name: "Business Registration", type: "PDF Document", id: "doc2" },
      { name: "Bank Statement", type: "PDF Document", id: "doc3" },
    ],
  };

  // Add debug logging for vendorProfile
  console.log("VendorDashboard - Vendor profile:", vendorProfile);
  const [cart, setCart] = useState<any[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  const stats = [
    {
      title: "Orders Placed",
      value: "89",
      change: "+12%",
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Total Spent",
      value: "रू 1,85,000",
      change: "+8%",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Centers",
      value: "15",
      change: "+3",
      icon: Users,
      color: "text-orange-600",
    },
    {
      title: "Pending Orders",
      value: "7",
      change: "-2",
      icon: Package,
      color: "text-purple-600",
    },
    {
      title: "Discount Received",
      value: "रू 12,500",
      change: "+5%",
      icon: Percent,
      color: "text-indigo-600",
    },
    {
      title: "Commission Paid to Admin",
      value: "रू 8,750",
      change: "+3%",
      icon: HandCoins,
      color: "text-red-600",
    },
    {
      title: "Total Inventory",
      value: "1,245",
      change: "+15",
      icon: Archive,
      color: "text-teal-600",
    },
  ];

  const myOrders = [
    {
      id: "PO-001",
      center: "Kathmandu Food Center",
      amount: "रू 12,500",
      status: "Delivered",
      date: "2024-01-15",
      items: "Rice, Wheat, Pulses",
    },
    {
      id: "PO-002",
      center: "Pokhara Grain Hub",
      amount: "रू 8,750",
      status: "In Transit",
      date: "2024-01-14",
      items: "Basmati Rice, Spices",
    },
    {
      id: "PO-003",
      center: "Chitwan Supply Co.",
      amount: "रू 15,200",
      status: "Processing",
      date: "2024-01-13",
      items: "Mixed Vegetables",
    },
    {
      id: "PO-004",
      center: "Lalitpur Organics",
      amount: "रू 6,800",
      status: "Confirmed",
      date: "2024-01-12",
      items: "Organic Wheat",
    },
  ];

  const centerProducts = [];

  const notifications = [
    {
      id: 1,
      message: "Order PO-001 has been delivered",
      time: "2 hours ago",
      read: false,
    },
    {
      id: 2,
      message: "New products available from Tech Hub Pokhara",
      time: "5 hours ago",
      read: false,
    },
    {
      id: 3,
      message: "Payment confirmed for Order PO-002",
      time: "1 day ago",
      read: true,
    },
    {
      id: 4,
      message: "Art Gallery Bhaktapur added new paintings",
      time: "2 days ago",
      read: true,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "text-green-600 bg-green-100";
      case "In Transit":
        return "text-blue-600 bg-blue-100";
      case "Processing":
        return "text-yellow-600 bg-yellow-100";
      case "Confirmed":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const addToCart = (product: any) => {
    setCart([...cart, { ...product, quantity: 1 }]);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(
      cart.map((item) => (item.id === productId ? { ...item, quantity } : item))
    );
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = Number.parseInt(
        item.price.replace("रू ", "").replace(",", "").split("/")[0]
      );
      return total + price * item.quantity;
    }, 0);
  };

  const getCartSubtotal = () => {
    return getCartTotal();
  };

  const getTax = () => {
    return Math.round(getCartSubtotal() * 0.13); // 13% VAT in Nepal
  };

  const getShipping = () => {
    return getCartSubtotal() > 5000 ? 0 : 200; // Free shipping over रू 5000
  };

  // Add new calculation functions for discount and commission
  const getDiscount = () => {
    const subtotal = getCartSubtotal();
    // 10% discount for orders over रू 10,000
    return subtotal > 10000 ? Math.round(subtotal * 0.1) : 0;
  };

  const getCommission = () => {
    const subtotal = getCartSubtotal();
    // 5% commission to admin
    return Math.round(subtotal * 0.05);
  };

  const getFinalTotal = () => {
    return (
      getCartSubtotal() +
      getTax() +
      getShipping() -
      getDiscount() +
      getCommission()
    );
  };

  const renderCartModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Simple Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
              <p className="text-sm text-gray-500">{cart.length} items</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCart(false)}
            className="h-10 w-10 p-0 rounded-full hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {cart.length === 0 ? (
          <div className="p-16 text-center">
            <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <ShoppingCart className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-500 mb-6">
              Add some products to get started
            </p>
            <Button
              onClick={() => setShowCart(false)}
              className="bg-blue-600 hover:bg-blue-700 px-8"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="flex h-full max-h-[calc(95vh-100px)]">
            {/* Cart Items - Left Side */}
            <div className="flex-1 p-6 overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Items in Cart
              </h3>
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {item.center}
                      </p>
                      <p className="text-sm font-medium text-blue-600 mt-1">
                        {item.price}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity - 1)
                          }
                          className="h-8 w-8 p-0 border-0 hover:bg-gray-100"
                        >
                          -
                        </Button>
                        <span className="w-8 text-center font-medium text-gray-900">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateCartQuantity(item.id, item.quantity + 1)
                          }
                          className="h-8 w-8 p-0 border-0 hover:bg-gray-100"
                        >
                          +
                        </Button>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="font-bold text-gray-900">
                          रू{" "}
                          {(
                            Number.parseInt(
                              item.price
                                .replace("रू ", "")
                                .replace(",", "")
                                .split("/")[0]
                            ) * item.quantity
                          ).toLocaleString()}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="mt-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 h-7 w-7 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Summary - Right Side */}
            <div className="w-96 bg-gray-50 border-l border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Order Summary
              </h3>

              {/* Simple Payment Breakdown */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    रू {getCartSubtotal().toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700 flex items-center">
                    Discount
                    {getDiscount() > 0 && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        10% off
                      </span>
                    )}
                  </span>
                  <span className="font-semibold text-green-600">
                    {getDiscount() > 0
                      ? `-रू ${getDiscount().toLocaleString()}`
                      : "रू 0"}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700 flex items-center">
                    VAT (13%)
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      Tax
                    </span>
                  </span>
                  <span className="font-semibold text-gray-900">
                    रू {getTax().toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700 flex items-center">
                    Commission (5%)
                    <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  </span>
                  <span className="font-semibold text-orange-600">
                    रू {getCommission().toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700 flex items-center">
                    Shipping
                    {getShipping() === 0 && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                        Free
                      </span>
                    )}
                  </span>
                  <span
                    className={`font-semibold ${
                      getShipping() === 0 ? "text-green-600" : "text-gray-900"
                    }`}
                  >
                    {getShipping() === 0 ? "FREE" : `रू ${getShipping()}`}
                  </span>
                </div>

                <div className="border-t border-gray-300 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-blue-600">
                        रू {getFinalTotal().toLocaleString()}
                      </span>
                      <p className="text-xs text-gray-500">NPR</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
                  onClick={() => {
                    setShowCart(false);
                    setShowPayment(true);
                  }}
                >
                  Proceed to Payment
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-gray-300 hover:bg-gray-50 text-gray-700 py-3"
                  onClick={() => setShowCart(false)}
                >
                  Continue Shopping
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="mt-6 pt-6 border-t border-gray-300">
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    Secure Payment
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                    Fast Delivery
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotifications(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border ${
                notification.read ? "bg-gray-50" : "bg-blue-50"
              }`}
            >
              <p className="text-sm">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPaymentModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
          <div className="flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            <h3 className="text-lg font-semibold">Secure Payment</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPayment(false)}
            className="text-white border-white hover:bg-white hover:text-blue-600 h-8 w-8 p-0 rounded-full"
          >
            ×
          </Button>
        </div>

        {/* Order Summary */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="text-sm font-medium text-gray-700 mb-3">
            Order Summary
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>रू {getCartSubtotal().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>VAT (13%):</span>
              <span>रू {getTax().toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping:</span>
              <span
                className={
                  getShipping() === 0 ? "text-green-600 font-medium" : ""
                }
              >
                {getShipping() === 0 ? "FREE" : `रू ${getShipping()}`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span className="text-blue-600">
                रू {getFinalTotal().toLocaleString()} NPR
              </span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="p-4">
          <div className="flex items-center mb-4">
            <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs font-medium text-blue-700">
                Secured by Stripe
              </span>
            </div>
          </div>

          <form className="space-y-4">
            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={paymentForm.cardNumber}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\s/g, "")
                      .replace(/(.{4})/g, "$1 ")
                      .trim();
                    if (value.length <= 19) {
                      setPaymentForm({ ...paymentForm, cardNumber: value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <CreditCard className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={paymentForm.expiryDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "");
                    if (value.length >= 2) {
                      value =
                        value.substring(0, 2) + "/" + value.substring(2, 4);
                    }
                    if (value.length <= 5) {
                      setPaymentForm({ ...paymentForm, expiryDate: value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <input
                  type="text"
                  placeholder="123"
                  value={paymentForm.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 3) {
                      setPaymentForm({ ...paymentForm, cvv: value });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={paymentForm.cardholderName}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    cardholderName: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Pay Button */}
            <Button
              onClick={(e) => {
                e.preventDefault();
                if (
                  !paymentForm.cardNumber ||
                  !paymentForm.expiryDate ||
                  !paymentForm.cvv ||
                  !paymentForm.cardholderName
                ) {
                  alert("Please fill in all payment details");
                  return;
                }
                alert("Payment processed successfully!");
                setShowPayment(false);
                setCart([]);
                setPaymentForm({
                  cardNumber: "",
                  expiryDate: "",
                  cvv: "",
                  cardholderName: "",
                });
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Pay रू {getFinalTotal().toLocaleString()} NPR
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
            <div className="w-3 h-3 mr-1">🔒</div>
            Your payment information is encrypted and secure
          </div>
        </div>
      </div>
    </div>
  );

  // Handle search functionality
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      console.log("🔍 Starting search for:", searchTerm);

      // Get all available categories first
      const availableCategories = await getCenterCategories();
      console.log("📋 Available categories:", availableCategories);

      // Check if search term matches any category (case-insensitive)
      const matchingCategories = availableCategories.filter((category) =>
        category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log("🎯 Matching categories:", matchingCategories);

      let allCenters = [];

      if (matchingCategories.length > 0) {
        // Search by each matching category
        for (const category of matchingCategories) {
          console.log(`🔍 Searching centers for category: ${category}`);
          try {
            const centers = await getCentersByCategory(category);
            console.log(
              `📍 Found ${centers.length} centers for category ${category}:`,
              centers
            );
            allCenters.push(...centers);
          } catch (error) {
            console.error(
              `❌ Error fetching centers for category ${category}:`,
              error
            );
          }
        }

        // Remove duplicates based on center ID
        const uniqueCenters = allCenters.filter(
          (center, index, self) =>
            index === self.findIndex((c) => c._id === center._id)
        );

        console.log(`📊 Total unique centers found: ${uniqueCenters.length}`);

        // Format results for display
        const formattedResults = uniqueCenters.map((center) => ({
          id: center._id,
          name: center.name,
          center: center.name,
          location:
            center.location || center.district || "Location not specified",
          categories: center.categories || [],
          description: `Distribution center supporting: ${(
            center.categories || []
          ).join(", ")}`,
          type: "center",
        }));

        setSearchResults(formattedResults);

        if (formattedResults.length === 0) {
          setSearchError(
            `No centers found for the matching categories. Please try a different search term.`
          );
        }
      } else {
        console.log(
          "❌ No matching categories found for search term:",
          searchTerm
        );
        setSearchResults([]);
        setSearchError(
          `No centers found for category "${searchTerm}". Available categories: ${availableCategories
            .slice(0, 5)
            .join(", ")}${availableCategories.length > 5 ? "..." : ""}`
        );
      }
    } catch (error) {
      console.error("❌ Search error:", error);
      setSearchError("Failed to search centers. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Add useEffect for real-time search
  useEffect(() => {
    if (searchTerm.trim().length > 2) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 500); // Debounce search by 500ms

      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setSearchError(null);
    }
  }, [searchTerm]);

  const renderMarketplace = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          const handleCardClick = () => {
            switch (stat.title) {
              case "Orders Placed":
                setShowOrdersModal(true);
                break;
              case "Total Spent":
                setShowSpentModal(true);
                break;
              case "Centers":
                setShowCentersModal(true);
                break;
              case "Pending Orders":
                setShowPendingModal(true);
                break;
              case "Discount Received":
                setShowDiscountModal(true);
                break;
              case "Commission Paid to Admin":
                setShowCommissionModal(true);
                break;
              case "Total Inventory":
                setShowInventoryModal(true);
                break;
              default:
                break;
            }
          };

          return (
            <Card
              key={index}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:scale-105 transform"
              onClick={handleCardClick}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                </div>
                <IconComponent className={`h-8 w-8 ${stat.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Search Results or Error */}
      {(searchResults.length > 0 || searchError) && (
        <Card className="p-6">
          {searchError ? (
            <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Search Notice</h4>
                <p className="text-sm text-amber-700 mt-1">{searchError}</p>
              </div>
            </div>
          ) : (
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Search Results ({searchResults.length})
            </h3>
          )}

          {searchResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{result.name}</h4>
                    {result.type === "center" ? (
                      <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                        Center
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-orange-600">
                        {result.price}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {result.description}
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Location: {result.location}
                  </p>
                  {result.categories && result.categories.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Categories:</p>
                      <div className="flex flex-wrap gap-1">
                        {result.categories.map((category, index) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (result.type === "center") {
                        // Handle center selection - maybe show products from this center
                        console.log("Selected center:", result);
                        alert(`Selected center: ${result.name}`);
                      } else {
                        addToCart(result);
                      }
                    }}
                  >
                    {result.type === "center" ? "View Center" : "Add to Cart"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Products Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            {selectedCategory ? `${selectedCategory} Products` : 'All Products from All Centers'}
          </h3>
          <div className="flex items-center space-x-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {productCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {productError && (
          <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Error</h4>
              <p className="text-sm text-red-700 mt-1">{productError}</p>
            </div>
          </div>
        )}

        {isLoadingProducts ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading products...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No Products Available
            </h4>
            <p className="text-gray-500">
              {selectedCategory 
                ? `No products available in ${selectedCategory} category`
                : 'No products available from any center'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                  <img
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                      {product.name}
                    </h4>
                    <span className="text-sm font-bold text-blue-600 ml-2">
                      रू {product.price.toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      {product.category}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      product.status === 'available' 
                        ? 'bg-green-100 text-green-800'
                        : product.status === 'out_of_stock'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    <p className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {product.vendorId?.businessName || 'Unknown Center'}
                    </p>
                  </div>
                  
                  <Button
                    size="sm"
                    className="w-full"
                    disabled={product.status !== 'available'}
                    onClick={() => addToCart({
                      id: product._id,
                      name: product.name,
                      price: `रू ${product.price.toLocaleString()}`,
                      image: product.images[0],
                      center: product.vendorId?.businessName || 'Unknown Center',
                      description: product.description,
                      category: product.category
                    })}
                  >
                    {product.status === 'available' ? 'Add to Cart' : 'Unavailable'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          My Purchase Orders
        </h3>
        <Button className="bg-orange-600 hover:bg-orange-700">
          <Plus className="h-4 w-4 mr-2" />
          New Order
        </Button>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-sm font-medium text-gray-600">
                  Order ID
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">
                  Center
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">
                  Items
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">
                  Amount
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">
                  Status
                </th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {myOrders.map((order) => (
                <tr key={order.id} className="border-b">
                  <td className="py-3 text-sm font-medium">{order.id}</td>
                  <td className="py-3 text-sm">{order.center}</td>
                  <td className="py-3 text-sm">{order.items}</td>
                  <td className="py-3 text-sm font-medium">{order.amount}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 text-sm text-gray-600">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  // Messages content
  const renderMessages = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
        <Button
          className="bg-orange-600 hover:bg-orange-700"
          onClick={() => setShowMessageModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      <Card className="p-6">
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Messages Yet
          </h3>
          <p className="text-gray-600">
            Start a conversation with centers or other vendors.
          </p>
          <Button
            className="mt-4 bg-orange-600 hover:bg-orange-700"
            onClick={() => setShowMessageModal(true)}
          >
            Open Message Box
          </Button>
        </div>
      </Card>
    </div>
  );

  // Profile content
  const renderProfileContent = () => (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Vendor Profile
          </h3>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowProfileModal(true)}
          >
            View Details
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">
              Business Information
            </h4>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="text-gray-500">Business Name:</span>{" "}
                {vendorProfile.businessName}
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Owner/Manager:</span>{" "}
                {vendorProfile.ownerName}
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Status:</span>
                <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {vendorProfile.status}
                </span>
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Joined Date:</span>{" "}
                {vendorProfile.joinedDate}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 mb-2">
              Contact Information
            </h4>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="text-gray-500">Email:</span>{" "}
                {vendorProfile.email}
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Phone:</span>{" "}
                {vendorProfile.phone}
              </p>
              <p className="text-sm">
                <span className="text-gray-500">Address:</span>{" "}
                {vendorProfile.address}
              </p>
              <p className="text-sm">
                <span className="text-gray-500">District:</span>{" "}
                {vendorProfile.district}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Uploaded Documents
        </h3>
        {vendorProfile.documents && vendorProfile.documents.length > 0 ? (
          <div className="space-y-3">
            {vendorProfile.documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-gray-500">{doc.type}</p>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No documents uploaded</p>
        )}
      </Card>
    </div>
  );

  // Profile Modal
  const renderProfileModal = () => {
    if (!showProfileModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b sticky top-0 bg-white z-10 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Vendor Profile Details
            </h2>
            <button
              onClick={() => setShowProfileModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Business Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Business Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Business Name</p>
                  <p className="font-medium">{vendorProfile.businessName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Owner/Manager</p>
                  <p className="font-medium">{vendorProfile.ownerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {vendorProfile.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Joined Date</p>
                  <p className="font-medium">{vendorProfile.joinedDate}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{vendorProfile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{vendorProfile.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{vendorProfile.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">District</p>
                  <p className="font-medium">{vendorProfile.district}</p>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Business Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">PAN Number</p>
                  <p className="font-medium">{vendorProfile.panNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bank Name</p>
                  <p className="font-medium">
                    {vendorProfile.bankDetails.bankName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Number</p>
                  <p className="font-medium">
                    {vendorProfile.bankDetails.accountNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Account Holder</p>
                  <p className="font-medium">
                    {vendorProfile.bankDetails.holderName}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Viewer Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Uploaded Documents
              </h3>
              {vendorProfile.documents && vendorProfile.documents.length > 0 ? (
                <div className="space-y-3">
                  {vendorProfile.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.type}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No documents uploaded</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img
                src="/image/vrslogo.png"
                alt="VRS Logo"
                className="w-8 h-8 object-contain mr-3"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <h1 className="text-xl font-bold text-gray-900">
                Vendor Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative"
                >
                  <Bell className="h-4 w-4" />
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {notifications.filter((n) => !n.read).length}
                    </span>
                  )}
                </Button>
                {showNotifications && renderNotifications()}
              </div>

              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCart(true)}
                  className="relative"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {cart.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.length}
                    </span>
                  )}
                </Button>
              </div>

              <div className="relative group">
                <div className="text-sm cursor-pointer">
                  <p className="font-medium text-gray-900">
                    {vendorProfile.businessName}
                  </p>
                  <p className="text-gray-500">Vendor</p>
                </div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">
                        {vendorProfile.businessName}
                      </p>
                      <p className="text-gray-500">{vendorProfile.email}</p>
                    </div>
                    <button
                      onClick={
                        onLogout || (() => console.log("Logout clicked"))
                      }
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <nav className="flex space-x-8">
              {[
                { id: "marketplace", label: "Marketplace", icon: Package },
                { id: "orders", label: "My Orders", icon: ShoppingCart },
                { id: "profile", label: "My Profile", icon: Users },
                { id: "messages", label: "Messages", icon: MessageCircle },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Search Section */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products, centers, or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2"
                disabled={isSearching}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "marketplace" && renderMarketplace()}
        {activeTab === "orders" && renderOrders()}
        {activeTab === "profile" && renderProfileContent()}
        {activeTab === "messages" && renderMessages()}
        {activeTab === "analytics" && renderAnalytics()}
      </div>
      {showCart && renderCartModal()}
      {showPayment && renderPaymentModal()}
      {showMessageModal && renderMessageModal()}
      {renderProfileModal()}
      {showOrdersModal && renderOrdersModal()}
      {showSpentModal && renderSpentModal()}
      {showCentersModal && renderCentersModal()}
      {showPendingModal && renderPendingModal()}
      {showDiscountModal && renderDiscountModal()}
      {showCommissionModal && renderCommissionModal()}
      {showInventoryModal && renderInventoryModal()}
    </div>
  );
}
