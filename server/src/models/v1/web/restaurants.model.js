import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";
import userValidations from "../../../validations/user.validations.js";
import others from "../../../utils/others.js";
import embeddingModel from "./embedding.model.js";
import { isTodayScheduled, getTodayIST } from "../../../helpers/restaurant-status.helper.js";

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;

const create_restaurant = async (req) => {
  try {
    const {
      name,
      username,
      phone_number,
      address,
      city,
      state,
      pincode,
      tax_percent,
    } = req.body;

    if (
      ![
        name,
        username,
        phone_number,
        address,
        city,
        state,
        pincode,
        tax_percent,
      ].every(Boolean)
    )
      return apiResponse.error(400, "Data Missing!");

    if (!userValidations.isValidUsername(username))
      return apiResponse.error(
        400,
        "Username can only contain letters (A-Z, a-z) and numbers (0-9). No special characters allowed."
      );

    const power = await others.getPower(req);
    if (power < 90) return apiResponse.error(401, "Unauthorized access!");

    const [[existing]] = await pool.query(
      "SELECT username FROM restaurants WHERE username = ?",
      username
    );
    if (existing) return apiResponse.error(400, "The username already exists.");

    const q =
      "INSERT INTO restaurants (name, username, phone_number, address, city, state, pincode, tax_percent) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    const [result] = await pool.query(q, [
      name,
      username,
      phone_number,
      address,
      city,
      state,
      pincode,
      tax_percent,
    ]);

    if (!result.affectedRows)
      return apiResponse.error(400, "Unable to add the data!");

    setImmediate(async () => {
      if (result.insertId) {
        await embeddingModel.restaurant(result.insertId);
      }
    })
    return apiResponse.success(201, "Created");
  } catch (error) {
    return apiResponse.error(500, error);
  }
};

const update_restaurant = async (req) => {
  try {
    const { id, ...params } = req.body;
    const userId = req.user.id;

    if (!id) return apiResponse.error(400, "Restaurant ID is required!");

    // Verify ownership
    const [access] = await pool.query(
      "SELECT rid FROM restaurant_access WHERE user_id = ? AND rid = ?",
      [userId, id]
    );

    if (!access.length) {
      if (req.user.role < 90) {
        return apiResponse.error(403, "You do not have permission to update this restaurant.");
      }
    }

    // --- Field Validations ---

    if (params.username && !userValidations.isValidUsername(params.username))
      return apiResponse.error(
        400,
        "Username can only contain letters (A-Z, a-z) and numbers (0-9). No special characters allowed."
      );

    if (params.username) {
      const [[existing]] = await pool.query(
        "SELECT id FROM restaurants WHERE username = ? AND id != ?",
        [params.username, id]
      );

      if (existing)
        return apiResponse.error(
          400,
          "Username already in use by another restaurant."
        );
    }

    if (params.tax_percent !== undefined) {
      if (isNaN(params.tax_percent) || params.tax_percent < 0 || params.tax_percent > 100)
        return apiResponse.error(400, "Invalid tax percentage.");
    }

    // online_orders: must be 0 or 1
    if (params.online_orders !== undefined) {
      const val = Number(params.online_orders);
      if (val !== 0 && val !== 1)
        return apiResponse.error(400, "online_orders must be 0 or 1.");
      params.online_orders = val;
    }

    // open_time / close_time: must match HH:MM:SS
    if (params.open_time !== undefined) {
      if (typeof params.open_time !== "string" || !TIME_REGEX.test(params.open_time))
        return apiResponse.error(400, "open_time must be in HH:MM:SS format.");
    }
    if (params.close_time !== undefined) {
      if (typeof params.close_time !== "string" || !TIME_REGEX.test(params.close_time))
        return apiResponse.error(400, "close_time must be in HH:MM:SS format.");
    }

    // active_days: bitmask 0–127
    if (params.active_days !== undefined) {
      const val = Number(params.active_days);
      if (!Number.isInteger(val) || val < 0 || val > 127)
        return apiResponse.error(400, "active_days must be an integer between 0 and 127.");
      params.active_days = val;
    }

    // is_active: must be 0 or 1
    if (params.is_active !== undefined) {
      const val = Number(params.is_active);
      if (val !== 0 && val !== 1)
        return apiResponse.error(400, "is_active must be 0 or 1.");
      params.is_active = val;

      if (val === 1) {
        // Check if today is a scheduled day — if not, set manual override
        const [[currentRow]] = await pool.query(
          "SELECT active_days FROM restaurants WHERE id = ?",
          [id]
        );
        if (currentRow && !isTodayScheduled(currentRow.active_days)) {
          params.manual_override_date = getTodayIST();
        }
      } else {
        // Turning off — closed for today only, schedule resumes tomorrow
        params.manual_override_date = getTodayIST();
      }
    }

    // is_veg_only: must be 0 or 1
    if (params.is_veg_only !== undefined) {
      const val = Number(params.is_veg_only);
      if (val !== 0 && val !== 1)
        return apiResponse.error(400, "is_veg_only must be 0 or 1.");
      params.is_veg_only = val;
    }

    // --- Build and execute update ---

    const keys = Object.keys(params);
    if (!keys.length) return apiResponse.error(400, "No fields to update.");

    const setClause = keys.map((key) => `${key} = ?`).join(", ");
    const values = [...Object.values(params), id];

    const [{ changedRows }] = await pool.query(
      `UPDATE restaurants SET ${setClause} WHERE id = ?`,
      values
    );
    setImmediate(async () => {
      if (changedRows > 0) {
        await embeddingModel.restaurant(id);
      }
    })
    return apiResponse.success(200, "Updated!");
  } catch (error) {
    return apiResponse.error(500, error);
  }
};

