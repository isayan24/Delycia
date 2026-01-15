import express from "express";
import voiceController from "../../../controller/v1/app/voice.controller.js";
const router = express.Router();

router.post("/", voiceController.speak);
router.post("/welcome", voiceController.welcome);

export default router;
