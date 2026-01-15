import { query } from "express";
import pool from "../../../config/db.connection.js";
import app from "../../../app.js";
import fs from "fs";
import path from "path";
let q, result;

const createTempSession = async (req) => {
  try {
    const { code, user_id } = req.body;

    // Checking the QRcode data
    q = "SELECT * FROM qr_codes WHERE id = ? AND status = 1 LIMIT 1";
    [result] = await pool.query(q, code);

    if (result.length === 0)
      return { status: false, statusCode: 400, message: "Invlaid entry" };
    const table_no = result[0].table_no;
    const rid = result[0].rid;

    // Deleting existing session if any
    await pool.query(`DELETE from temp_sessions WHERE user_id = ${user_id} `);
    // creating the sessions
    q = "INSERT INTO temp_sessions (user_id, table_no, rid) VALUES (?, ?, ?)";
    [result] = await pool.query(q, [user_id, table_no, rid]);

    if (result.affectedRows === 0)
      return {
        status: false,
        statusCode: 400,
        error: "Unable to create the session",
      };

    // Clearing the Expired QR code
    q = "DELETE FROM qr_codes WHERE id = ?";
    await pool.query(q, code);
    q = "SELECT name FROM users WHERE id = ?";
    [result] = await pool.query(q, user_id);
    // Refreshing the WS
    app.io.of("/get-temp-sessions").emit("temp_sessions_refresh");
    const filePath = path.join(
      process.cwd(),
      "public",
      "qrcodes",
      code + ".png"
    );

    app.io
      .of("/get-temp-sessions")
      .emit("temp_session_login", { name: result[0].name, table_no });
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("Error deleting QR:", err);
      }
    });
    return { status: true, statusCode: 201, message: "Session created" };
  } catch (error) {
    return {
      status: false,
      statusCode: 500,
      error: error.message,
    };
  }
};

const getTempSessions = async (table_no) => {
  try {
    const q = `
  SELECT 
    t.*, 
    u.name, 
    u.profile_pic 
  FROM temp_sessions t
  JOIN users u ON t.user_id = u.id
  WHERE t.table_no = ?
`;

    result = await pool.query(q, table_no);

    return { status: true, type: "temp_sessions", sessions: result };
  } catch (error) {
    return { status: false, type: "temp_sessions", error: error.message };
  }
};

export default { createTempSession, getTempSessions };
