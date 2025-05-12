import React, { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faSort,
  faSortUp,
  faSortDown,
  faCheck,
  faEye,
  faRefresh,
  faCheckSquare,
  faSquare,
} from "@fortawesome/free-solid-svg-icons";

const OrderGrid = ({ onSelect, refreshKey, onBulkAction }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);

      // Simulate API call - replace with actual API endpoint
      const mockOrders = [
        {
          order_id: 1234,
          customer: "John Doe",
          email: "john@example.com",
          product: "Mountain Bike Pro",
          price: 1500,
          status: "pending",
          date: "2024-01-15",
          phone_number: "+1234567890",
          address: "123 Main St, City, State 12345",
          quantity: 1,
        },
        {
          order_id: 1233,
          customer: "Jane Smith",
          email: "jane@example.com",
          product: "Road Racer Elite",
          price: 1200,
          status: "processing",
          date: "2024-01-14",
          phone_number: "+1234567891",
          address: "456 Oak Ave, City, State 12345",
          quantity: 1,
        },
        {
          order_id: 1232,
          customer: "Bob Johnson",
          email: "bob@example.com",
          product: "Urban Commuter",
          price: 800,
          status: "shipped",
          date: "2024-01-13",
          phone_number: "+1234567892",
          address: "789 Pine Rd, City, State 12345",
          quantity: 2,
        },
        {
          order_id: 1231,
          customer: "Alice Brown",
          email: "alice@example.com",
          product: "BMX Freestyle",
          price: 600,
          status: "delivered",
          date: "2024-01-12",
          phone_number: "+1234567893",
          address: "321 Elm St, City, State 12345",
          quantity: 1,
        },
        {
          order_id: 1230,
          customer: "Charlie Wilson",
          email: "charlie@example.com",
          product: "Electric Bike",
          price: 2000,
          status: "cancelled",
          date: "2024-01-11",
          phone_number: "+1234567894",
          address: "654 Maple Dr, City, State 12345",
          quantity: 1,
        },
      ];

      // Add more mock data for demonstration
      for (let i = 1229; i >= 1200; i--) {
        mockOrders.push({
          order_id: i,
          customer: `Customer ${i}`,
          email: `customer${i}@example.com`,
          product: `Product ${Math.floor(Math.random() * 5) + 1}`,
          price: Math.floor(Math.random() * 1000) + 500,
          status: [
            "pending",
            "processing",
            "shipped",
            "delivered",
            "cancelled",
          ][Math.floor(Math.random() * 5)],
          date: `2024-01-${Math.floor(Math.random() * 30) + 1}`,
          phone_number: `+123456789${i}`,
          address: `${Math.floor(
            Math.random() * 1000
          )} Street St, City, State 12345`,
          quantity: Math.floor(Math.random() * 3) + 1,
        });
      }

      setOrders(mockOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch orders on mount and when refreshKey changes
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, refreshKey]);

  // Filter and search orders
  useEffect(() => {
    let filtered = orders;

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.order_id.toString().includes(searchTerm) ||
          order.product.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "price") {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (sortConfig.key === "date") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [orders, searchTerm, statusFilter, sortConfig]);

  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Handle selection
  const handleOrderSelect = (order) => {
    onSelect(order);
  };

  // Handle bulk selection
  const handleBulkSelect = (orderId) => {
    setSelectedOrders((prev) => {
      if (prev.includes(orderId)) {
        return prev.filter((id) => id !== orderId);
      } else {
        return [...prev, orderId];
      }
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    const currentPageOrders = getCurrentPageOrders();
    const currentPageOrderIds = currentPageOrders.map(
      (order) => order.order_id
    );

    if (
      selectedOrders.length === currentPageOrderIds.length &&
      currentPageOrderIds.every((id) => selectedOrders.includes(id))
    ) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(currentPageOrderIds);
    }
  };

  // Get current page orders
  const getCurrentPageOrders = () => {
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    return filteredOrders.slice(startIndex, endIndex);
  };

  // Get total pages
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Status badge component
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

  // Sort icon component
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <FontAwesomeIcon icon={faSort} className="text-gray-400" />;
    }
    return (
      <FontAwesomeIcon
        icon={sortConfig.direction === "asc" ? faSortUp : faSortDown}
        className="text-blue-600"
      />
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-3">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex gap-2 items-center">
          {selectedOrders.length > 0 && (
            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-600">
                {selectedOrders.length} selected
              </span>
              <button
                onClick={() => onBulkAction("approve", selectedOrders)}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Bulk Approve
              </button>
              <button
                onClick={() => onBulkAction("ship", selectedOrders)}
                className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
              >
                Bulk Ship
              </button>
            </div>
          )}
          <button
            onClick={fetchOrders}
            className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            <FontAwesomeIcon icon={faRefresh} />
          </button>
        </div>
      </div>

      {/* Orders table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={handleSelectAll}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <FontAwesomeIcon
                      icon={
                        selectedOrders.length > 0 ? faCheckSquare : faSquare
                      }
                    />
                  </button>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("order_id")}
                >
                  <div className="flex items-center gap-1">
                    Order ID
                    {getSortIcon("order_id")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("customer")}
                >
                  <div className="flex items-center gap-1">
                    Customer
                    {getSortIcon("customer")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("product")}
                >
                  <div className="flex items-center gap-1">
                    Product
                    {getSortIcon("product")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("price")}
                >
                  <div className="flex items-center gap-1">
                    Price
                    {getSortIcon("price")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center gap-1">
                    Status
                    {getSortIcon("status")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center gap-1">
                    Date
                    {getSortIcon("date")}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getCurrentPageOrders().map((order) => (
                <tr key={order.order_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleBulkSelect(order.order_id)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FontAwesomeIcon
                        icon={
                          selectedOrders.includes(order.order_id)
                            ? faCheckSquare
                            : faSquare
                        }
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{order.order_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {order.customer}
                      </div>
                      <div className="text-sm text-gray-500">{order.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.product}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${order.price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleOrderSelect(order)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    >
                      <FontAwesomeIcon icon={faEye} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * ordersPerPage + 1} to{" "}
            {Math.min(currentPage * ordersPerPage, filteredOrders.length)} of{" "}
            {filteredOrders.length} orders
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 border rounded text-sm ${
                  currentPage === page
                    ? "bg-blue-500 text-white border-blue-500"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderGrid;
