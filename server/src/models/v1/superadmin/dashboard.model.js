import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";

/**
 * Get dashboard statistics
 * Returns key metrics: total restaurants, active subscriptions, revenue, users, orders
 */
const getStats = async (req) => {
  try {
    // Get total and active restaurant count
    const [restaurantStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_restaurants,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_restaurants
      FROM restaurants
    `);

    // Get active subscriptions count
    const [subscriptionStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_subscriptions,
        SUM(sp.price) as monthly_revenue
      FROM subscriptions sa
      JOIN subscription_plans sp ON sa.plan_id = sp.id
      WHERE sa.status = 'active'
    `);

    // Get user counts
    const [userStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role > 0 THEN 1 ELSE 0 END) as active_users
      FROM users
    `);

    // Get today's orders and revenue
    const [todayStats] = await pool.query(`
      SELECT 
        COUNT(DISTINCT cart_id) as orders_today,
        COALESCE(SUM(total_amount - discount_amount), 0) as revenue_today
      FROM orders
      WHERE DATE(created_at) = CURDATE()
        AND payment_status = 'completed'
    `);

    // Get total revenue (all time)
    const [totalRevenueResult] = await pool.query(`
      SELECT 
        COALESCE(SUM(total_amount - discount_amount), 0) as total_revenue
      FROM orders
      WHERE payment_status = 'completed'
    `);

    return apiResponse.success(200, "Dashboard statistics retrieved successfully", {
      data: {
        total_restaurants: restaurantStats[0].total_restaurants || 0,
        active_restaurants: restaurantStats[0].active_restaurants || 0,
        total_subscriptions: subscriptionStats[0].total_subscriptions || 0,
        monthly_revenue: parseFloat(subscriptionStats[0].monthly_revenue) || 0,
        total_users: userStats[0].total_users || 0,
        active_users: userStats[0].active_users || 0,
        orders_today: todayStats[0].orders_today || 0,
        revenue_today: todayStats[0].revenue_today || 0,
        total_revenue: totalRevenueResult[0].total_revenue || 0,
      },
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return apiResponse.error(500, "An error occurred while retrieving dashboard statistics");
  }
};

/**
 * Get recent activity feed
 * Returns recent activity including new restaurants, subscription changes, and user registrations
 */
const getRecentActivity = async (req) => {
  try {
    const { limit = 20, type = "" } = req.query;

    let activities = [];

    // Get recent restaurants (if no type filter or type is 'restaurant')
    if (!type || type === "restaurant") {
      const [restaurants] = await pool.query(
        `SELECT 
          id,
          name,
          'restaurant_created' as activity_type,
          created_at as timestamp
        FROM restaurants
        ORDER BY created_at DESC
        LIMIT ?`,
        [parseInt(limit)]
      );
      activities = activities.concat(
        restaurants.map((r) => ({
          id: `restaurant_${r.id}`,
          type: r.activity_type,
          description: `New restaurant "${r.name}" was created`,
          restaurant_id: r.id,
          restaurant_name: r.name,
          timestamp: r.timestamp,
        }))
      );
    }

    // Get recent subscription changes (if no type filter or type is 'subscription')
    if (!type || type === "subscription") {
      const [subscriptions] = await pool.query(
        `SELECT 
          sa.id,
          sa.restaurant_id,
          r.name as restaurant_name,
          sp.plan_name,
          sa.status,
          'subscription_changed' as activity_type,
          sa.created_at as timestamp
        FROM subscriptions sa
        JOIN restaurants r ON sa.restaurant_id = r.id
        JOIN subscription_plans sp ON sa.plan_id = sp.id
        ORDER BY sa.created_at DESC
        LIMIT ?`,
        [parseInt(limit)]
      );
      activities = activities.concat(
        subscriptions.map((s) => ({
          id: `subscription_${s.id}`,
          type: s.activity_type,
          description: `Restaurant "${s.restaurant_name}" subscription changed to "${s.plan_name}" (${s.status})`,
          restaurant_id: s.restaurant_id,
          restaurant_name: s.restaurant_name,
          metadata: {
            plan_name: s.plan_name,
            status: s.status,
          },
          timestamp: s.timestamp,
        }))
      );
    }

    // Get recent user registrations (if no type filter or type is 'user')
    if (!type || type === "user") {
      const [users] = await pool.query(
        `SELECT 
          u.id,
          u.name,
          u.email,
          'user_registered' as activity_type,
          u.register_at as timestamp,
          GROUP_CONCAT(DISTINCT r.name) as restaurant_names
        FROM users u
        LEFT JOIN restaurant_access ra ON u.id = ra.user_id
        LEFT JOIN restaurants r ON ra.rid = r.id
        GROUP BY u.id, u.name, u.email, u.register_at
        ORDER BY u.register_at DESC
        LIMIT ?`,
        [parseInt(limit)]
      );
      activities = activities.concat(
        users.map((u) => ({
          id: `user_${u.id}`,
          type: u.activity_type,
          description: `New user "${u.name}" (${u.email}) registered${u.restaurant_names ? ` for ${u.restaurant_names}` : ""
            }`,
          user_id: u.id,
          user_name: u.name,
          user_email: u.email,
          metadata: {
            restaurant_names: u.restaurant_names ? u.restaurant_names.split(",") : [],
          },
          timestamp: u.timestamp,
        }))
      );
    }

    // Sort all activities by timestamp descending and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    activities = activities.slice(0, parseInt(limit));

    return apiResponse.success(200, "Recent activity retrieved successfully", {
      data: activities,
      total: activities.length,
    });
  } catch (error) {
    console.error("Get recent activity error:", error);
    return apiResponse.error(500, "An error occurred while retrieving recent activity");
  }
};

/**
 * Get analytics data
 * Returns growth trends over time for restaurants, subscriptions, users, and revenue
 */
const getAnalytics = async (req) => {
  try {
    const {
      start_date = "",
      end_date = "",
      interval = "day", // day, week, month
    } = req.query;

    // Validate date format if provided
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (start_date && !dateRegex.test(start_date)) {
      return apiResponse.error(400, "Invalid start_date format. Expected YYYY-MM-DD");
    }
    if (end_date && !dateRegex.test(end_date)) {
      return apiResponse.error(400, "Invalid end_date format. Expected YYYY-MM-DD");
    }

    // Validate interval
    const validIntervals = ["day", "week", "month"];
    if (!validIntervals.includes(interval)) {
      return apiResponse.error(400, "Invalid interval. Must be one of: day, week, month");
    }

    // Build date filter
    let dateFilter = "";
    let dateParams = [];
    if (start_date && end_date) {
      dateFilter = "WHERE DATE(created_at) BETWEEN ? AND ?";
      dateParams = [start_date, end_date];
    } else if (start_date) {
      dateFilter = "WHERE DATE(created_at) >= ?";
      dateParams = [start_date];
    } else if (end_date) {
      dateFilter = "WHERE DATE(created_at) <= ?";
      dateParams = [end_date];
    } else {
      // Default to last 30 days
      dateFilter = "WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
    }

    // Determine date grouping based on interval
    let dateGroup;
    switch (interval) {
      case "week":
        dateGroup = "DATE_FORMAT(created_at, '%Y-%u')"; // Year-Week
        break;
      case "month":
        dateGroup = "DATE_FORMAT(created_at, '%Y-%m')"; // Year-Month
        break;
      default:
        dateGroup = "DATE(created_at)"; // Day
    }

    // Get restaurant growth trend
    const [restaurantTrend] = await pool.query(
      `SELECT 
        ${dateGroup} as period,
        COUNT(*) as count
      FROM restaurants
      ${dateFilter}
      GROUP BY period
      ORDER BY period ASC`,
      dateParams
    );

    // Get subscription growth trend
    const [subscriptionTrend] = await pool.query(
      `SELECT 
        ${dateGroup} as period,
        COUNT(*) as count
      FROM subscriptions
      ${dateFilter}
      GROUP BY period
      ORDER BY period ASC`,
      dateParams
    );

    // Get user growth trend
    const [userTrend] = await pool.query(
      `SELECT 
        ${dateGroup} as period,
        COUNT(*) as count
      FROM users
      ${dateFilter.replace("created_at", "register_at")}
      GROUP BY period
      ORDER BY period ASC`,
      dateParams
    );

    // Get revenue trend
    const [revenueTrend] = await pool.query(
      `SELECT 
        ${dateGroup} as period,
        COALESCE(SUM(total_amount - discount_amount), 0) as revenue,
        COUNT(DISTINCT cart_id) as order_count
      FROM orders
      ${dateFilter}
        AND payment_status = 'completed'
      GROUP BY period
      ORDER BY period ASC`,
      dateParams
    );

    return apiResponse.success(200, "Analytics data retrieved successfully", {
      data: {
        restaurants: restaurantTrend,
        subscriptions: subscriptionTrend,
        users: userTrend,
        revenue: revenueTrend,
        interval,
        date_range: {
          start: start_date || "30 days ago",
          end: end_date || "today",
        },
      },
    });
  } catch (error) {
    console.error("Get analytics error:", error);
    return apiResponse.error(500, "An error occurred while retrieving analytics data");
  }
};

/**
 * Get per-restaurant metrics
 * Returns detailed statistics for a specific restaurant including order volume and revenue
 */
const getRestaurantMetrics = async (req) => {
  try {
    const { id } = req.params;
    const {
      start_date = "",
      end_date = "",
    } = req.query;

    if (!id) {
      return apiResponse.error(400, "Restaurant ID is required");
    }

    // Validate date format if provided
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (start_date && !dateRegex.test(start_date)) {
      return apiResponse.error(400, "Invalid start_date format. Expected YYYY-MM-DD");
    }
    if (end_date && !dateRegex.test(end_date)) {
      return apiResponse.error(400, "Invalid end_date format. Expected YYYY-MM-DD");
    }

    // Check if restaurant exists
    const [restaurant] = await pool.query(
      "SELECT id, name, is_active, created_at FROM restaurants WHERE id = ?",
      [id]
    );

    if (!restaurant.length) {
      return apiResponse.error(404, "Restaurant not found");
    }

    // Build date filter for orders
    let dateFilter = "";
    let dateParams = [id];
    if (start_date && end_date) {
      dateFilter = "AND DATE(o.created_at) BETWEEN ? AND ?";
      dateParams.push(start_date, end_date);
    } else if (start_date) {
      dateFilter = "AND DATE(o.created_at) >= ?";
      dateParams.push(start_date);
    } else if (end_date) {
      dateFilter = "AND DATE(o.created_at) <= ?";
      dateParams.push(end_date);
    }

    // Get order volume and revenue
    const [orderMetrics] = await pool.query(
      `SELECT 
        COUNT(DISTINCT o.cart_id) as total_orders,
        COALESCE(SUM(o.total_amount - o.discount_amount), 0) as total_revenue,
        COALESCE(AVG(o.total_amount - o.discount_amount), 0) as average_order_value,
        COUNT(DISTINCT o.customer_id) as unique_customers
      FROM orders o
      WHERE o.rid = ?
        AND o.payment_status = 'completed'
        ${dateFilter}`,
      dateParams
    );

    // Get today's metrics
    const [todayMetrics] = await pool.query(
      `SELECT 
        COUNT(DISTINCT cart_id) as orders_today,
        COALESCE(SUM(total_amount - discount_amount), 0) as revenue_today
      FROM orders
      WHERE rid = ?
        AND DATE(created_at) = CURDATE()
        AND payment_status = 'completed'`,
      [id]
    );

    // Get menu item count
    const [menuStats] = await pool.query(
      `SELECT 
        COUNT(*) as total_menu_items,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_items
      FROM inventories
      WHERE rid = ?`,
      [id]
    );

    // Get user count
    const [userStats] = await pool.query(
      `SELECT COUNT(DISTINCT u.id) as total_users
      FROM users u
      JOIN restaurant_access ra ON u.id = ra.user_id
      WHERE ra.restaurant_id = ?`,
      [id]
    );

    // Get subscription info
    const [subscriptionInfo] = await pool.query(
      `SELECT 
        sp.plan_name,
        sp.price,
        sp.billing_period,
        sa.status,
        sa.start_date,
        sa.end_date,
        sa.auto_renew
      FROM subscriptions sa
      JOIN subscription_plans sp ON sa.plan_id = sp.id
      WHERE sa.restaurant_id = ?
        AND sa.status = 'active'
      ORDER BY sa.created_at DESC
      LIMIT 1`,
      [id]
    );

    // Get order status breakdown
    const [orderStatusBreakdown] = await pool.query(
      `SELECT 
        order_status,
        COUNT(DISTINCT cart_id) as count
      FROM orders
      WHERE rid = ?
        ${dateFilter.replace("o.created_at", "created_at")}
      GROUP BY order_status`,
      dateParams
    );

    // Get popular items (top 5)
    const [popularItems] = await pool.query(
      `SELECT 
        i.name as item_name,
        COUNT(*) as order_count,
        SUM(o.quantity) as total_quantity,
        COALESCE(SUM(o.total_amount - o.discount_amount), 0) as revenue
      FROM orders o
      JOIN inventories i ON o.item_id = i.id
      WHERE o.rid = ?
        AND o.payment_status = 'completed'
        ${dateFilter.replace("o.created_at", "o.created_at")}
      GROUP BY o.item_id, i.name
      ORDER BY order_count DESC
      LIMIT 5`,
      dateParams
    );

    return apiResponse.success(200, "Restaurant metrics retrieved successfully", {
      data: {
        restaurant: {
          id: restaurant[0].id,
          name: restaurant[0].name,
          is_active: restaurant[0].is_active,
          created_at: restaurant[0].created_at,
        },
        metrics: {
          total_orders: orderMetrics[0].total_orders || 0,
          total_revenue: orderMetrics[0].total_revenue || 0,
          average_order_value: parseFloat(orderMetrics[0].average_order_value) || 0,
          unique_customers: orderMetrics[0].unique_customers || 0,
          orders_today: todayMetrics[0].orders_today || 0,
          revenue_today: todayMetrics[0].revenue_today || 0,
          total_menu_items: menuStats[0].total_menu_items || 0,
          available_menu_items: menuStats[0].available_items || 0,
          total_users: userStats[0].total_users || 0,
        },
        subscription: subscriptionInfo.length > 0 ? subscriptionInfo[0] : null,
        order_status_breakdown: orderStatusBreakdown,
        popular_items: popularItems,
        date_range: {
          start: start_date || "all time",
          end: end_date || "today",
        },
      },
    });
  } catch (error) {
    console.error("Get restaurant metrics error:", error);
    return apiResponse.error(500, "An error occurred while retrieving restaurant metrics");
  }
};

export default {
  getStats,
  getRecentActivity,
  getAnalytics,
  getRestaurantMetrics,
};
