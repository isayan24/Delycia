import express from "express";
import inventoryController from "../../../controller/v1/web/inventory.controller.js";

const router = express.Router();

router.get("/", inventoryController.getItems);
router.get("/get-quickaddons-list", inventoryController.getRecommendedList);
export default router;
