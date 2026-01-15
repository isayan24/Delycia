import express from "express";
import tempSessionConroller from "../../../controller/v1/app/temp.session.controller.js";
const router = express.Router();

router.post("/", tempSessionConroller.createTempSession);

export default router;
