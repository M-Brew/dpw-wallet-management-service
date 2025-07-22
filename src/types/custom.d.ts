export interface IWalletUpdateEvent {
  type: "transaction_pending" | "transaction_completed" | "transaction_failed";
  status: "PENDING" | "SUCCESS" | "FAILURE";
  transactionId: string;
  transactionType: "P2P" | "P2M" | "Withdrawal" | "Deposit";
  senderUserId: string;
  senderWalletId: string;
  receiverUserId: string;
  receiverWalletId: string;
  amount: string;
  currency: string;
}
