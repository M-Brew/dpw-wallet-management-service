import { Kafka } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();

import { IWalletUpdateEvent } from "types/custom";

const { KAFKA_CLIENT_ID, KAFKA_BROKERS, KAFKA_WALLET_TOPIC } = process.env;

const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: KAFKA_BROKERS.split(","),
});

const producer = kafka.producer();

const connectProducer = async () => {
  try {
    await producer.connect();
    console.log("Kafka wallet producer connected");
  } catch (error) {
    console.log("Error connecting Kafka producer:", error);
    setTimeout(connectProducer, 5000);
  }
};

const sendWalletUpdate = async (event: IWalletUpdateEvent) => {
  try {
    await producer.send({
      topic: KAFKA_WALLET_TOPIC,
      messages: [{ value: JSON.stringify(event) }],
    });
  } catch (error) {
    console.log("Error sending wallet update event to Kafka:", error);
  }
};

export { connectProducer, sendWalletUpdate };
