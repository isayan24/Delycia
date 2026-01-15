import express from "express";
import variantController from "../../../controller/v1/web/variant.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/", authMiddleware, variantController.ADD_VARIANT);
router.delete("/", authMiddleware, variantController.DELETE_VARIANT);
router.patch("/", authMiddleware, variantController.UPDATE_VARIANT);

export default router;
