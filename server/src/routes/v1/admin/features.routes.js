import express from "express";
import featuresController from "../../../controller/v1/web/features.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, featuresController.get_features);
router.patch("/", authMiddleware, featuresController.update_features);

export default router;
