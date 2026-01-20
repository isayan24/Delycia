import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";

const getRestaurantCustomers = async (rid) => {
  if (!rid) {
    return apiResponse.error(400, "Restaurant ID (rid) is required");
  }

  try {
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
          SUM(o.total_amount) as total_spent,
          SUM(o.total_amount) / NULLIF(COUNT(DISTINCT o.cart_id), 0) as avg_order_value,
          SUBSTRING_INDEX(GROUP_CONCAT(i.name ORDER BY o.created_at DESC SEPARATOR ','), ',', 3) as last_order_items_str
        FROM orders o
        LEFT JOIN inventories i ON o.item_id = i.id
        WHERE o.rid = ?
        GROUP BY o.customer_id
      ) o_stats ON urv.user_id = o_stats.customer_id
      WHERE urv.restaurant_id = ?
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

const getCRMStats = async (rid) => {
  if (!rid) return apiResponse.error(400, "Restaurant ID is required");

  try {
    // 1. Total Customers
    const totalQuery = `SELECT COUNT(DISTINCT user_id) as count FROM user_restaurant_visits WHERE restaurant_id = ?`;

    // 2. New Customers (This Month)
    const newQuery = `
      SELECT COUNT(DISTINCT user_id) as count 
      FROM user_restaurant_visits 
      WHERE restaurant_id = ? 
      AND first_visit_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
    `;

    // 3. Returning Customers
    const returningQuery = `
      SELECT COUNT(DISTINCT user_id) as count 
      FROM user_restaurant_visits 
      WHERE restaurant_id = ? 
      AND visit_count > 1
    `;

    // 4. Visit Trends (Last 30 Days)
    const trendQuery = `
      SELECT DATE(last_visit_at) as date, COUNT(*) as visits
      FROM user_restaurant_visits
      WHERE restaurant_id = ?
      AND last_visit_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
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
        (SELECT SUM(total_amount) FROM orders WHERE rid = ? AND customer_id = ?) as total_spent,
        (SELECT AVG(total_amount) FROM orders WHERE rid = ? AND customer_id = ?) as avg_order_value
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
        MAX(o.created_at) as created_at,
        o.order_status,
        GROUP_CONCAT(i.name SEPARATOR ', ') as items
      FROM orders o
      LEFT JOIN inventories i ON o.item_id = i.id
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
