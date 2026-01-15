import express from "express";
import searchController from "../../../controller/v1/web/search.controller.js";

const router = express.Router();

router.get("/", searchController.search);
router.get("/suggestions", searchController.suggestions);

export default router;
