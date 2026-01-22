import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";

// Delete existing user
const deleteUser = async (uid, password) => {
  let q = `SELECT password FROM users WHERE uid = ?`;
  let [result] = await pool.query(q, [uid]);

  if (result.length === 0) {
    return { status: false, error: "User not found." };
  }
  if (password != result[0].password) {
    return { status: false, error: "Invalid password." };
  }
  q = "DELETE FROM users WHERE uid = ?";
  return await pool.query(q, [uid]);
};

// Get User
const getUser = async (uid) => {
  let q, result;
  q = "SELECT * FROM users WHERE uid = ?";
  [result] = await pool.query(q, [uid]);
  if (result.length == 0) {
    return {
      status: false,
      error: "Unable to access user data. Please check the request!",
      uid,
    };
  }
  result = result[0];
  delete result.password;
  delete result.role;

  return { status: true, user: result };
};

// Get User By Name
const getUserByName = async (name) => {
  try {
    let q, result;
    // Use LIKE for prefix matching to support search-as-you-type
    q = "SELECT * FROM users WHERE name LIKE ?";
    [result] = await pool.query(q, [`${name}%`]);

    if (result.length == 0) {
      return {
        status: true,
        users: [],
        message: "No users found matching the search term",
      };
    }

    // Remove sensitive fields from all results
    const users = result.map(user => {
      delete user.password;
      delete user.role;
      return user;
    });

    return { status: true, users };
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

// Update user Info
const updateUser = async (data) => {
  try {
    const { uid, ...params } = data;

    // Remove undefined/null values from params
    Object.keys(params).forEach(key =>
      (params[key] === undefined || params[key] === null || params[key] === '') && delete params[key]
    );

    const updateFields = Object.keys(params);
    const updateValues = Object.values(params);

    if (updateFields.length === 0) {
      return apiResponse.success(200, "No changes provided.");
    }

    let [result] = await pool.query(
      `SELECT id FROM users WHERE uid = ?`,
      [uid]
    );

    if (!result.length) return apiResponse.error(400, "User not found.");

    const q = `UPDATE users SET ${updateFields.map(f => `${f} = ?`).join(", ")} WHERE uid = ?`;

    // Add uid to the end of values for the WHERE clause
    updateValues.push(uid);

    const [{ affectedRows }] = await pool.query(q, updateValues);

    if (affectedRows === 0) {
      return apiResponse.success(200, "No changes were made.");
    }
    return apiResponse.success(200, "Update successful.");
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const checkUser = async (phone_number) => {
  try {
    let [result] = await pool.query(
      "SELECT id FROM users WHERE CONCAT(country_code, phone_number) = ?",
      ["+" + phone_number]
    );
    return result.length
      ? apiResponse.success(200, "The user exists and is valid.", {
        user: { id: result[0].id },
      })
      : apiResponse.success(
        204,
        "The user you are trying to access does not exist."
      );
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const getAllUsers = async (req) => {
  try {
    const id = req?.query?.id;
    const rid = req?.query?.rid;
    const exclude_role = req?.query?.exclude_role;
    let q, result;

    if (id) {
      q = `SELECT id,uid,name,email,username, phone_number,profile_pic, role, register_at FROM users WHERE id = ${id}`;
      [result] = await pool.query(q);
    } else if (rid) {
      q = `SELECT u.id, u.uid, u.name, u.email, u.username, u.phone_number, u.profile_pic, u.role, u.register_at 
           FROM users u
           JOIN restaurant_access ra ON u.id = ra.user_id
           WHERE ra.rid = ?`;

      const params = [rid];
      if (exclude_role) {
        q += ` AND u.role != ?`;
        params.push(exclude_role);
      }

      [result] = await pool.query(q, params);
    } else {
      q = "SELECT id,uid,name,email,username, phone_number,profile_pic,register_at FROM users";
      [result] = await pool.query(q);
    }

    return apiResponse.success(200, { users: result });
  } catch (error) {
    return apiResponse.success(500, error.message);
  }
};

export default {
  deleteUser,
  updateUser,
  getUser,
  checkUser,
  getAllUsers,
  getUserByName,
};
