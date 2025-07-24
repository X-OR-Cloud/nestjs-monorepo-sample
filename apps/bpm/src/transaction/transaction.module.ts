import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { Transaction, TransactionSchema } from './entities/transaction.entity';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Transaction.name, schema: TransactionSchema }]),
    AccountModule, 
    EventEmitterModule
  ],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
