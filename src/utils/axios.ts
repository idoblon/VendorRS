import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000',
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
