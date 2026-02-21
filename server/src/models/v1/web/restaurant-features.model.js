import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";

/**
 * Valid feature flag column names — used for whitelist validation
 * to prevent SQL injection via dynamic key names.
 */
const VALID_FEATURE_KEYS = new Set([
  "table_management",
  "staff_management",
  "inventory_management",
  "reports",
  "crm",
]);

/**
 * Get feature flags for a restaurant.
 * Admins can only access restaurants they have access to.
 */
const get_features = async (req) => {
  try {
    const { rid } = req.query;
    const userId = req.user.id;

    if (!rid) return apiResponse.error(400, "Restaurant ID is required!");

    // Verify ownership (unless superadmin)
    if (req.user.role < 90) {
      const [access] = await pool.query(
        "SELECT rid FROM restaurant_access WHERE user_id = ? AND rid = ?",
        [userId, rid]
      );
      if (!access.length) {
        return apiResponse.error(403, "Access denied to this restaurant.");
      }
    }

    const [[features]] = await pool.query(
      "SELECT * FROM restaurant_features WHERE rid = ?",
      [rid]
    );

    if (!features) {
      // Auto-create if missing (edge case: table existed before trigger)
      await pool.query(
        "INSERT IGNORE INTO restaurant_features (rid) VALUES (?)",
        [rid]
      );
      const [[newFeatures]] = await pool.query(
        "SELECT * FROM restaurant_features WHERE rid = ?",
        [rid]
      );
      return apiResponse.success(200, "success", { features: newFeatures });
    }

    return apiResponse.success(200, "success", { features });
  } catch (error) {
    console.error("get_features error:", error);
    return apiResponse.error(500, "Internal Server Error");
  }
};

/**
 * Update feature flags for a restaurant.
 * Accepts a flat object of feature keys with 0/1 values.
 */
const update_features = async (req) => {
  try {
    const { rid, ...featureUpdates } = req.body;
    const userId = req.user.id;

    if (!rid) return apiResponse.error(400, "Restaurant ID is required!");

    // Verify ownership (unless superadmin)
    if (req.user.role < 90) {
      const [access] = await pool.query(
        "SELECT rid FROM restaurant_access WHERE user_id = ? AND rid = ?",
        [userId, rid]
      );
      if (!access.length) {
        return apiResponse.error(403, "Access denied to this restaurant.");
      }
    }

    // Whitelist-validate keys and values
    const validUpdates = {};
    for (const [key, value] of Object.entries(featureUpdates)) {
      if (!VALID_FEATURE_KEYS.has(key)) {
        return apiResponse.error(400, `Invalid feature key: ${key}`);
      }
      const numVal = Number(value);
      if (numVal !== 0 && numVal !== 1) {
        return apiResponse.error(400, `Feature "${key}" must be 0 or 1.`);
      }
      validUpdates[key] = numVal;
    }

    const keys = Object.keys(validUpdates);
    if (!keys.length) return apiResponse.error(400, "No features to update.");

    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    const values = [...Object.values(validUpdates), rid];

    const [result] = await pool.query(
      `UPDATE restaurant_features SET ${setClause} WHERE rid = ?`,
      values
    );

    if (!result.affectedRows) {
      // Row might not exist — auto-insert then retry
      await pool.query(
        "INSERT IGNORE INTO restaurant_features (rid) VALUES (?)",
        [rid]
      );
      await pool.query(
        `UPDATE restaurant_features SET ${setClause} WHERE rid = ?`,
        values
      );
    }

    return apiResponse.success(200, "Features updated!");
  } catch (error) {
    console.error("update_features error:", error);
    return apiResponse.error(500, "Internal Server Error");
  }
};

export default { get_features, update_features };
