import express from "express";
import authController from "../../../controller/v1/web/auth.controller.js";
const router = express.Router();

router.post("/login", authController.admin_login);
router.post("/waiter-auth", authController.waiter_auth);
router.post("/create-admin", authController.create_admin);

export default router;
