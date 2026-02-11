import authController from "../../../controller/v1/web/auth.controller.js";
import express from "express";

const router = express.Router();

// Direct auth (used internally after magic link verification)
router.post("/handleAuth", authController.handleAuth);

// Token refresh
router.post("/refresh", authController.refresh);

// Magic link authentication
router.post("/request-login-link", authController.requestLoginLink);
router.get("/magic", authController.verifyMagicLink);

export default router;
