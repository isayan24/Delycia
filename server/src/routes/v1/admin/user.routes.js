import express from "express";

import userController from "../../../controller/v1/web/user.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/", authMiddleware, userController.getAllUsers);

export default router;
