import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";

const getRestaurantCustomers = async (rid, timeRange = 'this_month') => {
  if (!rid) {
    return apiResponse.error(400, "Restaurant ID (rid) is required");
  }

  try {
    let intervalCondition = "";

    switch (timeRange) {
      case 'today':
        intervalCondition = "AND last_visit_at >= CURDATE()";
        break;
      case 'yesterday':
        intervalCondition = "AND last_visit_at >= DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND last_visit_at < CURDATE()";
        break;
      case 'this_week':
        intervalCondition = "AND YEARWEEK(last_visit_at, 1) = YEARWEEK(CURDATE(), 1)";
        break;
      case 'this_month':
        intervalCondition = "AND last_visit_at >= DATE_FORMAT(NOW(), '%Y-%m-01')";
        break;
      case 'last_month':
        intervalCondition = "AND last_visit_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01') AND last_visit_at < DATE_FORMAT(NOW(), '%Y-%m-01')";
        break;
      case 'this_year':
        intervalCondition = "AND YEAR(last_visit_at) = YEAR(CURDATE())";
        break;
      case 'all_time':
        intervalCondition = "";
        break;
      default: // Default to this month
        intervalCondition = "AND last_visit_at >= DATE_FORMAT(NOW(), '%Y-%m-01')";
    }

    // Detailed query to fetch customer insights
    // We join user_restaurant_visits with users table
    // We also join with a subquery on orders to get aggregate spending data
    const query = `
      SELECT 
        u.id as user_id,
        u.name,
        u.phone_number,
        u.profile_pic,
        u.email,
        urv.visit_count,
        urv.last_visit_at,
        urv.first_visit_at,
        COALESCE(o_stats.total_spent, 0) as total_spent,
        COALESCE(o_stats.avg_order_value, 0) as avg_order_value,
        COALESCE(o_stats.last_order_items_str, '') as last_order_items_str
      FROM user_restaurant_visits urv
      JOIN users u ON urv.user_id = u.id
      LEFT JOIN (
        SELECT 
          o.customer_id,
          SUM(o.total_amount - COALESCE(o.discount_amount, 0)) as total_spent,
          SUM(o.total_amount - COALESCE(o.discount_amount, 0)) / NULLIF(COUNT(DISTINCT o.cart_id), 0) as avg_order_value,
          SUBSTRING_INDEX(GROUP_CONCAT(i.name ORDER BY o.created_at DESC SEPARATOR ','), ',', 3) as last_order_items_str
        FROM orders o
        LEFT JOIN inventories i ON o.item_id = i.id
        WHERE o.rid = ? AND (o.order_status = 'completed' OR o.order_status = 'settled')
        GROUP BY o.customer_id
      ) o_stats ON urv.user_id = o_stats.customer_id
      WHERE urv.restaurant_id = ? ${intervalCondition}
      ORDER BY urv.last_visit_at DESC
    `;

    const [customers] = await pool.query(query, [rid, rid]);

    // Format the list of items from string to array
    const formattedCustomers = customers.map(customer => ({
      ...customer,
      last_order_items: customer.last_order_items_str
        ? customer.last_order_items_str.split(',')
        : []
    }));

    return apiResponse.success(200, "Customers fetched successfully", { customers: formattedCustomers });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return apiResponse.error(500, error.message);
  }
};

