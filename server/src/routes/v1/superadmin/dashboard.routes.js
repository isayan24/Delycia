import express from "express";
import dashboardController from "../../../controller/v1/superadmin/dashboard.controller.js";
import superadminMiddleware from "../../../middlewares/superadmin.middleware.js";
const router = express.Router();

// Dashboard routes - all require superadmin access
router.get("/stats", superadminMiddleware, dashboardController.getStats);
router.get("/activity", superadminMiddleware, dashboardController.getRecentActivity);
router.get("/analytics", superadminMiddleware, dashboardController.getAnalytics);
router.get("/restaurants/:id/metrics", superadminMiddleware, dashboardController.getRestaurantMetrics);

export default router;
