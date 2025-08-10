import { useState, useEffect } from "react";
import {type Category, type Product } from "../../lib/data";
import CategorySelector from "./category-selector";
import CenterSelector from "./center-selector";
import ProductList from "./product-list";
import OrderSummary from "./order-summary";
import PaymentForm from "./payment-form";
import axiosInstance from "../../utils/axios";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { toast } from "../ui/Toaster";

export default function ProductCatalog() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<string | null>(null);
  const [cart, setCart] = useState<Product[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false)
  const [clientSecret, setClientSecret] = useState("");

  const stripePromise = loadStripe("pk_test_51RryGpRwaX8v4ksQ7mwWIl0XuOrw5G3AWBHWAv7FypjMOsWBbrCrHM4YsEpBSBcZ6LI7u3CznXhdxgD8hnyP5hos00s8QuykF7");
  useEffect(() => {
    const fetchInitialCategories = async () => {
      setLoadingCategories(true);
      setErrorCategories(null);
      try {
        const { data } = await axiosInstance.get("/api/categories");
        setCategories(data);
      } catch (e: any) {
        setErrorCategories(`Failed to fetch categories: ${e.message}`);
        console.error(e);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchInitialCategories();
  }, []);

  const handleSelectCategory = (categoryId: string) => {
    console.log("Selected Category ID:", categoryId);
    setSelectedCategory(categoryId);
    setSelectedCenter(null); // Reset center when category changes
    setCart([]); // Clear cart when category changes
    setOrderPlaced(false);
    setPaymentCompleted(false);
  };

  const handleSelectCenter = (centerId: string) => {
    setSelectedCenter(centerId);
    setCart([]); // Clear cart when center changes
    setOrderPlaced(false);
    setPaymentCompleted(false);
  };

  const handleAddToCart = async (product: Product) => {
    setCart((prevCart) => [...prevCart, product]);
  };

  const handlePlaceOrder = async () => {
    setOrderPlaced(true);
    const totalAmount = cart.reduce((sum, item) => sum + item.price, 0);
    const { data } = await axiosInstance.post(
      "/api/payments/create-payment-intent",
      {
        amount: totalAmount,
        currency: "inr",
      }
    );
    setClientSecret(data.clientSecret);
  };

  const handlePaymentComplete = async() => {
    const user = JSON.parse(localStorage.getItem("vrs_user") || "{}");
    if(!user) {
      toast.error("User not logged in. Please log in to complete the payment.");
      return
    }
    console.log("Payment completed for user:", user);
     const orderPayload = {
        centerId: selectedCenter, 
        vendorId: user._id,
        items: cart.map(item => ({
          productId: item._id,
          quantity: item.quantity ?? 1,
          specifications: item.specifications || {}
        })),
        paymentMethod: "Bank Transfer",  // or from your UI
        shippingMethod: {
          method: "Standard Shipping",
          cost: 0
        },
        discount:0
      };

    await axiosInstance.post(`/api/orders/vendor/${user._id}/order`, orderPayload);
    setPaymentCompleted(true);
    setCart([]); // Clear cart after successful payment
  };

  // Helper to find category name for display
  const getCategoryName = (id: string | null) => {
    return categories.find((c) => c.id === id)?.name || "";
  };

  if (loadingCategories) {
    return <div className="text-center p-8 text-xl">Loading categories...</div>;
  }

  if (errorCategories) {
    return (
      <div className="text-center p-8 text-xl text-red-500">
        Error: {errorCategories}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Product Catalog</h1>

      {!selectedCategory && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Select a Category:</h2>
          <CategorySelector
            categories={categories}
            onSelectCategory={handleSelectCategory}
          />
        </div>
      )}

      {selectedCategory && !selectedCenter && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Select a Center for {getCategoryName(selectedCategory)}:
          </h2>
          <CenterSelector
            categoryId={selectedCategory}
            onSelectCenter={handleSelectCenter}
          />
          <button
            onClick={() => handleSelectCategory(null)}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Back to Categories
          </button>
        </div>
      )}

      {selectedCenter && !orderPlaced && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Products at {getCategoryName(selectedCategory)} - Center{" "}
            {selectedCenter}:
          </h2>
          <ProductList
            centerId={selectedCenter}
            onAddToCart={handleAddToCart}
          />
          {cart.length > 0 && (
            <div className="mt-8 p-4 border rounded-md shadow-sm bg-white">
              <h3 className="text-xl font-semibold mb-4">Your Cart:</h3>
              <OrderSummary cart={cart} onPlaceOrder={handlePlaceOrder} />
            </div>
          )}
          <button
            onClick={() => handleSelectCenter(null)}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Back to Centers
          </button>
        </div>
      )}

      {orderPlaced && !paymentCompleted && clientSecret && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Proceed to Payment:</h2>
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm
              onPaymentComplete={handlePaymentComplete}
            />
          </Elements>
          <button
            onClick={() => setOrderPlaced(false)}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Back to Cart
          </button>
        </div>
      )}

      {paymentCompleted && (
        <div className="text-center p-8 border rounded-md shadow-lg bg-green-50 text-green-800">
          <h2 className="text-3xl font-bold mb-4">
            Order Placed Successfully!
          </h2>
          <p className="text-lg">Thank you for your purchase.</p>
          <button
            onClick={() => {
              setPaymentCompleted(false);
              setOrderPlaced(false);
              setCart([]);
              setSelectedCenter(null);
              setSelectedCategory(null);
            }}
            className="mt-6 px-6 py-3 bg-blue-400 text-white rounded-md hover:bg-blue-300"
          >
            Start New Order
          </button>
        </div>
      )}
    </div>
  );
}
