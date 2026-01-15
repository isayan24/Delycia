import pool from "../../../config/db.connection.js";

let q, result;

const fetchUpsellItems = async () => {
  q = "SELECT name, is_veg from inventory WHERE is_upsell = 1";
  [result] = await pool.query(q);
  console.log(result);
  return result;
};

export default { fetchUpsellItems };
