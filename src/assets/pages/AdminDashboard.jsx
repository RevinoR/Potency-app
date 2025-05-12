import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavbarAdmin from "../components/NavbarAdmin";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faBox,
  faShoppingCart,
  faExchangeAlt,
  faArrowUp,
  faArrowDown,
  faTriangleExclamation,
  faEye,
  faCalendarAlt,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalTransactions: 0,
    },
    ordersByStatus: [],
    topProducts: [],
    recentOrders: [],
    salesTrend: [],
    lowStockProducts: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const navigate = useNavigate();

  // Check if user is authenticated and is admin
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/signin", { state: { returnUrl: "/admin/dashboard" } });
        return;
      }

      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.role !== "admin") {
        navigate("/");
        return;
      }
    };

    checkAuth();
  }, [navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Simulate API calls - replace with actual API endpoints
        const mockData = {
          overview: {
            totalUsers: 1245,
            totalProducts: 89,
            totalOrders: 567,
            totalTransactions: 623,
          },
          ordersByStatus: [
            { name: "Pending", value: 65, color: "#F59E0B", percentage: 19.4 },
            {
              name: "Processing",
              value: 45,
              color: "#3B82F6",
              percentage: 13.4,
            },
            { name: "Shipped", value: 78, color: "#8B5CF6", percentage: 23.3 },
            {
              name: "Delivered",
              value: 123,
              color: "#10B981",
              percentage: 36.7,
            },
            { name: "Cancelled", value: 23, color: "#EF4444", percentage: 6.9 },
          ],
          topProducts: [
            { name: "Mountain Bike Pro", sold: 156, revenue: 234000 },
            { name: "Road Racer Elite", sold: 134, revenue: 201000 },
            { name: "Urban Commuter", sold: 98, revenue: 147000 },
            { name: "BMX Freestyle", sold: 67, revenue: 100500 },
            { name: "Electric Bike", sold: 45, revenue: 135000 },
          ],
          recentOrders: [
            {
              order_id: 1234,
              customer: "John Doe",
              email: "john@example.com",
              product: "Mountain Bike Pro",
              price: 1500,
              status: "pending",
              date: new Date().toISOString().slice(0, 10),
            },
            {
              order_id: 1233,
              customer: "Jane Smith",
              email: "jane@example.com",
              product: "Road Racer Elite",
              price: 1200,
              status: "processing",
              date: new Date().toISOString().slice(0, 10),
            },
            {
              order_id: 1232,
              customer: "Bob Johnson",
              email: "bob@example.com",
              product: "Urban Commuter",
              price: 800,
              status: "shipped",
              date: new Date().toISOString().slice(0, 10),
            },
          ],
          salesTrend: [
            { date: "Jan 1", sales: 15000, color: "#3B82F6" },
            { date: "Jan 2", sales: 18000, color: "#3B82F6" },
            { date: "Jan 3", sales: 22000, color: "#3B82F6" },
            { date: "Jan 4", sales: 19000, color: "#3B82F6" },
            { date: "Jan 5", sales: 25000, color: "#3B82F6" },
            { date: "Jan 6", sales: 28000, color: "#3B82F6" },
            { date: "Jan 7", sales: 24000, color: "#3B82F6" },
          ],
          lowStockProducts: [
            { name: "Mountain Bike Pro", stock: 5, status: "critical" },
            { name: "BMX Freestyle", stock: 12, status: "low" },
            { name: "Electric Bike", stock: 8, status: "critical" },
          ],
        };

        setDashboardData(mockData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedTimeRange]);

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <NavbarAdmin />

      <div className="pt-20 pb-8 px-6 md:px-12">
        <div className="container mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome back! Here's what's happening today.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="text-gray-500"
                />
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardData.overview.totalUsers}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <FontAwesomeIcon
                    icon={faUsers}
                    className="text-blue-600 text-xl"
                  />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <FontAwesomeIcon
                  icon={faArrowUp}
                  className="text-green-500 text-sm mr-1"
                />
                <span className="text-green-600 text-sm">
                  +12% from last month
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Products
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardData.overview.totalProducts}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <FontAwesomeIcon
                    icon={faBox}
                    className="text-green-600 text-xl"
                  />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <FontAwesomeIcon
                  icon={faArrowUp}
                  className="text-green-500 text-sm mr-1"
                />
                <span className="text-green-600 text-sm">+3 new this week</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardData.overview.totalOrders}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <FontAwesomeIcon
                    icon={faShoppingCart}
                    className="text-purple-600 text-xl"
                  />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <FontAwesomeIcon
                  icon={faArrowDown}
                  className="text-red-500 text-sm mr-1"
                />
                <span className="text-red-600 text-sm">-5% from last week</span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Transactions
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {dashboardData.overview.totalTransactions}
                  </p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <FontAwesomeIcon
                    icon={faExchangeAlt}
                    className="text-orange-600 text-xl"
                  />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <FontAwesomeIcon
                  icon={faArrowUp}
                  className="text-green-500 text-sm mr-1"
                />
                <span className="text-green-600 text-sm">
                  +8% from last month
                </span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Orders by Status - Bar Chart with CSS */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Orders by Status
              </h3>
              <div className="space-y-4">
                {dashboardData.ordersByStatus.map((item, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-24 text-sm text-gray-600">
                      {item.name}
                    </div>
                    <div className="flex-1 mx-4 h-6 bg-gray-200 rounded-full">
                      <div
                        className="h-full rounded-full flex items-center px-3"
                        style={{
                          backgroundColor: item.color,
                          width: `${item.percentage}%`,
                        }}
                        title={`${item.value} (${item.percentage}%)`}
                      >
                        <span className="text-white text-xs font-medium">
                          {item.value}
                        </span>
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-600 text-right">
                      {item.percentage}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sales Trend - Line Chart with CSS */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Sales Trend
              </h3>
              <div className="flex items-end space-x-2 h-48 border-l border-b border-gray-300">
                {dashboardData.salesTrend.map((item, index) => {
                  const maxSales = Math.max(
                    ...dashboardData.salesTrend.map((s) => s.sales)
                  );
                  const height = (item.sales / maxSales) * 100;
                  return (
                    <div
                      key={index}
                      className="flex flex-col items-center flex-1"
                    >
                      <div
                        className="w-full bg-blue-500 rounded-t transition-all duration-300"
                        style={{ height: `${height}%` }}
                        title={`${item.date}: $${item.sales.toLocaleString()}`}
                      ></div>
                      <div className="text-xs text-gray-600 mt-2 transform -rotate-45">
                        {item.date}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Top Products and Recent Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Products */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Top Selling Products
              </h3>
              <div className="space-y-4">
                {dashboardData.topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {product.sold} sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        ${product.revenue.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Recent Orders
                </h3>
                <button
                  onClick={() => navigate("/admin/orders")}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center hover:bg-blue-50 px-3 py-1 rounded transition-colors"
                >
                  <FontAwesomeIcon icon={faEye} className="mr-1" />
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {dashboardData.recentOrders.map((order) => (
                  <div
                    key={order.order_id}
                    className="border-l-4 border-blue-500 pl-4 py-2 hover:bg-gray-50 rounded-r transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">
                          #{order.order_id}
                        </p>
                        <p className="text-sm text-gray-600">
                          {order.customer}
                        </p>
                        <p className="text-sm text-gray-500">{order.product}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          ${order.price}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Stock Alerts
              </h3>
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                className="text-orange-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboardData.lowStockProducts.map((product, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                    product.status === "critical"
                      ? "border-red-500 bg-red-50 hover:bg-red-100"
                      : "border-orange-500 bg-orange-50 hover:bg-orange-100"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {product.stock} units left
                      </p>
                    </div>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        product.status === "critical"
                          ? "bg-red-100 text-red-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
