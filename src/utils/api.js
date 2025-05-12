import axios from "axios";

// Create the main api instance with the correct backend URL
const api = axios.create({
  baseURL: "http://localhost:3000", // Updated to match your backend port exactly
});

let isRefreshing = false;
let refreshQueue = [];

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push(() => resolve(api(originalRequest)));
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const { data } = await axios.post("/auth/refresh", { refreshToken });

        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        refreshQueue.forEach((cb) => cb());
        refreshQueue = [];
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/signin";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Dashboard API methods
export const dashboardAPI = {
  // Get dashboard statistics
  getStats: () => api.get("/api/dashboard/stats"),
};

// Order API methods
export const orderAPI = {
  // Get order statistics
  getStats: () => api.get("/api/orders/stats"),

  // Get all orders with pagination and filters (for admin)
  getOrders: (params = {}) => api.get("/api/orders", { params }),

  // Get a specific order by ID
  getOrderById: (orderId) => api.get(`/api/orders/${orderId}`),

  // Update order status
  updateOrderStatus: (orderId, status) =>
    api.put(`/api/orders/${orderId}/status`, { status }),

  // Update order notes
  updateOrderNotes: (orderId, notes) =>
    api.put(`/api/orders/${orderId}/notes`, { notes }),

  // Update order tracking number
  updateOrderTracking: (orderId, trackingNumber) =>
    api.put(`/api/orders/${orderId}/tracking`, { trackingNumber }),

  // Bulk update orders
  bulkUpdateOrders: (orderIds, action) =>
    api.put("/api/orders/bulk", { orderIds, action }),
};

// Export default api instance
export default api;
