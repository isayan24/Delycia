import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";

/**
 * Get staff performance leaderboard
 * Shows aggregated metrics for all staff members who have placed orders
 */
const getStaffLeaderboard = async (req) => {
  const {
    rid,
    start_date = null,
    end_date = null,
    page = 1,
    limit = 10,
  } = req.query;

  if (!rid) return apiResponse.error(400, "Restaurant ID (rid) is required");
  try {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build date filter conditions
    const dateConditions = [];
    const params = [rid];

    if (start_date) {
      dateConditions.push("o.created_at >= ?");
      params.push(start_date);
    }

    if (end_date) {
      // Add 1 day to end_date to include the entire day (23:59:59)
      dateConditions.push("o.created_at < DATE_ADD(?, INTERVAL 1 DAY)");
      params.push(end_date);
    }

    const dateFilter = dateConditions.length > 0
      ? `AND ${dateConditions.join(" AND ")}`
      : "";

    // Get total count of staff members with orders
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) AS total_staff
      FROM orders o
      INNER JOIN users u ON o.placed_by_staff_id = u.id
      WHERE o.rid = ?
        AND o.placed_by_staff_id IS NOT NULL
        ${dateFilter}
    `;

    const [countResult] = await pool.query(countQuery, params);
    const total_staff = countResult[0].total_staff;
    const total_pages = Math.ceil(total_staff / limitNum);

    // Get staff leaderboard with aggregated metrics
    const leaderboardQuery = `
      SELECT 
        u.id AS staff_id,
        u.name AS staff_name,
        u.username,
        u.profile_pic,
        u.role,
        COUNT(DISTINCT o.cart_id) AS total_orders,
        SUM(o.total_amount) AS total_revenue,
        ROUND(AVG(o.total_amount), 2) AS avg_order_value,
        MIN(o.created_at) AS first_order_date,
        MAX(o.created_at) AS last_order_date,
        COUNT(DISTINCT o.customer_id) AS unique_customers
      FROM orders o
      INNER JOIN users u ON o.placed_by_staff_id = u.id
      WHERE o.rid = ?
        AND o.placed_by_staff_id IS NOT NULL
        ${dateFilter}
      GROUP BY u.id, u.name, u.username, u.profile_pic, u.role
      ORDER BY total_revenue DESC
      LIMIT ? OFFSET ?
    `;

    const [staff] = await pool.query(leaderboardQuery, [
      ...params,
      limitNum,
      offset,
    ]);

    return apiResponse.success(200, "Staff leaderboard retrieved successfully", {
      staff,
      pagination: {
        total_staff,
        total_pages,
        current_page: pageNum,
        per_page: limitNum,
        has_next_page: pageNum < total_pages,
        has_prev_page: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error in getStaffLeaderboard:", error);
    return apiResponse.error(500, error.message);
  }
};

/**
 * Get individual staff member's order history
 * Shows complete order details for a specific staff member
 */
const getStaffOrders = async (req) => {
  const { staffId } = req.params;
  const {
    rid,
    start_date = null,
    end_date = null,
    page = 1,
    limit = 10,
  } = req.query;

  if (!rid) return apiResponse.error(400, "Restaurant ID (rid) is required");
  if (!staffId) return apiResponse.error(400, "Staff ID is required");

  try {
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Build date filter conditions
    const dateConditions = [];
    const params = [staffId, rid];

    if (start_date) {
      dateConditions.push("o.created_at >= ?");
      params.push(start_date);
    }

    if (end_date) {
      // Add 1 day to end_date to include the entire day (23:59:59)
      dateConditions.push("o.created_at < DATE_ADD(?, INTERVAL 1 DAY)");
      params.push(end_date);
    }

    const dateFilter = dateConditions.length > 0
      ? `AND ${dateConditions.join(" AND ")}`
      : "";

    // Get total count of orders
    const countQuery = `
      SELECT COUNT(DISTINCT o.cart_id) AS total_orders
      FROM orders o
      WHERE o.placed_by_staff_id = ?
        AND o.rid = ?
        ${dateFilter}
    `;

    const [countResult] = await pool.query(countQuery, params);
    const total_orders = countResult[0].total_orders;
    const total_pages = Math.ceil(total_orders / limitNum);

    // Get staff member details
    const staffQuery = `
      SELECT id, name, username, profile_pic, role, phone_number
      FROM users
      WHERE id = ?
    `;
    const [staffData] = await pool.query(staffQuery, [staffId]);

    if (staffData.length === 0) {
      return apiResponse.error(404, "Staff member not found");
    }

    // Get orders with customer details and items
    const ordersQuery = `
      SELECT 
        o.cart_id,
        o.customer_id,
        o.table_no,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.delivery_type,
        o.created_at,
        o.updated_at,
        c.name AS customer_name,
        c.phone_number AS customer_phone,
        c.email AS customer_email,
        c.username AS customer_username,
        c.profile_pic AS customer_profile_pic,
        SUM(o.total_amount) AS order_total,
        SUM(o.discount_amount) AS total_discount,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'id', o.id,
            'item_id', o.item_id,
            'item_name', COALESCE(i.name, o.display_name),
            'quantity', o.quantity,
            'price', o.total_amount,
            'variant_id', o.variant_id,
            'special_instructions', o.special_instructions
          )
        ) AS items
      FROM orders o
      LEFT JOIN users c ON o.customer_id = c.id
      LEFT JOIN inventories i ON o.item_id = i.id
      WHERE o.placed_by_staff_id = ?
        AND o.rid = ?
        ${dateFilter}
      GROUP BY o.cart_id, o.customer_id, o.table_no, o.payment_method, 
               o.payment_status, o.order_status, o.delivery_type, 
               o.created_at, o.updated_at,
               c.name, c.phone_number, c.email, c.username, c.profile_pic
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [orders] = await pool.query(ordersQuery, [
      ...params,
      limitNum,
      offset,
    ]);

    return apiResponse.success(200, "Staff orders retrieved successfully", {
      staff: staffData[0],
      orders,
      pagination: {
        total_orders,
        total_pages,
        current_page: pageNum,
        per_page: limitNum,
        has_next_page: pageNum < total_pages,
        has_prev_page: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error in getStaffOrders:", error);
    return apiResponse.error(500, error.message);
  }
};

export default {
  getStaffLeaderboard,
  getStaffOrders,
};