const get_restaurant = async (req, admin = true) => {
  try {
    let { rid, username } = req.query;

    // Priority: rid > username
    // If no rid but username is provided, resolve username to rid
    if (!rid && username) {
      const [[restaurant]] = await pool.query(
        "SELECT id FROM restaurants WHERE username = ?",
        [username]
      );

      if (!restaurant) {
        return apiResponse.error(404, "Restaurant not found");
      }

      rid = restaurant.id;
    }

    if (admin) {
      const userId = req.user.id;

      // If rid is provided, verify access
      if (rid) {
        const [access] = await pool.query(
          "SELECT rid FROM restaurant_access WHERE user_id = ? AND rid = ?",
          [userId, rid]
        );
        if (!access.length && req.user.role < 90) {
          return apiResponse.error(403, "Access denied to this restaurant.");
        }
      } else {
        // Find first restaurant accessible
        const [access] = await pool.query(
          "SELECT rid FROM restaurant_access WHERE user_id = ? LIMIT 1",
          [userId]
        );

        if (access.length) {
          rid = access[0].rid;
        } else if (req.user.role < 90) {
          return apiResponse.error(404, "No restaurant found associated with this account.");
        }
      }
    }

    if (admin && !rid && req.user.role < 90) return apiResponse.error(400, "Restaurant ID missing or could not be determined!");


    let q, params;

    if (admin) {
      q = "SELECT * FROM restaurant_status WHERE id = ?";
      params = [rid];
    } else {
      if (rid) {
        q = `SELECT id,name,username,phone_number,email,address,city,state,pincode,
              is_veg_only,description,logo,banner,tax_percent,latitude,longitude,is_active,
              online_orders,open_time,close_time,active_days
              FROM restaurants WHERE id = ?`;
        params = [rid];
      } else {
        q = `SELECT id,name,username,phone_number,email,address,city,state,pincode,
              is_veg_only,description,logo,banner,tax_percent,latitude,longitude,is_active,
              online_orders,open_time,close_time,active_days
              FROM restaurants`;
        params = [];
      }
    }

    const [rows] = await pool.query(q, params);

    if (admin || rid) {
      const restaurant_info = rows[0];
      if (!restaurant_info) {
        return apiResponse.error(404, "Restaurant not found");
      }

      const [restaurant_hours] = await pool.query(
        "SELECT id, day_of_week, open_time, close_time FROM restaurant_hours WHERE rid = ?",
        [rid] // Corrected Use 'rid' variable not query id if it was derived
      );

      // If we derived rid, we should use it. Note: 'rid' variable is updated above if admin=true, but if admin=false it comes from query.
      // Wait, params[0] is the safe bet.
      // Actually my code above updates 'rid' local variable. So using 'rid' is safe if logic holds.
      // But let's use the one from the query to be safe: params[0] if admin.
      const targetRid = admin ? rid : (req.query.rid || restaurant_info.id);


      return apiResponse.success(200, "success", {
        restaurant_info,
        restaurant_hours,
      });
    } else {
      return apiResponse.success(200, "success", {
        restaurants: rows,
      });
    }
  } catch (error) {
    console.error("get_restaurant error:", error);
    return apiResponse.error(500, "Internal Server Error");
  }
};

export default { create_restaurant, update_restaurant, get_restaurant };
