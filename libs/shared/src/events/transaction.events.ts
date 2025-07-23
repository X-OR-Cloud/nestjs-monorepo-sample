export interface TransactionCreateEvent {
  userId: string;
  transactionId: string;
  amount: number;
  type: 'expense' | 'income';
}

export interface NotificationEvent {
  userId: string;
  message: string;
  type: string;
}
