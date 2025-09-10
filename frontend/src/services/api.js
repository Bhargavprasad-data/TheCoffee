import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';
export const SOCKET_BASE_URL = 'http://localhost:5000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
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
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Don't redirect on public endpoints
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
  adminRegister: (userData) => api.post('/auth/admin/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getAllUsers: () => api.get('/auth/users'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password, email) => api.post('/auth/reset-password', { token, password, email }),
};

// Products API
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  create: (productData) => api.post('/products', productData),
  update: (id, productData) => api.put(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
  addReview: (id, reviewData) => api.post(`/products/${id}/reviews`, reviewData),
};

// Orders API
export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  create: (orderData) => api.post('/orders', orderData),
  update: (id, orderData) => api.put(`/orders/${id}`, orderData),
  delete: (id) => api.delete(`/orders/${id}`),
  get: (path) => api.get(`/orders${path}`),
  setStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  getTracking: (id) => api.get(`/orders/${id}/tracking`),
  setTracking: (id, data) => api.put(`/orders/${id}/tracking`, data),
  addCheckpoint: (id, data) => api.post(`/orders/${id}/tracking/checkpoints`, data),
  generateDeliveryOtp: (id) => api.post(`/orders/${id}/delivery/otp`),
  confirmDelivery: (id, data) => api.post(`/orders/${id}/delivery/confirm`, data),
  assignAgent: (id, data) => api.put(`/orders/${id}/assign`, data),
  agentOrders: (agentId) => api.get(`/orders/agent/${agentId}/orders`),
  agentStatus: (id, data) => api.post(`/orders/${id}/agent/status`, data),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
  deleteSelf: (id) => api.delete(`/orders/${id}/self`),
  // Public, no auth
  getPublic: (id) => api.get(`/orders/public/${id}`),
  getPublicTracking: (id) => api.get(`/orders/public/${id}/tracking`),
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  replace: (items) => api.put('/cart', { items }),
  add: (product, quantity) => api.post('/cart/add', { product, quantity }),
  remove: (productId) => api.delete(`/cart/remove/${productId}`),
  update: (productId, quantity) => api.put(`/cart/update/${productId}`, { quantity }),
  clear: () => api.delete('/cart/clear'),
};

// Wishlist API
export const wishlistAPI = {
  get: () => api.get('/wishlist'),
  add: (product) => api.post('/wishlist/add', { product }),
  remove: (productId) => api.delete(`/wishlist/remove/${productId}`),
  toggle: (product) => api.post('/wishlist/toggle', { product }),
  has: (productId) => api.get(`/wishlist/has/${productId}`),
  clear: () => api.delete('/wishlist/clear'),
};

export default api;
