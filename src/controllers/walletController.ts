import { Request, Response } from "express";

import Wallet from "../models/wallet.model";
import {
  createWalletValidation,
  updateWalletValidation,
  updateWalletStatusValidation,
} from "../validation/walletValidation";

const createWallet = async (req: Request, res: Response) => {
  try {
    const { userId, userName, userImage } = req.body;

    const { valid, errors } = createWalletValidation({
      userId,
    });
    if (!valid) {
      return res.status(400).json({ errors });
    }

    const existingWallet = await Wallet.findOne({ userId });
    if (existingWallet) {
      return res.status(400).json({ error: "User has an existing wallet" });
    }

    const newWallet = new Wallet({
      userId,
      userName,
      userImage
    });
    await newWallet.save();

    return res.status(201).json(newWallet);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

const getWallet = async (req: Request, res: Response) => {
  try {
    const { walletId } = req.params;

    const wallet = await Wallet.findById(walletId);

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    return res.status(200).json(wallet);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

const getUserWallet = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    return res.status(200).json(wallet);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

const updateWallet = async (req: Request, res: Response) => {
  try {
    const { userId, walletId, amount, transactionType } = req.body;

    const { valid, errors } = updateWalletValidation({
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
}

const updateWalletStatus = async (req: Request, res: Response) => {
  try {
    const { walletId, status } = req.body;

    const { valid, errors } = updateWalletStatusValidation({ walletId, status });
    if (!valid) {
      return res.status(400).json({ errors });
    }

    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    const updatedWallet = await Wallet.findByIdAndUpdate(
      walletId,
      { status },
      { new: true, useFindAndModify: false }
    );

    return res.status(200).json(updatedWallet);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

export default {
  createWallet,
  getWallet,
  getUserWallet,
  updateWallet,
  updateWalletStatus
}