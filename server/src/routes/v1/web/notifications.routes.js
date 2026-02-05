import express from "express";
import sanitizeInput from "../../../middlewares/sanitizeInputs.middleware.js";
import notificationsController from "../../../controller/v1/web/notifications.controller.js";

const router = express.Router();

// Get all notifications
router.get("/", sanitizeInput, notificationsController.getNotifications);

// Mark all as read
router.patch("/read-all", sanitizeInput, notificationsController.markAllAsRead);

// Mark as read
router.patch("/:id/read", sanitizeInput, notificationsController.markAsRead);

// Delete notification
router.delete("/:id", sanitizeInput, notificationsController.deleteNotification);

export default router;
