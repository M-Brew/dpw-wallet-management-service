import { Kafka } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();

import Wallet from "../models/wallet.model";
import { IWalletUpdateEvent } from "../types/custom";

const {
  KAFKA_CLIENT_ID,
  KAFKA_BROKERS,
  KAFKA_WALLET_GROUP_ID,
  KAFKA_TRANSACTION_TOPIC,
  NODE_ENV,
} = process.env;

const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: KAFKA_BROKERS.split(","),
});

const consumer = kafka.consumer({ groupId: KAFKA_WALLET_GROUP_ID });

const initConsumer = async () => {
  try {
    await createTopicIfNeeded(KAFKA_TRANSACTION_TOPIC);

    await consumer.connect();
    await consumer.subscribe({
      topic: KAFKA_TRANSACTION_TOPIC,
      fromBeginning: false,
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const event = JSON.parse(
          message.value.toString()
        ) as IWalletUpdateEvent;
        console.log(
          `Received message from Kafka topic ${topic}: ${JSON.stringify(event)}`
        );

        if (
          event.type === "transaction_completed" &&
          event.status === "SUCCESS"
        ) {
          if (
            event.transactionType === "P2P" ||
            event.transactionType === "P2M"
          ) {
            try {
              // TODO: check existence of transaction id
              console.log(
                `Processing credit for receiver wallet ${event.receiverWalletId} with amount ${event.amount}`
              );
              await Wallet.findByIdAndUpdate(
                event.receiverWalletId,
                { $inc: { balance: event.amount } },
                { new: true, useFindAndModify: false }
              );
              console.log(
                `Receiver wallet ${event.receiverWalletId} credited with amount ${event.amount}`
              );
              // TODO: send wallet updated event
            } catch (error) {
              console.log(
                `Failed to credit receiver wallet ${event.receiverWalletId} for transaction ${event.transactionId}:`,
                error
              );
            }
          } else if (event.transactionType === "Deposit") {
            try {
              // TODO: check existence of transaction id
              console.log(
                `Processing credit for receiver wallet ${event.receiverWalletId} with amount ${event.amount}`
              );
              await Wallet.findByIdAndUpdate(
                event.receiverWalletId,
                { $inc: { balance: event.amount } },
                { new: true, useFindAndModify: false }
              );
              console.log(
                `Wallet ${event.receiverWalletId} credited with amount ${event.amount}`
              );
              // TODO: send wallet updated event
            } catch (error) {
              console.log(
                `Failed to credit receiver wallet ${event.receiverWalletId} for transaction ${event.transactionId}:`,
                error
              );
            }
          } else if (event.transactionType === "Withdrawal") {
            try {
              // TODO: check existence of transaction id
              console.log(
                `Processing debit for receiver wallet ${event.receiverWalletId} with amount ${event.amount}`
              );
              await Wallet.findByIdAndUpdate(
                event.receiverWalletId,
                { $inc: { balance: -event.amount } },
                { new: true, useFindAndModify: false }
              );
              console.log(
                `Wallet ${event.receiverWalletId} debited with amount ${event.amount}`
              );
              // TODO: send wallet updated event
            } catch (error) {
              console.log(
                `Failed to debit receiver wallet ${event.receiverWalletId} for withdrawal transaction ${event.transactionId}:`,
                error
              );
            }
          }
        }

        // TODO: Implement transaction failure handler function
      },
    });
    console.log("Kafka wallet consumer connected");
  } catch (error) {
    console.log("Error connecting Kafka consumer:", error);
    setTimeout(initConsumer, 5000);
  }
};

async function createTopicIfNeeded(topicName: string) {
  if (NODE_ENV === "production") return;

  const admin = kafka.admin();
  await admin.connect();

  try {
    const topics = await admin.listTopics();
    if (topics.includes(topicName)) return;

    console.log(`Creating the ${topicName} topic`);
    await admin.createTopics({
      topics: [
        {
          topic: topicName,
          numPartitions: 1,
        },
      ],
    });
  } finally {
    await admin.disconnect();
  }
}

export { initConsumer };
