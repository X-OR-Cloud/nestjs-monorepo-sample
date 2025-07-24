import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedAuthModule } from '../../../libs/shared/src/auth';
import { QueueModule } from '../../../libs/shared/src/queue';
import { getDatabaseConfig } from '../../../libs/shared/src/database/database.config';
import { LgmController } from './lgm.controller';
import { LgmService } from './lgm.service';
import { LogModule } from './log/log.module';
import { RabbitMQEventProcessor } from './queue/rabbitmq-event.processor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/lgm/.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => 
        getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    LogModule,
    SharedAuthModule,
    QueueModule,
  ],
  controllers: [LgmController],
  providers: [LgmService, RabbitMQEventProcessor],
})
export class LgmModule {}
