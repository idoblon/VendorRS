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
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./../ui/tabs";
import { Badge } from "../ui/badge";
import { getProductCategories } from "../../utils/productApi";
import { User as UserType } from "../../types/index";
import { MessageBox } from "../ui/MessageBox";
import { getUnreadCount } from "../../utils/messageApi";
import { createProduct, getProductsByCenter, Product as ApiProduct } from "../../utils/productApi";
import axiosInstance from "../../utils/axios";
import nepalAddressData from "../../data/nepaladdress.json";

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
  // Utility function to get province from district
  const getProvinceFromDistrict = (districtName: string): string => {
    if (!districtName || districtName.trim() === "") {
      console.log("No district name provided");
      return "";
    }

    const normalizedDistrictName = districtName.trim().toLowerCase();
    console.log(`Attempting to find province for district: "${districtName}" (normalized: "${normalizedDistrictName}")`);

    // Find the province that contains this district
    for (const [provinceId, districts] of Object.entries(nepalAddressData.districts)) {
      const district = districts.find(d => d.displayName.toLowerCase() === normalizedDistrictName);
      if (district) {
        const province = nepalAddressData.provinces.find(p => p.id === provinceId);
        console.log(`Found province via exact match: ${province?.displayName} for district: ${districtName}`);
        return province ? province.displayName : "";
      }
    }

    // If exact match not found, try partial matching
    for (const [provinceId, districts] of Object.entries(nepalAddressData.districts)) {
      const district = districts.find(d =>
        d.displayName.toLowerCase().includes(normalizedDistrictName) ||
        normalizedDistrictName.includes(d.displayName.toLowerCase())
      );
      if (district) {
        const province = nepalAddressData.provinces.find(p => p.id === provinceId);
        console.log(`Found province via partial match: ${province?.displayName} for district: ${districtName}`);
        return province ? province.displayName : "";
      }
    }

    // If still not found, try fuzzy matching by removing common suffixes/prefixes
    const cleanedDistrictName = normalizedDistrictName
      .replace(/\s+/g, '') // Remove spaces
      .replace(/district$/i, '') // Remove "district" suffix
      .replace(/^district\s+/i, '') // Remove "district" prefix
      .replace(/municipality$/i, '') // Remove "municipality" suffix
      .replace(/municipal$/i, '') // Remove "municipal" suffix
      .replace(/rural municipality$/i, '') // Remove "rural municipality" suffix
      .replace(/sub-metropolitan$/i, '') // Remove "sub-metropolitan" suffix
      .replace(/metropolitan$/i, ''); // Remove "metropolitan" suffix

    console.log(`Trying fuzzy match with cleaned district name: "${cleanedDistrictName}"`);

    for (const [provinceId, districts] of Object.entries(nepalAddressData.districts)) {
      const district = districts.find(d => {
        const cleanedDataDistrict = d.displayName.toLowerCase()
          .replace(/\s+/g, '')
          .replace(/district$/i, '')
          .replace(/^district\s+/i, '')
          .replace(/municipality$/i, '')
          .replace(/municipal$/i, '')
          .replace(/rural municipality$/i, '')
          .replace(/sub-metropolitan$/i, '')
          .replace(/metropolitan$/i, '');
        return cleanedDataDistrict.includes(cleanedDistrictName) ||
               cleanedDistrictName.includes(cleanedDataDistrict);
      });
      if (district) {
        const province = nepalAddressData.provinces.find(p => p.id === provinceId);
        console.log(`Found province via fuzzy match: ${province?.displayName} for district: ${districtName}`);
        return province ? province.displayName : "";
      }
    }

    // If still not found, try case-insensitive substring matching with all district names
    for (const [provinceId, districts] of Object.entries(nepalAddressData.districts)) {
      const district = districts.find(d => {
        const districtLower = d.displayName.toLowerCase();
        const districtNoSpaces = districtLower.replace(/\s+/g, '');
        return districtLower.includes(normalizedDistrictName) ||
               normalizedDistrictName.includes(districtLower) ||
               districtNoSpaces.includes(cleanedDistrictName) ||
               cleanedDistrictName.includes(districtNoSpaces);
      });
      if (district) {
        const province = nepalAddressData.provinces.find(p => p.id === provinceId);
        console.log(`Found province via comprehensive match: ${province?.displayName} for district: ${districtName}`);
        return province ? province.displayName : "";
      }
    }

    console.log(`Could not find province for district: "${districtName}". Available districts:`, Object.values(nepalAddressData.districts).flat().map(d => d.displayName));
    return "";
  };

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
    status: "available" as "available" | "out_of_stock" | "discontinued",
    images: [""],
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showMessages, setShowMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [centerProfile, setCenterProfile] = useState<any>(null);

  // Fetch center profile on component mount
  useEffect(() => {
    const fetchCenterProfile = async () => {
      try {
        const response = await axiosInstance.get("/api/users/profile");
        if (response.data.success) {
          setCenterProfile(response.data.data.user);
        }
      } catch (error) {
        console.error("Failed to fetch center profile:", error);
        // Fallback to user prop if profile fetch fails
        setCenterProfile(user);
      }
    };

    fetchCenterProfile();
  }, [user]);

  // Use real user data from registration - only use properties that exist on User interface
  const displayProfile = centerProfile || user;
  const profileData = {
    name: displayProfile.businessName || displayProfile.name || "Distribution Center",
    managerName: displayProfile.name || "Manager",
    email: displayProfile.email,
    phone: displayProfile.phone || "N/A",
    address: displayProfile.address || "N/A",
    district: displayProfile.district || "N/A",
    establishedDate: displayProfile.createdAt
      ? new Date(displayProfile.createdAt).toLocaleDateString()
      : "N/A",
    status: displayProfile.status || "Active",
    panNumber: displayProfile.panNumber || "N/A",
    // Use documents from user data if available
    documents: displayProfile.documents || [
      { name: "Registration Certificate", type: "PDF Document" },
      { name: "Facility Layout", type: "PDF Document" },
      { name: "Safety Compliance", type: "PDF Document" },
    ],
  };





  const updateOrderStatus = (
    orderId: string,
    newStatus: IncomingOrder["status"]
  ) => {
    // In real app, this would update the order status via API
    console.log(`Updating order ${orderId} to status: ${newStatus}`);
  };

  const getStatusColor = (status: string): "secondary" => {
    // All statuses return "secondary" variant as per current logic
    return "secondary";
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
  const totalRevenue = 0; // Will be calculated from real API data
  const pendingOrders = 0; // Will be calculated from real API data
  const totalProducts = products.length;

  const handleLogout = () => {
    // Call the onLogout prop function
    onLogout();
  };

  // Category management functions
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getProductCategories();
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
      // For centers, we don't allow adding categories - they can only view existing ones
      setNewCategory("");
      setError("Centers cannot add new categories. Only administrators can manage categories.");
    } catch (err) {
      setError("Failed to add category");
      console.error("Error adding category:", err);
    } finally {
      setLoading(false);
    }
  };

  const removeCategory = async (categoryToRemove: string) => {
    try {
      setLoading(true);
      // For centers, we don't allow removing categories - they can only view existing ones
      setError("Centers cannot remove categories. Only administrators can manage categories.");
    } catch (err) {
      setError("Failed to remove category");
      console.error("Error removing category:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (
      !newProduct.name ||
      !newProduct.price ||
      !newProduct.category ||
      !newProduct.stock
    ) {
      alert("Please fill in all required fields");
      return;
    }

    // Validate that center has province and district from registration
    if (!displayProfile.province || !displayProfile.district) {
      alert("Your center profile is missing province or district information. Please contact support to update your profile.");
      return;
    }

    try {
      setLoading(true);

      // Prepare product data for API using center's stored province and district
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        availability: [
          {
            centerId: displayProfile._id || displayProfile.id,
            province: displayProfile.province,
            district: displayProfile.district,
            stock: parseInt(newProduct.stock),
          },
        ],
        images: newProduct.images
          .filter((img) => img.trim() !== "")
          .map((imgUrl, index) => ({
            filename: `image_${index + 1}`,
            originalName: `image_${index + 1}`,
            path: imgUrl,
            url: imgUrl,
            isPrimary: index === 0,
          })),
      };

      // Make API call to create the product
      await createProduct(productData);

      // Refresh the products list to show the new product
      await fetchProducts();

      alert(`Product "${newProduct.name}" added successfully!`);

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
    } catch (err: any) {
      console.error("Error adding product:", err);
      const message = err?.response?.data?.message || "Failed to add product. Please try again.";
      alert(message);
    } finally {
      setLoading(false);
    }
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
                  <option key={category} value={category}>
                    {category}
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

  // Fetch products for this center
  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      setProductsError(null);
      const centerId = user._id || user.id;
      const centerProducts = await getProductsByCenter(centerId);

      // Transform API products to match the local Product interface
      const transformedProducts: Product[] = centerProducts.map(apiProduct => ({
        id: apiProduct._id,
        name: apiProduct.name,
        description: apiProduct.description,
        price: apiProduct.price,
        category: apiProduct.category,
        stock: apiProduct.availability.find(avail => avail.centerId === centerId)?.stock || 0,
        status: apiProduct.status,
        images: apiProduct.images.map(img => img.url),
        createdDate: new Date(apiProduct.createdAt).toLocaleDateString(),
        updatedDate: new Date(apiProduct.updatedAt).toLocaleDateString(),
      }));

      setProducts(transformedProducts);
    } catch (err) {
      setProductsError("Failed to fetch products");
      console.error("Error fetching products:", err);
    } finally {
      setProductsLoading(false);
    }
  };

  // Load categories and products when component mounts
  useEffect(() => {
    fetchCategories();
    fetchProducts();
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
                  {displayProfile.name}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Manager:</span>{" "}
                  {displayProfile.managerName}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Status:</span>
                  <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {displayProfile.status}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Established Date:</span>{" "}
                  {displayProfile.establishedDate}
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
                  {displayProfile.email}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Phone:</span>{" "}
                  {displayProfile.phone}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">Address:</span>{" "}
                  {displayProfile.address}
                </p>
                <p className="text-sm">
                  <span className="text-gray-500">District:</span>{" "}
                  {displayProfile.district}
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
              <p className="text-xl font-semibold">1000 units</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Current Orders</p>
              <p className="text-xl font-semibold">
                {pendingOrders}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Utilization</p>
              <p className="text-xl font-semibold">
                75%
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
          {displayProfile.documents && displayProfile.documents.length > 0 ? (
            <div className="space-y-3">
              {displayProfile.documents.map((doc: any, index: number) => (
                <div
                  key={`${doc.name}-${index}`}
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
                    key={category}
                    className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                  >
                    <span>{category}</span>
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
                  <p className="font-medium">{displayProfile.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Manager</p>
                  <p className="font-medium">{displayProfile.managerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {displayProfile.status}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Established Date</p>
                  <p className="font-medium">{displayProfile.establishedDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Region</p>
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
                  <p className="font-medium">{displayProfile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{displayProfile.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{displayProfile.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">District</p>
                  <p className="font-medium">{displayProfile.district}</p>
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
                  <p className="font-medium">1000 units</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Current Orders</p>
                  <p className="font-medium">{pendingOrders}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Utilization</p>
                  <p className="font-medium">75%</p>
                </div>
              </div>
            </div>

            {/* Document Viewer Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Uploaded Documents
              </h3>
              {displayProfile.documents && displayProfile.documents.length > 0 ? (
                <div className="space-y-3">
                  {displayProfile.documents.map((doc: any, index: number) => (
                    <div
                      key={`${doc.name}-${index}`}
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
                        key={category}
                        className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                      >
                        <span>{category}</span>
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
              <img
                src="/image/vrslogo.png"
                alt="VRS Logo"
                className="w-8 h-8 object-contain mr-3"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <h1 className="text-2xl font-bold text-gray-900">
                Center Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowMessages(true)}
                className="flex items-center gap-2 relative"
              >
                <MessageCircle className="h-4 w-4" />
                Messages
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  {displayProfile.name || "Center"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-50">
                    <div className="py-1">
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
                    {/* Recent orders will be loaded from API */}
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No recent orders</p>
                      <p className="text-sm">Orders will appear here once received</p>
                    </div>
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
                  Manage your products and stock levels ({products.length}{" "}
                  items)
                </p>
              </div>
              <Button onClick={() => setShowAddProductModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No products available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
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
                            variant="primary"
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
              {/* Orders will be loaded from API */}
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No incoming orders</p>
                <p className="text-sm">Orders from vendors will appear here once received</p>
                <p className="text-sm mt-2">You can process and manage orders from this section</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            {renderProfileContent()}
          </TabsContent>
        </Tabs>
      </div>

      {renderProfileModal()}
      {renderAddProductModal()}
      <MessageBox 
        isOpen={showMessages} 
        onClose={() => setShowMessages(false)} 
      />
    </div>
  );
}
