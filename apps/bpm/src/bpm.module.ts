import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SharedAuthModule } from '../../../libs/shared/src/auth';
import { QueueModule } from '../../../libs/shared/src/queue';
import { getDatabaseConfig } from '../../../libs/shared/src/database/database.config';
import { BpmController } from './bpm.controller';
import { BpmService } from './bpm.service';
import { AccountModule } from './account/account.module';
import { TransactionModule } from './transaction/transaction.module';
import { RabbitMQEventProcessor } from './queue/rabbitmq-event.processor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/bpm/.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => 
        getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
            queue: 'bpm_queue',
            queueOptions: {
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    EventEmitterModule.forRoot(),
    AccountModule,
    TransactionModule,
    SharedAuthModule,
    QueueModule,
  ],
  controllers: [BpmController, RabbitMQEventProcessor],
  providers: [BpmService, RabbitMQEventProcessor],
})
export class BpmModule {}
