"use client";

import { useState, useEffect } from "react";
import { getProductsByCenterId, type Product } from "../../lib/data";
import ProductCard from "./product-card";
import axiosInstance from "../../utils/axios";

interface ProductListProps {
  centerId: string;
  onAddToCart: (product: Product) => void;
}

export default function ProductList({
  centerId,
  onAddToCart,
}: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await axiosInstance.get(
          `/api/products/center/${centerId}`
        );
        // Ensure we store an array
        if (Array.isArray(data.data.products)) {
          setProducts(data.data.products);
        } else if (Array.isArray(data?.products)) {
          setProducts(data.products); // if API wraps in { products: [...] }
        } else {
          setProducts([]); // fallback if no array found
        }
      } catch (e: any) {
        setError(`Failed to fetch products: ${e.message}`);
        console.error(e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (centerId) {
      fetchProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [centerId]);

  if (loading) {
    return <div className="text-center p-4">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  // No products fallback
  if (!products || products.length === 0) {
    console.log("No products found",products);
    return (
      <div className="text-center p-4 text-gray-500 border rounded-md">
        No products found for this center.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
