import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import walletRoutes from "./routes/wallet";
// import { initConsumer } from "./kafka/transactionConsumer";
// import { connectProducer } from "./kafka/walletProducer";

const { PORT, DB_URI } = process.env;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/wallets", walletRoutes);

// initConsumer();
// connectProducer();

mongoose.connect(DB_URI);
mongoose.connection.on("open", () =>
  console.log("Connected to database successfully")
);

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
