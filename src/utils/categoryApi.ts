import axiosInstance from './axios';

export interface Category {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await axiosInstance.get('/api/categories');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Get a specific category by ID
export const getCategoryById = async (id: string): Promise<Category> => {
  try {
    const response = await axiosInstance.get(`/api/categories/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

// Create a new category
export const createCategory = async (name: string): Promise<Category> => {
  try {
    const response = await axiosInstance.post('/api/categories', { name });
    return response.data.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Update a category
export const updateCategory = async (id: string, name: string): Promise<Category> => {
  try {
    const response = await axiosInstance.put(`/api/categories/${id}`, { name });
    return response.data.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

// Delete a category
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/categories/${id}`);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};