import express from "express";

import tablesController from "../../../controller/v1/web/tables.controller.js";

const router = express.Router();

router.get("/", tablesController.get_all_tables);
router.get("/zones", tablesController.get_all_zone);

export default router;
