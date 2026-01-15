import qrcodes from "../../../utils/qrcodes.js";
import pool from "../../../config/db.connection.js";
import app from "../../../app.js";
let q, result;

const generateMenuQR = async (table_no, rid) => {
  try {
    if (!table_no || !rid)
      return { status: false, statusCode: 400, error: "Data is missing!" };

    // Check if QR Code not exist
    q = "SELECT * FROM qr_codes WHERE table_no = ? AND status = 0 LIMIT 1";
    [result] = await pool.query(q, table_no);
    if (result.length > 0)
      return { status: true, statusCode: 200, QRCode: result[0].url };

    const QRData = await qrcodes.generate(rid, table_no);

    if (!QRData.status)
      return { status: false, statusCode: 500, error: QRData.error };

    q = `INSERT INTO qr_codes (id, table_no, url, rid) VALUES (?, ?, ?, ?)`;

    [result] = await pool.query(q, [QRData.id, table_no, QRData.URL, rid]);

    if (result.affectedRows === 0)
      return {
        status: false,
        statusCode: 400,
        error: "Faild to create the QRCODE",
      };

    return { status: true, statusCode: 201, QRCode: QRData.URL };
  } catch (error) {
    return { status: false, statusCode: 500, error: error.message };
  }
};

const updateQR = async (code) => {
  console.log("Update called : ", code);
  if (!code)
    return {
      status: false,
      statusCode: 400,
      message: "Data missing update QR",
    };
  const q = "UPDATE qr_codes SET status = 1 WHERE id = ? AND status = 0";
  let [result] = await pool.query(q, [code]);

  if (result.affectedRows > 0) {
    const [row] = await pool.query("SELECT * FROM qr_codes WHERE id = ?", [
      code,
    ]);

    [result] = await pool.query(
      "SELECT * FROM qr_codes WHERE table_no = ? AND rid = ? AND status = 0",
      [row[0].table_no, row[0].rid]
    );

    app.io.of("/check-qrcode").emit("qr_codes", { status: true, data: result });

    return { status: true, statusCode: 200, message: "QR ACTIVE" };
  } else {
    return { status: false, statusCode: 400, error: "INVALID REQUEST" };
  }
};

const checkQR = async (table_no, rid) => {
  try {
    const q =
      "SELECT * FROM QR_codes WHERE table_no = ? AND rid = ? AND status = 0";
    const [result] = await pool.query(q, [table_no, rid]);
    //console.log(result);
    if (result.length > 0) {
      return { status: true, data: result };
    } else {
      return { status: false, data: [] };
    }
  } catch (error) {
    return { status: false, data: [] };
  }
};

export default { generateMenuQR, updateQR, checkQR };
