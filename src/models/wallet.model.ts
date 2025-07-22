import { Schema, model } from "mongoose";

const walletSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: true,
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
