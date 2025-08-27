import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  Plus,
  Edit,
  Eye,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  LogOut,
  ChevronDown,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./../ui/tabs";
import { Badge } from "../ui/badge";
import {
  getCategories,
  createCategory,
  deleteCategory,
} from "../../utils/categoryApi";
import { User as UserType } from "../../types/index";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  status: "available" | "out_of_stock" | "discontinued";
  images: string[];
  createdDate: string;
  updatedDate: string;
}

interface IncomingOrder {
  id: string;
  vendorId: string;
  centerId: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  totalAmount: number;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered";
  requestedDeliveryDate: string;
  createdDate: string;
  updatedDate: string;
  vendor: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

interface CenterDashboardProps {
  user: UserType;
  onLogout: () => void;
}

export default function CenterDashboard({
  user,
  onLogout,
}: CenterDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    status: "available" as const,
    images: [""],
  });
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use real user data instead of mock data
  const centerProfile = {
    name: user.businessName || user.name || "Distribution Center",
    managerName: user.name || "Manager",
    email: user.email,
    phone: user.phone || "N/A",
    address: user.address || "N/A",
    district: user.district || "N/A",
    region: user.region || "N/A",
    establishedDate: user.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : "N/A",
    status: user.status || "Active",
    capacity: "5000 kg", // This might need to come from user data if available
    currentOrders: 28, // This should come from actual order data
    utilization: "75%", // This should be calculated from actual data
    documents: [
      { name: "Registration Certificate", type: "PDF Document", id: "doc1" },
      { name: "Facility Layout", type: "PDF Document", id: "doc2" },
      { name: "Safety Compliance", type: "PDF Document", id: "doc3" },
    ],
  };

  // Mock data - Center's inventory with footwear items
  const mockProducts: Product[] = [
    {
      id: "FW001",
      name: "Nike Air Max 270",
      description: "Iconic Nike Air Max with visible cushioning",
      price: 8999,
      category: "Footwear",
      stock: 45,
      status: "available",
      images: [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      ],
      createdDate: "2024-01-15",
      updatedDate: "2024-01-20",
    },
    {
      id: "FW002",
      name: "Adidas Ultraboost 22",
      description: "Premium running shoes with responsive cushioning",
      price: 12999,
      category: "Footwear",
      stock: 32,
      status: "available",
      images: [
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&h=400&fit=crop",
      ],
      createdDate: "2024-01-10",
      updatedDate: "2024-01-18",
    },
    {
      id: "FW003",
      name: "Converse Chuck Taylor",
      description: "Classic canvas sneakers for everyday wear",
      price: 4999,
      category: "Footwear",
      stock: 78,
      status: "available",
      images: [
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
      ],
      createdDate: "2024-01-12",
      updatedDate: "2024-01-19",
    },
    {
      id: "FW004",
      name: "Puma RS-X Sneakers",
      description: "Bold chunky sneakers with retro design",
      price: 7499,
      category: "Footwear",
      stock: 56,
      status: "available",
      images: [
        "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=400&h=400&fit=crop",
      ],
      createdDate: "2024-01-14",
      updatedDate: "2024-01-21",
    },
    {
      id: "FW005",
      name: "Vans Old Skool",
      description: "Skate shoes with signature side stripe",
      price: 5999,
      category: "Footwear",
      stock: 89,
      status: "available",
      images: [
        "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&h=400&fit=crop",
      ],
      createdDate: "2024-01-16",
      updatedDate: "2024-01-22",
    },
    {
      id: "FW006",
      name: "New Balance 990v5",
      description: "Premium made in USA running shoes",
      price: 11999,
      category: "Footwear",
      stock: 28,
      status: "available",
      images: [
        "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&h=400&fit=crop",
      ],
      createdDate: "2024-01-13",
      updatedDate: "2024-01-20",
    },
    {
      id: "FW007",
      name: "Reebok Classic Leather",
      description: "Timeless leather sneakers with retro appeal",
      price: 6499,
      category: "Footwear",
      stock: 67,
      status: "available",
      images: [
        "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop",
      ],
      createdDate: "2024-01-17",
      updatedDate: "2024-01-23",
    },
    {
      id: "FW008",
      name: "Jordan Air Force 1",
      description: "Iconic basketball shoes with premium materials",
      price: 9999,
      category: "Footwear",
      stock: 41,
      status: "available",
      images: [
        "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=400&fit=crop",
      ],
      createdDate: "2024-01-11",
      updatedDate: "2024-01-19",
    },
    {
      id: "FW009",
      name: "Timberland Boots",
      description: "Durable waterproof boots for outdoor activities",
      price: 13999,
      category: "Footwear",
      stock: 23,
      status: "available",
      images: [
        "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop",
      ],
      createdDate: "2024-01-18",
      updatedDate: "2024-01-24",
    },
    {
      id: "FW010",
      name: "Clarks Desert Boots",
      description: "Classic suede chukka boots with crepe sole",
      price: 8499,
      category: "Footwear",
      stock: 35,
      status: "available",
      images: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      ],
      createdDate: "2024-01-19",
      updatedDate: "2024-01-25",
    },
    {
      id: "FW011",
      name: "Skechers Go Walk",
      description: "Lightweight walking shoes with memory foam insole",
      price: 4499,
      category: "Footwear",
      stock: 92,
      status: "available",
      images: [
        "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop",
      ],
      createdDate: "2024-01-15",
      updatedDate: "2024-01-21",
    },
    {
      id: "FW012",
      name: "Asics Gel-Kayano",
      description: "High-performance running shoes with gel cushioning",
      price: 10999,
      category: "Footwear",
      stock: 38,
      status: "available",
      images: [
        "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop",
      ],
      createdDate: "2024-01-12",
      updatedDate: "2024-01-18",
    },
    {
      id: "FW013",
      name: "Under Armour HOVR",
      description: "Performance athletic shoes with energy return",
      price: 9499,
      category: "Footwear",
      stock: 44,
      status: "available",
      images: [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
      ],
      createdDate: "2024-01-20",
      updatedDate: "2024-01-26",
    },
    {
      id: "FW014",
      name: "Fila Disruptor II",
      description: "Chunky platform sneakers with distinctive design",
      price: 6999,
      category: "Footwear",
      stock: 61,
      status: "available",
      images: [
        "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=400&h=400&fit=crop",
      ],
      createdDate: "2024-01-14",
      updatedDate: "2024-01-20",
    },
    {
      id: "FW015",
      name: "Dr. Martens 1460",
      description: "Iconic leather boots with yellow stitching",
      price: 14999,
      category: "Footwear",
      stock: 19,
      status: "available",
      images: [
        "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
      ],
      createdDate: "2024-01-16",
      updatedDate: "2024-01-22",
    },
  ];

  // Mock data - Incoming orders from vendors
  const mockIncomingOrders: IncomingOrder[] = [
    {
      id: "ORD-001",
      vendorId: "vendor-1",
      centerId: "center-1",
      items: [
        {
          productId: "prod-1",
          productName: "Bowl of Steamed Rice",
          quantity: 10,
          price: 150,
          total: 1500,
        },
        {
          productId: "prod-2",
          productName: "Assorted Vegetables",
          quantity: 5,
          price: 200,
          total: 1000,
        },
      ],
      totalAmount: 2500,
      status: "pending",
      requestedDeliveryDate: "2024-01-25",
      createdDate: "2024-01-20",
      updatedDate: "2024-01-20",
      vendor: {
        id: "vendor-1",
        name: "Fresh Foods Restaurant",
        email: "orders@freshfoods.com",
        phone: "+977-9841234567",
      },
    },
    {
      id: "ORD-002",
      vendorId: "vendor-2",
      centerId: "center-1",
      items: [
        {
          productId: "prod-3",
          productName: "Assorted Spices",
          quantity: 3,
          price: 300,
          total: 900,
        },
      ],
      totalAmount: 900,
      status: "confirmed",
      requestedDeliveryDate: "2024-01-24",
      createdDate: "2024-01-18",
      updatedDate: "2024-01-19",
      vendor: {
        id: "vendor-2",
        name: "Spice Corner Cafe",
        email: "supply@spicecorner.com",
        phone: "+977-9851234567",
      },
    },
    {
      id: "ORD-003",
      vendorId: "vendor-3",
      centerId: "center-1",
      items: [
        {
          productId: "prod-1",
          productName: "Bowl of Steamed Rice",
          quantity: 20,
          price: 150,
          total: 3000,
        },
      ],
      totalAmount: 3000,
      status: "processing",
      requestedDeliveryDate: "2024-01-26",
      createdDate: "2024-01-19",
      updatedDate: "2024-01-21",
      vendor: {
        id: "vendor-3",
        name: "Mountain View Hotel",
        email: "procurement@mountainview.com",
        phone: "+977-9861234567",
      },
    },
  ];

  const updateOrderStatus = (
    orderId: string,
    newStatus: IncomingOrder["status"]
  ) => {
    // In real app, this would update the order status via API
    console.log(`Updating order ${orderId} to status: ${newStatus}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "confirmed":
        return "default";
      case "processing":
        return "secondary";
      case "shipped":
        return "default";
      case "delivered":
        return "default";
      default:
        return "secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <TrendingUp className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Calculate overview stats
  const totalRevenue = mockIncomingOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );
  const pendingOrders = mockIncomingOrders.filter(
    (order) => order.status === "pending"
  ).length;
  const totalProducts = mockProducts.length;

  const handleLogout = () => {
    // Call the onLogout prop function
    onLogout();
  };

  // Category management functions
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch categories");
      console.error("Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      setLoading(true);
      const data = await createCategory(newCategory.trim());
      setCategories([...categories, data]);
      setNewCategory("");
      setError(null);
    } catch (err) {
      setError("Failed to create category");
      console.error("Error creating category:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeCategory = async (categoryToRemove: {
    _id: string;
    name: string;
  }) => {
    try {
      setLoading(true);
      await deleteCategory(categoryToRemove._id);
      setCategories(
        categories.filter((cat) => cat._id !== categoryToRemove._id)
      );
      setError(null);
    } catch (err) {
      setError("Failed to delete category");
      console.error("Error deleting category:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    if (
      !newProduct.name ||
      !newProduct.price ||
      !newProduct.category ||
      !newProduct.stock
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const productToAdd: Product = {
      id: `prod-${Date.now()}`,
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      category: newProduct.category,
      stock: parseInt(newProduct.stock),
      status: newProduct.status,
      images: newProduct.images.filter((img) => img.trim() !== ""),
      createdDate: new Date().toISOString().split("T")[0],
      updatedDate: new Date().toISOString().split("T")[0],
    };

    // In a real app, this would make an API call to create the product
    console.log("Adding new product:", productToAdd);
    alert(`Product "${productToAdd.name}" added successfully!`);

    // Reset form and close modal
    setNewProduct({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      status: "available",
      images: [""],
    });
    setShowAddProductModal(false);
  };

  // Add Product Modal
  const renderAddProductModal = () => {
    if (!showAddProductModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b sticky top-0 bg-white z-10 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Add New Product
            </h2>
            <button
              onClick={() => setShowAddProductModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newProduct.description}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
                placeholder="Enter product description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (NPR)
                </label>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, stock: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={newProduct.category}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={newProduct.status}
                onChange={(e) =>
                  setNewProduct({
                    ...newProduct,
                    status: e.target.value as
                      | "available"
                      | "out_of_stock"
                      | "discontinued",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="available">Available</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Image URL
              </label>
              <input
                type="url"
                value={newProduct.images[0]}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, images: [e.target.value] })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddProductModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddProduct}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Add Product
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Load categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

  // Profile content
  const renderProfileContent = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Center Profile</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProfileModal(true)}
            >
              View Details
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                Center Information
              </h4>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="text-gray-500">Center Name:</span>{" "}
                  {centerProfile.name}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Manager:</span>{" "}
                  {centerProfile.managerName}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {centerProfile.status}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Established Date:</span>{" "}
                  {centerProfile.establishedDate}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Region:</span>{" "}
                  {centerProfile.region}
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
                  {centerProfile.email}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Phone:</span>{" "}
                  {centerProfile.phone}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Address:</span>{" "}
                  {centerProfile.address}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">District:</span>{" "}
                  {centerProfile.district}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operational Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Storage Capacity</p>
              <p className="text-xl font-semibold">{centerProfile.capacity}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Current Orders</p>
              <p className="text-xl font-semibold">
                {centerProfile.currentOrders}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Utilization</p>
              <p className="text-xl font-semibold">
                {centerProfile.utilization}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {centerProfile.documents && centerProfile.documents.length > 0 ? (
            <div className="space-y-3">
              {centerProfile.documents.map((doc) => (
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Center Categories</CardTitle>
          <p className="text-sm text-gray-600">
            Manage the product categories your center supports
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add new category"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                onKeyPress={(e) => e.key === "Enter" && addCategory()}
              />
              <Button onClick={addCategory} variant="outline">
                Add
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {loading ? (
                <p className="text-gray-500">Loading categories...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <div
                    key={category._id}
                    className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{category.name}</span>
                    <button
                      onClick={() => removeCategory(category)}
                      className="ml-2 text-green-600 hover:text-green-900"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No categories found</p>
              )}
            </div>
          </div>
        </CardContent>
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
              Center Profile Details
            </h2>
            <button
              onClick={() => setShowProfileModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Center Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Center Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Center Name</p>
                  <p className="font-medium">{centerProfile.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Manager</p>
                  <p className="font-medium">{centerProfile.managerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {centerProfile.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Established Date</p>
                  <p className="font-medium">{centerProfile.establishedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Region</p>
                  <p className="font-medium">{centerProfile.region}</p>
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
                  <p className="font-medium">{centerProfile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{centerProfile.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{centerProfile.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">District</p>
                  <p className="font-medium">{centerProfile.district}</p>
                </div>
              </div>
            </div>

            {/* Operational Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Operational Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Storage Capacity</p>
                  <p className="font-medium">{centerProfile.capacity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Orders</p>
                  <p className="font-medium">{centerProfile.currentOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Utilization</p>
                  <p className="font-medium">{centerProfile.utilization}</p>
                </div>
              </div>
            </div>

            {/* Document Viewer Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Uploaded Documents
              </h3>
              {centerProfile.documents && centerProfile.documents.length > 0 ? (
                <div className="space-y-3">
                  {centerProfile.documents.map((doc) => (
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

            {/* Category Management Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Center Categories
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Manage the product categories your center supports
              </p>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Add new category"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    onKeyPress={(e) => e.key === "Enter" && addCategory()}
                  />
                  <Button onClick={addCategory} variant="outline">
                    Add
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {loading ? (
                    <p className="text-gray-500">Loading categories...</p>
                  ) : error ? (
                    <p className="text-red-500">{error}</p>
                  ) : categories.length > 0 ? (
                    categories.map((category) => (
                      <div
                        key={category._id}
                        className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{category.name}</span>
                        <button
                          onClick={() => removeCategory(category)}
                          className="ml-2 text-green-600 hover:text-green-900"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No categories found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <LayoutDashboard className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Center Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Center Profile
                  <ChevronDown className="h-4 w-4" />
                </Button>
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-gray-900">
                          {centerProfile.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {centerProfile.email}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setShowProfileModal(true);
                          setShowProfileDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => {
                          onLogout();
                          setShowProfileDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Incoming Orders ({pendingOrders})
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Business Overview
              </h2>
              <p className="text-gray-600 mt-1">
                Monitor your center's performance and key metrics
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="text-center p-6">
                  <CreditCard className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    रू{totalRevenue.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center p-6">
                  <ShoppingCart className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">
                    Pending Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {pendingOrders}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center p-6">
                  <Package className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">
                    Total Products
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalProducts}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="text-center p-6">
                  <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-600">
                    Active Vendors
                  </p>
                  <p className="text-2xl font-bold text-gray-900">12</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockIncomingOrders.slice(0, 3).map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{order.id}</p>
                          <p className="text-sm text-gray-600">
                            {order.vendor.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">रू{order.totalAmount}</p>
                          <Badge
                            variant={getStatusColor(order.status)}
                            className="text-xs"
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Inventory Management
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage your products and stock levels ({mockProducts.length}{" "}
                  items)
                </p>
              </div>
              <Button onClick={() => setShowAddProductModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            {mockProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No products available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {mockProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={
                            product.images[0] ||
                            "/placeholder.svg?height=200&width=200"
                          }
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              "/placeholder.svg?height=200&width=200";
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                            {product.name}
                          </h3>
                          <Badge
                            variant={
                              product.stock < 10 ? "destructive" : "secondary"
                            }
                            className="text-xs"
                          >
                            {product.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-green-600">
                            रू{product.price}
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              product.stock < 10
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            Stock: {product.stock}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <Badge variant="outline" className="text-xs">
                            {product.category}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 bg-transparent"
                              title="Edit Product"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 bg-transparent"
                              title="View Details"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white"
                              title="Process Order"
                              onClick={() => {
                                // Handle order processing for this product
                                console.log(
                                  `Processing orders for ${product.name}`
                                );
                                // This would typically open a modal showing pending orders for this product
                                // and allow the center to fulfill them
                              }}
                            >
                              <ShoppingCart className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Incoming Orders
              </h2>
              <p className="text-gray-600 mt-1">Manage orders from vendors</p>
            </div>

            <div className="space-y-4">
              {mockIncomingOrders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {order.id}
                        </h3>
                        <p className="text-sm text-gray-600">
                          From: {order.vendor.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Contact: {order.vendor.phone}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={getStatusColor(order.status)}
                          className="mb-2"
                        >
                          {getStatusIcon(order.status)}
                          <span className="ml-1">{order.status}</span>
                        </Badge>
                        <p className="text-lg font-bold text-gray-900">
                          रू{order.totalAmount}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm bg-gray-50 p-2 rounded"
                        >
                          <span>
                            {item.productName} × {item.quantity}
                          </span>
                          <span>रू{item.total}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <p>Requested Delivery: {order.requestedDeliveryDate}</p>
                        <p>Order Date: {order.createdDate}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => {
                            // Update order status to processing
                            const updatedOrders = mockIncomingOrders.map((o) =>
                              o.id === order.id
                                ? { ...o, status: "processing" as const }
                                : o
                            );
                            // In a real app, this would make an API call to update the order
                            console.log(
                              `Order ${order.id} status updated to processing`
                            );
                            alert(`Order ${order.id} is now being processed!`);
                          }}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Process Order
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            {renderProfileContent()}
          </TabsContent>
        </Tabs>
      </div>

      {renderProfileModal()}
      {renderAddProductModal()}
    </div>
  );
}
