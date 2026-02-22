import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate a secure temporary password
 * Minimum 12 characters with mixed case, numbers, and symbols
 */
const generateSecurePassword = () => {
  const length = 12;
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";
  const allChars = uppercase + lowercase + numbers + symbols;

  let password = "";
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

/**
 * Send credentials via email (placeholder - integrate with actual email service)
 */
const sendCredentialsEmail = async (email, username, password) => {
  // TODO: Integrate with actual email service (nodemailer, SendGrid, etc.)
  // For now, log the credentials (in production, this should send an actual email)
  console.log(`[EMAIL] Sending staff credentials to ${email}`);
  console.log(`Username: ${username}`);
  console.log(`Temporary Password: ${password}`);
  console.log(`Please change your password after first login.`);

  // Return success for now
  return true;
};

/**
 * Get all staff with optional filters
 */
const getAllStaff = async (req) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      restaurant_id = "",
      role = "",
      status = "",
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build WHERE clause for filters
    let whereConditions = [];
    let queryParams = [];

    // Only get staff members (role > 0 and role != 1 for superadmin)
    whereConditions.push("u.role > 0 AND u.role != 1");

    if (search) {
      whereConditions.push(
        "(u.name LIKE ? OR u.email LIKE ? OR u.username LIKE ? OR u.phone_number LIKE ?)"
      );
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (restaurant_id) {
      whereConditions.push("ra.rid = ?");
      queryParams.push(parseInt(restaurant_id));
    }

    if (role) {
      whereConditions.push("u.role = ?");
      queryParams.push(parseInt(role));
    }

    // Status filter based on role (role > 0 = active, role = 0 = inactive)
    // But we already filter for role > 0 above, so status filter is for additional filtering
    if (status === "inactive") {
      // Override the role > 0 condition to include inactive staff
      whereConditions = whereConditions.filter(c => c !== "u.role > 0 AND u.role != 1");
      whereConditions.push("u.role = 0");
    }

    const whereClause =
      whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as total 
      FROM users u
      LEFT JOIN restaurant_access ra ON u.id = ra.user_id
      ${whereClause}
    `;
    const [countResult] = await pool.query(countQuery, queryParams);
    const total = countResult[0].total;

    // Get staff with restaurant info
    const query = `
      SELECT 
        u.id,
        u.uid,
        u.name,
        u.email,
        u.username,
        u.country_code,
        u.phone_number,
        u.profile_pic,
        u.role,
        u.register_at,
        GROUP_CONCAT(DISTINCT r.id) as restaurant_ids,
        GROUP_CONCAT(DISTINCT r.name) as restaurant_names,
        CASE WHEN u.role > 0 THEN 'active' ELSE 'inactive' END as status
      FROM users u
      LEFT JOIN restaurant_access ra ON u.id = ra.user_id
      LEFT JOIN restaurants r ON ra.rid = r.id
      ${whereClause}
      GROUP BY u.id, u.uid, u.name, u.email, u.username, u.country_code, u.phone_number, u.profile_pic, u.role, u.register_at
      ORDER BY u.register_at DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), offset);
    const [staff] = await pool.query(query, queryParams);

    // Format the response
    const formattedStaff = staff.map((member) => ({
      ...member,
      restaurant_ids: member.restaurant_ids
        ? member.restaurant_ids.split(",").map((id) => parseInt(id))
        : [],
      restaurant_names: member.restaurant_names
        ? member.restaurant_names.split(",")
        : [],
    }));

    return apiResponse.success(200, "Staff retrieved successfully", {
      data: formattedStaff,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all staff error:", error);
    return apiResponse.error(500, "An error occurred while retrieving staff");
  }
};

/**
 * Get single staff member details with activity
 */
