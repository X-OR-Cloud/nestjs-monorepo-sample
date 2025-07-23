import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const authToken: string = 
        client.handshake?.auth?.token || 
        client.handshake?.headers?.authorization?.replace('Bearer ', '');
      
      if (!authToken) {
        throw new WsException('No token provided');
      }

      const jwtPayload = this.jwtService.verify(authToken, {
        secret: process.env.JWT_SECRET || 'your-secret-key'
      });
      
      // Add user info to context
      context.switchToWs().getData().user = {
        userId: jwtPayload.sub,
        username: jwtPayload.username,
        orgId: jwtPayload.orgId || 'default-org'
      };
      
      return Boolean(jwtPayload);
    } catch (err) {
      throw new WsException('Invalid token');
    }
  }
}
