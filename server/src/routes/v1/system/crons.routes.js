import express from "express";
import deleteOtps from "../../../cron_jobs/otps.cron.js";
import deleteSessions from "../../../cron_jobs/temp_sessions.cron.js";
import updateTableStatus from "../../../cron_jobs/tables.cron.js";
import dbInit from "../../../config/db.Init.js";
const router = express.Router();

router.get("/otps", deleteOtps);
router.get("/deleteSessions", deleteSessions);
router.get("/dbInit", dbInit);
router.get("/updateTableStatus", updateTableStatus);
export default router;
