export interface CrossServiceEvent {
  eventType: string;
  source: string;
  target?: string;
  data: any;
  timestamp: Date;
  correlationId?: string;
}

export interface UserRegisteredEvent extends CrossServiceEvent {
  eventType: 'user.registered';
  source: 'iam';
  data: {
    userId: string;
    username: string;
    email: string;
    orgId: string;
  };
}

export interface AccountCreatedEvent extends CrossServiceEvent {
  eventType: 'account.created';
  source: 'bpm';
  data: {
    accountId: string;
    userId: string;
    accountType: string;
    balance: number;
  };
}

export interface TransactionProcessedEvent extends CrossServiceEvent {
  eventType: 'transaction.processed';
  source: 'bpm';
  data: {
    transactionId: string;
    accountId: string;
    userId: string;
    amount: number;
    type: 'credit' | 'debit';
    status: 'success' | 'failed';
  };
}

export interface LogCreatedEvent extends CrossServiceEvent {
  eventType: 'log.created';
  source: 'lgm';
  data: {
    logId: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    userId?: string;
    metadata?: any;
  };
}

export interface NotificationSentEvent extends CrossServiceEvent {
  eventType: 'notification.sent';
  source: 'nsm';
  data: {
    notificationId: string;
    userId: string;
    message: string;
    type: string;
    deliveryStatus: 'sent' | 'delivered' | 'failed';
  };
}
