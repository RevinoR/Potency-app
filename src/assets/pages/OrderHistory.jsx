import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faBoxOpen,
  faFileAlt,
  faShoppingBag,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

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
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge style
  const getStatusBadge = (status) => {
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

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setError("You must be logged in to view your orders");
        setLoading(false);
        return;
      }

      const response = await axios.get("/api/orders/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(response.data.data);

      // Select the first order by default if available
      if (response.data.data.length > 0) {
        setSelectedOrder(response.data.data[0]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Fetch order details
  const fetchOrderDetails = async (orderId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`/api/orders/user/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSelectedOrder(response.data.data.order);
    } catch (err) {
      console.error("Error fetching order details:", err);
      setError(err.response?.data?.message || "Failed to load order details");
    }
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <>
      <Navbar />

      <div className="container mx-auto pt-24 pb-12 px-4 md:px-6">
        <div className="flex items-center mb-8">
          <Link to="/" className="mr-4 text-gray-600 hover:text-gray-900">
            <FontAwesomeIcon icon={faArrowLeft} />
          </Link>
          <h1 className="text-2xl font-bold">Order History</h1>
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
            <p className="text-red-700">{error}</p>
            {error.includes("logged in") && (
              <Link
                to="/signin"
                className="mt-2 inline-block px-4 py-2 bg-black text-white hover:bg-gray-800"
              >
                Sign In
              </Link>
            )}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FontAwesomeIcon
              icon={faBoxOpen}
              className="text-5xl text-gray-300 mb-4"
            />
            <h2 className="text-xl font-medium mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet.
            </p>
            <Link
              to="/products"
              className="px-6 py-2 bg-black text-white hover:bg-gray-800"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            {/* Order List */}
            <div className="w-full md:w-1/3">
              <div className="bg-white rounded-lg shadow-sm">
                <h2 className="text-lg font-medium p-4 border-b">
                  Your Orders
                </h2>

                <div className="divide-y max-h-[600px] overflow-y-auto">
                  {orders.map((order) => (
                    <div
                      key={order.order_id}
                      onClick={() => fetchOrderDetails(order.order_id)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer ${
                        selectedOrder?.order_id === order.order_id
                          ? "bg-gray-50"
                          : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{order.product}</p>
                          <p className="text-sm text-gray-600">
                            Order #{order.order_id}
                          </p>
                          <p className="text-sm text-gray-600">
                            {formatDate(order.date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={getStatusBadge(order.status)}>
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                          <p className="font-medium mt-1">
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
                    <h2 className="text-lg font-medium">Order Details</h2>
                    <span className={getStatusBadge(selectedOrder.status)}>
                      {selectedOrder.status.charAt(0).toUpperCase() +
                        selectedOrder.status.slice(1)}
                    </span>
                  </div>

                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <span className="text-gray-600 text-sm">
                          Order Number
                        </span>
                        <p className="font-medium">#{selectedOrder.order_id}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">
                          Date Placed
                        </span>
                        <p>{formatDate(selectedOrder.date)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">
                          Total Amount
                        </span>
                        <p className="font-medium">
                          {formatCurrency(selectedOrder.price)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 text-sm">Items</span>
                        <p>{selectedOrder.quantity} item(s)</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-medium mb-3">Item Details</h3>

                      <div className="bg-gray-50 p-4 rounded-md flex items-start">
                        <div className="mr-4 bg-gray-200 w-16 h-16 flex-shrink-0">
                          {selectedOrder.image ? (
                            <img
                              src={`data:image/jpeg;base64,${selectedOrder.image}`}
                              alt={selectedOrder.product}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <FontAwesomeIcon icon={faShoppingBag} />
                            </div>
                          )}
                        </div>

                        <div className="flex-grow">
                          <h4 className="font-medium">
                            {selectedOrder.product}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {selectedOrder.subtitle || "No subtitle"}
                          </p>
                          <p className="text-sm">
                            Quantity: {selectedOrder.quantity} ×{" "}
                            {formatCurrency(
                              selectedOrder.price / selectedOrder.quantity
                            )}
                          </p>
                        </div>

                        <div className="ml-4 text-right">
                          <p className="font-medium">
                            {formatCurrency(selectedOrder.price)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-medium mb-3">Shipping Information</h3>

                      <div className="bg-gray-50 p-4 rounded-md">
                        <p className="font-medium">{selectedOrder.name}</p>
                        <p className="text-sm">{selectedOrder.email}</p>
                        <p className="text-sm">{selectedOrder.phone_number}</p>
                        <p className="text-sm mt-2">{selectedOrder.address}</p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Link
                        to="/products"
                        className="px-4 py-2 bg-black text-white hover:bg-gray-800"
                      >
                        Shop Again
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                  <FontAwesomeIcon
                    icon={faFileAlt}
                    className="text-5xl text-gray-300 mb-4"
                  />
                  <h2 className="text-xl font-medium mb-2">
                    No Order Selected
                  </h2>
                  <p className="text-gray-600">
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
