import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the Firebase ID token
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const generateSms = async (params) => {
  const response = await api.post('/generate-sms', params);
  return response.data;
};

export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const customersApi = {
  getAll: async () => {
    const response = await api.get('/customers/');
    return response.data;
  },
  getOne: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/customers/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/customers/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  }
};

export const campaignsApi = {
  getAll: async (customerId = null) => {
    const url = customerId ? `/campaigns/?customer_id=${customerId}` : '/campaigns/';
    const response = await api.get(url);
    return response.data;
  },
  getOne: async (id) => {
    const response = await api.get(`/campaigns/${id}`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/campaigns/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/campaigns/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/campaigns/${id}`);
    return response.data;
  },
  saveMessage: async (campaignId, data) => {
    const response = await api.post(`/campaigns/${campaignId}/messages`, data);
    return response.data;
  },
  getMessages: async (campaignId) => {
    const response = await api.get(`/campaigns/${campaignId}/messages`);
    return response.data;
  },
  deleteMessage: async (campaignId, messageId) => {
    const response = await api.delete(`/campaigns/${campaignId}/messages/${messageId}`);
    return response.data;
  }
};

export const analyticsApi = {
  getWeeklyTrend: async () => {
    const response = await api.get('/campaigns/analytics/weekly-trend');
    return response.data;
  }
};

export default api;
