import express from "express";

import tablesController from "../../../controller/v1/web/tables.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/", authMiddleware, tablesController.create_table);
router.patch("/", authMiddleware, tablesController.update_table);
router.delete("/", authMiddleware, tablesController.delete_table);

export default router;
