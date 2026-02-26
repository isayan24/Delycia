import pool from "../../../config/db.connection.js";
import others from "../../../utils/others.js";

/**
 * Create tables for QR code generation
 * Only creates tables that don't already exist
 * Does NOT store QR code metadata - QR codes are generated client-side only
 */
const createTablesForQRCodes = async (rid, tables, req) => {
  try {
    // Validate restaurant access
    const hasAccess = await others.hasRestaurantAccess(req, rid);
    if (!hasAccess) {
      return {
        status: 403,
        message: "Access denied: You do not have permission to access this restaurant",
        success: false,
      };
    }

    // Validate restaurant exists
    const [restaurant] = await pool.query(
      "SELECT id FROM restaurants WHERE id = ? LIMIT 1",
      [rid]
    );

    if (restaurant.length === 0) {
      return {
        status: 404,
        message: "Restaurant not found",
        success: false,
      };
    }

    const createdTables = [];
    const skippedTables = [];

    // Process each table
    for (const table of tables) {
      const { table_number, zone } = table;

      if (!table_number || !zone) {
        continue; // Skip invalid entries
      }

      // Check if table already exists
      const [existingTable] = await pool.query(
        "SELECT id FROM tables WHERE rid = ? AND table_number = ? LIMIT 1",
        [rid, table_number]
      );

      if (existingTable.length === 0) {
        // Create new table with default capacity of 4
        await pool.query(
          "INSERT INTO tables (rid, table_number, capacity, zone, status) VALUES (?, ?, ?, ?, ?)",
          [rid, table_number, 4, zone, "available"]
        );

        createdTables.push({
          table_number,
          zone,
          capacity: 4,
        });
      } else {
        skippedTables.push(table_number);
      }
    }

    return {
      status: 200,
      message: "Tables processed successfully",
      success: true,
      createdTables,
      createdTablesCount: createdTables.length,
      skippedTables,
      skippedTablesCount: skippedTables.length,
    };
  } catch (error) {
    return {
      status: 500,
      message: "Failed to create tables",
      success: false,
      error: error.message,
    };
  }
};

export default { 
  createTablesForQRCodes
};
