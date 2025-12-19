import { Router } from "express";

import walletController from "../controllers/walletController";

const router = Router();

router.post("/create", walletController.createWallet);

router.get("/:walletId", walletController.getWallet);

router.get("/user/:userId", walletController.getUserWallet);

router.get("/wallet/:nameOrWalletCode", walletController.getWalletByNameOrWalletCode);

router.post("/update", walletController.updateWallet);

router.patch("/updateStatus", walletController.updateWalletStatus);

router.patch("/add-contact", walletController.addContact);

router.patch("/remove-contact", walletController.removeContact);

export default router;
