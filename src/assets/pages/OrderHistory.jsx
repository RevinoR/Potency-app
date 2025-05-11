import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faBoxOpen,
  faFileAlt,
  faShoppingBag,
  faSpinner,
  faSync,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Format number as currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge style
  const getStatusBadge = (status = "pending") => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };

    return `inline-block px-2 py-1 rounded-full text-xs font-medium ${
      statusColors[status] || "bg-gray-100 text-gray-800"
    }`;
  };

  // Format status text
  const formatStatus = (status = "pending") => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Fetch orders with improved error handling
  const fetchOrders = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to view your orders");
        toast.error("You must be logged in to view your orders");
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await axios.get("/api/orders/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000, // 10 second timeout
      });

      if (response.data && response.data.data) {
        setOrders(response.data.data);

        // Select the most recent order by default if available
        if (response.data.data.length > 0) {
          // Sort orders by date (most recent first)
          const sortedOrders = [...response.data.data].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );
          setSelectedOrder(sortedOrders[0]);
        }

        if (showRefreshing) {
          toast.success("Orders refreshed successfully");
        }
      } else {
        setError("No order data found");
        toast.warning("No order data found");
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to load orders";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch order details with improved error handling
  const fetchOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication error. Please sign in again.");
        return;
      }

      // First check if we already have the full details
      const existingOrder = orders.find((o) => o.order_id === orderId);
      if (existingOrder && existingOrder.fullDetails) {
        setSelectedOrder(existingOrder);
        return;
      }

      // Show loading state for the selected order
      setSelectedOrder((prev) => ({
        ...prev,
        loading: true,
      }));

      const response = await axios.get(`/api/orders/user/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 8000, // 8 second timeout
      });

      if (response.data && response.data.data && response.data.data.order) {
        // Mark that we have full details to avoid unnecessary fetches
        const orderWithDetails = {
          ...response.data.data.order,
          fullDetails: true,
          loading: false,
        };

        setSelectedOrder(orderWithDetails);

        // Update the order in the orders array
        setOrders((prevOrders) =>
          prevOrders.map((o) => (o.order_id === orderId ? orderWithDetails : o))
        );
      } else {
        toast.warning("Order details not found");
        // Revert to basic details from orders list
        setSelectedOrder(existingOrder);
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      toast.error(
        err.response?.data?.message || "Failed to load order details"
      );

      // Revert to basic order details on error
      const existingOrder = orders.find((o) => o.order_id === orderId);
      setSelectedOrder(existingOrder);
    }
  };

  // Refresh orders
  const handleRefresh = () => {
    fetchOrders(true);
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();

    // Check if we were redirected from checkout with a success message
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("checkout") === "success") {
      toast.success("Your order has been placed successfully!");
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [fetchOrders]);

  return (
    <>
      <Navbar />
      <ToastContainer position="top-right" autoClose={5000} />

      <div className="container mx-auto pt-24 pb-12 px-4 md:px-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Link to="/" className="mr-4 text-gray-600 hover:text-gray-900">
              <FontAwesomeIcon icon={faArrowLeft} />
            </Link>
            <h1 className="text-2xl font-bold text-black">Order History</h1>
          </div>

          {orders.length > 0 && (
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              <FontAwesomeIcon
                icon={faSync}
                className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className="text-3xl text-gray-400 mr-2"
            />
            <span className="text-gray-600">Loading orders...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex items-start">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-red-600 mt-1 mr-3"
              />
              <div>
                <p className="text-red-700">{error}</p>
                {error.includes("logged in") && (
                  <Link
                    to="/signin"
                    className="mt-2 inline-block px-4 py-2 bg-black text-white hover:bg-gray-800 rounded"
                  >
                    Sign In
                  </Link>
                )}
                <button
                  onClick={() => fetchOrders()}
                  className="mt-2 ml-2 inline-block px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FontAwesomeIcon
              icon={faBoxOpen}
              className="text-5xl text-gray-300 mb-4"
            />
            <h2 className="text-xl font-medium mb-2 text-black">
              No Orders Yet
            </h2>
            <p className="text-gray-700 mb-6">
              You haven't placed any orders yet.
            </p>
            <Link
              to="/products"
              className="px-6 py-2 bg-black text-white hover:bg-gray-800 rounded"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Order List */}
            <div className="w-full md:w-1/3">
              <div className="bg-white rounded-lg shadow-sm">
                <h2 className="text-lg font-medium p-4 border-b text-black">
                  Your Orders
                </h2>

                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {orders.map((order) => (
                    <div
                      key={order.order_id}
                      onClick={() => fetchOrderDetails(order.order_id)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedOrder?.order_id === order.order_id
                          ? "bg-gray-50"
                          : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-black">
                            {order.product}
                          </p>
                          <p className="text-sm text-gray-700">
                            Order #{order.order_id}
                          </p>
                          <p className="text-sm text-gray-700">
                            {formatDate(order.date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={getStatusBadge(order.status)}>
                            {formatStatus(order.status)}
                          </span>
                          <p className="font-medium mt-1 text-black">
                            {formatCurrency(order.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="w-full md:w-2/3">
              {selectedOrder ? (
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-medium text-black">
                      Order Details
                    </h2>
                    <span className={getStatusBadge(selectedOrder.status)}>
                      {formatStatus(selectedOrder.status)}
                    </span>
                  </div>

                  {selectedOrder.loading ? (
                    <div className="flex items-center justify-center py-12">
                      <FontAwesomeIcon
                        icon={faSpinner}
                        spin
                        className="text-2xl text-gray-400 mr-2"
                      />
                      <span className="text-gray-600">Loading details...</span>
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div>
                          <span className="text-gray-700 text-sm">
                            Order Number
                          </span>
                          <p className="font-medium text-black">
                            #{selectedOrder.order_id}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-700 text-sm">
                            Date Placed
                          </span>
                          <p className="text-black">
                            {formatDate(selectedOrder.date)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-700 text-sm">
                            Total Amount
                          </span>
                          <p className="font-medium text-black">
                            {formatCurrency(selectedOrder.price)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-700 text-sm">Items</span>
                          <p className="text-black">
                            {selectedOrder.quantity} item(s)
                          </p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="font-medium mb-3 text-black">
                          Item Details
                        </h3>

                        <div className="bg-gray-50 p-4 rounded-md flex items-start">
                          <div className="mr-4 bg-gray-200 w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                            {selectedOrder.image ? (
                              <img
                                src={`data:image/jpeg;base64,${selectedOrder.image}`}
                                alt={selectedOrder.product}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.parentElement.innerHTML = `<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm1-7a1 1 0 10-2 0v3a1 1 0 102 0V9zm0-3a1 1 0 10-2 0 1 1 0 002 0z" clip-rule="evenodd"></path></svg></div>`;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <FontAwesomeIcon icon={faShoppingBag} />
                              </div>
                            )}
                          </div>

                          <div className="flex-grow">
                            <h4 className="font-medium text-black">
                              {selectedOrder.product}
                            </h4>
                            <p className="text-sm text-gray-700">
                              {selectedOrder.subtitle || "No subtitle"}
                            </p>
                            <p className="text-sm text-black">
                              Quantity: {selectedOrder.quantity} ×{" "}
                              {formatCurrency(
                                selectedOrder.price / selectedOrder.quantity
                              )}
                            </p>
                          </div>

                          <div className="ml-4 text-right">
                            <p className="font-medium text-black">
                              {formatCurrency(selectedOrder.price)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="font-medium mb-3 text-black">
                          Shipping Information
                        </h3>

                        <div className="bg-gray-50 p-4 rounded-md">
                          <p className="font-medium text-black">
                            {selectedOrder.name}
                          </p>
                          <p className="text-sm text-black">
                            {selectedOrder.email}
                          </p>
                          <p className="text-sm text-black">
                            {selectedOrder.phone_number}
                          </p>
                          <p className="text-sm mt-2 text-black">
                            {selectedOrder.address}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Link
                          to="/products"
                          className="px-4 py-2 bg-black text-white hover:bg-gray-800 rounded"
                        >
                          Shop Again
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <FontAwesomeIcon
                    icon={faFileAlt}
                    className="text-5xl text-gray-300 mb-4"
                  />
                  <h2 className="text-xl font-medium mb-2 text-black">
                    No Order Selected
                  </h2>
                  <p className="text-gray-700">
                    Select an order from the list to view its details.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
};

export default OrderHistoryPage;
