import express from "express";
import staffController from "../../../controller/v1/superadmin/staff.controller.js";
import superadminMiddleware from "../../../middlewares/superadmin.middleware.js";
import { csrfProtection } from "../../../middlewares/csrf.middleware.js";
const router = express.Router();

// Staff management routes - all require superadmin access
router.get("/", superadminMiddleware, staffController.getAllStaff);
router.post("/", csrfProtection, superadminMiddleware, staffController.createStaff);
router.get("/:id", superadminMiddleware, staffController.getStaffById);
router.patch("/:id", csrfProtection, superadminMiddleware, staffController.updateStaff);
router.delete("/:id", csrfProtection, superadminMiddleware, staffController.deactivateStaff);
router.delete("/:id/hard", csrfProtection, superadminMiddleware, staffController.deleteStaff);
router.get("/:id/activity", superadminMiddleware, staffController.getStaffActivity);

export default router;
