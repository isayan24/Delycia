import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";
import others from "../../../utils/others.js";
const tableModel = {
  // Get all tables by restaurant ID
  get_all: async (req) => {
    const { rid } = req.query;
    if (!rid) return apiResponse.error(400, "rid is required");

    try {
      // Get tables with party_size as the sum of all active orders for each table
      // This ensures when multiple customers order at the same table, their party sizes are accumulated
      const [tables] = await pool.query(
        `SELECT t.*, 
          (SELECT COALESCE(SUM(o.party_size), 0) 
           FROM orders o 
           WHERE o.table_no = t.table_number 
             AND o.rid = t.rid 
             AND o.order_status NOT IN ('cancelled', 'settled')
             AND o.created_at >= NOW() - INTERVAL 2 HOUR
          ) AS party_size
         FROM tables t 
         WHERE t.rid = ?`,
        [rid]
      );

      return apiResponse.success(200, "success", { tables });
    } catch (err) {
      return apiResponse.error(500, err.message);
    }
  },

  get_all_zone: async (req) => {
    const { rid } = req.query;
    if (!rid) return apiResponse.error(400, "rid is required");

    try {
      const [zones] = await pool.query(
        "SELECT DISTINCT zone FROM tables WHERE rid = ?",
        [rid]
      );
      return apiResponse.success(200, "success", { zones });
    } catch (err) {
      return apiResponse.error(500, err.message);
    }
  },

  // Create a new table
  create: async (req) => {
    const {
      rid,
      table_number,
      capacity,
      zone,
      status = "available",
    } = req.body;
    if (!rid || !table_number || !capacity || !zone)
      return apiResponse.error(400, "Missing required fields");

    if ((await others.getPower(req)) < 60)
      return apiResponse.error(401, "Unauthorized access!");

    try {
      const [result] = await pool.query(
        "INSERT INTO tables (rid, table_number, capacity, zone, status) VALUES (?, ?, ?, ?, ?)",
        [rid, table_number, capacity, zone, status]
      );
      return apiResponse.success(201, "Table created successfully");
    } catch (err) {
      return apiResponse.error(500, err.message);
    }
  },

  // Update an existing table
  update: async (req) => {
    const { id, capacity, zone, status } = req.body;

    if (!id) return apiResponse.error(400, "id is required");

    if ((await others.getPower(req)) < 60)
      return apiResponse.error(401, "Unauthorized access!");

    try {
      await pool.query(
        "UPDATE tables SET capacity = ?, zone = ?, status = ?, updated_at = NOW() WHERE id = ?",
        [capacity, zone, status, id]
      );
      return apiResponse.success(200, "Table updated successfully");
    } catch (err) {
      return apiResponse.error(500, err.message);
    }
  },
  // Delete a table
  delete: async (req) => {
    const { id } = req.body;
    if (!id) return apiResponse.error(400, "id is required");

    if ((await others.getPower(req)) < 60)
      return apiResponse.error(401, "Unauthorized access!");

    try {
      await pool.query("DELETE FROM tables WHERE id = ?", [id]);
      return apiResponse.success(200, "Table deleted successfully");
    } catch (err) {
      return apiResponse.error(500, err.message);
    }
  },
};

export default tableModel;
