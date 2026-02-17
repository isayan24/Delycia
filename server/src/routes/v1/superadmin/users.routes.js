import express from "express";
import usersController from "../../../controller/v1/superadmin/users.controller.js";
import superadminMiddleware from "../../../middlewares/superadmin.middleware.js";
import { csrfProtection } from "../../../middlewares/csrf.middleware.js";
const router = express.Router();

// User management routes - all require superadmin access
router.get("/", superadminMiddleware, usersController.getAllUsers);
router.post("/", csrfProtection, superadminMiddleware, usersController.createUser);
router.get("/:id", superadminMiddleware, usersController.getUserById);
router.patch("/:id", csrfProtection, superadminMiddleware, usersController.updateUser);
router.delete("/:id", csrfProtection, superadminMiddleware, usersController.deactivateUser);
router.post("/:id/reset-password", csrfProtection, superadminMiddleware, usersController.resetPassword);
router.get("/:id/activity", superadminMiddleware, usersController.getUserActivity);

export default router;
