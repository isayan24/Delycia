import expres from "express";
import qrcodeController from "../../../controller/v1/app/qrcode.controller.js";

const router = expres.Router();

router.post("/", qrcodeController.generateMenuQR);
router.patch("/", qrcodeController.updateQR);

export default router;
