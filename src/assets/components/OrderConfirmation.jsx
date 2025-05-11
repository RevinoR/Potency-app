import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faFileAlt,
  faShoppingBag,
  faArrowRight,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faClock,
  faExclamationTriangle,
  faPrint,
  faDownload,
  faHistory,
  faCreditCard, // Added missing icon import
} from "@fortawesome/free-solid-svg-icons";

const OrderConfirmation = ({ orderData, onClose }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  // Format number as currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format payment method for display
  const formatPaymentMethod = (method) => {
    return method
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Copy order number to clipboard
  const copyOrderNumber = (orderId) => {
    navigator.clipboard
      .writeText(orderId.toString())
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  // Set up a countdown timer for demo purposes (e.g., "Page will redirect in X seconds")
  useEffect(() => {
    const timer = setInterval(() => {
      if (timeLeft === null) return;
      if (timeLeft <= 1) {
        clearInterval(timer);
        // Auto close could be implemented here
      } else {
        setTimeLeft(timeLeft - 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handle no order data
  if (!orderData || !orderData.orders || !orderData.orders.length) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <div className="text-center p-8 flex flex-col items-center">
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-amber-500 text-5xl mb-4"
            />
            <p className="text-gray-600 mb-6">
              No order information available.
            </p>
            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
              <Link
                to="/products"
                onClick={onClose}
                className="inline-block px-6 py-2 bg-black text-white hover:bg-gray-800"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { orders, payment, orderSummary } = orderData;
  const order = orders[0]; // Use the first order for display
  const paymentDate = payment.date ? new Date(payment.date) : new Date();

  // Determine order status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "text-amber-600 bg-amber-100";
      case "processing":
        return "text-blue-600 bg-blue-100";
      case "shipped":
        return "text-purple-600 bg-purple-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-green-600 bg-green-100";
    }
  };

  // Print order receipt
  const printReceipt = () => {
    const printContent = document.getElementById("order-receipt");
    const originalContents = document.body.innerHTML;

    if (printContent) {
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      // Need to force a refresh after printing
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div id="order-receipt">
          <div className="bg-green-100 p-6 text-center">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-green-600 text-5xl mb-4"
            />
            <h1 className="text-2xl font-bold text-green-800 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-green-700">
              Thank you for your purchase. Your order has been received.
            </p>
          </div>

          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
              <div className="flex items-center">
                <span className="text-gray-600 text-sm mr-2">Order Number</span>
                <h2 className="font-bold"># {order.order_id}</h2>
                <button
                  onClick={() => copyOrderNumber(order.order_id)}
                  className="ml-2 text-gray-500 hover:text-gray-700 text-sm"
                  title="Copy order number"
                >
                  {copySuccess ? (
                    <span className="text-green-500 text-xs">Copied!</span>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              <div className="text-right flex flex-col md:items-end">
                <span className="text-gray-600 text-sm">Order Date</span>
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="mr-1 text-gray-400"
                  />
                  <p>{formatDate(paymentDate)}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-b py-4 mb-6">
              <h3 className="font-medium mb-4 flex items-center text-black">
                <FontAwesomeIcon
                  icon={faShoppingBag}
                  className="text-gray-500 mr-2"
                />
                Order Details
              </h3>

              {orders.map((orderItem) => (
                <div
                  key={orderItem.order_id}
                  className="flex items-start mb-4 bg-gray-50 p-3 rounded-md"
                >
                  <div className="mr-4">
                    <div className="w-12 h-12 bg-gray-200 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faShoppingBag}
                        className="text-gray-400"
                      />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium text-black">
                      {orderItem.product}
                    </h4>
                    <p className="text-sm text-gray-700">
                      Quantity: {orderItem.quantity}
                    </p>
                    <p className="text-xs text-gray-700 flex items-center mt-1">
                      Status:
                      <span
                        className={`ml-1 px-2 py-0.5 rounded-full ${getStatusColor(
                          orderItem.status
                        )}`}
                      >
                        {orderItem.status?.charAt(0).toUpperCase() +
                          orderItem.status?.slice(1) || "Pending"}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-black">
                      {formatCurrency(orderItem.price)}
                    </p>
                    <p className="text-xs text-gray-700">
                      {formatCurrency(orderItem.price / orderItem.quantity)}{" "}
                      each
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex-1 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium mb-4 flex items-center text-black">
                  <FontAwesomeIcon
                    icon={faCreditCard}
                    className="text-gray-500 mr-2"
                  />
                  Payment Information
                </h3>

                <div className="space-y-2 text-sm text-black">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Payment Method</span>
                    <p className="font-medium text-black">
                      {formatPaymentMethod(payment.method)}
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Payment ID</span>
                    <p className="font-medium text-black">{payment.id}</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Status</span>
                    <p className="text-green-600 font-medium">Paid</p>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Payment Date</span>
                    <p className="font-medium text-black">
                      {formatDate(paymentDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium mb-4 flex items-center text-black">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="text-gray-500 mr-2"
                  />
                  Shipping Information
                </h3>

                <div className="space-y-2 text-sm text-black">
                  <div className="flex items-start">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-gray-400 mt-1 mr-2"
                    />
                    <div>
                      <span className="text-gray-700 block">
                        Delivery Address
                      </span>
                      <p className="font-medium text-black">{order.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="text-gray-400 mt-1 mr-2"
                    />
                    <div>
                      <span className="text-gray-700 block">Email</span>
                      <p className="font-medium text-black">{order.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="text-gray-400 mt-1 mr-2"
                    />
                    <div>
                      <span className="text-gray-700 block">Phone</span>
                      <p className="font-medium text-black">
                        {order.phone_number}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <h3 className="font-medium mb-3 text-black">Order Summary</h3>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Subtotal</span>
                <span className="text-black">
                  {formatCurrency(orderSummary.subtotal)}
                </span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-gray-700">Tax (10%)</span>
                <span className="text-black">
                  {formatCurrency(orderSummary.tax)}
                </span>
              </div>
              <div className="flex justify-between font-medium text-lg pt-2 border-t">
                <span className="text-black">Total</span>
                <span className="text-black">
                  {formatCurrency(orderSummary.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0 flex flex-wrap gap-4 justify-between border-t mt-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={printReceipt}
              className="flex items-center justify-center text-gray-700 hover:text-black border border-gray-300 rounded px-4 py-2 hover:bg-gray-50"
            >
              <FontAwesomeIcon icon={faPrint} className="mr-2" />
              <span>Print Receipt</span>
            </button>

            <Link
              to="/orders"
              onClick={onClose}
              className="flex items-center justify-center text-gray-700 hover:text-black border border-gray-300 rounded px-4 py-2 hover:bg-gray-50"
            >
              <FontAwesomeIcon icon={faHistory} className="mr-2" />
              <span>View All Orders</span>
            </Link>
          </div>

          <Link
            to="/products"
            onClick={onClose}
            className="flex items-center justify-center px-6 py-2 bg-black text-white hover:bg-gray-800 rounded"
          >
            <span>Continue Shopping</span>
            <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
          </Link>
        </div>

        <div className="px-6 pb-6 pt-2 text-center text-sm text-gray-700">
          <p>A confirmation email has been sent to {order.email}</p>
          <p className="mt-1">Thank you for shopping with Potency!</p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
