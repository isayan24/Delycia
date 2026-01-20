// dashboardRoutes.js

import express from "express";
import dashboardController from "../../../controller/v1/web/dashboard.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/", authMiddleware, dashboardController.getCompleteDashboard);

router.get(
  "/overview",
  authMiddleware,
  dashboardController.getDashboardOverview
);

router.get("/stats", authMiddleware, dashboardController.getDashboardStats);

router.get("/sales-trend", authMiddleware, dashboardController.getSalesTrend);

router.get(
  "/order-status",
  authMiddleware,
  dashboardController.getOrderStatusDistribution
);

router.get(
  "/top-items",
  authMiddleware,
  dashboardController.getTopSellingItems
);

router.get(
  "/inventory",
  authMiddleware,
  dashboardController.getInventoryLevels
);

router.get(
  "/revenue-by-category",
  authMiddleware,
  dashboardController.getRevenueByCategory
);

router.get(
  "/recent-orders",
  authMiddleware,
  dashboardController.getRecentOrders
);



router.get(
  "/delivery-types",
  authMiddleware,
  dashboardController.getDeliveryTypeDistribution
);

router.get(
  "/customer-orders",
  authMiddleware,
  dashboardController.getCustomerOrders
);

export default router;
