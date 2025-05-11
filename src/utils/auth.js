// src/utils/auth.js - Token management utilities
import axios from "axios";

// Constants
const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

/**
 * Login user with credentials
 * @param {Object} credentials - User credentials (email, password)
 * @returns {Promise} - Auth response
 */
export const login = async (credentials) => {
  try {
    const response = await axios.post("/api/login", credentials);
    if (response.data && response.data.token) {
      // Store auth data
      setToken(response.data.token);
      setRefreshToken(response.data.refreshToken);
      setUser(response.data.user);
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

/**
 * Log out user
 */
export const logout = async () => {
  try {
    const token = getToken();
    if (token) {
      // Best effort to notify server, but don't wait for response
      await axios
        .post(
          "/api/logout",
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        .catch(() => {});
    }
  } finally {
    // Always clear local storage
    clearAuth();
  }
};

/**
 * Refresh auth token
 * @returns {Promise} - New token response or null if failed
 */
export const refreshAuthToken = async () => {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    const response = await axios.post("/api/refresh-token", { refreshToken });

    if (response.data && response.data.token) {
      // Update stored tokens
      setToken(response.data.token);
      setRefreshToken(response.data.refreshToken);
      setUser(response.data.user);
      return response.data;
    }
    return null;
  } catch (error) {
    console.error("Token refresh error:", error);
    clearAuth();
    return null;
  }
};

/**
 * Check if current user is authenticated
 * @returns {boolean} - True if authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Check if current user is an admin
 * @returns {boolean} - True if admin
 */
export const isAdmin = () => {
  try {
    const user = getUser();
    return user && user.role === "admin";
  } catch {
    return false;
  }
};

/**
 * Get current authentication token
 * @returns {string|null} - Auth token
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get refresh token
 * @returns {string|null} - Refresh token
 */
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Get current user data
 * @returns {Object|null} - User data
 */
export const getUser = () => {
  const userString = localStorage.getItem(USER_KEY);
  try {
    return userString ? JSON.parse(userString) : null;
  } catch (e) {
    console.error("Error parsing user data:", e);
    return null;
  }
};

/**
 * Store authentication token
 * @param {string} token - JWT token
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Store refresh token
 * @param {string} refreshToken - JWT refresh token
 */
export const setRefreshToken = (refreshToken) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

/**
 * Store user data
 * @param {Object} user - User data object
 */
export const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Clear all authentication data
 */
export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Set up axios interceptors for automatic token handling
 */
export const setupAuthInterceptors = () => {
  // Request interceptor - add token to requests
  axios.interceptors.request.use(
    (config) => {
      const token = getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - handle token expiration
  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If error is unauthorized and we haven't tried refreshing already
      if (
        error.response?.status === 401 &&
        error.response?.data?.code === "TOKEN_EXPIRED" &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          // Try to refresh the token
          const refreshResponse = await refreshAuthToken();

          if (refreshResponse && refreshResponse.token) {
            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.token}`;
            return axios(originalRequest);
          } else {
            // If refresh failed, log out and redirect
            clearAuth();
            window.location.href = "/signin";
            return Promise.reject(error);
          }
        } catch (refreshError) {
          clearAuth();
          window.location.href = "/signin";
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

export default {
  login,
  logout,
  refreshAuthToken,
  isAuthenticated,
  isAdmin,
  getToken,
  getUser,
  clearAuth,
  setupAuthInterceptors,
};
