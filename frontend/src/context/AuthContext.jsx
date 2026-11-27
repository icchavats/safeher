import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('safevoice_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('safevoice_token') || null);
  const [loading, setLoading] = useState(true);
  const [dbOffline, setDbOffline] = useState(false);

  // Fetch current user on mount if token exists
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          setDbOffline(false);
          localStorage.setItem('safevoice_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        if (err.response?.status === 503 || err.response?.data?.isDatabaseOffline) {
          setDbOffline(true);
        } else {
          console.warn('[SafeVoice Auth] Token validation error:', err.message);
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('safevoice_token', res.data.token);
      localStorage.setItem('safevoice_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('safevoice_token', res.data.token);
      localStorage.setItem('safevoice_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const updateProfile = async (updateData) => {
    const res = await api.put('/auth/profile', updateData);
    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('safevoice_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('safevoice_token');
    localStorage.removeItem('safevoice_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        loading,
        dbOffline,
        setDbOffline,
        login,
        register,
        updateProfile,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
