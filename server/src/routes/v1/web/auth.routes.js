import authController from "../../../controller/v1/web/auth.controller.js";
import express from "express";

const router = express.Router();
router.post("/handleAuth", authController.handleAuth);
router.post("/refresh", authController.refresh);
router.post("/sendOTP", authController.sendOTP);
router.post("/verifyOTP", authController.verifyOTP);

export default router;
