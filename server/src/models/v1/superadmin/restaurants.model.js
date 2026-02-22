import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";

/**
 * Get all restaurants with optional filters
 */
const getAllRestaurants = async (req) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      city = "",
      status = "",
    } = req.query;

    console.log(req.query, "query i am giving")

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build WHERE clause for filters
    let whereConditions = [];
    let queryParams = [];

    if (search) {
      whereConditions.push("(r.name LIKE ? OR r.email LIKE ? OR r.phone_number LIKE ?)");
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    if (city) {
      whereConditions.push("r.city LIKE ?");
      queryParams.push(`%${city}%`);
    }

    if (status) {
      whereConditions.push("r.is_active = ?");
      queryParams.push(status === "active" ? 1 : 0);
    }

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(" AND ")}`
      : "";

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM restaurants r 
      ${whereClause}
    `;
    const [countResult] = await pool.query(countQuery, queryParams);
    const total = countResult[0].total;

    // Get restaurants with subscription info
    const query = `
      SELECT 
        r.id,
        r.name,
        r.username,
        r.email,
        r.phone_number,
        r.address,
        r.city,
        r.state,
        r.pincode,
        r.is_active,
        r.created_at,
        sp.plan_name as subscription_plan_name,
        sa.id as subscription_assignment_id,
        sa.status as subscription_status
      FROM restaurants r
      LEFT JOIN subscriptions sa ON r.id = sa.restaurant_id AND sa.status = 'active'
      LEFT JOIN subscription_plans sp ON sa.plan_id = sp.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), offset);
    const [restaurants] = await pool.query(query, queryParams);

    return apiResponse.success(200, "Restaurants retrieved successfully", {
      data: restaurants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all restaurants error:", error);
    return apiResponse.error(500, "An error occurred while retrieving restaurants");
  }
};

/**
 * Get single restaurant details
 */
const getRestaurantById = async (req) => {
  try {
    const { id } = req.params;

    if (!id) {
      return apiResponse.error(400, "Restaurant ID is required");
    }

    // Get restaurant details with subscription info
    const query = `
      SELECT 
        r.*,
        sp.plan_name as subscription_plan_name,
        sp.price as subscription_price,
        sp.billing_period as subscription_billing_period,
        sa.id as subscription_assignment_id,
        sa.start_date as subscription_start_date,
        sa.end_date as subscription_end_date,
        sa.status as subscription_status,
        sa.auto_renew as subscription_auto_renew,
        (SELECT COUNT(*) FROM users WHERE JSON_CONTAINS(restaurant_rids, CAST(r.id AS JSON))) as user_count,
        (SELECT COUNT(*) FROM inventories WHERE rid = r.id) as menu_item_count,
        (SELECT COUNT(*) FROM orders WHERE rid = r.id AND payment_status = 'completed' AND DATE(created_at) = CURDATE()) as orders_today
      FROM restaurants r
      LEFT JOIN subscriptions sa ON r.id = sa.restaurant_id AND sa.status = 'active'
      LEFT JOIN subscription_plans sp ON sa.plan_id = sp.id
      WHERE r.id = ?
    `;

    const [result] = await pool.query(query, [id]);

    if (!result.length) {
      return apiResponse.error(404, "Restaurant not found");
    }

    return apiResponse.success(200, "Restaurant details retrieved successfully", {
      data: result[0],
    });
  } catch (error) {
    console.error("Get restaurant error:", error);
    return apiResponse.error(500, "An error occurred while retrieving restaurant details");
  }
};

/**
 * Create new restaurant
 */
const createRestaurant = async (req) => {
  try {
    const {
      name,
      username,
      email,
      phone_number,
      address,
      city,
      state,
      pincode,
      fssai_license = "",
      is_veg_only = 0,
      description = "",
      logo = null,
      banner = null,
      tax_percent = 5,
      latitude = null,
      longitude = null,
      commission_percent = 15,
      online_orders = 0,
      open_time = "10:00:00",
      close_time = "22:00:00",
      active_days = 127,
    } = req.body;

    // Validate required fields
    if (!name || !phone_number || !email || !address || !city || !state || !pincode) {
      return apiResponse.error(400, "Missing required fields: name, phone_number, email, address, city, state, pincode");
    }
    console.log("Step 0 complete \n\n\n\n\n\n\n")


    // Check if restaurant name already exists (case-insensitive)
    const [existingName] = await pool.query(
      "SELECT id FROM restaurants WHERE LOWER(name) = LOWER(?)",
      [name]
    );

    if (existingName.length > 0) {
      return apiResponse.error(409, "Restaurant name already exists");
    }

    // Check if username already exists (if provided)
    if (username) {
      const [existingUsername] = await pool.query(
        "SELECT id FROM restaurants WHERE username = ?",
        [username]
      );

      if (existingUsername.length > 0) {
        return apiResponse.error(409, "Username already exists");
      }
    }


    // Insert new restaurant
    const insertQuery = `
      INSERT INTO restaurants (
        name, username, email, phone_number, address, city, state, pincode,
        fssai_license, is_veg_only, description, logo, banner, tax_percent,
        latitude, longitude, commission_percent, is_active, online_orders,
        open_time, close_time, active_days
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(insertQuery, [
      name,
      username || null,
      email,
      phone_number,
      address,
      city,
      state,
      pincode,
      fssai_license,
      is_veg_only,
      description,
      logo,
      banner,
      tax_percent,
      latitude,
      longitude,
      commission_percent,
      online_orders,
      open_time,
      close_time,
      active_days,
    ]);

    // Fetch the created restaurant
    const [newRestaurant] = await pool.query(
      "SELECT * FROM restaurants WHERE id = ?",
      [result.insertId]
    );

    return apiResponse.success(201, "Restaurant created successfully", {
      data: newRestaurant[0],
    });
  } catch (error) {
    console.error("Create restaurant error:", error);
    return apiResponse.error(500, "An error occurred while creating restaurant");
  }
};

