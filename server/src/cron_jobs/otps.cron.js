import pool from "../config/db.connection.js";

// All the otps that were generated 10 minutes ago will be deleted.
let q = "DELETE FROM otps WHERE created_at < NOW() - INTERVAL 10 MINUTE";
const deleteOtps = async (req, res) => {
  await pool.query(q);
  res.send("OK");
};

export default deleteOtps;