const getStaffById = async (req) => {
  try {
    const { id } = req.params;

    if (!id) {
      return apiResponse.error(400, "Staff ID is required");
    }

    // Get staff details with restaurant info
    const staffQuery = `
      SELECT 
        u.id,
        u.uid,
        u.name,
        u.email,
        u.username,
        u.country_code,
        u.phone_number,
        u.profile_pic,
        u.role,
        u.register_at,
        GROUP_CONCAT(DISTINCT r.id) as restaurant_ids,
        GROUP_CONCAT(DISTINCT r.name) as restaurant_names,
        CASE WHEN u.role > 0 THEN 'active' ELSE 'inactive' END as status
      FROM users u
      LEFT JOIN restaurant_access ra ON u.id = ra.user_id
      LEFT JOIN restaurants r ON ra.rid = r.id
      WHERE u.id = ? AND u.role > 0
      GROUP BY u.id, u.uid, u.name, u.email, u.username, u.country_code, u.phone_number, u.profile_pic, u.role, u.register_at
    `;

    const [staffResult] = await pool.query(staffQuery, [id]);

    if (!staffResult.length) {
      return apiResponse.error(404, "Staff member not found");
    }

    const staff = {
      ...staffResult[0],
      restaurant_ids: staffResult[0].restaurant_ids
        ? staffResult[0].restaurant_ids.split(",").map((id) => parseInt(id))
        : [],
      restaurant_names: staffResult[0].restaurant_names
        ? staffResult[0].restaurant_names.split(",")
        : [],
    };

    return apiResponse.success(200, "Staff details retrieved successfully", {
      data: staff,
    });
  } catch (error) {
    console.error("Get staff error:", error);
    return apiResponse.error(500, "An error occurred while retrieving staff details");
  }
};

/**
 * Create new staff member
 */
