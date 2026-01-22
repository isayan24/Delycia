import express from "express";

import userController from "../../../controller/v1/web/user.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/", authMiddleware, userController.getAllUsers);
router.patch("/", authMiddleware, userController.updateUser);
router.delete("/:uid", authMiddleware, userController.deleteStaff);

export default router;
