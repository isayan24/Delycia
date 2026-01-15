import express from "express";
import restaurantsController from "../../../controller/v1/web/restaurants.controller.js";

const router = express.Router();
router.get("/", restaurantsController.get_restaurant);

export default router;
