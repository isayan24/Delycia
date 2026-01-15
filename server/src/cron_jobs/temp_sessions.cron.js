import pool from "../config/db.connection.js";

const deleteSessions = async (re, res) => {
  const q =
    "DELETE FROM temp_sessions WHERE login_at < NOW() - INTERVAL 1 HOUR";
  const result = await pool.query(q);
  console.log(result);
  res.send("Okay");
};

export default deleteSessions;
