import express from "express";
import qrcodeController from "../../../controller/v1/admin/qrcode.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";

const router = express.Router();

// POST /admin/qr-codes/create-tables - Create tables for QR codes (simplified)
router.post("/create-tables", authMiddleware, qrcodeController.createTablesForQRCodes);

export default router;
