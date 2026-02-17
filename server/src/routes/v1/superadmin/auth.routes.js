import express from "express";
import authController from "../../../controller/v1/superadmin/auth.controller.js";
import { loginRateLimiter } from "../../../middlewares/rateLimiter.middleware.js";
import { csrfProtection, getCsrfToken } from "../../../middlewares/csrf.middleware.js";
const router = express.Router();

// CSRF token endpoint - clients should call this before making state-changing requests
router.get("/csrf-token", getCsrfToken);

// Auth routes don't need superadmin middleware on login
// Logout will need it to ensure only authenticated superadmins can logout
// Apply rate limiting to login endpoint to prevent brute force attacks
// Apply CSRF protection to all state-changing operations
router.post("/login", csrfProtection, loginRateLimiter, authController.superadmin_login);
router.post("/logout", csrfProtection, authController.superadmin_logout);

export default router;
