import pool from "../config/db.connection.js";
import others from "../utils/others.js";
const verifyAdmin = async (req, res, next) => {
  const q = "SELECT * FROM users WHERE uid = ? ";
  const user = others.getUser(req);
  const [result] = await pool.query(q, user.uid);
  if (result.length === 0)
    return res.status(401).json({
      status: false,
      error: "You don't have administrative permission.",
    });
  next();
};

export default verifyAdmin;
