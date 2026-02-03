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
        AND (order_status = 'completed' OR order_status = 'settled') 
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

    // Customer Stats
    // Total Customers (All time)
    const totalCustomersQuery = `
      SELECT COUNT(*) as total_customers 
      FROM user_restaurant_visits 
      WHERE restaurant_id = ${pool.escape(rid)}
    `;

    // Customers Today
    const customersTodayQuery = `
      SELECT COUNT(*) as customers_today
      FROM user_restaurant_visits 
      WHERE restaurant_id = ${pool.escape(rid)}
        AND DATE(last_visit_at) = CURDATE()
    `;

    // Customers This Month
    const customersMonthQuery = `
      SELECT COUNT(*) as customers_month
      FROM user_restaurant_visits 
      WHERE restaurant_id = ${pool.escape(rid)}
        AND MONTH(last_visit_at) = MONTH(CURDATE())
        AND YEAR(last_visit_at) = YEAR(CURDATE())
    `;

    // Customers This Year
    const customersYearQuery = `
      SELECT COUNT(*) as customers_year
      FROM user_restaurant_visits 
      WHERE restaurant_id = ${pool.escape(rid)}
        AND YEAR(last_visit_at) = YEAR(CURDATE())
    `;

    const [totalSalesResult] = await pool.query(totalSalesQuery);
    const [totalOrdersResult] = await pool.query(totalOrdersQuery);
    const [newCustomersResult] = await pool.query(newCustomersQuery);
    const [avgOrderValueResult] = await pool.query(avgOrderValueQuery);
    const [totalCustomersResult] = await pool.query(totalCustomersQuery);
    const [customersTodayResult] = await pool.query(customersTodayQuery);
    const [customersMonthResult] = await pool.query(customersMonthQuery);
    const [customersYearResult] = await pool.query(customersYearQuery);

    const stats = {
      totalSales: totalSalesResult[0].total_sales || 0,
      totalOrders: totalOrdersResult[0].total_orders || 0,
      newCustomers: newCustomersResult[0].new_customers || 0,
      avgOrderValue: parseFloat(
        avgOrderValueResult[0].avg_order_value || 0
      ).toFixed(2),
      totalCustomers: totalCustomersResult[0].total_customers || 0,
      customersToday: customersTodayResult[0].customers_today || 0,
      customersMonth: customersMonthResult[0].customers_month || 0,
      customersYear: customersYearResult[0].customers_year || 0,
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
        AND (order_status = 'completed' OR order_status = 'settled')
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
        SUM(o.total_amount - (COALESCE(o.discount_amount, 0) / COALESCE(calc.cnt, 1))) as total_revenue
      FROM orders o
      JOIN inventories i ON o.item_id = i.id
      JOIN (
        SELECT cart_id, COUNT(*) as cnt 
        FROM orders 
        WHERE rid = ${pool.escape(rid)}
        GROUP BY cart_id
      ) calc ON o.cart_id = calc.cart_id
      WHERE o.rid = ${pool.escape(rid)}
        AND (o.order_status = 'completed' OR o.order_status = 'settled')
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
  const { rid, filter } = req.query || {};

  if (!rid) {
    return apiResponse.error(400, "Restaurant ID (rid) is required");
  }

  try {
    let filterCondition = "";
    if (filter === "critical") {
      filterCondition = "AND stock = 0";
    } else if (filter === "low") {
      filterCondition = "AND stock < 10"; // Includes critical (0)
    } else if (filter === "available") {
      filterCondition = "AND stock > 0";
    }

    // Main Query: Get filtered items
    // Optimized to use inventory_stats table
    const inventoryQuery = `
      SELECT 
        i.id,
        i.name,
        i.stock,
        i.status,
        CASE 
          WHEN i.stock = 0 THEN 'critical'
          WHEN i.stock < 10 THEN 'low'
          WHEN i.stock < 50 THEN 'medium'
          ELSE 'good'
        END as stock_level,
        COALESCE(s.units_sold, 0) as total_sold,
        COALESCE(s.total_revenue, 0) as total_revenue,
        COALESCE(s.order_count, 0) as unique_customers
      FROM inventories i
      LEFT JOIN inventory_stats s ON i.id = s.item_id
      WHERE i.rid = ${pool.escape(rid)} 
      ${filterCondition}
      ORDER BY i.stock ASC
    `;

    // Summary Query: Get counts for ALL items (ignoring filter)
    const summaryQuery = `
      SELECT 
        CASE 
          WHEN stock = 0 THEN 'critical'
          WHEN stock < 10 THEN 'low'
          WHEN stock < 50 THEN 'medium'
          ELSE 'good'
        END as stock_level,
        COUNT(*) as count
      FROM inventories
      WHERE rid = ${pool.escape(rid)}
      GROUP BY stock_level
    `;

    const [inventoryResult] = await pool.query(inventoryQuery);
    const [summaryResult] = await pool.query(summaryQuery);

    const inventory = inventoryResult.map((row) => ({
      id: row.id,
      name: row.name,
      stock: parseInt(row.stock || 0),
      status: row.status,
      stockLevel: row.stock_level,
      totalSold: parseInt(row.total_sold || 0),
      totalRevenue: parseFloat(row.total_revenue || 0),
      uniqueCustomers: parseInt(row.unique_customers || 0),
    }));

    // Process summary counts
    const summary = {
      critical: 0,
      low: 0,
      medium: 0,
      good: 0,
      total: 0,
    };

    summaryResult.forEach(row => {
      if (summary[row.stock_level] !== undefined) {
        summary[row.stock_level] = parseInt(row.count || 0);
      }
    });

    // Special logic: 'low' should include 'critical' (stock < 10 includes stock = 0)
    // But in the tabs we usually want distinct buckets or strict subsets. 
    // The previous logic was: `inventoryByLevel.low` filtered by `stockLevel === 'low'`.
    // My SQL CASE statement makes them mutually exclusive: 0 -> critical, 1-9 -> low.
    // If the UI expects "Low Stock" to include 0, we should add critical to low.
    // However, looking at the previous code: 
    // `low: inventory.filter((item) => item.stockLevel === "low")`
    // It was mutually exclusive based on the SQL `CASE` logic.
    // I will keep them mutually exclusive as per the SQL CASE for consistency with the tabs "Low Stock" vs "Out of Stock".

    summary.total = Object.values(summary).reduce((a, b) => a + b, 0) - summary.total; // Recalculate total correctly
    // Wait, separate loops is safer
    summary.total = 0;
    summaryResult.forEach(row => {
      summary.total += parseInt(row.count || 0);
    });

    return apiResponse.success(200, "Inventory levels fetched successfully", {
      inventory,
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
        SUM(o.total_amount - (COALESCE(o.discount_amount, 0) / COALESCE(calc.cnt, 1))) as total_revenue,
        COUNT(o.id) as order_count
      FROM orders o
      JOIN inventories i ON o.item_id = i.id
      JOIN categories c ON i.category_id = c.id
      JOIN (
        SELECT cart_id, COUNT(*) as cnt 
        FROM orders 
        WHERE rid = ${pool.escape(rid)}
        GROUP BY cart_id
      ) calc ON o.cart_id = calc.cart_id
      WHERE o.rid = ${pool.escape(rid)}
        AND (o.order_status = 'completed' OR o.order_status = 'settled')
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
      getRecentOrders(req),
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
        recentOrders: recentOrdersResponse.data.recentOrders,
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

const getCustomerOrders = async (req) => {
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

    // Query to get aggregated customer order stats within the date range
    const query = `
      SELECT 
        u.id as user_id,
        u.name as customer_name,
        u.phone_number,
        COUNT(DISTINCT o.cart_id) as total_orders,
        SUM(o.total_amount) as total_spent,
        MAX(o.created_at) as last_order_date,
        SUBSTRING_INDEX(GROUP_CONCAT(DISTINCT i.name ORDER BY o.created_at DESC SEPARATOR ', '), ', ', 5) as top_items
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      LEFT JOIN inventories i ON o.item_id = i.id
      WHERE o.rid = ${pool.escape(rid)}
        AND (o.order_status = 'completed' OR o.order_status = 'settled')
        ${dateFilter}
      GROUP BY u.id
      ORDER BY total_spent DESC
      LIMIT 50
    `;

    const [result] = await pool.query(query);

    const customerOrders = result.map((row) => ({
      userId: row.user_id,
      customerName: row.customer_name,
      phoneNumber: row.phone_number,
      totalOrders: parseInt(row.total_orders || 0),
      totalSpent: parseFloat(row.total_spent || 0),
      lastOrderDate: row.last_order_date,
      topItems: row.top_items
    }));

    return apiResponse.success(
      200,
      "Customer orders fetched successfully",
      { customerOrders }
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
  getRecentOrders,
  getDeliveryTypeDistribution,
  getDashboardOverview,
  getCompleteDashboard,
  getCustomerOrders,
};
