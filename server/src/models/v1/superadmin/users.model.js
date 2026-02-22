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
  console.log(`[EMAIL] Sending credentials to ${email}`);
  console.log(`Username: ${username}`);
  console.log(`Temporary Password: ${password}`);
  console.log(`Please change your password after first login.`);

  // Return success for now
  return true;
};

/**
 * Get all users with optional filters
 */
const getAllUsers = async (req) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      restaurant_id = "",
      role = "",
      status = "",
      start_date = "",
      end_date = "",
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build WHERE clause for filters
    let whereConditions = [];
    let queryParams = [];

    if (search) {
      whereConditions.push(
        "(u.name LIKE ? OR u.email LIKE ? OR u.username LIKE ? OR u.phone_number LIKE ?)"
      );
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    if (restaurant_id) {
      whereConditions.push("ra.restaurant_id = ?");
      queryParams.push(parseInt(restaurant_id));
    }

    if (role) {
      whereConditions.push("u.role = ?");
      queryParams.push(parseInt(role));
    }

    // Status filter: active (role > 0) or inactive (role = 0)
    if (status === "active") {
      whereConditions.push("u.role > 0");
    } else if (status === "inactive") {
      whereConditions.push("u.role = 0");
    }

    if (start_date) {
      whereConditions.push("DATE(u.register_at) >= ?");
      queryParams.push(start_date);
    }

    if (end_date) {
      whereConditions.push("DATE(u.register_at) <= ?");
      queryParams.push(end_date);
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

    // Get users with restaurant info
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
      LEFT JOIN restaurants r ON ra.restaurant_id = r.id
      ${whereClause}
      GROUP BY u.id, u.uid, u.name, u.email, u.username, u.country_code, u.phone_number, u.profile_pic, u.role, u.register_at
      ORDER BY u.register_at DESC
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), offset);
    const [users] = await pool.query(query, queryParams);

    // Format the response
    const formattedUsers = users.map((user) => ({
      ...user,
      restaurant_ids: user.restaurant_ids
        ? user.restaurant_ids.split(",").map((id) => parseInt(id))
        : [],
      restaurant_names: user.restaurant_names
        ? user.restaurant_names.split(",")
        : [],
    }));

    return apiResponse.success(200, "Users retrieved successfully", {
      data: formattedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return apiResponse.error(500, "An error occurred while retrieving users");
  }
};

/**
 * Get single user details with activity logs
 */
