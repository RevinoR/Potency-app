import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faUser,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faBox,
  faCalendarAlt,
  faDollarSign,
  faEdit,
  faCheck,
  faSave,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";

const OrderDetail = ({ order, onUpdateStatus, onClose }) => {
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(order?.status || "");
  const [notes, setNotes] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  if (!order) {
    return (
      <div className="p-6 text-center text-gray-500">
        Select an order to view details
      </div>
    );
  }

  const handleStatusUpdate = () => {
    if (selectedStatus !== order.status) {
      onUpdateStatus(order.order_id, selectedStatus);
    }
    setIsEditingStatus(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const getNextAction = (status) => {
    const actions = {
      pending: "Mark as Processing",
      processing: "Mark as Shipped",
      shipped: "Mark as Delivered",
      delivered: "Completed",
      cancelled: "Cancelled",
    };
    return actions[status];
  };

  const getNextStatus = (status) => {
    const nextStatus = {
      pending: "processing",
      processing: "shipped",
      shipped: "delivered",
    };
    return nextStatus[status];
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Order Details</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Order #{order.order_id}
              </h3>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="text-gray-400 mr-2"
                />
                <span className="text-gray-600">Date:</span>
                <span className="ml-1 font-medium">{order.date}</span>
              </div>
              <div>
                <FontAwesomeIcon
                  icon={faDollarSign}
                  className="text-gray-400 mr-2"
                />
                <span className="text-gray-600">Total:</span>
                <span className="ml-1 font-medium">${order.price}</span>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-800 mb-3">
              Customer Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={faUser}
                  className="text-gray-400 mr-3 w-4"
                />
                <span className="text-gray-600 w-20">Name:</span>
                <span className="font-medium">{order.customer}</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-gray-400 mr-3 w-4"
                />
                <span className="text-gray-600 w-20">Email:</span>
                <span className="font-medium">{order.email}</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="text-gray-400 mr-3 w-4"
                />
                <span className="text-gray-600 w-20">Phone:</span>
                <span className="font-medium">{order.phone_number}</span>
              </div>
              <div className="flex items-start">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="text-gray-400 mr-3 w-4 mt-1"
                />
                <span className="text-gray-600 w-20">Address:</span>
                <span className="font-medium">{order.address}</span>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-800 mb-3">
              Product Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={faBox}
                  className="text-gray-400 mr-3 w-4"
                />
                <span className="text-gray-600 w-20">Product:</span>
                <span className="font-medium">{order.product}</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={faBox}
                  className="text-gray-400 mr-3 w-4"
                />
                <span className="text-gray-600 w-20">Quantity:</span>
                <span className="font-medium">{order.quantity}</span>
              </div>
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={faDollarSign}
                  className="text-gray-400 mr-3 w-4"
                />
                <span className="text-gray-600 w-20">Price:</span>
                <span className="font-medium">${order.price}</span>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-800 mb-3">
              Status Management
            </h4>

            {isEditingStatus ? (
              <div className="space-y-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleStatusUpdate}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <FontAwesomeIcon icon={faSave} />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingStatus(false);
                      setSelectedStatus(order.status);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    <FontAwesomeIcon icon={faUndo} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Current Status:</span>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
                <button
                  onClick={() => setIsEditingStatus(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 w-full justify-center"
                >
                  <FontAwesomeIcon icon={faEdit} />
                  Update Status
                </button>
                {getNextStatus(order.status) && (
                  <button
                    onClick={() =>
                      onUpdateStatus(
                        order.order_id,
                        getNextStatus(order.status)
                      )
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 w-full justify-center"
                  >
                    <FontAwesomeIcon icon={faCheck} />
                    {getNextAction(order.status)}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Tracking Number (if shipped) */}
          {order.status === "shipped" && (
            <div className="bg-white border rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-800 mb-3">
                Tracking Information
              </h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter tracking number"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => {
                    // Handle tracking number save
                    console.log("Tracking number saved:", trackingNumber);
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white border rounded-lg p-4">
            <h4 className="text-md font-semibold text-gray-800 mb-3">
              Order Notes
            </h4>
            <textarea
              placeholder="Add notes about this order..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                // Handle notes save
                console.log("Notes saved:", notes);
              }}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
