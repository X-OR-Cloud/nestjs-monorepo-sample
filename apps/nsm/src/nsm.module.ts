import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedAuthModule } from '../../../libs/shared/src/auth';
import { QueueModule } from '../../../libs/shared/src/queue';
import { getDatabaseConfig } from '../../../libs/shared/src/database/database.config';
import { NsmController } from './nsm.controller';
import { NsmService } from './nsm.service';
import { NotificationModule } from './notification/notification.module';
import { RabbitMQEventProcessor } from './queue/rabbitmq-event.processor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/nsm/.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => 
        getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    NotificationModule,
    SharedAuthModule,
    QueueModule,
  ],
  controllers: [NsmController],
  providers: [NsmService, RabbitMQEventProcessor],
})
export class NsmModule {}