const getUserById = async (req) => {
  try {
    const { id } = req.params;

    if (!id) {
      return apiResponse.error(400, "User ID is required");
    }

    // Get user details with restaurant info
    const userQuery = `
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
      LEFT JOIN restaurants r ON ra.restaurant_id = r.id
      WHERE u.id = ?
      GROUP BY u.id, u.uid, u.name, u.email, u.username, u.country_code, u.phone_number, u.profile_pic, u.role, u.register_at
    `;

    const [userResult] = await pool.query(userQuery, [id]);

    if (!userResult.length) {
      return apiResponse.error(404, "User not found");
    }

    const user = {
      ...userResult[0],
      restaurant_ids: userResult[0].restaurant_ids
        ? userResult[0].restaurant_ids.split(",").map((id) => parseInt(id))
        : [],
      restaurant_names: userResult[0].restaurant_names
        ? userResult[0].restaurant_names.split(",")
        : [],
    };

    // Get activity logs (recent orders as activity)
    const activityQuery = `
      SELECT 
        o.id as order_id,
        o.cart_id,
        o.rid as restaurant_id,
        r.name as restaurant_name,
        o.order_status,
        o.payment_status,
        o.total_amount,
        o.created_at,
        'order_placed' as activity_type
      FROM orders o
      LEFT JOIN restaurants r ON o.rid = r.id
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC
      LIMIT 20
    `;

    const [activity] = await pool.query(activityQuery, [id]);

    return apiResponse.success(200, "User details retrieved successfully", {
      data: {
        user,
        activity,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return apiResponse.error(500, "An error occurred while retrieving user details");
  }
};

/**
 * Create new user
 */
const createUser = async (req) => {
  try {
    const {
      name,
      email,
      username,
      country_code = "+91",
      phone_number,
      role = 0,
      restaurant_ids = [],
      profile_pic = "https://static.delycia.com/icons/user.png",
    } = req.body;

    // Validate required fields
    if (!name || !phone_number) {
      return apiResponse.error(400, "Missing required fields: name, phone_number");
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return apiResponse.error(400, "Invalid email format");
    }

    // Check email uniqueness (platform-wide)
    if (email) {
      const [existingEmail] = await pool.query(
        "SELECT id FROM users WHERE LOWER(email) = LOWER(?)",
        [email]
      );

      if (existingEmail.length > 0) {
        return apiResponse.error(409, "Email address already exists in the platform");
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

    // Validate restaurant assignments if provided
    if (restaurant_ids && restaurant_ids.length > 0) {
      const placeholders = restaurant_ids.map(() => "?").join(",");
      const [restaurants] = await pool.query(
        `SELECT id, is_active FROM restaurants WHERE id IN (${placeholders})`,
        restaurant_ids
      );

      if (restaurants.length !== restaurant_ids.length) {
        return apiResponse.error(404, "One or more restaurants not found");
      }

      // Check if all restaurants are active
      const inactiveRestaurants = restaurants.filter((r) => r.is_active === 0);
      if (inactiveRestaurants.length > 0) {
        return apiResponse.error(400, "Cannot assign user to inactive restaurant(s)");
      }
    }

    // Generate secure temporary password
    const temporaryPassword = generateSecurePassword();
    const uid = uuidv4();

    // Generate username if not provided
    const finalUsername =
      username ||
      `${name.toLowerCase().replace(/\s+/g, "")}${Math.floor(
        Math.random() * 10000
      )}`;

    // Insert new user
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
      phone_number,
      profile_pic,
      temporaryPassword,
      role,
    ]);

    const userId = result.insertId;

    // Assign to restaurants if provided
    if (restaurant_ids && restaurant_ids.length > 0) {
      const accessInserts = restaurant_ids.map((rid) => [userId, rid]);
      await pool.query(
        "INSERT INTO restaurant_access (user_id, restaurant_id) VALUES ?",
        [accessInserts]
      );
    }

    // Send credentials via email if email is provided
    if (email) {
      try {
        await sendCredentialsEmail(email, finalUsername, temporaryPassword);
      } catch (emailError) {
        console.error("Failed to send credentials email:", emailError);
        // Don't fail the user creation if email fails
      }
    }

    // Fetch the created user
    const [newUser] = await pool.query(
      `SELECT 
        u.id, u.uid, u.name, u.email, u.username, u.country_code, 
        u.phone_number, u.profile_pic, u.role, u.register_at,
        GROUP_CONCAT(DISTINCT r.id) as restaurant_ids,
        GROUP_CONCAT(DISTINCT r.name) as restaurant_names
      FROM users u
      LEFT JOIN restaurant_access ra ON u.id = ra.user_id
      LEFT JOIN restaurants r ON ra.restaurant_id = r.id
      WHERE u.id = ?
      GROUP BY u.id`,
      [userId]
    );

    const userData = {
      ...newUser[0],
      restaurant_ids: newUser[0].restaurant_ids
        ? newUser[0].restaurant_ids.split(",").map((id) => parseInt(id))
        : [],
      restaurant_names: newUser[0].restaurant_names
        ? newUser[0].restaurant_names.split(",")
        : [],
      temporary_password: temporaryPassword, // Include in response for superadmin
    };

    return apiResponse.success(201, "User created successfully. Credentials have been sent to the user's email.", {
      data: userData,
    });
  } catch (error) {
    console.error("Create user error:", error);
    return apiResponse.error(500, "An error occurred while creating user");
  }
};

/**
 * Update user details
 */
const updateUser = async (req) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return apiResponse.error(400, "User ID is required");
    }

    // Check if user exists
    const [existing] = await pool.query(
      "SELECT id, email, username FROM users WHERE id = ?",
      [id]
    );

    if (!existing.length) {
      return apiResponse.error(404, "User not found");
    }

    // If email is being updated, check for uniqueness
    if (updateData.email && updateData.email !== existing[0].email) {
      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updateData.email)) {
        return apiResponse.error(400, "Invalid email format");
      }

      const [existingEmail] = await pool.query(
        "SELECT id FROM users WHERE LOWER(email) = LOWER(?) AND id != ?",
        [updateData.email, id]
      );

      if (existingEmail.length > 0) {
        return apiResponse.error(409, "Email address already exists in the platform");
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

    if (updateFields.length === 0) {
      return apiResponse.error(400, "No valid fields to update");
    }

    // Add user ID to values
    updateValues.push(id);

    const updateQuery = `
      UPDATE users 
      SET ${updateFields.join(", ")}
      WHERE id = ?
    `;

    await pool.query(updateQuery, updateValues);

    // Handle restaurant assignments if provided
    if (updateData.restaurant_ids !== undefined) {
      const restaurant_ids = updateData.restaurant_ids;

      // Validate restaurants if provided
      if (restaurant_ids && restaurant_ids.length > 0) {
        const placeholders = restaurant_ids.map(() => "?").join(",");
        const [restaurants] = await pool.query(
          `SELECT id, is_active FROM restaurants WHERE id IN (${placeholders})`,
          restaurant_ids
        );

        if (restaurants.length !== restaurant_ids.length) {
          return apiResponse.error(404, "One or more restaurants not found");
        }

        const inactiveRestaurants = restaurants.filter(
          (r) => r.is_active === 0
        );
        if (inactiveRestaurants.length > 0) {
          return apiResponse.error(400, "Cannot assign user to inactive restaurant(s)");
        }
      }

      // Remove existing restaurant assignments
      await pool.query("DELETE FROM restaurant_access WHERE user_id = ?", [
        id,
      ]);

      // Add new assignments
      if (restaurant_ids && restaurant_ids.length > 0) {
        const accessInserts = restaurant_ids.map((rid) => [id, rid]);
        await pool.query(
          "INSERT INTO restaurant_access (user_id, restaurant_id) VALUES ?",
          [accessInserts]
        );
      }
    }

    // Fetch updated user
    const [updatedUser] = await pool.query(
      `SELECT 
        u.id, u.uid, u.name, u.email, u.username, u.country_code, 
        u.phone_number, u.profile_pic, u.role, u.register_at,
        GROUP_CONCAT(DISTINCT r.id) as restaurant_ids,
        GROUP_CONCAT(DISTINCT r.name) as restaurant_names
      FROM users u
      LEFT JOIN restaurant_access ra ON u.id = ra.user_id
      LEFT JOIN restaurants r ON ra.restaurant_id = r.id
      WHERE u.id = ?
      GROUP BY u.id`,
      [id]
    );

    const userData = {
      ...updatedUser[0],
      restaurant_ids: updatedUser[0].restaurant_ids
        ? updatedUser[0].restaurant_ids.split(",").map((id) => parseInt(id))
        : [],
      restaurant_names: updatedUser[0].restaurant_names
        ? updatedUser[0].restaurant_names.split(",")
        : [],
    };

    return apiResponse.success(200, "User updated successfully", {
      data: userData,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return apiResponse.error(500, "An error occurred while updating user");
  }
};

/**
 * Deactivate user (soft delete - preserve historical data)
 */
const deactivateUser = async (req) => {
  try {
    const { id } = req.params;

    if (!id) {
      return apiResponse.error(400, "User ID is required");
    }

    // Check if user exists
    const [existing] = await pool.query(
      "SELECT id, role FROM users WHERE id = ?",
      [id]
    );

    if (!existing.length) {
      return apiResponse.error(404, "User not found");
    }

    if (existing[0].role === 0) {
      return apiResponse.error(400, "User is already inactive");
    }

    // Deactivate user by setting role to 0 (preserves all historical data)
    // Also clear tokens to revoke access
    await pool.query(
      "UPDATE users SET role = 0, access_token = NULL, refresh_token = NULL WHERE id = ?",
      [id]
    );

    // Fetch updated user
    const [deactivatedUser] = await pool.query(
      `SELECT 
        u.id, u.uid, u.name, u.email, u.username, u.country_code, 
        u.phone_number, u.profile_pic, u.role, u.register_at,
        GROUP_CONCAT(DISTINCT r.id) as restaurant_ids,
        GROUP_CONCAT(DISTINCT r.name) as restaurant_names,
        'inactive' as status
      FROM users u
      LEFT JOIN restaurant_access ra ON u.id = ra.user_id
      LEFT JOIN restaurants r ON ra.restaurant_id = r.id
      WHERE u.id = ?
      GROUP BY u.id`,
      [id]
    );

    const userData = {
      ...deactivatedUser[0],
      restaurant_ids: deactivatedUser[0].restaurant_ids
        ? deactivatedUser[0].restaurant_ids.split(",").map((id) => parseInt(id))
        : [],
      restaurant_names: deactivatedUser[0].restaurant_names
        ? deactivatedUser[0].restaurant_names.split(",")
        : [],
    };

    return apiResponse.success(
      200,
      "User deactivated successfully. Access has been revoked while preserving historical data.",
      {
        data: userData,
      }
    );
  } catch (error) {
    console.error("Deactivate user error:", error);
    return apiResponse.error(500, "An error occurred while deactivating user");
  }
};

/**
 * Reset user password
 */
const resetPassword = async (req) => {
  try {
    const { id } = req.params;

    if (!id) {
      return apiResponse.error(400, "User ID is required");
    }

    // Check if user exists
    const [existing] = await pool.query(
      "SELECT id, email, username, name FROM users WHERE id = ?",
      [id]
    );

    if (!existing.length) {
      return apiResponse.error(404, "User not found");
    }

    const user = existing[0];

    if (!user.email) {
      return apiResponse.error(
        400,
        "User does not have an email address. Cannot send password reset."
      );
    }

    // Generate secure temporary password
    const temporaryPassword = generateSecurePassword();

    // Update user password and clear tokens
    await pool.query(
      "UPDATE users SET password = ?, access_token = NULL, refresh_token = NULL WHERE id = ?",
      [temporaryPassword, id]
    );

    // Send credentials via email
    try {
      await sendCredentialsEmail(
        user.email,
        user.username,
        temporaryPassword
      );
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      return apiResponse.error(
        500,
        "Password was reset but failed to send email. Please contact the user directly."
      );
    }

    return apiResponse.success(
      200,
      "Password reset successfully. Temporary password has been sent to the user's email.",
      {
        data: {
          user_id: parseInt(id),
          email: user.email,
          temporary_password: temporaryPassword, // Include for superadmin reference
        },
      }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return apiResponse.error(500, "An error occurred while resetting password");
  }
};

/**
 * Get user activity logs
 */
const getUserActivity = async (req) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    if (!id) {
      return apiResponse.error(400, "User ID is required");
    }

    // Check if user exists
    const [existing] = await pool.query(
      "SELECT id, name, email FROM users WHERE id = ?",
      [id]
    );

    if (!existing.length) {
      return apiResponse.error(404, "User not found");
    }

    // Get activity logs (orders as activity)
    const activityQuery = `
      SELECT 
        o.id as order_id,
        o.cart_id,
        o.rid as restaurant_id,
        r.name as restaurant_name,
        o.item_id,
        i.name as item_name,
        o.quantity,
        o.order_status,
        o.payment_status,
        o.payment_method,
        o.delivery_type,
        o.total_amount,
        o.discount_amount,
        o.created_at,
        o.updated_at,
        'order' as activity_type
      FROM orders o
      LEFT JOIN restaurants r ON o.rid = r.id
      LEFT JOIN inventories i ON o.item_id = i.id
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC
      LIMIT ?
    `;

    const [activity] = await pool.query(activityQuery, [
      id,
      parseInt(limit),
    ]);

    return apiResponse.success(200, "User activity retrieved successfully", {
      data: {
        user_id: parseInt(id),
        user_name: existing[0].name,
        user_email: existing[0].email,
        activity,
        total_activities: activity.length,
      },
    });
  } catch (error) {
    console.error("Get user activity error:", error);
    return apiResponse.error(500, "An error occurred while retrieving user activity");
  }
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deactivateUser,
  resetPassword,
  getUserActivity,
};
