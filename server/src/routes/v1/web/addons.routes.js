import express from "express";
import addonsController from "../../../controller/v1/web/addons.controller.js";
const router = express.Router();

router.get("/inventory", addonsController.getAddonsForItem)
router.post("/link-order", addonsController.linkAddonsToOrder);

export default router;