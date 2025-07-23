import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { NotificationService } from './notification.service';
import { WsJwtGuard } from '../../../../libs/shared/src/auth';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private notificationService: NotificationService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake?.auth?.token || client.handshake?.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;
      
      client.data.userId = userId;
      this.notificationService.addClient(userId, client);
      
      console.log(`Client connected: ${client.id} for user: ${userId}`);
    } catch (error) {
      console.log('Invalid token, disconnecting client');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.notificationService.removeClient(userId);
      console.log(`Client disconnected: ${client.id} for user: ${userId}`);
    }
  }

  @SubscribeMessage('getNotifications')
  async getNotifications(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const notifications = await this.notificationService.findByUserId(userId);
      client.emit('notifications', notifications);
    }
  }
}
