import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";
import others from "../../../utils/others.js";
const tableModel = {
  // Get all tables by restaurant ID
  get_all: async (req) => {
    const { rid } = req.query;
    if (!rid) return apiResponse.error(400, "rid is required");

    try {
      // Get tables with party_size as the sum of unique orders (by cart_id) for each table
      // This ensures when the same customer has multiple items, party_size is counted only once per order
      const [tables] = await pool.query(
        `SELECT t.*, 
          COALESCE(SUM(distinct_orders.party_size), 0) AS party_size
         FROM tables t 
         LEFT JOIN (
           SELECT DISTINCT table_id, cart_id, party_size, rid
           FROM orders
           WHERE order_status NOT IN ('cancelled', 'settled')
             AND created_at >= NOW() - INTERVAL 2 HOUR
         ) AS distinct_orders 
           ON distinct_orders.table_id = t.id 
           AND distinct_orders.rid = t.rid
         WHERE t.rid = ?
         GROUP BY t.id`,
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

  // Get specific table details by restaurant ID and table ID
  get_table_details: async (req) => {
    const { rid, tableId } = req.query;
    if (!rid || !tableId) return apiResponse.error(400, "rid and tableId are required");

    try {
      const [tables] = await pool.query(
        `SELECT t.*, 
          COALESCE(SUM(distinct_orders.party_size), 0) AS party_size
         FROM tables t 
         LEFT JOIN (
           SELECT DISTINCT table_id, cart_id, party_size, rid
           FROM orders
           WHERE order_status NOT IN ('cancelled', 'settled')
             AND created_at >= NOW() - INTERVAL 2 HOUR
         ) AS distinct_orders 
           ON distinct_orders.table_id = t.id 
           AND distinct_orders.rid = t.rid
         WHERE t.rid = ? AND t.id = ?
         GROUP BY t.id`,
        [rid, tableId]
      );

      if (tables.length === 0) {
        return apiResponse.error(404, "Table not found");
      }

      return apiResponse.success(200, "success", { table: tables[0] });
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
    const { id, table_number, capacity, zone, status } = req.body;

    if (!id) return apiResponse.error(400, "id is required");

    if ((await others.getPower(req)) < 60)
      return apiResponse.error(401, "Unauthorized access!");

    try {
      // Build dynamic SET clause to only update provided fields
      const fields = [];
      const values = [];

      if (table_number !== undefined) { fields.push("table_number = ?"); values.push(table_number); }
      if (capacity !== undefined) { fields.push("capacity = ?"); values.push(capacity); }
      if (zone !== undefined) { fields.push("zone = ?"); values.push(zone); }
      if (status !== undefined) { fields.push("status = ?"); values.push(status); }

      if (fields.length === 0) return apiResponse.error(400, "No fields to update");

      fields.push("updated_at = NOW()");
      values.push(id);

      await pool.query(
        `UPDATE tables SET ${fields.join(", ")} WHERE id = ?`,
        values
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
