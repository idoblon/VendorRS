import { useState, useEffect } from "react";
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
  MapPin,
  Search,
  Loader2,
  Percent,
  AlertCircle,
  ArrowLeft,
  MessageCircle,
  X,
  Eye,
  LogOut,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { MessageBox } from "../ui/MessageBox";
import { Image } from "../ui/Image";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  getVendorAnalytics,
  getVendorOrders,
  getOrderDetails,
  getUserDocuments,
  getCentersSalesRanking,
  getVendorTopCentersAnalytics,
  getCentersPerformance,
} from "../../utils/vendorApi";

import { findTopCentersByRevenue } from "../../utils/minHeap";
import axiosInstance from "../../utils/axios";
import { StripePaymentForm } from "../StripePaymentForm";

// Initialize Stripe
const stripePromise = loadStripe(
  "pk_test_51RryGpRwaX8v4ksQ7mwWIl0XuOrw5G3AWBHWAv7FypjMOsWBbrCrHM4YsEpBSBcZ6LI7u3CznXhdxgD8hnyP5hos00s8QuykF7"
);
import {
  getCentersByCategory,
  getCenterCategories,
  getAllCenters,
  Center,
} from "../../utils/centerApi";
import {
  getProducts,
  getProductCategories,
  Product,
} from "../../utils/productApi";
import { User, Order, OrderStatus } from "../../types/index";
import { getUnreadCount } from "../../utils/messageApi";

interface VendorDashboardProps {
  user: User;
  vendorName?: string;
  onLogout?: () => void;
}

