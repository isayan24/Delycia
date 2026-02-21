import express from "express";
import sessionController from "../../../controller/v1/web/session.controller.js";

const router = express.Router();

/**
 * Session Management Routes
 * 
 * All routes require authentication (access token)
 */

// Get all active sessions for current user
router.get("/", sessionController.getUserSessions);

// Get current session status (for expiry warnings)
router.get("/status", sessionController.getSessionStatus);

// Extend current session
router.post("/extend", sessionController.extendSession);

// Logout from specific session
router.delete("/:sessionId", sessionController.logoutFromSession);

// Logout from all sessions except current
router.delete("/all/logout", sessionController.logoutFromAllSessions);

// Get session statistics (monitoring)
router.get("/stats/all", sessionController.getSessionStats);

export default router;
