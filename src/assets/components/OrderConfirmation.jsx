import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faFileAlt,
  faShoppingBag,
} from "@fortawesome/free-solid-svg-icons";

const OrderConfirmation = ({ orderData }) => {
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

  if (!orderData || !orderData.orders || !orderData.orders.length) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No order information available.</p>
        <Link
          to="/products"
          className="inline-block mt-4 px-6 py-2 bg-black text-white hover:bg-gray-800"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const { orders, payment, orderSummary } = orderData;
  const order = orders[0]; // Use the first order for display
  const paymentDate = payment.date ? new Date(payment.date) : new Date();

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(orderItem.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-4">Payment Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600 text-sm">Payment Method</span>
                <p>
                  {payment.method
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Payment ID</span>
                <p>{payment.id}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Status</span>
                <p className="text-green-600 font-medium">Paid</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Amount</span>
                <p>{formatCurrency(payment.total)}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-4">Shipping Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600 text-sm">Name</span>
                <p>{order.name}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Email</span>
                <p>{order.email}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Phone</span>
                <p>{order.phone_number}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Address</span>
                <p>{order.address}</p>
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

          <div className="flex justify-between">
            <Link
              to="/orders"
              className="flex items-center text-gray-700 hover:text-black"
            >
              <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
              <span>View Orders</span>
            </Link>

            <Link
              to="/products"
              className="px-6 py-2 bg-black text-white hover:bg-gray-800"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
