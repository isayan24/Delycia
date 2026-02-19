import express from "express";
import authController from "../../../controller/v1/web/auth.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/login", authController.admin_login);
router.post("/waiter-auth", authController.waiter_auth);
router.post("/create-admin", authController.create_admin);
router.post("/guest-customer", authMiddleware, authController.create_guest_customer);

export default router;
