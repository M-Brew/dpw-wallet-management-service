import { Router } from "express";

import walletController from "../controllers/walletController";

const router = Router();

router.post("/create", walletController.createWallet);

router.get("/:walletId", walletController.getWallet);

router.get("/user/:userId", walletController.getUserWallet);

router.post("/update", walletController.updateWallet);

router.patch("/updateStatus", walletController.updateWalletStatus);

export default router;
