import axiosInstance from './axios';

export interface Center {
  _id: string;
  name: string;
  location: string;
  rating: number;
  categories: string[];
  image: string;
  province?: string;
  district?: string;
  status?: string;
}

// Get centers by category
export const getCentersByCategory = async (category: string): Promise<Center[]> => {
  try {
    const response = await axiosInstance.get(`/api/users/centers/category/${category}`);
    return response.data.data.centers;
  } catch (error) {
    console.error('Error fetching centers by category:', error);
    throw error;
  }
};

// Get all center categories
export const getCenterCategories = async (): Promise<string[]> => {
  try {
    const response = await axiosInstance.get('/api/users/centers/categories');
    return response.data.data.categories;
  } catch (error) {
    console.error('Error fetching center categories:', error);
    throw error;
  }
};

// Get all centers
export const getAllCenters = async (params?: { limit?: number; page?: number; status?: string }): Promise<Center[]> => {
  // Try to get centers directly from admin endpoint first
  try {
    const response = await axiosInstance.get('/api/users/centers');
    const centers = response.data.data.centers || [];
    
    // Filter by status if provided
    if (params?.status) {
      return centers.filter(center => center.status === params.status);
    }
    
    return centers;
  } catch (adminError) {
    console.log('Admin centers endpoint not accessible, using category-based approach');
  }
  
  // If admin endpoint fails, fall back to category-based approach
  try {
    // Get all unique categories
    const categoriesResponse = await axiosInstance.get('/api/users/centers/categories');
    const categories = categoriesResponse.data.data.categories;
    
    // For non-vendor users, return empty array to avoid 403 errors
    if (!categories || categories.length === 0) {
      return [];
    }
    
    // Fetch centers for each category and combine results
    const centersPromises = categories.map(async (category) => {
      try {
        return await getCentersByCategory(category);
      } catch (error) {
        console.warn(`Failed to fetch centers for category ${category}:`, error);
        return [];
      }
    });
    
    const centersArrays = await Promise.all(centersPromises);
  
    // Flatten the array of arrays and remove duplicates by center ID
    const uniqueCentersMap = new Map();
    centersArrays.flat().forEach(center => {
      uniqueCentersMap.set(center._id, center);
    });
    
    const uniqueCenters = Array.from(uniqueCentersMap.values());
    
    // Filter by status if provided
    if (params?.status) {
      return uniqueCenters.filter(center => center.status === params.status);
    }
    
    return uniqueCenters;
  } catch (error) {
    console.error('Error fetching all centers:', error);
    // Return empty array instead of throwing to prevent breaking the dashboard
    return [];
  }
};