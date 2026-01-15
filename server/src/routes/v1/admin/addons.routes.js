import express from "express";
import authMiddleware from "../../../middlewares/auth.middleware.js";
import addonsController from "../../../controller/v1/web/addons.controller.js";
const router = express.Router();

router.get("/", authMiddleware, addonsController.getAddons);
router.get("/inventory", authMiddleware, addonsController.getAddonsForItem);

router.post("/", authMiddleware, addonsController.createAddon);
router.post("/link-item", authMiddleware, addonsController.linkAddonsToItem);
router.post("/unlink-item", authMiddleware, addonsController.unlinkAddonsFromItem);
router.post("/link-order", authMiddleware, addonsController.linkAddonsToOrder);

router.patch("/", authMiddleware, addonsController.updateAddon);
router.delete("/", authMiddleware, addonsController.deleteAddon);

export default router;