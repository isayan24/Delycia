import express from "express";
import useController from "../../../controller/v1/web/user.controller.js";
import authMiddleware from "../../../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/", authMiddleware, useController.getUser);
router.get("/check", useController.checkUser);
router.get("/search", useController.getUserByName);
router.patch("/", authMiddleware, useController.updateUser);
router.delete("/", authMiddleware, useController.deleteUser);

export default router;
