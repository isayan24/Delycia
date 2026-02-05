
import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";
import app from "../../../app.js";

const createNotification = async (data) => {
  const {
    restaurant_id,
    user_id,
    type,
    title,
    message,
    priority = "medium",
    action_url,
    action_label,
    data: extraData
  } = data;

  if (!restaurant_id || !type || !title || !message) {
    throw new Error("Missing required fields for notification");
  }

  const q = `
        INSERT INTO notifications 
        (restaurant_id, user_id, type, title, message, priority, action_url, action_label, data)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  const values = [
    restaurant_id,
    user_id || null, // Ensure explicit null if undefined
    type,
    title,
    message,
    priority,
    action_url || null,
    action_label || null,
    JSON.stringify(extraData || {})
  ];

  try {
    const [result] = await pool.query(q, values);

    // Emit socket event for real-time updates
    // Using global io targeting /orders namespace as client connects there
    if (app.io) {
      app.io.of("/orders").emit("new_notification", {
        id: result.insertId,
        ...data,
        extra_data: extraData,
        created_at: new Date()
      });
    }

    return result.insertId;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

const getNotifications = async (req) => {
  const { rid, page = 1, limit = 20, type, is_read } = req.query;

  if (!rid) return apiResponse.error(400, "Restaurant ID is required");

  try {
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [rid];
    let conditions = "restaurant_id = ?";

    if (type) {
      conditions += " AND type = ?";
      params.push(type);
    }

    if (is_read !== undefined && is_read !== 'all') {
      conditions += " AND is_read = ?";
      params.push(is_read === 'true' ? 1 : 0);
    }

    // Count total
    const countQ = `SELECT COUNT(*) as total FROM notifications WHERE ${conditions}`;
    const [countResult] = await pool.query(countQ, params);
    const total = countResult[0].total;

    // Fetch paginated
    const q = `
            SELECT * FROM notifications 
            WHERE ${conditions}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        `;

    const [notifications] = await pool.query(q, [...params, parseInt(limit), offset]);

    return apiResponse.success(200, "Notifications fetched successfully", {
      notifications,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      total_pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const markAsRead = async (req) => {
  const { id } = req.params; // Notification ID
  const { rid } = req.body; // Security check ensure it belongs to the restaurant

  if (!id) return apiResponse.error(400, "Notification ID is required");

  try {
    // Optional: specific user check logic here

    const q = "UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE id = ? AND restaurant_id = ?";
    const [result] = await pool.query(q, [id, rid]);

    if (result.affectedRows === 0) {
      return apiResponse.error(404, "Notification not found or access denied");
    }

    return apiResponse.success(200, "Notification marked as read");
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const markAllAsRead = async (req) => {
  const { rid } = req.body;

  if (!rid) return apiResponse.error(400, "Restaurant ID is required");

  try {
    const q = "UPDATE notifications SET is_read = TRUE, read_at = NOW() WHERE restaurant_id = ? AND is_read = FALSE";
    const [result] = await pool.query(q, [rid]);

    return apiResponse.success(200, "All notifications marked as read", { count: result.affectedRows });
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const deleteNotification = async (req) => {
  const { id } = req.params;
  const { rid } = req.body; // or query, depending on how specific we want to be

  if (!id) return apiResponse.error(400, "Notification ID is required");

  try {
    const q = "DELETE FROM notifications WHERE id = ? AND restaurant_id = ?";
    const [result] = await pool.query(q, [id, rid]);

    if (result.affectedRows === 0) {
      return apiResponse.error(404, "Notification not found or access denied");
    }

    return apiResponse.success(200, "Notification deleted");
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

// Internal export for other models to use directly
export const internalCreateNotification = createNotification;

export default {
  createNotification, // This one is not really an API endpoint handler, but the model function
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
