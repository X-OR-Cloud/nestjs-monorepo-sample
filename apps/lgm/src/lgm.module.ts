import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SharedAuthModule } from '../../../libs/shared/src/auth';
import { LgmController } from './lgm.controller';
import { LgmService } from './lgm.service';
import { LogModule } from './log/log.module';

@Module({
  imports: [
    LogModule,
    SharedAuthModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [LgmController],
  providers: [LgmService],
})
export class LgmModule {}
