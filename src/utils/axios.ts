import axios from 'axios';

// Use empty baseURL since Vite proxies /api to the backend
// and the API calls already include /api prefix
const axiosInstance = axios.create({
  baseURL: '/',
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