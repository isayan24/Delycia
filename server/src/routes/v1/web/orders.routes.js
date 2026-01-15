import ordersController from "../../../controller/v1/web/orders.controller.js";
import express from "express";
import authMiddleware from "../../../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/", authMiddleware, ordersController.get_orders);
router.post("/", authMiddleware, ordersController.create_orders);
export default router;
