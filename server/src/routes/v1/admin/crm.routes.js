import express from "express";
import crmController from "../../../controller/v1/web/crm.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";

const router = express.Router();

router.get(
  "/list",
  authMiddleware,
  crmController.getRestaurantCustomers
);

router.get(
  "/stats",
  authMiddleware,
  crmController.getCRMStats
);

router.get(
  "/details",
  authMiddleware,
  crmController.getCustomerDetails
);

export default router;
