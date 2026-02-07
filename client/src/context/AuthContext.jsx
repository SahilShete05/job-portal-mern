import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AuthContext from './AuthContextBase';
import {
  registerUser,
  loginUser,
  logout as logoutService,
  getToken,
  setToken,
  clearToken,
  refreshSession,
  logoutSession,
} from '../services/authService';
import { connectSocket, disconnectSocket } from '../services/socket';

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize user from localStorage on app start
  useEffect(() => {
    const initializeUser = () => {
      setLoading(true);
      refreshSession()
        .then((result) => {
          setUser(result.user || null);
        })
        .catch(() => {
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    initializeUser();
  }, []);

  useEffect(() => {
    if (user) {
      connectSocket();
    } else {
      disconnectSocket();
    }
  }, [user]);


  // Login Function
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      setLoading(true);

      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      const result = await loginUser({ email, password });

      // Update state
      setUser(result.user);
      setToken(result.token);
      connectSocket();

      return {
        success: true,
        message: result.message,
        user: result.user,
      };
    } catch (err) {
      const errorMessage = err.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Register Function
  const register = useCallback(async (name, email, password, role = 'jobseeker') => {
    try {
      setError(null);
      setLoading(true);

      if (!name || !email || !password) {
        throw new Error('Name, email, and password are required');
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }

      const result = await registerUser({
        name,
        email,
        password,
        role,
      });

      // Update state
      setUser(result.user);
      setToken(result.token);
      connectSocket();

      return {
        success: true,
        message: result.message,
        user: result.user,
      };
    } catch (err) {
      const errorMessage = err.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout Function
  const logout = useCallback(() => {
    try {
      logoutSession().catch(() => {});
      logoutService();
      clearToken();
      setUser(null);
      setError(null);
      disconnectSocket();
      return { success: true, message: 'Logged out successfully' };
    } catch (err) {
      const errorMessage = err.message || 'Logout failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Check User Role
  const isRole = useCallback((requiredRole) => {
    if (!user) return false;
    return user.role === requiredRole;
  }, [user]);

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback((requiredRoles) => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  }, [user]);

  // Check if user is authenticated
  const isAuthenticated = useCallback(() => !!user && !!getToken(), [user]);

  // Clear Error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    loading,
    error,
    clearError,
    login,
    register,
    logout,
    isRole,
    hasAnyRole,
    isAuthenticated,
  }), [user, loading, error, clearError, login, register, logout, isRole, hasAnyRole, isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

