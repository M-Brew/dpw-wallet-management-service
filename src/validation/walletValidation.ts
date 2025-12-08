import { isValidObjectId } from "mongoose";

const createWalletValidation = (details: { userId: string }) => {
  const { userId } = details;
  const errors: Record<string, string> = {};

  if (!userId || userId.trim() === "") {
    errors.userId = "User id is required";
  } else {
    if (!isValidObjectId(userId)) {
      errors.userId = "User id should be a valid id";
    }
  }

  return {
    valid: Object.keys(errors).length < 1,
    errors,
  };
};

const updateWalletValidation = (details: {
  // userId: string;
  walletId: string;
  amount: number;
  transactionType: string;
}) => {
  const { walletId, amount, transactionType } = details;
  const errors: Record<string, string> = {};

  // if (!userId || userId.trim() === "") {
  //   errors.userId = "User id is required";
  // } else {
  //   if (!isValidObjectId(userId)) {
  //     errors.userId = "User id should be a valid id";
  //   }
  // }

  if (!walletId || walletId.trim() === "") {
    errors.walletId = "Wallet id is required";
  } else {
    if (!isValidObjectId(walletId)) {
      errors.walletId = "Wallet id should be a valid id";
    }
  }

  if (!amount) {
    errors.amount = "Amount is required";
  } else {
    if (amount < 1) {
      errors.amount = "Amount should be greater than 0";
    }
  }

  if (!transactionType || transactionType === "") {
    errors.transactionType = "Transaction type is required";
  } else {
    if (!["credit", "debit"].includes(transactionType)) {
      errors.transactionType = "Invalid transaction type.";
    }
  }

  return {
    valid: Object.keys(errors).length < 1,
    errors,
  };
};

export { createWalletValidation, updateWalletValidation };
