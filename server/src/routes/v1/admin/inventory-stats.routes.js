import express from "express";
import inventoryStatsController from "../../../controller/v1/web/inventory-stats.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/:itemId", authMiddleware, inventoryStatsController.getItemStats);

export default router;
