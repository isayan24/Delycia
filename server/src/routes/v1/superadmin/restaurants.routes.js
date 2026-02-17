import express from "express";
import restaurantsController from "../../../controller/v1/superadmin/restaurants.controller.js";
import superadminMiddleware from "../../../middlewares/superadmin.middleware.js";
import { csrfProtection } from "../../../middlewares/csrf.middleware.js";
const router = express.Router();

// All restaurant management routes require superadmin access
router.get("/", superadminMiddleware, restaurantsController.getAllRestaurants);
router.post("/", csrfProtection, superadminMiddleware, restaurantsController.createRestaurant);
router.get("/:id", superadminMiddleware, restaurantsController.getRestaurantById);
router.patch("/:id", csrfProtection, superadminMiddleware, restaurantsController.updateRestaurant);
router.delete("/:id", csrfProtection, superadminMiddleware, restaurantsController.deactivateRestaurant);

export default router;
