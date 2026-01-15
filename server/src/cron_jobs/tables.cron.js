import pool from "../config/db.connection.js";

const updateTableStatus = async (re, res) => {
  const q =
    "UPDATE tables SET status = 'available' WHERE updated_at < NOW() - INTERVAL 1 HOUR;";
  const result = await pool.query(q);
  console.log(result);
  res.send("Okay");
};

export default updateTableStatus;
