import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SharedAuthModule } from '../../../libs/shared/src/auth';
import { NsmController } from './nsm.controller';
import { NsmService } from './nsm.service';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    NotificationModule,
    SharedAuthModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [NsmController],
  providers: [NsmService],
})
export class NsmModule {}
