import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SharedAuthModule } from '../../../libs/shared/src/auth';
import { QueueModule } from '../../../libs/shared/src/queue';
import { getDatabaseConfig } from '../../../libs/shared/src/database/database.config';
import { IamController } from './iam.controller';
import { IamService } from './iam.service';
import { UserModule } from './user/user.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: './apps/iam/.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => 
        getDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    UserModule,
    SharedAuthModule,
    QueueModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [IamController, AuthController],
  providers: [IamService, AuthService],
})
export class IamModule {}
