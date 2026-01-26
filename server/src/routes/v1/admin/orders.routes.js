import ordersController from "../../../controller/v1/web/orders.controller.js";
import express from "express";
import authMiddleware from "../../../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/", authMiddleware, ordersController.get_all_orders);
router.get("/history", authMiddleware, ordersController.get_paginated_orders);
router.patch("/", authMiddleware, ordersController.update_orders);
router.post("/merge", authMiddleware, ordersController.merge_orders);
router.delete("/", authMiddleware, ordersController.delete_order);
export default router;
