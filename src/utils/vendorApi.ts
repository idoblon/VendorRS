import axiosInstance from './axios';
import { Order } from '../types/index';

// Existing function
export interface VendorAnalytics {
  name: string;
  value: number;
}

// Get vendor analytics
export const getVendorAnalytics = async (vendorId: string): Promise<VendorAnalytics[]> => {
  try {
    const response = await axiosInstance.get(`/api/orders/analytics/${vendorId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching vendor analytics:', error);
    throw error;
  }
};

// New function: Get vendor orders
export const getVendorOrders = async (vendorId: string): Promise<Order[]> => {
  try {
    const response = await axiosInstance.get(`/api/orders/vendor/${vendorId}/orders`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    throw error;
  }
};

// New function: Get order details by ID
export const getOrderDetails = async (orderId: string): Promise<Order> => {
  try {
    const response = await axiosInstance.get(`/api/orders/${orderId}`);
    return response.data.data.order;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error;
  }
};

// New function: Get order stats
export const getOrderStats = async (vendorId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/api/orders/stats/overview`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching order stats:', error);
    throw error;
  }
};

// New function: Get user documents
export const getUserDocuments = async (): Promise<any[]> => {
  try {
    const response = await axiosInstance.get('/api/users/documents');
    return response.data.data.documents || [];
  } catch (error) {
    console.error('Error fetching user documents:', error);
    throw error;
  }
};
