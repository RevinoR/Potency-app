import React from "react";
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
} from "@fortawesome/free-solid-svg-icons";

const OrderConfirmation = ({ orderData, onClose }) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
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
          <div className="flex justify-between items-center mb-6">
            <div>
              <span className="text-gray-600 text-sm">Order Number</span>
              <h2 className="font-bold"># {order.order_id}</h2>
            </div>
            <div className="text-right">
              <span className="text-gray-600 text-sm">Order Date</span>
              <p>{formatDate(paymentDate)}</p>
            </div>
          </div>

          <div className="border-t border-b py-4 mb-6">
            <h3 className="font-medium mb-4">Order Details</h3>

            {orders.map((orderItem) => (
              <div key={orderItem.order_id} className="flex items-start mb-4">
                <div className="mr-4">
                  <FontAwesomeIcon
                    icon={faShoppingBag}
                    className="text-gray-400 text-xl"
                  />
                </div>
                <div className="flex-grow">
                  <h4 className="font-medium">{orderItem.product}</h4>
                  <p className="text-sm text-gray-600">
                    Quantity: {orderItem.quantity}
                  </p>
                  <p className="text-xs text-gray-500">
                    Order Status:
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
                  <p className="font-medium">
                    {formatCurrency(orderItem.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-4">Payment Information</h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 block mb-1">Payment Method</span>
                <p className="font-medium">
                  {formatPaymentMethod(payment.method)}
                </p>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Payment ID</span>
                <p className="font-medium">{payment.id}</p>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Status</span>
                <p className="text-green-600 font-medium">Paid</p>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Payment Date</span>
                <p className="font-medium">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="mr-1 text-gray-400"
                  />
                  {formatDate(paymentDate)}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-4">Shipping Information</h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="text-gray-400 mt-1 mr-2"
                />
                <div>
                  <span className="text-gray-600 block">Delivery Address</span>
                  <p className="font-medium">{order.address}</p>
                </div>
              </div>

              <div className="flex items-start">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-gray-400 mt-1 mr-2"
                />
                <div>
                  <span className="text-gray-600 block">Email</span>
                  <p className="font-medium">{order.email}</p>
                </div>
              </div>

              <div className="flex items-start">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="text-gray-400 mt-1 mr-2"
                />
                <div>
                  <span className="text-gray-600 block">Phone</span>
                  <p className="font-medium">{order.phone_number}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatCurrency(orderSummary.subtotal)}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-gray-600">Tax (10%)</span>
              <span>{formatCurrency(orderSummary.tax)}</span>
            </div>
            <div className="flex justify-between font-medium text-lg pt-2 border-t">
              <span>Total</span>
              <span>{formatCurrency(orderSummary.total)}</span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4">
            <Link
              to="/orders"
              onClick={onClose}
              className="flex items-center justify-center text-gray-700 hover:text-black border border-gray-300 rounded px-4 py-2 hover:bg-gray-50"
            >
              <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
              <span>View All Orders</span>
            </Link>

            <Link
              to="/products"
              onClick={onClose}
              className="flex items-center justify-center px-6 py-2 bg-black text-white hover:bg-gray-800"
            >
              Continue Shopping
              <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </Link>
          </div>

          <div className="mt-6 pt-4 border-t text-center text-sm text-gray-500">
            <p>A confirmation email has been sent to {order.email}</p>
            <p className="mt-1">Thank you for shopping with Potency!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