export function VendorDashboard({
  user,
  vendorName = "ABC Trading Co.",
  onLogout,
}: VendorDashboardProps): JSX.Element {
  const [activeTab, setActiveTab] = useState("marketplace");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // Top Admin Centers state for marketplace
  const [topAdminCenters, setTopAdminCenters] = useState<any[]>([]);
  const [isLoadingAdminCenters, setIsLoadingAdminCenters] = useState(false);
  const [adminCentersError, setAdminCentersError] = useState<string | null>(
    null
  );

  // Admin Analytics state
  const [adminAnalytics, setAdminAnalytics] = useState<any[]>([]);
  const [isLoadingAdminAnalytics, setIsLoadingAdminAnalytics] = useState(false);
  const [adminAnalyticsError, setAdminAnalyticsError] = useState<string | null>(
    null
  );

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [centerSearchResults, setCenterSearchResults] = useState<Center[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchingCenters, setIsSearchingCenters] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [centerSearchError, setCenterSearchError] = useState<string | null>(
    null
  );
  const [categorySuggestions, setCategorySuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Product state
  const [products, setProducts] = useState<Product[]>([]);
  const [productCategories, setProductCategories] = useState<string[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);

  // Cart state
  const [cart, setCart] = useState<any[]>([]);
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  });

  // Payment state
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isCreatingPaymentIntent, setIsCreatingPaymentIntent] = useState(false);

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [isLoadingOrderDetails, setIsLoadingOrderDetails] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Messaging state
  const [showMessages, setShowMessages] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Document viewing state
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

  // Analytics card click state
  const [clickedCard, setClickedCard] = useState<string | null>(null);
  const [filteredProductsByCard, setFilteredProductsByCard] = useState<
    Product[]
  >([]);
  const [isLoadingCardProducts, setIsLoadingCardProducts] = useState(false);

  // Backend base URL for images
  const BACKEND_BASE_URL = "http://localhost:5000";

  // Handle analytics card click
  const handleCardClick = async (cardType: string) => {
    setClickedCard(cardType);
    setIsLoadingCardProducts(true);

    try {
      // For demonstration, we'll filter products based on card type
      let filtered = [];

      switch (cardType) {
        case "commission":
          // Show products that have generated commission (for demo, show all available products)
          filtered = products.filter((p) => p.status === "available");
          break;
        case "discount":
          // Show products that are eligible for discount (for demo, show products with price > 1000)
          filtered = products.filter((p) => p.price > 1000);
          break;
        case "products":
          // Show all products
          filtered = products;
          break;
        default:
          filtered = products;
      }

      setFilteredProductsByCard(filtered);
    } catch (error: unknown) {
      console.error("Error filtering products:", error);
    } finally {
      setIsLoadingCardProducts(false);
    }
  };

  // Handle back to analytics cards
  const handleBackToAnalytics = () => {
    setClickedCard(null);
    setFilteredProductsByCard([]);
  };

  // Fetch unread message count on mount and when showMessages changes
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadCount();
        setUnreadMessageCount(count);
      } catch (error: unknown) {
        console.error("Failed to fetch unread message count:", error);
      }
    };

    fetchUnreadCount();

    // Optionally, you can set an interval to refresh unread count periodically
    const intervalId = setInterval(fetchUnreadCount, 60000); // every 60 seconds

    return () => clearInterval(intervalId);
  }, [showMessages]);

  // Function to handle toggling message box visibility
  const toggleMessages = () => {
    setShowMessages(!showMessages);
  };

  // Vendor profile data
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
      ifscCode: "N/A",
      branch: "N/A",
    },
    documents:
      documents.length > 0
        ? documents
        : [
            {
              name: "PAN Card",
              type: "Image Document",
              id: "doc1",
              url: "/image/pan-card-sample.jpg", // Fallback to image URL
              previewUrl: "/image/pan-card-sample.jpg", // Preview URL for modal
            },
          ],
  };

  // State for centers and center categories
  const [centers, setCenters] = useState<Center[]>([]);
  const [centerCategories, setCenterCategories] = useState<string[]>([]);
  const [isLoadingCenters, setIsLoadingCenters] = useState(false);
  const [centerError, setCenterError] = useState<string | null>(null);

  const [productsByCategoryAndCenter, setProductsByCategoryAndCenter] =
    useState<Record<string, Record<string, Product[]>>>({});

  // Fetch products from all centers and categories
  useEffect(() => {
    const fetchProductData = async () => {
      try {
        setIsLoadingProducts(true);
        setProductError(null);

        // Fetch product categories first
        const categories = await getProductCategories();
        setProductCategories(categories);

        // Fetch center categories and centers (optional for vendors)
        setIsLoadingCenters(true);
        setCenterError(null);
        try {
          const centerCats = await getCenterCategories();
          setCenterCategories(centerCats);

          const allCenters = await getAllCenters();
          setCenters(allCenters);
        } catch (centerError) {
          console.warn(
            "Could not fetch center data, continuing without centers:",
            centerError
          );
          setCenterCategories([]);
          setCenters([]);
        }

        // Create a structure to hold products by category and center
        const productsByCategory: Record<
          string,
          Record<string, Product[]>
        > = {};

        // Initialize the structure with all categories
        categories.forEach((category) => {
          productsByCategory[category] = {};
          // Only initialize with centers if we have center data
          if (centers.length > 0) {
            centers.forEach((center) => {
              productsByCategory[category][center._id] = [];
            });
          }
        });

        // Fetch ALL products from all centers without any filters
        const productsData = await getProducts();
        const fetchedProducts = productsData.products || [];

        // Filter out any mock or placeholder products
        const filteredProducts = fetchedProducts.filter((product) => {
          if (!product.vendorId) return false;
          if (!product.images || product.images.length === 0) return false;
          if (product.images.some((img) => img.url.includes("placeholder.svg")))
            return false;
          if (
            (product.vendorId?.businessName ?? "")
              .toLowerCase()
              .includes("mock")
          )
            return false;
          return true;
        });

        // Organize products by category and center
        filteredProducts.forEach((product) => {
          const category = product.category;

          if (product.availability && product.availability.length > 0) {
            product.availability.forEach((avail) => {
              const centerId =
                typeof avail.centerId === "object"
                  ? avail.centerId._id
                  : avail.centerId;

              // Ensure category exists in the structure
              if (!productsByCategory[category]) {
                productsByCategory[category] = {};
              }

              // Add product to the appropriate category and center
              if (!productsByCategory[category][centerId]) {
                productsByCategory[category][centerId] = [];
              }
              productsByCategory[category][centerId].push(product);
            });
          } else {
            // If no availability data, still organize by category with a default center
            if (!productsByCategory[category]) {
              productsByCategory[category] = {};
            }
            if (!productsByCategory[category]["default"]) {
              productsByCategory[category]["default"] = [];
            }
            productsByCategory[category]["default"].push(product);
          }
        });

        setProductsByCategoryAndCenter(productsByCategory);
        setProducts(filteredProducts);
      } catch (error: unknown) {
        console.error("Error fetching product data:", error);
        setProductError(
          `Failed to load products: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      } finally {
        setIsLoadingProducts(false);
        setIsLoadingCenters(false);
      }
    };

    fetchProductData();
  }, []);

  // Fetch user documents on component mount
  useEffect(() => {
    const fetchUserDocuments = async () => {
      try {
        setIsLoadingDocuments(true);
        setDocumentsError(null);
        const userDocuments = await getUserDocuments();
        setDocuments(userDocuments);
      } catch (error: unknown) {
        console.error("Error fetching user documents:", error);
        setDocumentsError("Failed to load documents. Please try again.");
      } finally {
        setIsLoadingDocuments(false);
      }
    };

    fetchUserDocuments();
  }, []);

  // Fetch admin analytics data when marketplace tab is active
  useEffect(() => {
    if (activeTab === "marketplace") {
      fetchAdminAnalytics();
    }
  }, [activeTab]);

  // Fetch vendor analytics data
  const fetchAdminAnalytics = async () => {
    setIsLoadingAdminCenters(true);
    setAdminCentersError(null);

    try {
      // Fetch vendor orders and all centers to compute top centers by revenue
      const [vendorOrders, allCenters] = await Promise.all([
        getVendorOrders(user.id),
        getAllCenters(),
      ]);
      console.log(vendorOrders, allCenters);
      // Use heap-based algorithm to find top centers by revenue
      const topCenters = findTopCentersByRevenue(vendorOrders, allCenters, 4);

      setTopAdminCenters(topCenters);
    } catch (error: unknown) {
      console.error("Error fetching admin analytics data:", error);
      setAdminCentersError(
        error instanceof Error
          ? error.message
          : "Failed to load admin analytics data"
      );
    } finally {
      setIsLoadingAdminCenters(false);
    }
  };

  // Handle search functionality
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    setCenterSearchError(null);

    try {
      console.log("🔍 Starting search for:", searchTerm);

      // Get all available product categories
      const availableCategories = await getProductCategories();
      console.log("📋 Available product categories:", availableCategories);

      // Check if search term matches any category (case-insensitive)
      const matchingCategories = availableCategories.filter((category) =>
        (category ?? "").toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log("🎯 Matching categories:", matchingCategories);

      if (matchingCategories.length > 0) {
        // Search by each matching category
        let allProducts = [];

        for (const category of matchingCategories) {
          console.log(`🔍 Searching products for category: ${category}`);
          try {
            const productsResponse = await getProducts({ category });
            console.log(
              `📦 Found ${productsResponse.products.length} products for category ${category}:`,
              productsResponse.products
            );
            allProducts.push(...productsResponse.products);
          } catch (error) {
            console.error(
              `❌ Error fetching products for category ${category}:`,
              error
            );
          }
        }

        // Remove duplicates based on product ID
        const uniqueProducts = allProducts.filter(
          (product, index, self) =>
            index === self.findIndex((p) => p._id === product._id)
        );

        console.log(`📊 Total unique products found: ${uniqueProducts.length}`);

        setSearchResults(uniqueProducts);

        if (uniqueProducts.length === 0) {
          setSearchError(
            `No products found for the matching categories. Please try a different search term.`
          );
        }
      } else {
        console.log(
          "❌ No matching categories found for search term:",
          searchTerm
        );
        setSearchResults([]);
        setSearchError(
          `No products found for category "${searchTerm}". Available categories: ${availableCategories
            .slice(0, 5)
            .join(", ")}${availableCategories.length > 5 ? "..." : ""}`
        );
      }
    } catch (error: unknown) {
      console.error("❌ Search error:", error);
      setSearchError("Failed to search products. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Add to cart functionality
  const addToCart = (product: Product) => {
    // Determine center name from availability if populated, else fallback to vendor businessName
    const centerName =
      product.availability && product.availability.length > 0
        ? typeof product.availability[0].centerId === "object" &&
          product.availability[0].centerId?.name
          ? product.availability[0].centerId.name
          : product.vendorId?.businessName || "Unknown Center"
        : product.vendorId?.businessName || "Unknown Center";

    setCart([
      ...cart,
      {
        ...product,
        quantity: 1,
        price: `रू ${product.price.toLocaleString()}`,
        center: centerName,
      },
    ]);
  };

  // Update category suggestions as user types
  useEffect(() => {
    if (searchTerm.trim()) {
      const filteredSuggestions = productCategories.filter((category) =>
        (category ?? "").toLowerCase().includes(searchTerm.toLowerCase())
      );
      setCategorySuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setCategorySuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, productCategories]);

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

  // Handle category suggestion selection
  const handleSuggestionClick = (category: string) => {
    setSearchTerm(category);
    setShowSuggestions(false);
    handleSearch();
  };

  // Fetch vendor orders when orders tab is active
  useEffect(() => {
    const fetchVendorOrders = async () => {
      if (activeTab === "orders" && user.id) {
        try {
          setIsLoadingOrders(true);
          setOrdersError(null);
          const vendorOrders = await getVendorOrders(user.id);
          setOrders(vendorOrders);
        } catch (error: unknown) {
          console.error("Error fetching vendor orders:", error);
          setOrdersError("Failed to load orders. Please try again.");
        } finally {
          setIsLoadingOrders(false);
        }
      }
    };

    fetchVendorOrders();
  }, [activeTab, user.id]);

  // Function to handle order click and fetch details
  const handleOrderClick = async (orderId: string) => {
    try {
      setIsLoadingOrderDetails(true);
      const orderDetails = await getOrderDetails(orderId);
      setSelectedOrder(orderDetails);
    } catch (error: unknown) {
      console.error("Error fetching order details:", error);
      setOrdersError("Failed to load order details. Please try again.");
    } finally {
      setIsLoadingOrderDetails(false);
    }
  };

  // Function to close order details
  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
  };

  // Function to view document
  const handleViewDocument = (doc: any) => {
    setCurrentDocument(doc);
    setShowDocumentModal(true);
  };

  // Function to close document modal
  const handleCloseDocumentModal = () => {
    setShowDocumentModal(false);
    setCurrentDocument(null);
  };

  // Function to remove item from cart
  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  // Function to update cart item quantity
  const updateCartQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    const newCart = [...cart];
    newCart[index].quantity = quantity;
    setCart(newCart);
  };

  // Function to handle payment
  const handlePayment = async (paymentIntentId?: string) => {
    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      // Prepare order data
      const vendorId = cart[0].vendorId?._id || cart[0].vendorId; // Assuming all products from same vendor
      const centerId =
        cart[0].availability && cart[0].availability.length > 0
          ? typeof cart[0].availability[0].centerId === "object"
            ? cart[0].availability[0].centerId._id
            : cart[0].availability[0].centerId
          : null;

      if (!vendorId || !centerId) {
        alert("Vendor or Center information missing for the order.");
        return;
      }

      const items = cart.map((item) => ({
        productId: item._id,
        quantity: item.quantity,
        specifications: item.specifications || {},
      }));

      // For simplicity, hardcode paymentMethod and shippingMethod here or extend UI to select
      const paymentMethod = "Credit Card";
      const shippingMethod = { method: "Standard", cost: 500 };

      // Call backend API to create order
      const response = await fetch(
        `http://localhost:5000/api/orders/vendor/${vendorId}/order`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("vrs_token")}`,
          },
          body: JSON.stringify({
            centerId,
            vendorId,
            items,
            paymentMethod,
            shippingMethod,
            paymentIntentId, // Include payment intent ID if provided
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Order placed successfully!");
        setShowCart(false);
        setShowPayment(false);
        setCart([]);
      } else {
        alert(`Failed to place order: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("An error occurred while processing payment.");
    }
  };

  // Render cart modal
  const renderCartModal = () => {
    console.log(
      "renderCartModal called, showCart:",
      showCart,
      "cart length:",
      cart.length
    );
    if (!showCart) {
      console.log("Cart modal not rendered because showCart is false");
      return null;
    }

    console.log("Cart modal should be rendered now");

    const totalAmount = cart.reduce((total, item) => {
      const price =
        typeof item.price === "string"
          ? parseInt(item.price.replace("रू ", "").replace(/,/g, ""))
          : item.price;
      return total + price * item.quantity;
    }, 0);

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        style={{ zIndex: 9999 }}
      >
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Shopping Cart ({cart.length} items)
            </h3>
            <button
              onClick={() => {
                console.log("Close button clicked");
                setShowCart(false);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  Your cart is empty
                </h4>
                <p className="text-gray-500">
                  Add some products to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        {item.images && item.images.length > 0 ? (
                          <Image
                            key={item.images[0].url}
                            src={
                              item.images[0].url &&
                              !item.images[0].url.includes("placeholder.svg") &&
                              !item.images[0].url.startsWith("/image/")
                                ? `http://localhost:5000${item.images[0].url}`
                                : `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(
                                    item.name
                                  )}`
                            }
                            alt={item.name}
                            className="w-12 h-12 object-cover"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500">{item.category}</p>
                        <p className="text-sm text-gray-500">
                          {item.center ||
                            (item.availability && item.availability.length > 0
                              ? typeof item.availability[0].centerId ===
                                  "object" &&
                                item.availability[0].centerId?.name
                                ? item.availability[0].centerId.name
                                : "Unknown Center"
                              : "Unknown Center")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            updateCartQuantity(index, item.quantity - 1)
                          }
                          className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateCartQuantity(index, item.quantity + 1)
                          }
                          className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-semibold text-orange-600">
                        {typeof item.price === "string"
                          ? item.price
                          : `रू ${item.price.toLocaleString()}`}
                      </span>
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-xl font-bold text-orange-600">
                      रू {totalAmount.toLocaleString()}
                    </span>
                  </div>
                  {/* Display discount and commission */}
                  {cart.length > 0 && (
                    <>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-md font-medium text-blue-700">
                          Discount (up to 15%):
                        </span>
                        {/* For demo, calculate discount as 15% of totalAmount */}
                        <span className="text-md font-semibold text-blue-700">
                          रू{" "}
                          {(totalAmount * 0.15).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-md font-medium text-red-700">
                          Admin Commission (up to 5%):
                        </span>
                        {/* For demo, calculate commission as 5% of totalAmount */}
                        <span className="text-md font-semibold text-red-700">
                          रू{" "}
                          {(totalAmount * 0.05).toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Payment Section */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">
                      Complete Your Payment
                    </h4>
                    <p className="text-sm text-gray-600">
                      Review your order and proceed to payment
                    </p>

                    {!showPayment ? (
                      <Button
                        onClick={async () => {
                          setIsCreatingPaymentIntent(true);
                          try {
                            const response = await fetch(
                              "http://localhost:5000/api/payments/create-payment-intent",
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  amount: totalAmount,
                                  currency: "usd", // Use USD for better Stripe compatibility
                                }),
                              }
                            );

                            const data = await response.json();

                            if (!response.ok) {
                              throw new Error(
                                data.message ||
                                  `HTTP ${response.status}: ${response.statusText}`
                              );
                            }

                            if (!data.clientSecret) {
                              throw new Error(
                                "No client secret received from server"
                              );
                            }

                            setClientSecret(data.clientSecret);
                            setShowPayment(true);
                          } catch (error) {
                            console.error(
                              "Error creating payment intent:",
                              error
                            );
                            const errorMessage =
                              error instanceof Error
                                ? error.message
                                : "Failed to initialize payment. Please try again.";
                            alert(
                              `Payment initialization failed: ${errorMessage}`
                            );
                          } finally {
                            setIsCreatingPaymentIntent(false);
                          }
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        disabled={cart.length === 0 || isCreatingPaymentIntent}
                      >
                        {isCreatingPaymentIntent ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Initializing Payment...
                          </>
                        ) : (
                          `Proceed to Payment (रू ${totalAmount.toLocaleString()})`
                        )}
                      </Button>
                    ) : clientSecret ? (
                      <Elements
                        stripe={stripePromise}
                        options={{ clientSecret }}
                      >
                        <StripePaymentForm
                          key={totalAmount} // Force remount on amount change
                          amount={totalAmount}
                          currency="usd"
                          onSuccess={(paymentIntentId) =>
                            handlePayment(paymentIntentId)
                          }
                          onError={(error) => alert(`Payment failed: ${error}`)}
                        />
                      </Elements>
                    ) : (
                      <div className="text-center py-4">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Setting up payment...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render search results or error
  const renderSearchResults = () => {
    if (searchResults.length === 0 && !searchError) return null;

    return (
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
            {searchResults.map((product) => (
              <div
                key={product._id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <span className="text-sm font-semibold text-orange-600">
                    रू {product.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {product.description}
                </p>
                <p className="text-xs text-gray-500 mb-3">
                  Category: {product.category}
                </p>
                <p className="text-xs text-gray-500 mb-3 flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {product.availability && product.availability.length > 0
                    ? typeof product.availability[0].centerId === "object" &&
                      product.availability[0].centerId?.name
                      ? product.availability[0].centerId.name
                      : product.vendorId?.businessName || "Unknown Center"
                    : product.vendorId?.businessName || "Unknown Center"}
                </p>
                <Button
                  size="sm"
                  className="w-full"
                  disabled={product.status !== "available"}
                  onClick={() => addToCart(product)}
                >
                  {product.status === "available"
                    ? "Add to Cart"
                    : "Unavailable"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  };

  // Render analytics cards
  const renderAnalyticsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Total Commission Card */}
      <Card
        className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => handleCardClick("commission")}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-600 mb-1">
              Total Commission
            </p>
            <p className="text-2xl font-bold text-green-900">रू 12,500</p>
            <p className="text-xs text-green-600 mt-1">From all orders</p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </Card>

      {/* Total Discount Card */}
      <Card
        className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => handleCardClick("discount")}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600 mb-1">
              Total Discount
            </p>
            <p className="text-2xl font-bold text-blue-900">रू 3,200</p>
            <p className="text-xs text-blue-600 mt-1">Given to customers</p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <Percent className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </Card>

      {/* Total Products Card */}
      <Card
        className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => handleCardClick("products")}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-600 mb-1">
              Total Products
            </p>
            <p className="text-2xl font-bold text-orange-900">47</p>
            <p className="text-xs text-orange-600 mt-1">In marketplace</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-full">
            <Package className="h-6 w-6 text-orange-600" />
          </div>
        </div>
      </Card>
    </div>
  );

  // Render filtered products by card click
  const renderFilteredProductsByCard = () => {
    if (isLoadingCardProducts) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading products...</span>
        </div>
      );
    }

    if (filteredProductsByCard.length === 0) {
      return (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No Products Available
          </h4>
          <p className="text-gray-500">
            {clickedCard === "commission"
              ? "No available products found"
              : clickedCard === "discount"
              ? "No products eligible for discount found"
              : "No products found"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            {clickedCard === "commission"
              ? "Available Products (Commission Generating)"
              : clickedCard === "discount"
              ? "Products Eligible for Discount"
              : "All Products"}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToAnalytics}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Analytics
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProductsByCard.map((product) => (
            <div
              key={product._id}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200"
            >
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                {product.images && product.images.length > 0 ? (
                  <Image
                    key={product.images[0].url}
                    src={
                      product.images[0].url &&
                      !product.images[0].url.includes("placeholder.svg") &&
                      !product.images[0].url.startsWith("/image/")
                        ? `http://localhost:5000${product.images[0].url}`
                        : `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(
                            product.name
                          )}`
                    }
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <Package className="h-12 w-12 text-gray-400" />
                  </div>
                )}
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
                    {product.category || "Uncategorized"}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      product.status === "available"
                        ? "bg-green-100 text-green-800"
                        : product.status === "out_of_stock"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.status.replace("_", " ").toUpperCase()}
                  </span>
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  <p className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {product.availability && product.availability.length > 0
                      ? typeof product.availability[0].centerId === "object" &&
                        product.availability[0].centerId?.name
                        ? product.availability[0].centerId.name
                        : product.vendorId?.businessName || "Unknown Center"
                      : product.vendorId?.businessName || "Unknown Center"}
                  </p>
                </div>

                <Button
                  size="sm"
                  className="w-full"
                  disabled={product.status !== "available"}
                  onClick={() => addToCart(product)}
                >
                  {product.status === "available"
                    ? "Add to Cart"
                    : "Unavailable"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render products by category and center
  const renderProductsByCategoryAndCenter = () => {
    if (isLoadingProducts || isLoadingCenters) {
      return (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600 mr-2" />
          <p>Loading products from all centers...</p>
        </div>
      );
    }

    if (productError || centerError) {
      return (
        <div className="flex items-start space-x-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
          <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-800">Error</h4>
            <p className="text-sm text-amber-700 mt-1">
              {productError || centerError}
            </p>
          </div>
        </div>
      );
    }

    // Show all categories and centers
    const categoriesToShow = productCategories;
    const centersToShow = centers;

    return (
      <div className="space-y-8">
        {/* Display products by category */}
        {categoriesToShow.map((category) => {
          // Check if this category has any products in the selected centers
          const hasProductsInCategory = centersToShow.some((center) => {
            const centerProducts =
              productsByCategoryAndCenter[category]?.[center._id] || [];
            return centerProducts.length > 0;
          });

          if (!hasProductsInCategory) return null;

          return (
            <Card key={category} className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {category}
              </h3>

              {/* Display products by center within this category */}
              <div className="space-y-6">
                {centersToShow.map((center) => {
                  const centerProducts =
                    productsByCategoryAndCenter[category]?.[center._id] || [];

                  if (centerProducts.length === 0) return null;

                  return (
                    <div
                      key={`${category}-${center._id}`}
                      className="border-t pt-4 mt-4 first:border-t-0 first:pt-0 first:mt-0"
                    >
                      <h4 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-orange-500" />
                        {center.name}
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          ({centerProducts.length} products)
                        </span>
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {centerProducts.map((product) => (
                          <div
                            key={`${product._id}-${center._id}`}
                            className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                          >
                            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                              {product.images && product.images.length > 0 ? (
                                <Image
                                  key={product.images[0].url}
                                  src={
                                    product.images[0].url &&
                                    !product.images[0].url.includes(
                                      "placeholder.svg"
                                    ) &&
                                    !product.images[0].url.startsWith("/image/")
                                      ? `http://localhost:5000${product.images[0].url}`
                                      : `/placeholder.svg?height=200&width=200&query=${encodeURIComponent(
                                          product.name
                                        )}`
                                  }
                                  alt={product.name}
                                  className="w-full h-48 object-cover"
                                />
                              ) : (
                                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                                  <Package className="h-12 w-12 text-gray-400" />
                                </div>
                              )}
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
                                  {product.category || "Uncategorized"}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    product.status === "available"
                                      ? "bg-green-100 text-green-800"
                                      : product.status === "out_of_stock"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {product.status
                                    .replace("_", " ")
                                    .toUpperCase()}
                                </span>
                              </div>

                              <Button
                                size="sm"
                                className="w-full"
                                disabled={product.status !== "available"}
                                onClick={() => addToCart(product)}
                              >
                                {product.status === "available"
                                  ? "Add to Cart"
                                  : "Unavailable"}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    );
  };

  // Render marketplace content
  const renderMarketplace = () => (
    <div className="space-y-6">
      {/* Analytics Cards Section */}
      {renderAnalyticsCards()}

      {/* Top Centers Section - displays top centers from AdminDashboard analytics using minHeap algorithm */}
      <div className="space-y-4 mt-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Top Centers</h3>
        </div>
        {renderTopCentersContent()}
      </div>

      {/* Show filtered products when card is clicked */}
      {clickedCard ? (
        <Card className="p-6">{renderFilteredProductsByCard()}</Card>
      ) : searchResults.length > 0 || searchError ? (
        <>
          {/* Search Results */}
          {renderSearchResults()}
        </>
      ) : (
        <>
          {/* Products by Category and Center */}
          {renderProductsByCategoryAndCenter()}
        </>
      )}
    </div>
  );

  // Render order status badge
  const renderOrderStatusBadge = (status: OrderStatus) => {
    let bgColor = "";
    let textColor = "";

    switch (status) {
      case OrderStatus.PENDING:
        bgColor = "bg-yellow-100";
        textColor = "text-yellow-800";
        break;
      case OrderStatus.CONFIRMED:
        bgColor = "bg-blue-100";
        textColor = "text-blue-800";
        break;
      case OrderStatus.SHIPPED:
        bgColor = "bg-indigo-100";
        textColor = "text-indigo-800";
        break;
      case OrderStatus.DELIVERED:
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        break;
      case OrderStatus.CANCELLED:
        bgColor = "bg-red-100";
        textColor = "text-red-800";
        break;
      default:
        bgColor = "bg-gray-100";
        textColor = "text-gray-800";
    }

    return (
      <span
        className={`inline-block px-2 py-1 text-xs font-semibold rounded ${bgColor} ${textColor}`}
      >
        {status}
      </span>
    );
  };

  // Render orders list
  const renderOrdersList = () => {
    if (isLoadingOrders) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading orders...</span>
        </div>
      );
    }

    if (ordersError) {
      return (
        <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800">Error</h4>
            <p className="text-sm text-red-700 mt-1">{ordersError}</p>
          </div>
        </div>
      );
    }

    if (orders.length === 0) {
      return (
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No Orders Found
          </h4>
          <p className="text-gray-500">You have no orders yet.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {orders.map((order) => (
          <Card
            key={order._id}
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleOrderClick(order._id)}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Order ID: {order._id}
                </p>
                <p className="text-xs text-gray-600">
                  Date: {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>{renderOrderStatusBadge(order.status)}</div>
            </div>
            <div className="mt-2 text-sm text-gray-700">
              Total Amount: रू {order.orderSummary.totalAmount.toLocaleString()}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // Render order details view
  const renderOrderDetails = () => {
    if (!selectedOrder) return null;

    return (
      <Card className="p-6 space-y-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCloseOrderDetails}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Order Details - {selectedOrder._id}
        </h3>

        <div>
          <p>
            <strong>Status: </strong>
            {renderOrderStatusBadge(selectedOrder.status)}
          </p>
          <p>
            <strong>Date: </strong>
            {new Date(selectedOrder.createdAt).toLocaleString()}
          </p>
          <p>
            <strong>Total Amount: </strong> रू{" "}
            {selectedOrder.orderSummary.totalAmount.toLocaleString()}
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Items:</h4>
          <ul className="list-disc list-inside space-y-1">
            {selectedOrder.items.map((item) => (
              <li key={item.productId}>
                {item.productName} - Quantity: {item.quantity} - Unit Price: रू{" "}
                {item.unitPrice.toLocaleString()} - Total: रू{" "}
                {item.totalPrice.toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      </Card>
    );
  };

  // Render top centers content (without header for marketplace integration)
  const renderTopCentersContent = () => {
    if (isLoadingAdminCenters) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading top centers...</span>
        </div>
      );
    }

    if (adminCentersError) {
      return (
        <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800">Error</h4>
            <p className="text-sm text-red-700 mt-1">{adminCentersError}</p>
          </div>
        </div>
      );
    }

    if (topAdminCenters.length === 0) {
      return (
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            No Top Centers Data
          </h4>
          <p className="text-gray-500 text-sm">
            No centers performance data available.
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {topAdminCenters.map((center, index) => (
          <Card
            key={center.centerId}
            className="p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0
                    ? "bg-yellow-100 text-yellow-800"
                    : index === 1
                    ? "bg-gray-100 text-gray-800"
                    : index === 2
                    ? "bg-orange-100 text-orange-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {index + 1}
              </div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                {center.centerName}
              </h4>
              <p className="text-xs text-gray-500 flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {center.centerLocation || "Location not available"}
              </p>
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500">Total Revenue</p>
                <p className="text-lg font-bold text-green-600">
                  रू {center.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{center.orderCount} orders</span>
                <span>Avg: रू {center.averageOrderValue.toLocaleString()}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // Render top centers
  const renderTopCenters = () => {
    if (isLoadingAdminCenters) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading top centers...</span>
        </div>
      );
    }

    if (adminCentersError) {
      return (
        <div className="flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800">Error</h4>
            <p className="text-sm text-red-700 mt-1">{adminCentersError}</p>
          </div>
        </div>
      );
    }

    if (topAdminCenters.length === 0) {
      return (
        <div className="text-center py-12">
          <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No Top Centers Data
          </h4>
          <p className="text-gray-500">
            No centers performance data available.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            Top Performing Centers
          </h3>
          <span className="text-sm text-gray-500">
            Based on sales performance
          </span>
        </div>

        {renderTopCentersContent()}
      </div>
    );
  };

  // Render vendor profile details
  const renderProfile = () => (
    <div className="space-y-6">
      {/* Business Information Card */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Business Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Business Name</p>
            <p className="text-lg font-semibold text-gray-900">
              {vendorProfile.businessName}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Owner Name</p>
            <p className="text-lg font-semibold text-gray-900">
              {vendorProfile.ownerName}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Email</p>
            <p className="text-lg text-gray-900">{vendorProfile.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Phone</p>
            <p className="text-lg text-gray-900">{vendorProfile.phone}</p>
          </div>
        </div>
      </Card>

      {/* Address Information Card */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Address Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Address</p>
            <p className="text-lg text-gray-900">{vendorProfile.address}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">District</p>
            <p className="text-lg text-gray-900">{vendorProfile.district}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">PAN Number</p>
            <p className="text-lg text-gray-900">{vendorProfile.panNumber}</p>
          </div>
        </div>
      </Card>

      {/* Registration & Status Card */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Registration & Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Joined Date</p>
            <p className="text-lg text-gray-900">{vendorProfile.joinedDate}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                vendorProfile.status === "APPROVED"
                  ? "bg-green-100 text-green-800"
                  : vendorProfile.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-800"
                  : vendorProfile.status === "REJECTED"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {vendorProfile.status}
            </span>
          </div>
        </div>
      </Card>

      {/* Bank Details Card */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Bank Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Bank Name</p>
            <p className="text-lg text-gray-900">
              {vendorProfile.bankDetails.bankName}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Account Number</p>
            <p className="text-lg text-gray-900">
              {vendorProfile.bankDetails.accountNumber}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Account Holder</p>
            <p className="text-lg text-gray-900">
              {vendorProfile.bankDetails.holderName}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">IFSC Code</p>
            <p className="text-lg text-gray-900">
              {vendorProfile.bankDetails.ifscCode}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Branch</p>
            <p className="text-lg text-gray-900">
              {vendorProfile.bankDetails.branch}
            </p>
          </div>
        </div>
      </Card>

      {/* Documents Card */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Documents</h3>
        <div className="space-y-3">
          {vendorProfile.documents.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">{doc.name}</p>
                <p className="text-sm text-gray-500">{doc.type}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewDocument(doc)}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                View
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

  // Update main content rendering for orders tab
  // Replace the existing orders tab content rendering in the return statement with:
  // {activeTab === "orders" && (selectedOrder ? renderOrderDetails() : renderOrdersList())}

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
              />
              <h1 className="text-xl font-bold text-gray-900">
                Vendor Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleMessages}
                  className="relative"
                  aria-label="Messages"
                >
                  <MessageCircle className="h-4 w-4" />
                  {unreadMessageCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadMessageCount}
                    </span>
                  )}
                </Button>
              </div>
              <div className="relative flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log(
                      "Cart button clicked, current showCart:",
                      showCart
                    );
                    console.log("Cart length:", cart.length);
                    setShowCart(true);
                    console.log(
                      "After setShowCart(true), showCart should be true"
                    );
                    // Force re-render check
                    setTimeout(() => {
                      console.log(
                        "Timeout check - showCart after click:",
                        showCart
                      );
                    }, 100);
                  }}
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

              <div className="relative">
                <button
                  onClick={() => setShowProfileModal(!showProfileModal)}
                  className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <span className="text-sm text-gray-600">
                    Welcome, {vendorProfile.businessName}
                  </span>
                  <svg
                    className={`h-4 w-4 text-gray-500 transition-transform ${
                      showProfileModal ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showProfileModal && onLogout && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-2">
                      <button
                        onClick={onLogout}
                        className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
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
            {/* Removed rendering of Top Centers content */}

            {/* Search Field */}
            {activeTab === "marketplace" && (
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products by category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 200)
                    }
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />

                  {/* Category Suggestions Dropdown */}
                  {showSuggestions && categorySuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 mt-1 max-h-60 overflow-y-auto">
                      {categorySuggestions.map((category) => (
                        <div
                          key={category}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => handleSuggestionClick(category)}
                        >
                          {category}
                        </div>
                      ))}
                    </div>
                  )}
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
            )}
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "marketplace" && <>{renderMarketplace()}</>}
        {activeTab === "orders" &&
          (selectedOrder ? renderOrderDetails() : renderOrdersList())}
        {activeTab === "top-centers" && renderTopCenters()}
        {activeTab === "profile" && renderProfile()}
      </div>

      {/* MessageBox component */}
      <MessageBox
        isOpen={showMessages}
        onClose={() => setShowMessages(false)}
      />

      {/* Document Modal */}
      {showDocumentModal && currentDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentDocument.name}
              </h3>
              <button
                onClick={handleCloseDocumentModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              {currentDocument.type.includes("Image") ? (
                <Image
                  key={currentDocument.previewUrl || currentDocument.url}
                  src={
                    currentDocument.previewUrl
                      ? `http://localhost:5000${currentDocument.previewUrl}`
                      : currentDocument.url
                  }
                  alt={currentDocument.name}
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
              ) : (
                <div className="text-center py-8">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Document preview not available
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => window.open(currentDocument.url, "_blank")}
                  >
                    Download Document
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {renderCartModal()}
    </div>
  );
}