const getCRMStats = async (rid, timeRange = 'this_month') => {
  if (!rid) return apiResponse.error(400, "Restaurant ID is required");

  try {
    let dateCondition = "";
    let intervalCondition = "";

    switch (timeRange) {
      case 'today':
        dateCondition = "AND DATE(created_at) = CURDATE()";
        intervalCondition = "AND last_visit_at >= CURDATE()";
        break;
      case 'yesterday':
        dateCondition = "AND DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)";
        intervalCondition = "AND last_visit_at >= DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND last_visit_at < CURDATE()";
        break;
      case 'this_week':
        dateCondition = "AND YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)";
        intervalCondition = "AND YEARWEEK(last_visit_at, 1) = YEARWEEK(CURDATE(), 1)";
        break;
      case 'this_month':
        dateCondition = "AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')";
        intervalCondition = "AND last_visit_at >= DATE_FORMAT(NOW(), '%Y-%m-01')";
        break;
      case 'last_month':
        dateCondition = "AND created_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01') AND created_at < DATE_FORMAT(NOW(), '%Y-%m-01')";
        intervalCondition = "AND last_visit_at >= DATE_FORMAT(DATE_SUB(NOW(), INTERVAL 1 MONTH), '%Y-%m-01') AND last_visit_at < DATE_FORMAT(NOW(), '%Y-%m-01')";
        break;
      case 'this_year':
        dateCondition = "AND YEAR(created_at) = YEAR(CURDATE())";
        intervalCondition = "AND YEAR(last_visit_at) = YEAR(CURDATE())";
        break;
      case 'all_time':
        dateCondition = "";
        intervalCondition = "";
        break;
      default: // Default to this month if unknown
        dateCondition = "AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')";
        intervalCondition = "AND last_visit_at >= DATE_FORMAT(NOW(), '%Y-%m-01')";
    }

    // 1. Total Customers (Always All Time for this specific metric, usually)
    // But if we want active customers in this period, we could filter. 
    // Usually "Total Customers" implies database size, but "Active Customers" implies period.
    // Let's keep Total Customers as All Time for context, or filter it?
    // The user asked for "control over data". 
    // Let's filter "Active Customers" in this period for the first card if logical, 
    // or keep "Total Customers" as all time and add "Active" label.
    // Given the UI label is "Total Customers", let's keep it as All Time for the base,
    // OR filter it to show how many customers visited in this period.
    // Let's go with: How many unique customers visited in this period.
    const totalQuery = `SELECT COUNT(DISTINCT user_id) as count FROM user_restaurant_visits WHERE restaurant_id = ? ${intervalCondition}`;

    // 2. New Customers (First visit in this period)
    const newQuery = `
      SELECT COUNT(DISTINCT user_id) as count 
      FROM user_restaurant_visits 
      WHERE restaurant_id = ? 
      AND first_visit_at IS NOT NULL
      ${intervalCondition.replace(/last_visit_at/g, 'first_visit_at')}
    `;

    // 3. Returning Customers (Visited in this period AND visit_count > 1)
    // This definition is tricky. A returning customer in "Today" is someone who visited today and has > 1 total visits?
    // Yes, that makes sense.
    const returningQuery = `
      SELECT COUNT(DISTINCT user_id) as count 
      FROM user_restaurant_visits 
      WHERE restaurant_id = ? 
      AND visit_count > 1
      ${intervalCondition}
    `;

    // 4. Visit Trends (Graph)
    // Adjust graph range based on selection
    let trendLimitCondition = "";
    if (timeRange === 'today' || timeRange === 'yesterday') {
      // Hourly breakdown for day view? Or just one point? Area chart needs points.
      // Let's Stick to Daily grouping for now, but maybe for Today we should do hourly?
      // The UI says "Customer Visits Trend (30 Days)". We might need to update that title dynamically or just return what we have.
      // For simplicity in this iteration, let's keep daily grouping but restrict range.
      trendLimitCondition = intervalCondition;
    } else {
      trendLimitCondition = intervalCondition;
    }

    // Default trend query (Daily)
    const trendQuery = `
      SELECT DATE(last_visit_at) as date, COUNT(*) as visits
      FROM user_restaurant_visits
      WHERE restaurant_id = ?
      ${trendLimitCondition}
      GROUP BY DATE(last_visit_at)
      ORDER BY date ASC
    `;

    const [totalRes] = await pool.query(totalQuery, [rid]);
    const [newRes] = await pool.query(newQuery, [rid]);
    const [returningRes] = await pool.query(returningQuery, [rid]);
    const [trendRes] = await pool.query(trendQuery, [rid]);

    return apiResponse.success(200, "CRM stats fetched", {
      stats: {
        totalCustomers: totalRes[0].count,
        newCustomers: newRes[0].count,
        returningCustomers: returningRes[0].count,
        visitTrend: trendRes.map(t => ({
          date: t.date.toISOString().split('T')[0],
          visits: t.visits
        }))
      }
    });
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const getCustomerDetails = async (rid, customerId) => {
  if (!rid || !customerId) return apiResponse.error(400, "Missing required params");

  try {
    // 1. Profile & Stats
    const profileQuery = `
      SELECT 
        u.id, u.name, u.email, u.phone_number, u.profile_pic,
        urv.visit_count, urv.first_visit_at, urv.last_visit_at,
        (SELECT SUM(total_amount - COALESCE(discount_amount, 0)) FROM orders WHERE rid = ? AND customer_id = ? AND (order_status = 'completed' OR order_status = 'settled')) as total_spent,
        (SELECT SUM(total_amount - COALESCE(discount_amount, 0)) / COUNT(DISTINCT cart_id) FROM orders WHERE rid = ? AND customer_id = ? AND (order_status = 'completed' OR order_status = 'settled')) as avg_order_value
      FROM users u
      JOIN user_restaurant_visits urv ON u.id = urv.user_id
      WHERE u.id = ? AND urv.restaurant_id = ?
    `;

    // 2. Order History (Timeline)
    const historyQuery = `
      SELECT 
        MIN(o.id) as order_id,
        o.cart_id,
        SUM(o.total_amount) as total_amount,
        SUM(o.discount_amount) as discount_amount,
        MAX(o.created_at) as created_at,
        o.order_status,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'name', i.name,
            'quantity', o.quantity,
            'price', o.total_amount,
            'variant_name', v.name,
            'addons', (
              SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'name', a.name,
                  'price', oa.price,
                  'quantity', oa.quantity
                )
              )
              FROM order_addons oa
              JOIN addons a ON oa.addon_id = a.id
              WHERE oa.order_id = o.id
            )
          )
        ) as items
      FROM orders o
      LEFT JOIN inventories i ON o.item_id = i.id
      LEFT JOIN variants v ON o.variant_id = v.id
      WHERE o.rid = ? AND o.customer_id = ?
      GROUP BY o.cart_id
      ORDER BY MAX(o.created_at) DESC
      LIMIT 20
    `;

    const [profileRes] = await pool.query(profileQuery, [rid, customerId, rid, customerId, customerId, rid]);
    const [historyRes] = await pool.query(historyQuery, [rid, customerId]);

    if (!profileRes.length) return apiResponse.error(404, "Customer not found");

    return apiResponse.success(200, "Customer details fetched", {
      profile: profileRes[0],
      history: historyRes
    });
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

export default {
  getRestaurantCustomers,
  getCRMStats,
  getCustomerDetails
};
