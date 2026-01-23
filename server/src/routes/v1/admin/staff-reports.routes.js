import express from "express";
import staffReportsController from "../../../controller/v1/admin/staff-reports.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";

const router = express.Router();

// Get staff performance leaderboard
router.get("/leaderboard", authMiddleware, staffReportsController.getStaffLeaderboard);

// Get individual staff orders
router.get("/:staffId/orders", authMiddleware, staffReportsController.getStaffOrders);

export default router;
