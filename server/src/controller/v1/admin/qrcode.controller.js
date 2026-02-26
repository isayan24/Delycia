import qrcodeModel from "../../../models/v1/admin/qrcode.model.js";

/**
 * Create tables for QR code generation (POST /admin/qr-codes/create-tables)
 * Simplified endpoint that only creates tables, doesn't store QR metadata
 */
const createTablesForQRCodes = async (req, res) => {
  try {
    const { rid, tables } = req.body;

    if (!rid || !tables || !Array.isArray(tables)) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields: rid and tables array",
        success: false,
      });
    }

    const response = await qrcodeModel.createTablesForQRCodes(rid, tables, req);
    res.status(response.status).json(response);
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      success: false,
    });
  }
};

export default { 
  createTablesForQRCodes
};
