import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";
import userValidations from "../../../validations/user.validations.js";
import others from "../../../utils/others.js";
import embeddingModel from "./embedding.model.js";

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

    await embeddingModel.restaurant(result.insertId);
    return apiResponse.success(201, "Created");
  } catch (error) {
    return apiResponse.error(500, error);
  }
};

const update_restaurant = async (req) => {
  try {
    const { id, ...params } = req.body;

    if (params.username && !userValidations.isValidUsername(params.username))
      return apiResponse.error(
        400,
        "Username can only contain letters (A-Z, a-z) and numbers (0-9). No special characters allowed."
      );

    if (!id || !Object.keys(params).length)
      return apiResponse.error(400, "ID or update fields missing!");

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

    const values = [...Object.values(params), id];
    const setClause = Object.keys(params)
      .map((key) => `${key} =?`)
      .join(",");

    const [{ changedRows }] = await pool.query(
      `UPDATE restaurants SET ${setClause} WHERE id = ?`,
      values
    );

    await embeddingModel.restaurant(id);
    return apiResponse.success(200, "Updated!");
  } catch (error) {
    return apiResponse.error(500, error);
  }
};

const get_restaurant = async (req, admin = true) => {
  try {
    const { rid } = req.query;

    if (admin) {
      if (!rid) return apiResponse.error(400, "Data is missing!");
    }

    let q, params;

    if (admin) {
      q = "SELECT * FROM restaurants WHERE id = ?";
      params = [rid];
    } else {
      if (rid) {
        q = `SELECT id,name,username,phone_number,email,address,city,state,pincode,
              is_veg_only,description,logo,banner,latitude,longitude,is_active 
              FROM restaurants WHERE id = ?`;
        params = [rid];
      } else {
        q = `SELECT id,name,username,phone_number,email,address,city,state,pincode,
              is_veg_only,description,logo,banner,latitude,longitude,is_active 
              FROM restaurants`;
        params = [];
      }
    }

    const [rows] = await pool.query(q, params);

    if (admin || rid) {
      const restaurant_info = admin ? rows[0] : rows[0];
      if (!restaurant_info) {
        return apiResponse.error(404, "Restaurant not found");
      }

      const [restaurant_hours] = await pool.query(
        "SELECT id, day_of_week, open_time, close_time FROM restaurant_hours WHERE rid = ?",
        [rid]
      );

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
