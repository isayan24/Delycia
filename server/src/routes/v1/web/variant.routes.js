import express from "express";
import variantController from "../../../controller/v1/web/variant.controller.js";
const router = express.Router();

router.get("/", variantController.GET_VARIANTS);

export default router;
