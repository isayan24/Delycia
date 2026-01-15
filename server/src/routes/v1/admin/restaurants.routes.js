import express from "express";
import restaurantsController from "../../../controller/v1/web/restaurants.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/", authMiddleware, restaurantsController.get_restaurant_admin);
router.post("/", authMiddleware, restaurantsController.create_restaurant);
router.patch("/", authMiddleware, restaurantsController.update_restaurant);

export default router;
