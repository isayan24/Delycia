import apiResponse from "../../../utils/apiResponse.js";
import pool from "../../../config/db.connection.js";

const getDashboardStats = async (req) => {
  const { rid, startDate, endDate } = req.query || {};

  if (!rid) {
    return apiResponse.error(400, "Restaurant ID (rid) is required");
  }

  try {
    const dateFilter =
      startDate && endDate
        ? `AND DATE(created_at) >= ${pool.escape(
          startDate
        )} AND DATE(created_at) <= ${pool.escape(endDate)}`
        : "";

    // Total Sales
    const totalSalesQuery = `
      SELECT COALESCE(SUM(total_amount), 0) as total_sales 
      FROM orders 
      WHERE rid = ${pool.escape(rid)} 
        AND order_status = 'completed' 
        AND payment_status = 'completed'
        ${dateFilter}
    `;

    // Total Orders
    const totalOrdersQuery = `
      SELECT COUNT(*) as total_orders 
      FROM orders 
      WHERE rid = ${pool.escape(rid)} 
        ${dateFilter}
    `;

    // New Customers (first-time visitors based on user_restaurant_visits table)
    // Count customers where visit_count = 1 and first_visit_at is within date range
    const newCustomersQuery = startDate && endDate
      ? `
        SELECT COUNT(*) as new_customers 
        FROM user_restaurant_visits 
        WHERE restaurant_id = ${pool.escape(rid)} 
          AND visit_count = 1
          AND DATE(first_visit_at) >= ${pool.escape(startDate)}
          AND DATE(first_visit_at) <= ${pool.escape(endDate)}
      `
      : `
        SELECT COUNT(*) as new_customers 
        FROM user_restaurant_visits 
        WHERE restaurant_id = ${pool.escape(rid)} 
          AND visit_count = 1
      `;

    // Average Order Value
    const avgOrderValueQuery = `
      SELECT COALESCE(AVG(total_amount), 0) as avg_order_value 
      FROM orders 
      WHERE rid = ${pool.escape(rid)} 
        AND total_amount > 0
        ${dateFilter}
    `;

    const [totalSalesResult] = await pool.query(totalSalesQuery);
    const [totalOrdersResult] = await pool.query(totalOrdersQuery);
    const [newCustomersResult] = await pool.query(newCustomersQuery);
    const [avgOrderValueResult] = await pool.query(avgOrderValueQuery);

    const stats = {
      totalSales: totalSalesResult[0].total_sales || 0,
      totalOrders: totalOrdersResult[0].total_orders || 0,
      newCustomers: newCustomersResult[0].new_customers || 0,
      avgOrderValue: parseFloat(
        avgOrderValueResult[0].avg_order_value || 0
      ).toFixed(2),
    };

    return apiResponse.success(
      200,
      "Dashboard statistics fetched successfully",
      {
        stats,
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      }
    );
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const getSalesTrend = async (req) => {
  const { rid, startDate, endDate } = req.query || {};

  if (!rid) {
    return apiResponse.error(400, "Restaurant ID (rid) is required");
  }

  try {
    const dateFilter =
      startDate && endDate
        ? `AND DATE(created_at) >= ${pool.escape(
          startDate
        )} AND DATE(created_at) <= ${pool.escape(endDate)}`
        : "";

    const salesTrendQuery = `
      SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(total_amount), 0) as daily_sales,
        COUNT(*) as daily_orders
      FROM orders 
      WHERE rid = ${pool.escape(rid)} 
        AND order_status = 'completed'
        ${dateFilter}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    const [result] = await pool.query(salesTrendQuery);

    const salesTrend = result.map((row) => ({
      date: row.date,
      sales: parseFloat(row.daily_sales || 0),
      orders: parseInt(row.daily_orders || 0),
    }));

    return apiResponse.success(200, "Sales trend data fetched successfully", {
      salesTrend,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
    });
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const getOrderStatusDistribution = async (req) => {
  const { rid, startDate, endDate } = req.query || {};

  if (!rid) {
    return apiResponse.error(400, "Restaurant ID (rid) is required");
  }

  try {
    const dateFilter =
      startDate && endDate
        ? `AND DATE(created_at) >= ${pool.escape(
          startDate
        )} AND DATE(created_at) <= ${pool.escape(endDate)}`
        : "";

    const orderStatusQuery = `
      SELECT 
        order_status,
        COUNT(*) as count
      FROM orders 
      WHERE rid = ${pool.escape(rid)} 
        ${dateFilter}
      GROUP BY order_status
      ORDER BY count DESC
    `;

    const [result] = await pool.query(orderStatusQuery);

    const orderStatus = result.map((row) => ({
      status: row.order_status,
      count: parseInt(row.count || 0),
    }));

    return apiResponse.success(
      200,
      "Order status distribution fetched successfully",
      {
        orderStatus,
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      }
    );
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const getTopSellingItems = async (req) => {
  const { rid, startDate, endDate, limit } = req.query || {};

  if (!rid) {
    return apiResponse.error(400, "Restaurant ID (rid) is required");
  }

  try {
    const dateFilter =
      startDate && endDate
        ? `AND DATE(o.created_at) >= ${pool.escape(
          startDate
        )} AND DATE(o.created_at) <= ${pool.escape(endDate)}`
        : "";

    const itemLimit = limit ? parseInt(limit) : 5;

    const topItemsQuery = `
      SELECT 
        o.item_id,
        i.name,
        SUM(o.quantity) as total_quantity,
        COUNT(o.id) as order_count,
        SUM(o.total_amount) as total_revenue
      FROM orders o
      JOIN inventories i ON o.item_id = i.id
      WHERE o.rid = ${pool.escape(rid)}
        AND o.order_status = 'completed'
        ${dateFilter}
      GROUP BY o.item_id, i.name
      ORDER BY total_quantity DESC
      LIMIT ${pool.escape(itemLimit)}
    `;

    const [result] = await pool.query(topItemsQuery);

    const topItems = result.map((row) => ({
      itemId: row.item_id,
      name: row.name,
      totalQuantity: parseInt(row.total_quantity || 0),
      orderCount: parseInt(row.order_count || 0),
      totalRevenue: parseFloat(row.total_revenue || 0),
    }));

    return apiResponse.success(200, "Top selling items fetched successfully", {
      topItems,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
    });
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const getInventoryLevels = async (req) => {
  const { rid } = req.query || {};

  if (!rid) {
    return apiResponse.error(400, "Restaurant ID (rid) is required");
  }

  try {
    const inventoryQuery = `
      SELECT 
        id,
        name,
        stock,
        status,
        CASE 
          WHEN stock = 0 THEN 'critical'
          WHEN stock < 10 THEN 'low'
          WHEN stock < 50 THEN 'medium'
          ELSE 'good'
        END as stock_level
      FROM inventories 
      WHERE rid = ${pool.escape(rid)}
      ORDER BY stock ASC
    `;

    const [result] = await pool.query(inventoryQuery);

    const inventory = result.map((row) => ({
      id: row.id,
      name: row.name,
      stock: parseInt(row.stock || 0),
      status: row.status,
      stockLevel: row.stock_level,
    }));

    // Group by stock level for easier frontend processing
    const inventoryByLevel = {
      critical: inventory.filter((item) => item.stockLevel === "critical"),
      low: inventory.filter((item) => item.stockLevel === "low"),
      medium: inventory.filter((item) => item.stockLevel === "medium"),
      good: inventory.filter((item) => item.stockLevel === "good"),
    };

    const summary = {
      critical: inventoryByLevel.critical.length,
      low: inventoryByLevel.low.length,
      medium: inventoryByLevel.medium.length,
      good: inventoryByLevel.good.length,
      total: inventory.length,
    };

    return apiResponse.success(200, "Inventory levels fetched successfully", {
      inventory,
      inventoryByLevel,
      summary,
    });
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const getRevenueByCategory = async (req) => {
  const { rid, startDate, endDate } = req.query || {};

  if (!rid) {
    return apiResponse.error(400, "Restaurant ID (rid) is required");
  }

  try {
    const dateFilter =
      startDate && endDate
        ? `AND DATE(o.created_at) >= ${pool.escape(
          startDate
        )} AND DATE(o.created_at) <= ${pool.escape(endDate)}`
        : "";

    const categoryRevenueQuery = `
      SELECT 
        c.id as category_id,
        c.name as category_name,
        SUM(o.total_amount) as total_revenue,
        COUNT(o.id) as order_count
      FROM orders o
      JOIN inventories i ON o.item_id = i.id
      JOIN categories c ON i.category_id = c.id
      WHERE o.rid = ${pool.escape(rid)}
        AND o.order_status = 'completed'
        ${dateFilter}
      GROUP BY c.id, c.name
      ORDER BY total_revenue DESC
    `;

    const [result] = await pool.query(categoryRevenueQuery);

    const categoryRevenue = result.map((row) => ({
      categoryId: row.category_id,
      categoryName: row.category_name,
      totalRevenue: parseFloat(row.total_revenue || 0),
      orderCount: parseInt(row.order_count || 0),
    }));

    return apiResponse.success(
      200,
      "Revenue by category fetched successfully",
      {
        categoryRevenue,
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      }
    );
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const getRecentOrders = async (req) => {
  const { rid, limit } = req.query || {};

  if (!rid) {
    return apiResponse.error(400, "Restaurant ID (rid) is required");
  }

  try {
    const orderLimit = limit ? parseInt(limit) : 10;

    const recentOrdersQuery = `
      SELECT 
        o.id,
        o.cart_id,
        o.display_name,
        o.quantity,
        o.total_amount,
        o.order_status,
        o.payment_status,
        o.delivery_type,
        o.table_no,
        o.created_at,
        u.name as customer_name
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      WHERE o.rid = ${pool.escape(rid)}
      ORDER BY o.created_at DESC
      LIMIT ${pool.escape(orderLimit)}
    `;

    const [result] = await pool.query(recentOrdersQuery);

    const recentOrders = result.map((row) => ({
      id: row.id,
      cartId: row.cart_id,
      displayName: row.display_name,
      quantity: parseInt(row.quantity || 0),
      totalAmount: parseFloat(row.total_amount || 0),
      orderStatus: row.order_status,
      paymentStatus: row.payment_status,
      deliveryType: row.delivery_type,
      tableNo: row.table_no || 0,
      createdAt: row.created_at,
      customerName: row.customer_name || "Guest",
    }));

    return apiResponse.success(200, "Recent orders fetched successfully", {
      recentOrders,
    });
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const getPaymentMethodDistribution = async (req) => {
  const { rid, startDate, endDate } = req.query || {};

  if (!rid) {
    return apiResponse.error(400, "Restaurant ID (rid) is required");
  }

  try {
    const dateFilter =
      startDate && endDate
        ? `AND DATE(created_at) >= ${pool.escape(
          startDate
        )} AND DATE(created_at) <= ${pool.escape(endDate)}`
        : "";

    const paymentMethodQuery = `
      SELECT 
        payment_method,
        COUNT(*) as count,
        SUM(total_amount) as total_amount
      FROM orders 
      WHERE rid = ${pool.escape(rid)} 
        AND order_status = 'completed'
        ${dateFilter}
      GROUP BY payment_method
      ORDER BY count DESC
    `;

    const [result] = await pool.query(paymentMethodQuery);

    const paymentMethods = result.map((row) => ({
      method: row.payment_method,
      count: parseInt(row.count || 0),
      totalAmount: parseFloat(row.total_amount || 0),
    }));

    return apiResponse.success(
      200,
      "Payment method distribution fetched successfully",
      {
        paymentMethods,
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      }
    );
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const getDeliveryTypeDistribution = async (req) => {
  const { rid, startDate, endDate } = req.query || {};

  if (!rid) {
    return apiResponse.error(400, "Restaurant ID (rid) is required");
  }

  try {
    const dateFilter =
      startDate && endDate
        ? `AND DATE(created_at) >= ${pool.escape(
          startDate
        )} AND DATE(created_at) <= ${pool.escape(endDate)}`
        : "";

    const deliveryTypeQuery = `
      SELECT 
        delivery_type,
        COUNT(*) as count,
        SUM(total_amount) as total_amount
      FROM orders 
      WHERE rid = ${pool.escape(rid)} 
        ${dateFilter}
      GROUP BY delivery_type
      ORDER BY count DESC
    `;

    const [result] = await pool.query(deliveryTypeQuery);

    const deliveryTypes = result.map((row) => ({
      type: row.delivery_type,
      count: parseInt(row.count || 0),
      totalAmount: parseFloat(row.total_amount || 0),
    }));

    return apiResponse.success(
      200,
      "Delivery type distribution fetched successfully",
      {
        deliveryTypes,
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      }
    );
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const getDashboardOverview = async (req) => {
  const { rid, startDate, endDate } = req.query || {};

  if (!rid) {
    return apiResponse.error(400, "Restaurant ID (rid) is required");
  }

  try {
    // Get stats
    const statsResponse = await getDashboardStats(req);
    if (statsResponse.statusCode !== 200) {
      return statsResponse;
    }

    // Get sales trend
    const salesTrendResponse = await getSalesTrend(req);
    if (salesTrendResponse.statusCode !== 200) {
      return salesTrendResponse;
    }

    // Get order status
    const orderStatusResponse = await getOrderStatusDistribution(req);
    if (orderStatusResponse.statusCode !== 200) {
      return orderStatusResponse;
    }

    return apiResponse.success(200, "Dashboard overview fetched successfully", {
      stats: statsResponse.data.stats,
      salesTrend: salesTrendResponse.data.salesTrend,
      orderStatus: orderStatusResponse.data.orderStatus,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null,
      },
    });
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const getCompleteDashboard = async (req) => {
  const { rid, startDate, endDate } = req.query || {};

  if (!rid) {
    return apiResponse.error(400, "Restaurant ID (rid) is required");
  }

  try {
    // Get all dashboard data
    const [
      statsResponse,
      salesTrendResponse,
      orderStatusResponse,
      topItemsResponse,
      inventoryResponse,
      categoryRevenueResponse,
      recentOrdersResponse,
      paymentMethodsResponse,
      deliveryTypesResponse,
    ] = await Promise.all([
      getDashboardStats(req),
      getSalesTrend(req),
      getOrderStatusDistribution(req),
      getTopSellingItems(req),
      getInventoryLevels(req),
      getRevenueByCategory(req),
      getRecentOrders(req),
      getPaymentMethodDistribution(req),
      getDeliveryTypeDistribution(req),
    ]);

    // Check if any response failed
    const responses = [
      statsResponse,
      salesTrendResponse,
      orderStatusResponse,
      topItemsResponse,
      inventoryResponse,
      categoryRevenueResponse,
      recentOrdersResponse,
      paymentMethodsResponse,
      deliveryTypesResponse,
    ];

    for (const response of responses) {
      if (response.statusCode !== 200) {
        return response;
      }
    }

    return apiResponse.success(
      200,
      "Complete dashboard data fetched successfully",
      {
        stats: statsResponse.data.stats,
        salesTrend: salesTrendResponse.data.salesTrend,
        orderStatus: orderStatusResponse.data.orderStatus,
        topItems: topItemsResponse.data.topItems,
        inventory: inventoryResponse.data,
        categoryRevenue: categoryRevenueResponse.data.categoryRevenue,
        recentOrders: recentOrdersResponse.data.recentOrders,
        paymentMethods: paymentMethodsResponse.data.paymentMethods,
        deliveryTypes: deliveryTypesResponse.data.deliveryTypes,
        dateRange: {
          startDate: startDate || null,
          endDate: endDate || null,
        },
      }
    );
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const getLoyaltyStats = async (req) => {
  const { rid } = req.query || {};

  if (!rid) {
    return apiResponse.error(400, "Restaurant ID (rid) is required");
  }

  try {
    const loyaltyQuery = `
      SELECT 
        CASE 
          WHEN visit_count = 1 THEN 'New'
          WHEN visit_count BETWEEN 2 AND 5 THEN 'Regular'
          WHEN visit_count BETWEEN 6 AND 10 THEN 'Loyal'
          ELSE 'VIP'
        END as customer_segment,
        COUNT(*) as count
      FROM user_restaurant_visits
      WHERE restaurant_id = ${pool.escape(rid)}
      GROUP BY customer_segment
    `;

    const [loyaltyResult] = await pool.query(loyaltyQuery);

    return apiResponse.success(
      200,
      "Loyalty stats fetched successfully",
      { loyalty: loyaltyResult }
    );
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const getChurnRisk = async (req) => {
  const { rid } = req.query || {};

  if (!rid) {
    return apiResponse.error(400, "Restaurant ID (rid) is required");
  }

  try {
    const churnQuery = `
      SELECT 
        user_id,
        visit_count,
        last_visit_at,
        DATEDIFF(NOW(), last_visit_at) as days_since_last_visit
      FROM user_restaurant_visits
      WHERE restaurant_id = ${pool.escape(rid)}
        AND visit_count > 3
        AND last_visit_at < DATE_SUB(NOW(), INTERVAL 30 DAY)
      ORDER BY visit_count DESC
      LIMIT 10
    `;

    const [churnResult] = await pool.query(churnQuery);

    return apiResponse.success(
      200,
      "Churn risk data fetched successfully",
      { churnRisk: churnResult }
    );
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const getRetentionStats = async (req) => {
  const { rid } = req.query || {};

  if (!rid) {
    return apiResponse.error(400, "Restaurant ID (rid) is required");
  }

  try {
    const retentionQuery = `
      SELECT 
        AVG(
          DATEDIFF(last_visit_at, first_visit_at) / NULLIF(visit_count - 1, 0)
        ) as avg_days_between_visits,
        COUNT(*) as returning_customers
      FROM user_restaurant_visits
      WHERE restaurant_id = ${pool.escape(rid)}
        AND visit_count > 1
    `;

    const [retentionResult] = await pool.query(retentionQuery);

    return apiResponse.success(
      200,
      "Retention stats fetched successfully",
      {
        retention: {
          avgDaysBetweenVisits: parseFloat(retentionResult[0].avg_days_between_visits || 0).toFixed(1),
          returningCustomers: retentionResult[0].returning_customers
        }
      }
    );
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

export default {
  getDashboardStats,
  getSalesTrend,
  getOrderStatusDistribution,
  getTopSellingItems,
  getInventoryLevels,
  getRevenueByCategory,
  getRecentOrders,
  getPaymentMethodDistribution,
  getDeliveryTypeDistribution,
  getDashboardOverview,
  getCompleteDashboard,
  getLoyaltyStats,
  getChurnRisk,
  getRetentionStats,
};
