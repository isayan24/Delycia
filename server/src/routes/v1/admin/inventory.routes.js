import express from "express";
import inventoryController from "../../../controller/v1/web/inventory.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, inventoryController.addItem);
router.post("/bulk", authMiddleware, inventoryController.bulkAddItemsOptimized);
router.patch("/", authMiddleware, inventoryController.updateItem);
router.delete("/", authMiddleware, inventoryController.deleteItem);

export default router;
