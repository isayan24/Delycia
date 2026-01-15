import dataController from "../../../controller/v1/system/data.controller.js";

import express from "express";

const router = express.Router();

router.get("/", dataController.fetchUpsellItems);

export default router;
