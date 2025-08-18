import axios from 'axios';

// Use environment variable or default to localhost:5000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

axiosInstance.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('vrs_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error:any) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to normalize role case
axiosInstance.interceptors.response.use(
  (response) => {
    // Check if response contains user data with role
    if (response.data?.data?.user?.role) {
      // Convert role to lowercase to match frontend enum
      response.data.data.user.role = response.data.data.user.role.toLowerCase();
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;