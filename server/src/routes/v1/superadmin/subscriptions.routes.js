import express from "express";
import subscriptionsController from "../../../controller/v1/superadmin/subscriptions.controller.js";
import superadminMiddleware from "../../../middlewares/superadmin.middleware.js";
import { csrfProtection } from "../../../middlewares/csrf.middleware.js";
const router = express.Router();

// Subscription plan management routes
router.get("/plans", superadminMiddleware, subscriptionsController.getAllPlans);
router.post("/plans", csrfProtection, superadminMiddleware, subscriptionsController.createPlan);
router.get("/plans/:id", superadminMiddleware, subscriptionsController.getPlanById);
router.patch("/plans/:id", csrfProtection, superadminMiddleware, subscriptionsController.updatePlan);
router.delete("/plans/:id", csrfProtection, superadminMiddleware, subscriptionsController.deactivatePlan);
router.get("/plans/:id/stats", superadminMiddleware, subscriptionsController.getPlanStats);

// Subscription assignment routes
router.post("/assignments", csrfProtection, superadminMiddleware, subscriptionsController.assignPlan);
router.get("/assignments/:restaurantId", superadminMiddleware, subscriptionsController.getRestaurantSubscription);
router.patch("/assignments/:id", csrfProtection, superadminMiddleware, subscriptionsController.changePlan);
router.get("/assignments/:restaurantId/history", superadminMiddleware, subscriptionsController.getSubscriptionHistory);

export default router;
