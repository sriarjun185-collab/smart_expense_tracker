import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Set default base URL for axios (proxied via Vite)
axios.defaults.baseURL = '';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Set auth header helper
  const setAuthHeader = (authToken) => {
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Check login status on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        setAuthHeader(token);
        try {
          const res = await axios.get('/api/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            handleLogout();
          }
        } catch (err) {
          console.error('Error fetching user:', err);
          handleLogout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  // Register user
  const register = async (name, email, password) => {
    try {
      const res = await axios.post('/api/auth/register', { name, email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        setAuthHeader(res.data.token);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Try again.';
      throw new Error(message);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        setAuthHeader(res.data.token);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password.';
      throw new Error(message);
    }
  };

  // Logout helper
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthHeader(null);
  };

  const logout = () => {
    handleLogout();
  };

  // Update profile details
  const updateProfile = async (userData) => {
    try {
      const res = await axios.put('/api/users/profile', userData);
      if (res.data.success) {
        setUser(res.data.user);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update profile.';
      throw new Error(message);
    }
  };

  // Change password
  const changePassword = async (oldPassword, newPassword) => {
    try {
      const res = await axios.put('/api/users/password', { oldPassword, newPassword });
      return res.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to change password.';
      throw new Error(message);
    }
  };

  // Delete account
  const deleteAccount = async () => {
    try {
      const res = await axios.delete('/api/users/account');
      if (res.data.success) {
        handleLogout();
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete account.';
      throw new Error(message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        logout,
        updateProfile,
        changePassword,
        deleteAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
