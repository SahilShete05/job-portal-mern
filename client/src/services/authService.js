import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

let accessToken = null;

const getCookieValue = (name) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
};

const getCsrfToken = () => getCookieValue('csrfToken');

// Create Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add JWT token to request headers if it exists
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  refreshQueue = [];
};

const refreshAccessToken = async () => {
  const response = await api.post('/auth/refresh');
  if (response.data?.success && response.data?.token) {
    setToken(response.data.token);
    return response.data.token;
  }
  throw new Error('Failed to refresh token');
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    const isAuthRefresh = originalRequest?.url?.includes('/auth/refresh');
    if (error.response.status === 401 && !originalRequest._retry && !isAuthRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearToken();
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ============================================
// Authentication Functions
// ============================================

// Register User
export const registerUser = async (data) => {
  try {
    const response = await api.post('/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
    });

    if (response.data.success) {
      setToken(response.data.token);

      return {
        success: true,
        message: response.data.message,
        user: response.data.user,
        token: response.data.token,
      };
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
    throw new Error(errorMessage);
  }
};

// Login User
export const loginUser = async (data) => {
  try {
    const response = await api.post('/auth/login', {
      email: data.email,
      password: data.password,
    });

    if (response.data.success) {
      setToken(response.data.token);

      return {
        success: true,
        message: response.data.message,
        user: response.data.user,
        token: response.data.token,
      };
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Login failed';
    throw new Error(errorMessage);
  }
};

// Change Password (Authenticated)
export const changePassword = async (data) => {
  try {
    const response = await api.patch('/auth/change-password', {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message,
      };
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message || 'Password update failed';
    throw new Error(errorMessage);
  }
};

// ============================================
// Token Management Functions
// ============================================

// Get JWT Token from memory
export const getToken = () => {
  return accessToken;
};

// Set JWT Token in memory
export const setToken = (token) => {
  if (token) {
    accessToken = token;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:token-update'));
    }
  }
};

// Clear JWT Token from memory
export const clearToken = () => {
  accessToken = null;
};

// ============================================
// Session Management Functions
// ============================================

// Logout User
export const logout = () => {
  clearToken();
  return { success: true, message: 'Logged out successfully' };
};

// Check if User is Authenticated
export const isAuthenticated = () => {
  return !!getToken();
};

// ============================================
// Export API instance for other service calls
// ============================================
export default api;

export const refreshSession = async () => {
  const response = await api.post('/auth/refresh');
  if (response.data?.success && response.data?.token) {
    setToken(response.data.token);
    return {
      success: true,
      user: response.data.user,
      token: response.data.token,
    };
  }
  throw new Error('Session refresh failed');
};

export const logoutSession = async () => {
  await api.post('/auth/logout');
  clearToken();
};
