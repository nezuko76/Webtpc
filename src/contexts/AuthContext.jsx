import { createContext, useContext, useState, useEffect, useRef } from 'react';
import apiClient from '../api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const fetchCartRef = useRef(null);

  // Initialize auth from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const register = async (data) => {
    const res = await apiClient.post('/auth/register', data);
    return res.data;
  };

  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    const { accessToken, userId, email: userEmail, fullName, role, avatarUrl } = res.data.data;
    
    const userData = { userId, email: userEmail, fullName, role, avatarUrl };
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setToken(accessToken);
    setUser(userData);

    setTimeout(() => {
      if (fetchCartRef.current) {
        fetchCartRef.current();
      }
    }, 100);

    return res.data.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const verifyEmail = async (token) => {
    const res = await apiClient.get(`/auth/verify-email?token=${token}`);
    return res.data;
  };

  const forgotPassword = async (email) => {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  };

  const resetPassword = async (email, otp, newPassword) => {
    const res = await apiClient.post('/auth/reset-password', { email, otp, newPassword });
    return res.data;
  };

  const isAuthenticated = !!token;

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    isLoggedIn: isAuthenticated,
    isAdmin: user?.role === 'ADMIN',
    register,
    login,
    logout,
    verifyEmail,
    forgotPassword,
    resetPassword,
    fetchCartRef,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
