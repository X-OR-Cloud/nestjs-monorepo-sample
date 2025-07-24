import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Transaction } from './entities/transaction.entity';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { AccountService } from '../account/account.service';
import { TransactionCreateEvent, UserActionEvent, NotificationEvent } from '../../../../libs/shared/src/events';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    private accountService: AccountService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const transaction = new this.transactionModel({
      amount: createTransactionDto.amount,
      type: createTransactionDto.type,
      description: createTransactionDto.description,
      userId,
    });

    // Set transaction-specific metadata using direct assignment
    if (!transaction.metadata) transaction.metadata = {};
    transaction.metadata.originalAmount = createTransactionDto.amount;
    transaction.metadata.currency = 'USD';
    transaction.metadata.category = createTransactionDto.type;
    transaction.metadata.source = 'api';
    transaction.markModified('metadata');

    const savedTransaction = await transaction.save();

    // Update account balance
    await this.accountService.updateBalance(userId, createTransactionDto.amount, createTransactionDto.type);

    // Emit events
    const transactionCreateEvent: TransactionCreateEvent = {
      userId,
      transactionId: savedTransaction.id,
      amount: savedTransaction.amount,
      type: savedTransaction.type,
    };

    const userActionEvent: UserActionEvent = {
      userId,
      service: 'bpm',
      action: 'createTransaction',
      time: new Date(),
    };

    const notificationEvent: NotificationEvent = {
      userId,
      message: `New ${savedTransaction.type} transaction of $${savedTransaction.amount} created`,
      type: 'transaction',
    };

    this.eventEmitter.emit('transaction-create', transactionCreateEvent);
    this.eventEmitter.emit('user-event', userActionEvent);
    this.eventEmitter.emit('notification', notificationEvent);

    return savedTransaction;
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    return await this.transactionModel.find({ 
      userId, 
      deletedAt: null 
    }).exec();
  }

  async findByUserIdAndOrgId(userId: string, orgId: string): Promise<Transaction[]> {
    return await this.transactionModel.find({ 
      userId, 
      deletedAt: null 
    }).exec();
  }

  async findAll(): Promise<Transaction[]> {
    return await this.transactionModel.find({ 
      deletedAt: null 
    }).exec();
  }

  async findById(transactionId: string): Promise<Transaction | undefined> {
    const transaction = await this.transactionModel.findOne({ 
      _id: transactionId, 
      deletedAt: null 
    }).exec();
    return transaction || undefined;
  }

  async getTransactionsByType(userId: string, type: 'expense' | 'income'): Promise<Transaction[]> {
    return await this.transactionModel.find({ 
      userId, 
      type, 
      deletedAt: null 
    }).exec();
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
      if (!transaction.metadata) transaction.metadata = {};
      transaction.metadata.eventProcessed = true;
      transaction.metadata.eventProcessedAt = new Date();
      transaction.markModified('metadata');
      await transaction.save();
    }
  }
}
