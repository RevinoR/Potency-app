import { query } from "../src/db.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Get overview statistics
    const userCountQuery = 'SELECT COUNT(*) as count FROM "User"';
    const productCountQuery = 'SELECT COUNT(*) as count FROM "Product"';
    const orderCountQuery = 'SELECT COUNT(*) as count FROM "Order"';
    const transactionCountQuery = 'SELECT COUNT(*) as count FROM "Transaction"';

    const [userResult, productResult, orderResult, transactionResult] =
      await Promise.all([
        query(userCountQuery),
        query(productCountQuery),
        query(orderCountQuery),
        query(transactionCountQuery),
      ]);

    // Get orders by status
    const ordersByStatusQuery = `
      SELECT 
        status,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 2) as percentage
      FROM "Order"
      GROUP BY status
    `;
    const ordersByStatusResult = await query(ordersByStatusQuery);

    // Get top products
    const topProductsQuery = `
      SELECT 
        p.product_id,
        p.name,
        p.sold,
        p.sold * p.price as revenue
      FROM "Product" p
      ORDER BY p.sold DESC
      LIMIT 5
    `;
    const topProductsResult = await query(topProductsQuery);

    // Get recent orders with customer details
    const recentOrdersQuery = `
      SELECT 
        o.order_id,
        o.name as customer,
        o.email,
        o.product,
        o.price,
        o.status,
        o.date
      FROM "Order" o
      ORDER BY o.date DESC
      LIMIT 5
    `;
    const recentOrdersResult = await query(recentOrdersQuery);

    // Get sales trend for last 7 days
    const salesTrendQuery = `
      SELECT 
        DATE(date) as date,
        SUM(price) as sales
      FROM "Order"
      WHERE date >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(date)
      ORDER BY DATE(date)
    `;
    const salesTrendResult = await query(salesTrendQuery);

    // Get low stock products
    const lowStockQuery = `
      SELECT 
        name,
        stock,
        CASE 
          WHEN stock <= 5 THEN 'critical'
          WHEN stock <= 15 THEN 'low'
          ELSE 'normal'
        END as status
      FROM "Product"
      WHERE stock <= 15
      ORDER BY stock ASC
    `;
    const lowStockResult = await query(lowStockQuery);

    // Format data for frontend
    const dashboardData = {
      overview: {
        totalUsers: parseInt(userResult.rows[0].count),
        totalProducts: parseInt(productResult.rows[0].count),
        totalOrders: parseInt(orderResult.rows[0].count),
        totalTransactions: parseInt(transactionResult.rows[0].count),
      },
      ordersByStatus: ordersByStatusResult.rows.map((row) => ({
        name: row.status,
        value: parseInt(row.count),
        percentage: parseFloat(row.percentage),
        color: getStatusColor(row.status),
      })),
      topProducts: topProductsResult.rows.map((product) => ({
        name: product.name,
        sold: product.sold,
        revenue: parseInt(product.revenue),
      })),
      recentOrders: recentOrdersResult.rows.map((order) => ({
        order_id: order.order_id,
        customer: order.customer,
        email: order.email,
        product: order.product,
        price: parseFloat(order.price),
        status: order.status,
        date: order.date,
      })),
      salesTrend: salesTrendResult.rows.map((sale) => ({
        date: formatDate(sale.date),
        sales: parseInt(sale.sales || 0),
      })),
      lowStockProducts: lowStockResult.rows.map((product) => ({
        name: product.name,
        stock: product.stock,
        status: product.status,
      })),
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
};

// Helper function to get status colors
const getStatusColor = (status) => {
  const colors = {
    pending: "#F59E0B",
    processing: "#3B82F6",
    shipped: "#8B5CF6",
    delivered: "#10B981",
    cancelled: "#EF4444",
  };
  return colors[status] || "#6B7280";
};

// Helper function to format dates
const formatDate = (date) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const d = new Date(date);
  return `${months[d.getMonth()]} ${d.getDate()}`;
};
