/**
 * VitaCore API Client — v2.0.0 (consolidated)
 * Single source of truth for all API calls (storefront + admin).
 *
 * Replaces:
 *   - src/api/apiClient.js   (old, kept axios + refresh logic)
 *   - src/api/adminApi.js    (removed — endpoints folded in below)
 *
 * Centralized Axios instance with JWT auto-refresh, request deduplication,
 * and typed wrappers for every backend endpoint.
 */
import axios from 'axios';

// ── Base URL ──────────────────────────────────────────────────────
// IMPORTANT: VITE_API_BASE_URL should be the ROOT origin only

const ROOT_URL = import.meta.env.VITE_API_BASE_URL;
const API_V1 = `${ROOT_URL}/api/v1`;

// ── Token storage ────────────────────────────────────────
const TokenStore = {
  get: () => localStorage.getItem('vc_access'),
  set: (t) => localStorage.setItem('vc_access', t),
  getRefresh: () => localStorage.getItem('vc_refresh'),
  setRefresh: (t) => localStorage.setItem('vc_refresh', t),
  clear: () => {
    localStorage.removeItem('vc_access');
    localStorage.removeItem('vc_refresh');
  },
};

export { TokenStore };

// ── Axios instance ────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_V1,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach access token ──────────────────────
api.interceptors.request.use((config) => {
  const token = TokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor: auto-refresh on 401, redirect on hard fail ─
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = TokenStore.getRefresh();
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_V1}/auth/refresh-token`, {
          refreshToken,
        });
        const newToken = data.accessToken;
        TokenStore.set(newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        TokenStore.clear();
        // Old adminApi.js did window.location.href = '/login' directly.
        // Keep the event-based approach instead — a top-level listener
        // (e.g. in App.jsx) should handle the redirect, so non-admin
        // routes can also react (show toast, etc.) without a hard reload.
        window.dispatchEvent(new CustomEvent('vc:session-expired'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ── Helper: extract error message ────────────────────────────────
export const getApiError = (err) =>
  err?.response?.data?.message ||
  err?.response?.data?.errors?.[0]?.msg ||
  err?.message ||
  'Something went wrong';

// ═══════════════════════════════════════════════════════════════════
// AUTH  /auth
// ═══════════════════════════════════════════════════════════════════
export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin-login', data),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  me: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  logoutAll: () => api.post('/auth/logout-all'),
};

// ═══════════════════════════════════════════════════════════════════
// PRODUCTS  /products
// ═════════════════════════════════════════════════════════
// backend expects PUT.
export const products = {
  list: (params) => api.get('/products', { params }),
  get: (slug) => api.get(`/products/${slug}`),
  getById: (id) => api.get(`/products/${id}`), // from adminApi.js (slug vs id — verify which your admin UI needs)
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
  // Admin
  create: (data) => api.post('/products', data),
  update: (id, data) => api.patch(`/products/${id}`, data), // ⚠️ verify PATCH vs PUT
  delete: (id) => api.delete(`/products/${id}`),
  // Image upload — multipart/form-data
  uploadImage: (id, formData) =>
    api.post(`/products/${id}/images`, formData, {
      headers: { 'Content-Type': undefined },
    }),
};

// ═══════════════════════════════════════════════════════════════════
// ORDERS  /orders
// ═══════════════════════════════════════════════════════════════════
// ⚠️ CONFLICT: old apiClient's admin list is all() -> /order
// collapse into one once you check.
export const orders = {
  myOrders: () => api.get('/orders'),
  get: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.post(`/orders/${id}/cancel`),
  recent: (limit = 10) => api.get('/orders', { params: { limit, sort: '-createdAt' } }),
  // Admin
  all: (params) => api.get('/orders/admin/all', { params }), // ⚠️ verify vs adminList
  adminList: (params) => api.get('/orders', { params }),     // ⚠️ verify vs all()
  updateStatus: (id, data) => api.patch(`/orders/admin/${id}/status`, data),
};

// ═══════════════════════════════════════════════════════════════════
// PAYMENTS  /payments
// ════════════════════════╗
export const payments = {
  validatePromo: (code) => api.post('/payments/validate-promo', { code }),
  checkout: (data) => api.post('/payments/checkout', data),
  verifyStatus: (reference) => api.get(`/payments/${reference}/status`),
};

// ═══════════════════════════════════════════════════════════════════
// USERS  /users
// ═══════════════════════════════════════════════════════════════════
export const users = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.patch('/users/profile', data),
  changePassword: (data) => api.patch('/users/change-password', data),
  addAddress: (data) => api.post('/users/addresses', data),
  removeAddress: (id) => api.delete(`/users/addresses/${id}`),
  toggleWishlist: (productId) => api.post(`/users/wishlist/${productId}`),
  newsletter: (data) => api.post('/users/newsletter', data),
};

// ═══════════════════════════════════════════════════════════════════
// ADMIN  /admin
// ═════════════════════════════════════════════════════════════
export const admin = {
  dashboard: () => api.get('/admin/stats'),       // ⚠️ vs '/admin/stats'
  revenueAnalytics: (months) => api.get('/admin/reports/revenue', { params: { months } }), // ⚠️ vs '/admin/reports/revenue'
  topProducts: () => api.get('/admin/reports/top-products'),   // ⚠️ '/admin/reports/top-products'
  categoryAnalytics: () => api.get('/admin/stats/categoryBreakdown'),

  // Users / Customers
  allUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/status`),
  getCustomerById: (id) => api.get(`/admin/users/${id}`), // from adminApi.js

   updateUserRole: (id, data) =>
    api.patch(`/admin/users/${id}/role`, data),

  // Products
  updateStock: (id, stock) => api.patch(`/admin/products/${id}/stock`, { stock }),
  toggleReviewVisibility: (productId, reviewId) =>
    api.patch(`/admin/products/${productId}/reviews/${reviewId}/visibility`),

  // Reviews (from adminApi.js — separate moderation queue, not the
  // per-product visibility toggle above; confirm these are distinct
  // endpoints and not duplicates)
  reviews: {
    list: (params) => api.get('/admin/reviews', { params }),
    approve: (id) => api.patch(`/admin/reviews/${id}/approve`),
    reject: (id) => api.patch(`/admin/reviews/${id}/reject`),
  },

  // Orders
  notifyShipped: (id) => api.post(`/admin/orders/${id}/notify-shipped`),
   
  // Categories - using the routes from your backend
  getCategories: () => api.get('/categories'),  // Public route
  getAdminCategories: (includeInactive) => 
    api.get('/admin/categories', { params: { includeInactive } }),  // Admin route
  
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
};

export default api;