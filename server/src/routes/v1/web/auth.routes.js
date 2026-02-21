import authController from "../../../controller/v1/web/auth.controller.js";
import express from "express";
import { refreshRateLimiter, loginRateLimiter } from "../../../middlewares/rateLimiter.middleware.js";

const router = express.Router();

// Direct auth (used internally after magic link verification)
router.post("/handleAuth", loginRateLimiter, authController.handleAuth);

// Token refresh (with rate limiting)
router.post("/refresh", refreshRateLimiter, authController.refresh);

// Magic link authentication (with rate limiting)
router.post("/request-login-link", loginRateLimiter, authController.requestLoginLink);
router.get("/magic", authController.verifyMagicLink);

// Logout
router.post("/logout", authController.logout);

export default router;
