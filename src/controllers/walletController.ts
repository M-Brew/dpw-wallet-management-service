import { Request, Response } from "express";

import Wallet from "../models/wallet.model";
import {
  createWalletValidation,
  updateWalletValidation,
  updateWalletStatusValidation,
  addContactValidation,
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

    let code = await generateWalletCode(12);

    const newWallet = new Wallet({
      userId,
      userName,
      userImage,
      code
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

const getWalletByNameOrWalletCode = async (req: Request, res: Response) => {
  try {
    const { nameOrWalletId } = req.params;

    const regex = new RegExp(nameOrWalletId, 'i');
    const wallet = await Wallet.find({
      $or: [
        { userName: regex },
        { walletId: regex }
      ]
    }).select(["userId", "userName", "userImage", "code", "status"]);

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

async function generateWalletCode(length: number) {
  let unique = true;
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*-+=~";
  let walletCode = "";
  const randomArray = new Uint8Array(length);
  crypto.getRandomValues(randomArray);
  randomArray.forEach((number) => {
    walletCode += chars[number % chars.length];
  });

  const existingWalletCode = await Wallet.findOne({ walletCode });
  if (existingWalletCode) {
    unique = false;
  }

  if (!unique) {
    await generateWalletCode(length);
  } else {
    return walletCode;
  }
}

const addContact = async (req: Request, res: Response) => {
  try {
    const { walletId, contactCode } = req.body;

    const { valid, errors } = addContactValidation({
      walletId,
      contactCode
    });
    if (!valid) {
      return res.status(400).json({ errors });
    }

    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    const contactWallet = await Wallet.findOne({ code: contactCode });
    if (!contactWallet) {
      return res.status(404).json({ error: "New contact wallet not found" });
    }

    const newContact = {
      walletId: contactWallet._id,
      code: contactWallet.code,
      userName: contactWallet.userName,
      userImage: contactWallet.userImage
    }

    const updatedWallet = await Wallet.findByIdAndUpdate(
      walletId,
      { $push: { contacts: newContact } },
      { new: true, useFindAndModify: false }
    );

    return res.status(200).json(updatedWallet);
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
}

const removeContact = async (req: Request, res: Response) => {
  try {
    const { walletId, contactCode } = req.body;

    const { valid, errors } = addContactValidation({
      walletId,
      contactCode
    });
    if (!valid) {
      return res.status(400).json({ errors });
    }

    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return res.status(404).json({ error: "Wallet not found" });
    }

    const updateContactList = wallet.contacts.filter((contact) => contact.code !== contactCode)

    const updatedWallet = await Wallet.findByIdAndUpdate(
      walletId,
      { contacts: updateContactList },
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
  getWalletByNameOrWalletCode,
  updateWallet,
  updateWalletStatus,
  addContact,
  removeContact,
}