/**
 * Update restaurant details
 */
const updateRestaurant = async (req) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return apiResponse.error(400, "Restaurant ID is required");
    }

    // Check if restaurant exists
    const [existing] = await pool.query(
      "SELECT id, name FROM restaurants WHERE id = ?",
      [id]
    );

    if (!existing.length) {
      return apiResponse.error(404, "Restaurant not found");
    }

    // If name is being updated, check for uniqueness
    if (updateData.name && updateData.name !== existing[0].name) {
      const [existingName] = await pool.query(
        "SELECT id FROM restaurants WHERE LOWER(name) = LOWER(?) AND id != ?",
        [updateData.name, id]
      );

      if (existingName.length > 0) {
        return apiResponse.error(409, "Restaurant name already exists");
      }
    }

    // If username is being updated, check for uniqueness
    if (updateData.username) {
      const [existingUsername] = await pool.query(
        "SELECT id FROM restaurants WHERE username = ? AND id != ?",
        [updateData.username, id]
      );

      if (existingUsername.length > 0) {
        return apiResponse.error(409, "Username already exists");
      }
    }

    // Build update query dynamically based on provided fields
    const allowedFields = [
      "name", "username", "email", "phone_number", "address", "city", "state",
      "pincode", "fssai_license", "is_veg_only", "description", "logo", "banner",
      "tax_percent", "latitude", "longitude", "commission_percent", "is_active",
      "online_orders", "open_time", "close_time", "active_days"
    ];

    const updateFields = [];
    const updateValues = [];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updateData[field]);
      }
    }

    if (updateFields.length === 0) {
      return apiResponse.error(400, "No valid fields to update");
    }

    // Add restaurant ID to values
    updateValues.push(id);

    const updateQuery = `
      UPDATE restaurants 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;

    await pool.query(updateQuery, updateValues);

    // Fetch updated restaurant
    const [updatedRestaurant] = await pool.query(
      "SELECT * FROM restaurants WHERE id = ?",
      [id]
    );

    return apiResponse.success(200, "Restaurant updated successfully", {
      data: updatedRestaurant[0],
    });
  } catch (error) {
    console.error("Update restaurant error:", error);
    return apiResponse.error(500, "An error occurred while updating restaurant");
  }
};

/**
 * Deactivate restaurant
 */
const deactivateRestaurant = async (req) => {
  try {
    const { id } = req.params;

    if (!id) {
      return apiResponse.error(400, "Restaurant ID is required");
    }

    // Check if restaurant exists
    const [existing] = await pool.query(
      "SELECT id, is_active FROM restaurants WHERE id = ?",
      [id]
    );

    if (!existing.length) {
      return apiResponse.error(404, "Restaurant not found");
    }

    if (existing[0].is_active === 0) {
      return apiResponse.error(400, "Restaurant is already inactive");
    }

    // Deactivate restaurant (soft delete - change status to inactive)
    await pool.query(
      "UPDATE restaurants SET is_active = 0 WHERE id = ?",
      [id]
    );

    // Fetch updated restaurant
    const [deactivatedRestaurant] = await pool.query(
      "SELECT * FROM restaurants WHERE id = ?",
      [id]
    );

    return apiResponse.success(200, "Restaurant deactivated successfully", {
      data: deactivatedRestaurant[0],
    });
  } catch (error) {
    console.error("Deactivate restaurant error:", error);
    return apiResponse.error(500, "An error occurred while deactivating restaurant");
  }
};

export default {
  getAllRestaurants,
  getRestaurantById,
  createRestaurant,
  updateRestaurant,
  deactivateRestaurant,
};