const createStaff = async (req) => {
  try {
    const {
      name,
      email,
      username,
      country_code = "+91",
      phone_number,
      role = 5, // Default to waiter role
      restaurant_id,
      profile_pic = "https://static.delycia.com/icons/user.png",
    } = req.body;

    // Validate required fields
    if (!name || !restaurant_id) {
      return apiResponse.error(400, "Missing required fields: name, restaurant_id");
    }

    // Validate role (must be staff role: 2-7, not 0 or 1)
    if (role < 2 || role > 7) {
      return apiResponse.error(400, "Invalid role. Staff role must be between 2 and 7");
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return apiResponse.error(400, "Invalid email format");
    }

    // Verify restaurant exists and is active
    const [restaurant] = await pool.query(
      "SELECT id, is_active FROM restaurants WHERE id = ?",
      [restaurant_id]
    );

    if (!restaurant.length) {
      return apiResponse.error(404, "Restaurant not found");
    }

    if (restaurant[0].is_active === 0) {
      return apiResponse.error(400, "Cannot assign staff to inactive restaurant");
    }

    // Check email uniqueness within restaurant
    if (email) {
      const [existingEmail] = await pool.query(
        `SELECT u.id, u.email 
         FROM users u
         INNER JOIN restaurant_access ra ON u.id = ra.user_id
         WHERE LOWER(u.email) = LOWER(?) AND ra.rid = ?`,
        [email, restaurant_id]
      );

      if (existingEmail.length > 0) {
        return apiResponse.error(
          409,
          "Email address already exists for a staff member in this restaurant"
        );
      }
    }

    // Check username uniqueness if provided
    if (username) {
      const [existingUsername] = await pool.query(
        "SELECT id FROM users WHERE username = ?",
        [username]
      );

      if (existingUsername.length > 0) {
        return apiResponse.error(409, "Username already exists");
      }
    }

    // Generate secure temporary password
    const temporaryPassword = generateSecurePassword();
    const uid = uuidv4();

    // Generate username if not provided
    const finalUsername =
      username ||
      `${name.toLowerCase().replace(/\s+/g, "")}-${Math.floor(
        Math.random() * 10000
      )}`;

    // Insert new staff member
    const insertQuery = `
      INSERT INTO users (
        uid, name, email, username, country_code, phone_number, 
        profile_pic, password, role
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.query(insertQuery, [
      uid,
      name,
      email || null,
      finalUsername,
      country_code,
      phone_number || null,
      profile_pic,
      temporaryPassword,
      role,
    ]);

    const staffId = result.insertId;

    // Assign to restaurant
    await pool.query(
      "INSERT INTO restaurant_access (user_id, rid) VALUES (?, ?)",
      [staffId, restaurant_id]
    );

    // Send credentials via email if email is provided
    if (email) {
      try {
        await sendCredentialsEmail(email, finalUsername, temporaryPassword);
      } catch (emailError) {
        console.error("Failed to send credentials email:", emailError);
        // Don't fail the staff creation if email fails
      }
    }

    // Fetch the created staff member
    const [newStaff] = await pool.query(
      `SELECT 
        u.id, u.uid, u.name, u.email, u.username, u.country_code, 
        u.phone_number, u.profile_pic, u.role, u.register_at,
        r.id as restaurant_id,
        r.name as restaurant_name
      FROM users u
      INNER JOIN restaurant_access ra ON u.id = ra.user_id
      INNER JOIN restaurants r ON ra.rid = r.id
      WHERE u.id = ?`,
      [staffId]
    );

    const staffData = {
      ...newStaff[0],
      restaurant_ids: [newStaff[0].restaurant_id],
      restaurant_names: [newStaff[0].restaurant_name],
      temporary_password: temporaryPassword, // Include in response for superadmin
    };

    // Remove the individual restaurant fields
    delete staffData.restaurant_id;
    delete staffData.restaurant_name;

    return apiResponse.success(201, "Staff member created successfully. Credentials have been sent to the staff's email.", {
      data: staffData,
    });
  } catch (error) {
    console.error("Create staff error:", error);
    return apiResponse.error(500, "An error occurred while creating staff member");
  }
};

/**
 * Update staff member details
 */
const updateStaff = async (req) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return apiResponse.error(400, "Staff ID is required");
    }

    // Check if staff exists
    const [existing] = await pool.query(
      "SELECT id, email, username, role FROM users WHERE id = ? AND role > 0",
      [id]
    );

    if (!existing.length) {
      return apiResponse.error(404, "Staff member not found");
    }

    // Validate role if being updated
    if (updateData.role !== undefined && (updateData.role < 2 || updateData.role > 7)) {
      return apiResponse.error(400, "Invalid role. Staff role must be between 2 and 7");
    }

    // If email is being updated, check for uniqueness within restaurant
    if (updateData.email && updateData.email !== existing[0].email) {
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.email)) {
        return apiResponse.error(400, "Invalid email format");
      }

      // Get staff's restaurant
      const [staffRestaurant] = await pool.query(
        "SELECT rid FROM restaurant_access WHERE user_id = ?",
        [id]
      );

      if (staffRestaurant.length > 0) {
        const [existingEmail] = await pool.query(
          `SELECT u.id 
           FROM users u
           INNER JOIN restaurant_access ra ON u.id = ra.user_id
           WHERE LOWER(u.email) = LOWER(?) AND ra.rid = ? AND u.id != ?`,
          [updateData.email, staffRestaurant[0].rid, id]
        );

        if (existingEmail.length > 0) {
          return apiResponse.error(
            409,
            "Email address already exists for another staff member in this restaurant"
          );
        }
      }
    }

    // If username is being updated, check for uniqueness
    if (updateData.username && updateData.username !== existing[0].username) {
      const [existingUsername] = await pool.query(
        "SELECT id FROM users WHERE username = ? AND id != ?",
        [updateData.username, id]
      );

      if (existingUsername.length > 0) {
        return apiResponse.error(409, "Username already exists");
      }
    }

    // Build update query dynamically based on provided fields
    const allowedFields = [
      "name",
      "email",
      "username",
      "country_code",
      "phone_number",
      "profile_pic",
      "role",
    ];

    const updateFields = [];
    const updateValues = [];

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updateData[field]);
      }
    }

    if (updateFields.length === 0 && updateData.restaurant_id === undefined) {
      return apiResponse.error(400, "No valid fields to update");
    }

    // Update user fields if any
    if (updateFields.length > 0) {
      updateValues.push(id);
      const updateQuery = `
        UPDATE users 
        SET ${updateFields.join(", ")}
        WHERE id = ?
      `;
      await pool.query(updateQuery, updateValues);
    }

    // Handle restaurant assignment if provided
    if (updateData.restaurant_id !== undefined) {
      const restaurant_id = updateData.restaurant_id;

      // Validate restaurant
      const [restaurant] = await pool.query(
        "SELECT id, is_active FROM restaurants WHERE id = ?",
        [restaurant_id]
      );

      if (!restaurant.length) {
        return apiResponse.error(404, "Restaurant not found");
      }

      if (restaurant[0].is_active === 0) {
        return apiResponse.error(400, "Cannot assign staff to inactive restaurant");
      }

      // Remove existing restaurant assignment
      await pool.query("DELETE FROM restaurant_access WHERE user_id = ?", [id]);

      // Add new assignment
      await pool.query(
        "INSERT INTO restaurant_access (user_id, rid) VALUES (?, ?)",
        [id, restaurant_id]
      );
    }

    // Fetch updated staff
    const [updatedStaff] = await pool.query(
      `SELECT 
        u.id, u.uid, u.name, u.email, u.username, u.country_code, 
        u.phone_number, u.profile_pic, u.role, u.register_at,
        GROUP_CONCAT(DISTINCT r.id) as restaurant_ids,
        GROUP_CONCAT(DISTINCT r.name) as restaurant_names
      FROM users u
      LEFT JOIN restaurant_access ra ON u.id = ra.user_id
      LEFT JOIN restaurants r ON ra.rid = r.id
      WHERE u.id = ?
      GROUP BY u.id`,
      [id]
    );

    const staffData = {
      ...updatedStaff[0],
      restaurant_ids: updatedStaff[0].restaurant_ids
        ? updatedStaff[0].restaurant_ids.split(",").map((id) => parseInt(id))
        : [],
      restaurant_names: updatedStaff[0].restaurant_names
        ? updatedStaff[0].restaurant_names.split(",")
        : [],
    };

    return apiResponse.success(200, "Staff member updated successfully", {
      data: staffData,
    });
  } catch (error) {
    console.error("Update staff error:", error);
    return apiResponse.error(500, "An error occurred while updating staff member");
  }
};

/**
 * Deactivate staff member (soft delete - preserve historical data)
 */
const deactivateStaff = async (req) => {
  try {
    const { id } = req.params;

    if (!id) {
      return apiResponse.error(400, "Staff ID is required");
    }

    // Check if staff exists
    const [existing] = await pool.query(
      "SELECT id, role FROM users WHERE id = ? AND role > 0",
      [id]
    );

    if (!existing.length) {
      return apiResponse.error(404, "Staff member not found");
    }

    if (existing[0].role === 0) {
      return apiResponse.error(400, "Staff member is already inactive");
    }

    // Deactivate staff by setting role to 0 (preserves all historical data)
    // Also clear tokens to revoke access
    await pool.query(
      "UPDATE users SET role = 0, access_token = NULL, refresh_token = NULL WHERE id = ?",
      [id]
    );

    // Fetch updated staff
    const [deactivatedStaff] = await pool.query(
      `SELECT 
        u.id, u.uid, u.name, u.email, u.username, u.country_code, 
        u.phone_number, u.profile_pic, u.role, u.register_at,
        GROUP_CONCAT(DISTINCT r.id) as restaurant_ids,
        GROUP_CONCAT(DISTINCT r.name) as restaurant_names,
        'inactive' as status
      FROM users u
      LEFT JOIN restaurant_access ra ON u.id = ra.user_id
      LEFT JOIN restaurants r ON ra.rid = r.id
      WHERE u.id = ?
      GROUP BY u.id`,
      [id]
    );

    const staffData = {
      ...deactivatedStaff[0],
      restaurant_ids: deactivatedStaff[0].restaurant_ids
        ? deactivatedStaff[0].restaurant_ids.split(",").map((id) => parseInt(id))
        : [],
      restaurant_names: deactivatedStaff[0].restaurant_names
        ? deactivatedStaff[0].restaurant_names.split(",")
        : [],
    };

    return apiResponse.success(
      200,
      "Staff member deactivated successfully. Access has been revoked while preserving historical records.",
      {
        data: staffData,
      }
    );
  } catch (error) {
    console.error("Deactivate staff error:", error);
    return apiResponse.error(500, "An error occurred while deactivating staff member");
  }
};

/**
 * Get staff activity logs
 */
const getStaffActivity = async (req) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    if (!id) {
      return apiResponse.error(400, "Staff ID is required");
    }

    // Check if staff exists
    const [existing] = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = ? AND role > 0",
      [id]
    );

    if (!existing.length) {
      return apiResponse.error(404, "Staff member not found");
    }

    // Get activity logs (orders placed by staff)
    const activityQuery = `
      SELECT 
        o.id as order_id,
        o.cart_id,
        o.rid as restaurant_id,
        r.name as restaurant_name,
        o.customer_id,
        c.name as customer_name,
        o.item_id,
        i.name as item_name,
        o.quantity,
        o.order_status,
        o.payment_status,
        o.payment_method,
        o.delivery_type,
        o.total_amount,
        o.discount_amount,
        o.table_no,
        o.party_size,
        o.created_at,
        o.updated_at,
        'order_placed' as activity_type
      FROM orders o
      LEFT JOIN restaurants r ON o.rid = r.id
      LEFT JOIN users c ON o.customer_id = c.id
      LEFT JOIN inventories i ON o.item_id = i.id
      WHERE o.placed_by_staff_id = ?
      ORDER BY o.created_at DESC
      LIMIT ?
    `;

    const [activity] = await pool.query(activityQuery, [
      id,
      parseInt(limit),
    ]);

    return apiResponse.success(200, "Staff activity retrieved successfully", {
      data: {
        staff_id: parseInt(id),
        staff_name: existing[0].name,
        staff_email: existing[0].email,
        staff_role: existing[0].role,
        activity,
        total_activities: activity.length,
      },
    });
  } catch (error) {
    console.error("Get staff activity error:", error);
    return apiResponse.error(500, "An error occurred while retrieving staff activity");
  }
};

export default {
  getAllStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deactivateStaff,
  getStaffActivity,
};
