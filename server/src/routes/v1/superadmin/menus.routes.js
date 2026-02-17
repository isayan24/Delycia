import express from "express";
import menusController from "../../../controller/v1/superadmin/menus.controller.js";
import superadminMiddleware from "../../../middlewares/superadmin.middleware.js";
import { csrfProtection } from "../../../middlewares/csrf.middleware.js";
const router = express.Router();

// Menu management routes - all require superadmin access
router.get("/", superadminMiddleware, menusController.getAllMenus);
router.get("/items/:id", superadminMiddleware, menusController.getMenuItemById);
router.patch("/items/:id", csrfProtection, superadminMiddleware, menusController.updateMenuItem);
router.delete("/items/:id", csrfProtection, superadminMiddleware, menusController.deleteMenuItem);
router.post("/categories", csrfProtection, superadminMiddleware, menusController.createCategory);
router.patch("/bulk", csrfProtection, superadminMiddleware, menusController.bulkUpdateMenuItems);

export default router;
