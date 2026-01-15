import qrcodeModel from "../../../models/v1/app/qrcode.model.js";

const generateMenuQR = async (req, res) => {
  const { table_no, rid } = req.body;
  console.log(rid);
  const response = await qrcodeModel.generateMenuQR(table_no, rid);
  res.status(response.statusCode).json(response);
};

const generateMenuQRWS = async (table_no) => {
  const response = await qrcodeModel.generateMenuQR(table_no);
  return response;
};

const updateQR = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ status: false, message: "Missing code" });
  }

  const response = await qrcodeModel.updateQR(code);
  res.status(response.statusCode).json(response);
};

const checkQR = async (table_no, rid) => {
  const response = await qrcodeModel.checkQR(table_no);
  return response;
};

export default { generateMenuQR, generateMenuQRWS, updateQR, checkQR };
