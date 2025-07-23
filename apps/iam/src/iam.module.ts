import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SharedAuthModule } from '../../../libs/shared/src/auth';
import { IamController } from './iam.controller';
import { IamService } from './iam.service';
import { UserModule } from './user/user.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';

@Module({
  imports: [
    UserModule,
    SharedAuthModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [IamController, AuthController],
  providers: [IamService, AuthService],
})
export class IamModule {}
