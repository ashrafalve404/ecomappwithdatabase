import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config';

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_CONFIG.BASE_URL}token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          await AsyncStorage.setItem('accessToken', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await api.post('login/', { username, password });
    return response.data;
  },
  
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    password_confirm: string;
    first_name?: string;
    last_name?: string;
  }) => {
    const response = await api.post('register/', userData);
    return response.data;
  },
};

// Products API calls
export const productsAPI = {
  getProducts: async () => {
    const response = await api.get('products/');
    return response.data;
  },
  
  getProductDetails: async (id: number) => {
    const response = await api.get(`products/${id}/`);
    return response.data;
  },
  
  searchProducts: async (query: string) => {
    const response = await api.get(`products/?search=${encodeURIComponent(query)}`);
    return response.data;
  },
  
  getProductsByCategory: async (categoryId: number) => {
    const response = await api.get(`products/?category=${categoryId}`);
    return response.data;
  },
};

// Categories API calls
export const categoriesAPI = {
  getCategories: async () => {
    const response = await api.get('categories/');
    return response.data;
  },
};

// Cart API calls
export const cartAPI = {
  getCart: async () => {
    const response = await api.get('cart/');
    return response.data;
  },
  
  addToCart: async (productId: number, quantity: number = 1) => {
    const response = await api.post('cart/add/', { product_id: productId, quantity });
    return response.data;
  },
  
  removeFromCart: async (itemId: number) => {
    const response = await api.delete(`cart/remove/${itemId}/`);
    return response.data;
  },
  
  updateCartItem: async (itemId: number, quantity: number) => {
    const response = await api.patch(`cart/update/${itemId}/`, { quantity });
    return response.data;
  },
};

// Orders API calls
export const ordersAPI = {
  createOrder: async (orderData: {
    shipping_address: string;
    payment_method: string;
  }) => {
    const response = await api.post('orders/create/', orderData);
    return response.data;
  },
  
  getOrders: async () => {
    const response = await api.get('orders/');
    return response.data;
  },
  
  getOrderDetails: async (id: number) => {
    const response = await api.get(`orders/${id}/`);
    return response.data;
  },
};

// User API calls
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('profile/');
    return response.data;
  },
  
  updateProfile: async (userData: {
    first_name?: string;
    last_name?: string;
  }) => {
    const response = await api.patch('profile/', userData);
    return response.data;
  },
};

export default api;
