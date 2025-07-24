import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { AccountModule } from '../account/account.module';

@Module({
  imports: [AccountModule, EventEmitterModule],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
