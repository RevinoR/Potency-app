import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../components/NavbarAdmin";
import OrderGrid from "../components/OrderGrid";
import OrderDetail from "../components/OrderDetail";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const OrderAdminPage = () => {
  // State management
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  });
  const navigate = useNavigate();

  // Check if user is authenticated and is admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/signin", { state: { returnUrl: "/admin/orders" } });
          return;
        }

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user.role !== "admin") {
          setError("You do not have permission to access this page");
          setTimeout(() => {
            navigate("/");
          }, 3000);
          return;
        }

        // Fetch initial order statistics
        await fetchOrderStats();
      } catch (err) {
        console.error("Auth check error:", err);
        setError("Authentication failed");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch order statistics
  const fetchOrderStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // In a real implementation, you'd have an API endpoint for order stats
      // For now, we'll simulate this data
      const mockStats = {
        total: 150,
        pending: 45,
        processing: 30,
        shipped: 25,
        delivered: 40,
        cancelled: 10,
      };
      setOrderStats(mockStats);
    } catch (err) {
      console.error("Error fetching order stats:", err);
    }
  }, []);

  // Handle order selection
  const handleOrderSelect = useCallback((order) => {
    setSelectedOrder(order);

    // In mobile view, scroll to detail section
    if (window.innerWidth < 768) {
      const detailSection = document.getElementById("order-detail-mobile");
      if (detailSection) {
        detailSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, []);

  // Handle order status update
  const handleOrderUpdate = useCallback(
    async (orderId, newStatus) => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.put(
          `/api/orders/${orderId}/status`,
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data.success) {
          toast.success(`Order status updated to ${newStatus}`);

          // Update selected order if it's the one that was updated
          if (selectedOrder && selectedOrder.order_id === orderId) {
            setSelectedOrder((prev) => ({
              ...prev,
              status: newStatus,
            }));
          }

          // Trigger refresh of the order grid
          setRefreshKey((key) => key + 1);
          fetchOrderStats();
        }
      } catch (error) {
        console.error("Error updating order:", error);
        const errorMessage =
          error.response?.data?.message || "Failed to update order status";
        toast.error(errorMessage);
      }
    },
    [selectedOrder, fetchOrderStats]
  );

  // Handle bulk actions (future implementation)
  const handleBulkAction = useCallback((action, orderIds) => {
    // Placeholder for bulk actions like bulk approve, bulk ship, etc.
    console.log(`Bulk ${action} for orders:`, orderIds);
    toast.info(`Bulk ${action} feature coming soon!`);
  }, []);

  // If still checking auth, show loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading order admin...</p>
        </div>
      </div>
    );
  }

  // If error (e.g., not admin), show error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-red-500 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavbarAdmin />
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="pt-16 pb-8 container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-black">Order Management</h1>
          <div className="text-sm text-gray-600">
            Total Orders: {orderStats.total}
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-white p-3 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {orderStats.pending}
            </div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-blue-600">
              {orderStats.processing}
            </div>
            <div className="text-xs text-gray-600">Processing</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-purple-600">
              {orderStats.shipped}
            </div>
            <div className="text-xs text-gray-600">Shipped</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600">
              {orderStats.delivered}
            </div>
            <div className="text-xs text-gray-600">Delivered</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-red-600">
              {orderStats.cancelled}
            </div>
            <div className="text-xs text-gray-600">Cancelled</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-gray-800">
              {orderStats.total}
            </div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex gap-6">
          <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
            <OrderGrid
              onSelect={handleOrderSelect}
              refreshKey={refreshKey}
              onBulkAction={handleBulkAction}
            />
          </div>

          {selectedOrder && (
            <div className="w-1/3 bg-white rounded-lg shadow-sm">
              <OrderDetail
                order={selectedOrder}
                onUpdateStatus={handleOrderUpdate}
              />
            </div>
          )}
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <OrderGrid
              onSelect={handleOrderSelect}
              refreshKey={refreshKey}
              onBulkAction={handleBulkAction}
            />
          </div>

          {selectedOrder && (
            <div
              id="order-detail-mobile"
              className="bg-white rounded-lg shadow-sm"
            >
              <OrderDetail
                order={selectedOrder}
                onUpdateStatus={handleOrderUpdate}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderAdminPage;
