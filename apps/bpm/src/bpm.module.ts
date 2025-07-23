import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SharedAuthModule } from '../../../libs/shared/src/auth';
import { BpmController } from './bpm.controller';
import { BpmService } from './bpm.service';
import { AccountModule } from './account/account.module';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    AccountModule,
    TransactionModule,
    SharedAuthModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [BpmController],
  providers: [BpmService],
})
export class BpmModule {}
