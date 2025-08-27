import axiosInstance from './axios';

export interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  vendorId: {
    _id: string;
    name: string;
    businessName: string;
    email: string;
    phone: string;
  };
  availability: Array<{
    centerId: string;
    province: string;
    district: string;
    stock: number;
    reservedStock: number;
    lastUpdated: string;
  }>;
  specifications: Record<string, any>;
  images: string[];
  tags: string[];
  status: 'available' | 'out_of_stock' | 'discontinued';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

// Get all products
export const getProducts = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  province?: string;
  district?: string;
  search?: string;
  vendorId?: string;
  status?: string;
}): Promise<ProductsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await axiosInstance.get(`/api/products?${queryParams.toString()}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Get product by ID
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await axiosInstance.get(`/api/products/${id}`);
    return response.data.data.product;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// Get products by category
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    const response = await axiosInstance.get(`/api/products?category=${category}`);
    return response.data.data.products;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

// Get product categories
export const getProductCategories = async (): Promise<string[]> => {
  try {
    const response = await axiosInstance.get('/api/products/categories');
    return response.data.data.categories;
  } catch (error) {
    console.error('Error fetching product categories:', error);
    throw error;
  }
};

// Get products by center
export const getProductsByCenter = async (centerId: string): Promise<Product[]> => {
  try {
    const response = await axiosInstance.get(`/api/products/center/${centerId}`);
    return response.data.data.products;
  } catch (error) {
    console.error('Error fetching products by center:', error);
    throw error;
  }
};