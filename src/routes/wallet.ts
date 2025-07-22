import { Router, Request, Response } from "express";

import {
  createWalletValidation,
  updateWalletValidation,
} from "../validation/walletValidation";
import Wallet from "../models/wallet.model";

const router = Router();

router.post("/create", async (req: Request, res: Response) => {
  try {
    const { userId, initialBalance, currency } = req.body;

    const { valid, errors } = createWalletValidation({
      userId,
      initialBalance,
      currency,
    });
    if (!valid) {
      return res.status(400).json({ errors });
    }

    const existingWallet = await Wallet.findOne({ user: userId });
    if (existingWallet) {
      return res.status(400).json({ error: "User has an existing wallet" });
    }

    const newWallet = new Wallet({
      user: userId,
      ...(initialBalance ? { balance: initialBalance } : {}),
      ...(currency ? { currency } : {}),
    });
    await newWallet.save();

    return res.status(201).json(newWallet);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

router.get("/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const wallet = await Wallet.findOne({ user: userId });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    return res.status(200).json(wallet);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

router.post("/update", async (req: Request, res: Response) => {
  try {
    const { userId, walletId, amount, transactionType } = req.body;

    const { valid, errors } = updateWalletValidation({
      userId,
      walletId,
      amount,
      transactionType,
    });
    if (!valid) {
      return res.status(400).json({ errors });
    }

    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    if (transactionType === "credit") {
      const updatedWallet = await Wallet.findByIdAndUpdate(
        walletId,
        { $inc: { balance: amount } },
        { new: true, useFindAndModify: false }
      );

      return res.status(200).json(updatedWallet);
    }

    if (transactionType === "debit") {
      if (wallet.balance < amount) {
        return res.status(400).json({ error: "Insufficient balance" });
      }

      const updatedWallet = await Wallet.findByIdAndUpdate(
        walletId,
        { $inc: { balance: -amount } },
        { new: true, useFindAndModify: false }
      );

      return res.status(200).json(updatedWallet);
    }
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
});

export default router;
