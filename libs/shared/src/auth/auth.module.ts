import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { WsJwtGuard } from './ws-jwt.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { 
        expiresIn: process.env.JWT_EXPIRES_IN || '1h' 
      },
    }),
  ],
  providers: [JwtStrategy, JwtAuthGuard, WsJwtGuard],
  exports: [JwtModule, JwtStrategy, JwtAuthGuard, WsJwtGuard, PassportModule],
})
export class SharedAuthModule {}
