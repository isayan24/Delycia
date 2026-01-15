import pool from "../../../config/db.connection.js";
import apiResponse from "../../../utils/apiResponse.js";
import others from "../../../utils/others.js";
let q, result;

const GET_VARIANTS = async (req) => {
  const { inventory_id } = req.query || {};

  if (!inventory_id) return apiResponse.error(400, "Data is missing!");
  try {
    [result] = await pool.query(
      "SELECT * FROM variants WHERE inventory_id  = ?",
      inventory_id
    );

    return apiResponse.success(200, "success", { variants: result });
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const ADD_VARIANT = async (req) => {
  try {
    const { inventory_id, name, price } = req.body;

    if (![inventory_id, name, price].every(Boolean))
      return apiResponse.error(400, "Data missing");

    if ((await others.getPower(req)) < 70)
      return apiResponse.error(401, "Unauthorized access!");

    q = "INSERT INTO variants (inventory_id, name, price) VALUES (?, ?, ?)";

    const [{ affectedRows }] = await pool.query(q, [inventory_id, name, price]);
    if (affectedRows < 1) {
      return apiResponse.error(400, result);
    }
    return apiResponse.success(201, "The item has been added!");
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const DELETE_VARIANT = async (req) => {
  try {
    let { id } = req.body;

    if (!id) return apiResponse.error(400, "Data is missing");

    if ((await others.getPower(req)) < 70)
      return apiResponse.error(401, "Unauthorized access!");

    const [{ affectedRows }] = await pool.query(
      "DELETE FROM variants WHERE id = ?",
      id
    );

    if (!affectedRows) return apiResponse.error(400, "No rows affected");

    return apiResponse.success(200, "The variant has been deleted!");
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

const UPDATE_VARIANT = async (req) => {
  try {
    const { id, ...params } = req.body;
    if (!id) return apiResponse.error(400, "Data is missing!");

    if ((await others.getPower(req)) < 70)
      return apiResponse.error(401, "Unauthorized access!");

    for (let key in params)
      if (!params[key] || key === "id") delete params[key]; // removing the empty params
    const values = Object.values(params);
    values.push(id);

    let setClause = Object.keys(params)
      .map((key) => `${key} = ?`)
      .join(",");

    q = `UPDATE variants SET ${setClause} WHERE id = ?`;

    const [{ affectedRows }] = await pool.query(q, values);
    if (affectedRows === 0) {
      return apiResponse.success(200, "No item found or no changes made.");
    }

    return apiResponse.success(200, "Variant updated successfully.");
  } catch (error) {
    return apiResponse.error(500, error.message);
  }
};

export default {
  GET_VARIANTS,
  ADD_VARIANT,
  UPDATE_VARIANT,
  DELETE_VARIANT,
};
