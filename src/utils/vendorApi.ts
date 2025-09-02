import axiosInstance from './axios';
import { Order } from '../types/index';

// Existing function
export interface VendorAnalytics {
  name: string;
  value: number;
}

// New interface for centers sales ranking
export interface CenterSalesRanking {
  _id: string;
  centerId: string;
  centerName: string;
  centerLocation: string;
  centerDistrict: string;
  totalSales: number;
  orderCount: number;
  lastOrderDate: string;
  averageOrderValue: number;
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

// New function: Get centers ranked by sales for a vendor
export const getCentersSalesRanking = async (vendorId: string): Promise<CenterSalesRanking[]> => {
  try {
    const response = await axiosInstance.get(`/api/orders/centers/sales-ranking/${vendorId}`);
    return response.data.data.centers;
  } catch (error) {
    console.error('Error fetching centers sales ranking:', error);
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

// New function: Get admin analytics for top centers
export const getAdminAnalytics = async (): Promise<any> => {
  try {
    const response = await axiosInstance.get('/api/orders/admin/analytics');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching admin analytics:', error);
    throw error;
  }
};

// New function: Get vendor analytics for top centers
export const getVendorTopCentersAnalytics = async (vendorId: string): Promise<any> => {
  try {
    const response = await axiosInstance.get(`/api/orders/vendor/analytics/${vendorId}`);
    return response.data.data.centers;
  } catch (error) {
    console.error('Error fetching vendor top centers analytics:', error);
    throw error;
  }
};

// New function: Get centers performance data (similar to admin analytics)
export const getCentersPerformance = async (): Promise<any[]> => {
  try {
    const response = await axiosInstance.get('/api/orders/centers/performance');
    return response.data.data.centers;
  } catch (error) {
    console.error('Error fetching centers performance data:', error);
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
