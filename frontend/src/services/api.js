import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://safeher-3sex.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

export const getEvidenceAudioUrl = (filename) => {
  return `${API_BASE_URL}/evidence/stream/${filename}`;
};

// Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('safevoice_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthenticated 401s
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if expired or invalid
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        localStorage.removeItem('safevoice_token');
        localStorage.removeItem('safevoice_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
