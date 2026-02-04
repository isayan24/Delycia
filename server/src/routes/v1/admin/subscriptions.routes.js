import express from "express";
import subscriptionsController from "../../../controller/v1/admin/subscriptions.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";

const router = express.Router();

// Get subscription details for a restaurant
router.get("/", authMiddleware, subscriptionsController.getSubscription);

// Get available subscription plans
router.get("/plans", authMiddleware, subscriptionsController.getPlans);

export default router;
