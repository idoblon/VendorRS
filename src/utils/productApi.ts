import axiosInstance from './axios';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
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
    lastUpdated?: Date;
  }>;
  specifications?: Record<string, any>;
  images: Array<{
    filename: string;
    originalName: string;
    path: string;
    url: string;
    isPrimary: boolean;
  }>;
  tags: string[];
  status: 'available' | 'out_of_stock' | 'discontinued';
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination?: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

// Get products by center ID
export const getProductsByCenter = async (centerId: string): Promise<Product[]> => {
  try {
    const response = await axiosInstance.get(`/api/products/center/${centerId}`);
    return response.data.data.products;
  } catch (error) {
    console.error('Error fetching products by center:', error);
    throw error;
  }
};

// Get all products with optional filters
export const getProducts = async (filters?: {
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
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
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
export const getProductById = async (productId: string): Promise<Product> => {
  try {
    const response = await axiosInstance.get(`/api/products/${productId}`);
    return response.data.data.product;
  } catch (error) {
    console.error('Error fetching product details:', error);
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