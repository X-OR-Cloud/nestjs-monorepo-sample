import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AccountService } from '../account/account.service';
import { TransactionCreateEvent, UserActionEvent, NotificationEvent } from '../../../../libs/shared/src/events';

@Injectable()
export class TransactionService {
  private transactions: Transaction[] = [];

  constructor(
    private accountService: AccountService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const transaction = new Transaction({
      amount: createTransactionDto.amount,
      type: createTransactionDto.type,
      description: createTransactionDto.description,
      owner: {
        userId,
        orgId: 'default-org',
      },
    });

    // Set transaction-specific attributes
    transaction.setAttribute('category', createTransactionDto.type);
    transaction.setAttribute('source', 'api');
    transaction.setMetadata('originalAmount', createTransactionDto.amount);
    transaction.setMetadata('currency', 'USD');

    this.transactions.push(transaction);

    // Update account balance
    await this.accountService.updateBalance(userId, createTransactionDto.amount, createTransactionDto.type);

    // Emit events
    const transactionCreateEvent: TransactionCreateEvent = {
      userId,
      transactionId: transaction.id,
      amount: transaction.amount,
      type: transaction.type,
    };

    const userActionEvent: UserActionEvent = {
      userId,
      service: 'bpm',
      action: 'createTransaction',
      time: new Date(),
    };

    const notificationEvent: NotificationEvent = {
      userId,
      message: `New ${transaction.type} transaction of $${transaction.amount} created`,
      type: 'transaction',
    };

    this.eventEmitter.emit('transaction-create', transactionCreateEvent);
    this.eventEmitter.emit('user-event', userActionEvent);
    this.eventEmitter.emit('notification', notificationEvent);

    return transaction;
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    return this.transactions.filter(transaction => 
      transaction.owner.userId === userId && !transaction.isDeleted()
    );
  }

  async findByUserIdAndOrgId(userId: string, orgId: string): Promise<Transaction[]> {
    return this.transactions.filter(transaction => 
      transaction.owner.userId === userId && 
      transaction.owner.orgId === orgId && 
      !transaction.isDeleted()
    );
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactions.filter(transaction => !transaction.isDeleted());
  }

  async findById(transactionId: string): Promise<Transaction | undefined> {
    return this.transactions.find(transaction => 
      transaction.id === transactionId && !transaction.isDeleted()
    );
  }

  async getTransactionsByType(userId: string, type: 'expense' | 'income'): Promise<Transaction[]> {
    return this.transactions.filter(transaction => 
      transaction.owner.userId === userId && 
      transaction.type === type && 
      !transaction.isDeleted()
    );
  }

  async getTotalByType(userId: string, type: 'expense' | 'income'): Promise<number> {
    const transactions = await this.getTransactionsByType(userId, type);
    return transactions.reduce((total, transaction) => total + transaction.amount, 0);
  }

  @OnEvent('transaction-create')
  async handleTransactionCreate(event: TransactionCreateEvent) {
    console.log('Transaction created event received:', event);
    // Additional business logic can be added here
    
    // Update metadata for the transaction
    const transaction = await this.findById(event.transactionId);
    if (transaction) {
      transaction.setMetadata('eventProcessed', true);
      transaction.setMetadata('eventProcessedAt', new Date());
    }
  }
}
