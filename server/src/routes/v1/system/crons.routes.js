import express from "express";
import deleteOtps from "../../../cron_jobs/otps.cron.js";
import deleteSessions from "../../../cron_jobs/temp_sessions.cron.js";
import updateTableStatus from "../../../cron_jobs/tables.cron.js";
import { checkPlanExpiry, checkLowStock, checkOutOfStock, cleanupNotifications } from "../../../cron_jobs/notification.cron.js";
import dbInit from "../../../config/db.Init.js";
const router = express.Router();

router.get("/otps", deleteOtps);
router.get("/deleteSessions", deleteSessions);
router.get("/dbInit", dbInit);
router.get("/updateTableStatus", updateTableStatus);
// Notification Checks
router.get("/notifications/check-expiry", checkPlanExpiry);
router.get("/notifications/check-low-stock", checkLowStock);
router.get("/notifications/check-out-of-stock", checkOutOfStock);
router.get("/notifications/cleanup", cleanupNotifications);

export default router;
