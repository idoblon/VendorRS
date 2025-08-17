import axiosInstance from './axios';

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