import axiosInstance from './axios';

export interface Center {
  _id: string;
  name: string;
  location: string;
  rating: number;
  categories: string[];
  image: string;
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