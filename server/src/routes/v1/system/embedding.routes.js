import express from "express";
import embeddingController from "../../../controller/v1/system/embedding.controller.js";

const router = express.Router();

router.get("/inventory", embeddingController.inventory);
router.get("/category", embeddingController.category);
router.get("/restaurant", embeddingController.restaurant);

export default router;
