"use client"

import { useState } from "react"
import {
  Package,
  ShoppingCart,
  Users,
  Bell,
  TrendingUp,
  DollarSign,
  Plus,
  Search,
  Star,
  MapPin,
  LogOut,
  X,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface VendorDashboardProps {
  vendorName?: string
  onLogout?: () => void
}

export default function VendorDashboard({ vendorName = "ABC Trading Co.", onLogout }: VendorDashboardProps) {
  const [activeTab, setActiveTab] = useState("marketplace")
  const [cart, setCart] = useState<any[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
  })

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
  ]

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
  ]

  const centerProducts = [
    // Spices
    {
      id: "CTR-001",
      name: "Turmeric Powder Premium",
      center: "Spice Hub Kathmandu",
      price: "रू 180/kg",
      stock: 200,
      rating: 4.8,
      location: "Kathmandu",
      image: "/turmeric-powder.png",
      category: "Spices",
    },
    {
      id: "CTR-002",
      name: "Cardamom Green Large",
      center: "Mountain Spices Ilam",
      price: "रू 3,500/kg",
      stock: 50,
      rating: 4.9,
      location: "Ilam",
      image: "/green-cardamom.png",
      category: "Spices",
    },
    {
      id: "CTR-003",
      name: "Cinnamon Bark Organic",
      center: "Organic Spices Dolakha",
      price: "रू 800/kg",
      stock: 100,
      rating: 4.7,
      location: "Dolakha",
      image: "/cinnamon-bark.png",
      category: "Spices",
    },
    {
      id: "CTR-004",
      name: "Black Pepper Whole",
      center: "Spice Valley Gulmi",
      price: "रू 1,200/kg",
      stock: 80,
      rating: 4.6,
      location: "Gulmi",
      image: "/black-pepper-pile.png",
      category: "Spices",
    },
    {
      id: "CTR-005",
      name: "Cumin Seeds Premium",
      center: "Spice Hub Kathmandu",
      price: "रू 450/kg",
      stock: 150,
      rating: 4.5,
      location: "Kathmandu",
      image: "/cumin-seeds.png",
      category: "Spices",
    },
    // Gadgets
    {
      id: "CTR-006",
      name: "Wireless Bluetooth Earbuds",
      center: "Tech Zone Pokhara",
      price: "रू 3,500",
      stock: 40,
      rating: 4.4,
      location: "Pokhara",
      image: "/placeholder-kql3d.png",
      category: "Gadgets",
    },
    {
      id: "CTR-007",
      name: "Power Bank 20000mAh",
      center: "Electronics Hub Kathmandu",
      price: "रू 2,800",
      stock: 60,
      rating: 4.6,
      location: "Kathmandu",
      image: "/portable-power-bank.png",
      category: "Gadgets",
    },
    {
      id: "CTR-008",
      name: "Smart Watch Fitness Tracker",
      center: "Gadget Store Lalitpur",
      price: "रू 8,500",
      stock: 25,
      rating: 4.3,
      location: "Lalitpur",
      image: "/smartwatch-lifestyle.png",
      category: "Gadgets",
    },
    {
      id: "CTR-009",
      name: "USB-C Fast Charger",
      center: "Tech Accessories Bhaktapur",
      price: "रू 1,200",
      stock: 100,
      rating: 4.5,
      location: "Bhaktapur",
      image: "/placeholder-am111.png",
      category: "Gadgets",
    },
    {
      id: "CTR-010",
      name: "Wireless Mouse Gaming",
      center: "Gaming Hub Pokhara",
      price: "रू 2,200",
      stock: 35,
      rating: 4.7,
      location: "Pokhara",
      image: "/gaming-mouse.png",
      category: "Gadgets",
    },
    // Beverages
    {
      id: "CTR-011",
      name: "Himalayan Green Tea",
      center: "Tea Garden Ilam",
      price: "रू 800/250g",
      stock: 120,
      rating: 4.8,
      location: "Ilam",
      image: "/cup-of-green-tea.png",
      category: "Beverages",
    },
    {
      id: "CTR-012",
      name: "Organic Coffee Beans",
      center: "Coffee Roasters Gulmi",
      price: "रू 1,500/kg",
      stock: 80,
      rating: 4.9,
      location: "Gulmi",
      image: "/pile-of-coffee-beans.png",
      category: "Beverages",
    },
    {
      id: "CTR-013",
      name: "Herbal Tea Mix",
      center: "Herbal Products Dolpa",
      price: "रू 600/200g",
      stock: 90,
      rating: 4.6,
      location: "Dolpa",
      image: "/herbal-tea.png",
      category: "Beverages",
    },
    {
      id: "CTR-014",
      name: "Black Tea Premium",
      center: "Tea Estate Jhapa",
      price: "रू 450/250g",
      stock: 150,
      rating: 4.7,
      location: "Jhapa",
      image: "/black-tea.png",
      category: "Beverages",
    },
    {
      id: "CTR-015",
      name: "Honey Pure Wild",
      center: "Bee Farm Chitwan",
      price: "रू 1,200/kg",
      stock: 60,
      rating: 4.8,
      location: "Chitwan",
      image: "/wild-honey.png",
      category: "Beverages",
    },
    // Handicrafts
    {
      id: "CTR-016",
      name: "Pashmina Shawl Handwoven",
      center: "Handicraft Center Manang",
      price: "रू 4,500",
      stock: 30,
      rating: 4.9,
      location: "Manang",
      image: "/pashmina-shawl.png",
      category: "Handicrafts",
    },
    {
      id: "CTR-017",
      name: "Singing Bowl Tibetan",
      center: "Buddhist Crafts Mustang",
      price: "रू 3,200",
      stock: 20,
      rating: 4.8,
      location: "Mustang",
      image: "/placeholder-t286u.png",
      category: "Handicrafts",
    },
    {
      id: "CTR-018",
      name: "Wooden Mask Traditional",
      center: "Wood Craft Bhaktapur",
      price: "रू 2,800",
      stock: 25,
      rating: 4.7,
      location: "Bhaktapur",
      image: "/wooden-mask.png",
      category: "Handicrafts",
    },
    {
      id: "CTR-019",
      name: "Khukuri Knife Authentic",
      center: "Metal Craft Gorkha",
      price: "रू 5,500",
      stock: 15,
      rating: 4.9,
      location: "Gorkha",
      image: "/khukuri-knife.png",
      category: "Handicrafts",
    },
    {
      id: "CTR-020",
      name: "Prayer Flags Colorful",
      center: "Tibetan Crafts Solukhumbu",
      price: "रू 800",
      stock: 100,
      rating: 4.6,
      location: "Solukhumbu",
      image: "/placeholder-zewbr.png",
      category: "Handicrafts",
    },
    // Foods
    {
      id: "CTR-021",
      name: "Basmati Rice Premium",
      center: "Rice Mill Jhapa",
      price: "रू 120/kg",
      stock: 500,
      rating: 4.8,
      location: "Jhapa",
      image: "/basmati-rice.png",
      category: "Foods",
    },
    {
      id: "CTR-022",
      name: "Lentils Mixed Dal",
      center: "Grain Center Bara",
      price: "रू 180/kg",
      stock: 300,
      rating: 4.7,
      location: "Bara",
      image: "/mixed-lentils.png",
      category: "Foods",
    },
    {
      id: "CTR-023",
      name: "Mustard Oil Cold Pressed",
      center: "Oil Mill Rupandehi",
      price: "रू 280/liter",
      stock: 200,
      rating: 4.6,
      location: "Rupandehi",
      image: "/placeholder.svg?height=150&width=200",
      category: "Foods",
    },
    {
      id: "CTR-024",
      name: "Dried Fish Sukuti",
      center: "Fish Processing Kailali",
      price: "रू 1,800/kg",
      stock: 40,
      rating: 4.5,
      location: "Kailali",
      image: "/placeholder.svg?height=150&width=200",
      category: "Foods",
    },
    {
      id: "CTR-025",
      name: "Buckwheat Flour",
      center: "Flour Mill Mustang",
      price: "रू 150/kg",
      stock: 80,
      rating: 4.7,
      location: "Mustang",
      image: "/placeholder.svg?height=150&width=200",
      category: "Foods",
    },
    // Additional items
    {
      id: "CTR-026",
      name: "Yak Cheese Aged",
      center: "Dairy Farm Langtang",
      price: "रू 2,500/kg",
      stock: 20,
      rating: 4.9,
      location: "Langtang",
      image: "/placeholder.svg?height=150&width=200",
      category: "Foods",
    },
    {
      id: "CTR-027",
      name: "Cordyceps Himalayan",
      center: "Herbal Collection Dolpa",
      price: "रू 25,000/100g",
      stock: 5,
      rating: 5.0,
      location: "Dolpa",
      image: "/placeholder.svg?height=150&width=200",
      category: "Herbs",
    },
    {
      id: "CTR-028",
      name: "Felt Bag Handmade",
      center: "Felt Factory Kathmandu",
      price: "रू 1,800",
      stock: 45,
      rating: 4.6,
      location: "Kathmandu",
      image: "/placeholder.svg?height=150&width=200",
      category: "Handicrafts",
    },
    {
      id: "CTR-029",
      name: "Solar Lantern Portable",
      center: "Solar Tech Chitwan",
      price: "रू 2,200",
      stock: 30,
      rating: 4.4,
      location: "Chitwan",
      image: "/placeholder.svg?height=150&width=200",
      category: "Gadgets",
    },
    {
      id: "CTR-030",
      name: "Rhododendron Honey",
      center: "Mountain Honey Gorkha",
      price: "रू 1,800/kg",
      stock: 35,
      rating: 4.8,
      location: "Gorkha",
      image: "/placeholder.svg?height=150&width=200",
      category: "Beverages",
    },
  ]

  const notifications = [
    { id: 1, message: "Order PO-001 has been delivered", time: "2 hours ago", read: false },
    { id: 2, message: "New products available from Tech Hub Pokhara", time: "5 hours ago", read: false },
    { id: 3, message: "Payment confirmed for Order PO-002", time: "1 day ago", read: true },
    { id: 4, message: "Art Gallery Bhaktapur added new paintings", time: "2 days ago", read: true },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "text-green-600 bg-green-100"
      case "In Transit":
        return "text-blue-600 bg-blue-100"
      case "Processing":
        return "text-yellow-600 bg-yellow-100"
      case "Confirmed":
        return "text-purple-600 bg-purple-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const addToCart = (product: any) => {
    setCart([...cart, { ...product, quantity: 1 }])
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.id !== productId))
  }

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(cart.map((item) => (item.id === productId ? { ...item, quantity } : item)))
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = Number.parseInt(item.price.replace("रू ", "").replace(",", "").split("/")[0])
      return total + price * item.quantity
    }, 0)
  }

  const getCartSubtotal = () => {
    return getCartTotal()
  }

  const getTax = () => {
    return Math.round(getCartSubtotal() * 0.13) // 13% VAT in Nepal
  }

  const getShipping = () => {
    return getCartSubtotal() > 5000 ? 0 : 200 // Free shipping over रू 5000
  }

  const getFinalTotal = () => {
    return getCartSubtotal() + getTax() + getShipping()
  }

  const renderCartModal = () => (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <div className="flex items-center">
            <ShoppingCart className="h-6 w-6 mr-3" />
            <h3 className="text-xl font-bold">Shopping Cart</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCart(false)}
            className="text-white border-white hover:bg-white hover:text-orange-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {cart.length === 0 ? (
          <div className="p-12 text-center bg-white">
            <ShoppingCart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
            <Button onClick={() => setShowCart(false)} className="bg-orange-600 hover:bg-orange-700">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="flex flex-col h-full max-h-[calc(90vh-80px)] bg-white">
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 bg-white">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-orange-200 transition-all duration-200 shadow-sm"
                  >
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-100"
                    />
                    <div className="flex-1 bg-white">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {item.center}
                      </p>
                      <p className="text-sm font-medium text-orange-600">{item.price}</p>
                    </div>
                    <div className="flex items-center space-x-2 bg-white">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="h-8 w-8 p-0 border-gray-300 hover:border-orange-400 hover:bg-orange-50 bg-white"
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-medium bg-gray-50 py-1 px-2 rounded text-gray-900">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="h-8 w-8 p-0 border-gray-300 hover:border-orange-400 hover:bg-orange-50 bg-white"
                      >
                        +
                      </Button>
                    </div>
                    <div className="text-right bg-white">
                      <p className="font-semibold text-gray-900">
                        रू{" "}
                        {(
                          Number.parseInt(item.price.replace("रू ", "").replace(",", "").split("/")[0]) * item.quantity
                        ).toLocaleString()}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="mt-1 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 bg-white"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Summary */}
            <div className="border-t bg-white p-4">
              <div className="bg-gradient-to-br from-gray-50 to-orange-50 rounded-lg shadow-md border border-orange-200 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-orange-200 pb-2">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2 text-orange-600" />
                    Order Summary
                  </h3>
                  <span className="text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded-full font-medium">
                    {cart.length} {cart.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 px-3 bg-white rounded-md border border-gray-100">
                    <span className="text-gray-800 font-medium">Subtotal:</span>
                    <span className="font-bold text-gray-900">रू {getCartSubtotal().toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 px-3 bg-white rounded-md border border-gray-100">
                    <span className="text-gray-800 font-medium flex items-center">
                      VAT (13%):
                      <span className="ml-1 text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-medium">
                        Tax
                      </span>
                    </span>
                    <span className="font-bold text-gray-900">रू {getTax().toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center py-2 px-3 bg-white rounded-md border border-gray-100">
                    <span className="text-gray-800 font-medium flex items-center">
                      Shipping:
                      {getShipping() === 0 && (
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          Free
                        </span>
                      )}
                    </span>
                    <span className={`font-bold ${getShipping() === 0 ? "text-green-600" : "text-gray-900"}`}>
                      {getShipping() === 0 ? "FREE" : `रू ${getShipping()}`}
                    </span>
                  </div>

                  <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-3 border-2 border-orange-300 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">Total:</span>
                      <div className="text-right">
                        <span className="text-xl font-bold text-orange-600 block">
                          रू {getFinalTotal().toLocaleString()}
                        </span>
                        <span className="text-xs font-medium text-gray-600">NPR</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-4">
                <Button
                  variant="outline"
                  className="flex-1 bg-white border-gray-300 hover:bg-gray-50 text-gray-700"
                  onClick={() => setShowCart(false)}
                >
                  Continue Shopping
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold shadow-lg"
                  onClick={() => {
                    setShowCart(false)
                    setShowPayment(true)
                  }}
                >
                  Proceed to Payment
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderNotifications = () => (
    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Notifications</h3>
          <Button variant="outline" size="sm" onClick={() => setShowNotifications(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border ${notification.read ? "bg-gray-50" : "bg-blue-50"}`}
            >
              <p className="text-sm">{notification.message}</p>
              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

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
          <div className="text-sm font-medium text-gray-700 mb-3">Order Summary</div>
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
              <span className={getShipping() === 0 ? "text-green-600 font-medium" : ""}>
                {getShipping() === 0 ? "FREE" : `रू ${getShipping()}`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
              <span>Total:</span>
              <span className="text-blue-600">रू {getFinalTotal().toLocaleString()} NPR</span>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <div className="p-4">
          <div className="flex items-center mb-4">
            <div className="flex items-center bg-blue-50 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs font-medium text-blue-700">Secured by Stripe</span>
            </div>
          </div>

          <form className="space-y-4">
            {/* Card Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={paymentForm.cardNumber}
                  onChange={(e) => {
                    const value = e.target.value
                      .replace(/\s/g, "")
                      .replace(/(.{4})/g, "$1 ")
                      .trim()
                    if (value.length <= 19) {
                      setPaymentForm({ ...paymentForm, cardNumber: value })
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={paymentForm.expiryDate}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, "")
                    if (value.length >= 2) {
                      value = value.substring(0, 2) + "/" + value.substring(2, 4)
                    }
                    if (value.length <= 5) {
                      setPaymentForm({ ...paymentForm, expiryDate: value })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  value={paymentForm.cvv}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "")
                    if (value.length <= 3) {
                      setPaymentForm({ ...paymentForm, cvv: value })
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Cardholder Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={paymentForm.cardholderName}
                onChange={(e) => setPaymentForm({ ...paymentForm, cardholderName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Pay Button */}
            <Button
              onClick={(e) => {
                e.preventDefault()
                if (
                  !paymentForm.cardNumber ||
                  !paymentForm.expiryDate ||
                  !paymentForm.cvv ||
                  !paymentForm.cardholderName
                ) {
                  alert("Please fill in all payment details")
                  return
                }
                alert("Payment processed successfully!")
                setShowPayment(false)
                setCart([])
                setPaymentForm({ cardNumber: "", expiryDate: "", cvv: "", cardholderName: "" })
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
  )

  const renderMarketplace = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {stat.change}
                </p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search products from centers..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
      </Card>

      {/* Products from Centers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {centerProducts.map((product) => (
          <Card key={product.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <img
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-32 object-cover rounded-lg"
              />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                    {product.category}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900">{product.name}</h4>
                <p className="text-sm text-gray-600 flex items-center mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  {product.center} • {product.location}
                </p>
                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500 ml-4">{product.stock} available</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-orange-600">{product.price}</span>
                <Button onClick={() => addToCart(product)} className="bg-orange-600 hover:bg-orange-700" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add to Cart
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderOrders = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">My Purchase Orders</h3>
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
                <th className="text-left py-2 text-sm font-medium text-gray-600">Order ID</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Center</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Items</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-2 text-sm font-medium text-gray-600">Date</th>
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
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
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
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <img
                src="/vrslogo.png"
                alt="VRS Logo"
                className="w-8 h-8 object-contain mr-3"
                onError={(e) => {
                  e.currentTarget.style.display = "none"
                }}
              />
              <h1 className="text-xl font-bold text-gray-900">Vendor Dashboard</h1>
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
                <Button variant="outline" size="sm" onClick={() => setShowCart(true)} className="relative">
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
                  <p className="font-medium text-gray-900">{vendorName}</p>
                  <p className="text-gray-500">Vendor</p>
                </div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      <p className="font-medium">{vendorName}</p>
                      <p className="text-gray-500">vendor@example.com</p>
                    </div>
                    <button
                      onClick={onLogout || (() => console.log("Logout clicked"))}
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
          <nav className="flex space-x-8">
            {[
              { id: "marketplace", label: "Marketplace", icon: Package },
              { id: "orders", label: "My Orders", icon: ShoppingCart },
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
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "marketplace" && renderMarketplace()}
        {activeTab === "orders" && renderOrders()}
      </div>

      {showCart && renderCartModal()}
      {showPayment && renderPaymentModal()}
    </div>
  )
}

export { VendorDashboard }
