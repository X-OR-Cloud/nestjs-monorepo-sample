import { Controller, Get, Post, Body, UseGuards, ValidationPipe } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard, CurrentUser } from '../../../../libs/shared/src/auth';
import { Transaction } from './entities/transaction.entity';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  async getTransactions(@CurrentUser() user: any): Promise<Transaction[]> {
    return this.transactionService.findByUserId(user.userId);
  }

  @Post()
  async createTransaction(
    @CurrentUser() user: any,
    @Body(ValidationPipe) createTransactionDto: CreateTransactionDto,
  ): Promise<Transaction> {
    return this.transactionService.create(user.userId, createTransactionDto);
  }
}
