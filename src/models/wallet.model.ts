import { Schema, model } from "mongoose";

const STATUS = {
  active: "active",
  deactivated: "deactivated",
  suspended: "suspended",
};

const walletSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    userImage: {
      type: String,
    },
    balance: {
      type: Number,
      required: true,
      default: 0.0
    },
    currency: {
      type: String,
      required: true,
      default: "GHS"
    },
    status: {
      type: String,
      required: true,
      default: STATUS.active,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: true,
    },
  }
);

const walletModel = model("Wallet", walletSchema);

export default walletModel;
