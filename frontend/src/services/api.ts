import axios, { AxiosInstance, AxiosError } from 'axios';
import store from '../store';
import { refreshToken } from '../store/slices/authSlice';

const API_BASE_URL = ((import.meta as any).env.VITE_API_URL as string) || 'http://localhost:3000/api';
const API_TIMEOUT = ((import.meta as any).env.VITE_API_TIMEOUT as string) || 30000;

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: Number(API_TIMEOUT),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh and 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // If we get a 401 and haven't already tried to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const result = await store.dispatch(refreshToken());
        if (refreshToken.fulfilled.match(result)) {
          const newToken = result.payload.accessToken;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API service methods
export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),
  logout: () => apiClient.post('/auth/logout'),
  me: () => apiClient.get('/auth/me'),
  refresh: (refreshToken: string) =>
    apiClient.post('/auth/refresh', { refreshToken }),
};

export const salesAPI = {
  list: (params?: any) => apiClient.get('/sales', { params }),
  get: (id: string) => apiClient.get(`/sales/${id}`),
  create: (data: any) => apiClient.post('/sales', data),
  update: (id: string, data: any) => apiClient.patch(`/sales/${id}`, data),
  delete: (id: string) => apiClient.delete(`/sales/${id}`),
  finalize: (id: string) => apiClient.post(`/sales/${id}/finalize`, {}),
  getSaleItems: (saleId: string) => apiClient.get(`/sales/${saleId}/items`),
};

export const inventoryAPI = {
  list: (params?: any) => apiClient.get('/inventory', { params }),
  get: (id: string) => apiClient.get(`/inventory/${id}`),
  create: (data: any) => apiClient.post('/inventory', data),
  update: (id: string, data: any) =>
    apiClient.patch(`/inventory/${id}`, data),
  delete: (id: string) => apiClient.delete(`/inventory/${id}`),
  count: (data: any) => apiClient.post('/inventory/counts', data),
  getCounts: (params?: any) => apiClient.get('/inventory/counts', { params }),
};

export const shiftsAPI = {
  list: (params?: any) => apiClient.get('/shifts', { params }),
  get: (id: string) => apiClient.get(`/shifts/${id}`),
  create: (data: any) => apiClient.post('/shifts', data),
  clockIn: (data: any) => apiClient.post('/shifts/clock-in', data),
  clockOut: (id: string, data?: any) =>
    apiClient.post(`/shifts/${id}/clock-out`, data || {}),
  update: (id: string, data: any) =>
    apiClient.patch(`/shifts/${id}`, data),
  approve: (id: string) =>
    apiClient.post(`/shifts/${id}/approve`, {}),
};

export const refundsAPI = {
  list: (params?: any) => apiClient.get('/refunds', { params }),
  get: (id: string) => apiClient.get(`/refunds/${id}`),
  create: (data: any) => apiClient.post('/refunds', data),
  approve: (id: string) =>
    apiClient.post(`/refunds/${id}/approve`, {}),
  reject: (id: string, reason: string) =>
    apiClient.post(`/refunds/${id}/reject`, { reason }),
};

export const purchaseOrdersAPI = {
  list: (params?: any) => apiClient.get('/purchase-orders', { params }),
  get: (id: string) => apiClient.get(`/purchase-orders/${id}`),
  create: (data: any) => apiClient.post('/purchase-orders', data),
  update: (id: string, data: any) =>
    apiClient.patch(`/purchase-orders/${id}`, data),
  receive: (id: string, data: any) =>
    apiClient.post(`/purchase-orders/${id}/receive`, data),
  suppliers: () => apiClient.get('/suppliers'),
};

export const reportsAPI = {
  salesByLocation: (params?: any) =>
    apiClient.get('/reports/sales-by-location', { params }),
  salesByPayment: (params?: any) =>
    apiClient.get('/reports/sales-by-payment', { params }),
  inventoryValue: (params?: any) =>
    apiClient.get('/reports/inventory-value', { params }),
  lowStock: (params?: any) =>
    apiClient.get('/reports/low-stock', { params }),
  shiftSummary: (params?: any) =>
    apiClient.get('/reports/shift-summary', { params }),
  dashboardMetrics: (params?: any) =>
    apiClient.get('/reports/dashboard-metrics', { params }),
};

export const stationsAPI = {
  list: () => apiClient.get('/stations'),
  get: (id: string) => apiClient.get(`/stations/${id}`),
};
