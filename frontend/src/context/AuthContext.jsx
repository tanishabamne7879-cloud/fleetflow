import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      api.get('/auth/me')
        .then(response => {
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        })
        .catch(() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      toast.success('Account created! Please check your email for OTP.');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Signup failed');
      throw error;
    }
  };

  const sendOTP = async (email) => {
    try {
      await api.post('/auth/send-otp', { email });
      toast.success('OTP sent to your email!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to send OTP');
      throw error;
    }
  };

  const verifyOTP = async (email, otpCode) => {
    try {
      await api.post('/auth/verify-otp', { email, otp_code: otpCode });
      toast.success('OTP verified successfully!');
      return true;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Invalid OTP');
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      // ✅ USE URLSearchParams for Form Data
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = response.data;
      localStorage.setItem('access_token', access_token);

      const userResponse = await api.get('/auth/me');
      setUser(userResponse.data);
      localStorage.setItem('user', JSON.stringify(userResponse.data));

      toast.success('Login successful!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    toast.success('Logged out');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signup,
      login,
      logout,
      sendOTP,
      verifyOTP,
      updateUser,
      isAuthenticated: !!localStorage.getItem('access_token')
    }}>
      {children}
    </AuthContext.Provider>
  );
};