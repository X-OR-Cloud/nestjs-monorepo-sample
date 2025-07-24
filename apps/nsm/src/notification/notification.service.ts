import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Notification } from './entities/notification.entity';
import { NotificationEvent } from '../../../../libs/shared/src/events';

@Injectable()
export class NotificationService {
  private notifications: Notification[] = [];
  private connectedClients: Map<string, any> = new Map();

  @OnEvent('notification')
  async handleNotification(event: NotificationEvent) {
    console.log('Notification event received:', event);
    
    const notification = new Notification({
      message: event.message,
      type: event.type,
      read: false,
      owner: {
        userId: event.userId,
        orgId: 'default-org',
      },
    });
    
    // Set notification-specific attributes and metadata
    notification.setAttribute('eventSource', 'system');
    notification.setAttribute('originalEvent', JSON.stringify(event));
    notification.setMetadata('deliveryAttempts', 0);
    notification.setMetadata('createdByEvent', true);
    
    // Set priority based on notification type
    if (event.type === 'error' || event.type === 'alert') {
      notification.setPriority('high');
    } else if (event.type === 'warning') {
      notification.setPriority('normal');
    } else {
      notification.setPriority('low');
    }
    
    this.notifications.push(notification);
    
    // Send to connected client if available
    const client = this.connectedClients.get(event.userId);
    if (client) {
      client.emit('notification', notification);
      notification.setMetadata('deliveredViaWebSocket', true);
      notification.setMetadata('deliveredAt', new Date());
    }
    
    console.log('Notification created and sent:', notification);
  }

  addClient(userId: string, client: any) {
    this.connectedClients.set(userId, client);
    console.log(`Client connected for user: ${userId}`);
  }

  removeClient(userId: string) {
    this.connectedClients.delete(userId);
    console.log(`Client disconnected for user: ${userId}`);
  }

  async findByUserId(userId: string): Promise<Notification[]> {
    return this.notifications.filter(notification => 
      notification.owner.userId === userId && !notification.isDeleted()
    );
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    return this.notifications.filter(notification => 
      notification.owner.userId === userId && 
      !notification.read && 
      !notification.isDeleted()
    );
  }

  async findByType(userId: string, type: string): Promise<Notification[]> {
    return this.notifications.filter(notification => 
      notification.owner.userId === userId && 
      notification.type === type && 
      !notification.isDeleted()
    );
  }

  async findByPriority(userId: string, priority: string): Promise<Notification[]> {
    return this.notifications.filter(notification => 
      notification.owner.userId === userId && 
      notification.getPriority() === priority && 
      !notification.isDeleted()
    );
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    const notification = this.notifications.find(n => 
      n.id === notificationId && !n.isDeleted()
    );
    
    if (notification) {
      notification.markAsRead();
      return true;
    }
    
    return false;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const userNotifications = await this.findUnreadByUserId(userId);
    userNotifications.forEach(notification => notification.markAsRead());
    return userNotifications.length;
  }

  async createNotification(userId: string, message: string, type: string, priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'): Promise<Notification> {
    const notification = new Notification({
      message,
      type,
      read: false,
      owner: {
        userId,
        orgId: 'default-org',
      },
    });
    
    notification.setPriority(priority);
    notification.setAttribute('eventSource', 'manual');
    notification.setMetadata('createdByEvent', false);
    
    this.notifications.push(notification);
    
    // Send to connected client if available
    const client = this.connectedClients.get(userId);
    if (client) {
      client.emit('notification', notification);
      notification.setMetadata('deliveredViaWebSocket', true);
      notification.setMetadata('deliveredAt', new Date());
    }
    
    return notification;
  }

  async createWelcomeNotification(userId: string, username: string, email: string): Promise<Notification> {
    const message = `Welcome ${username}! Your account has been successfully created. You can now start using our services.`;
    return this.createNotification(userId, message, 'welcome', 'normal');
  }

  async createAccountNotification(userId: string, accountId: string, accountType: string): Promise<Notification> {
    const message = `Your ${accountType} account (${accountId}) has been created successfully and is ready for use.`;
    return this.createNotification(userId, message, 'account', 'normal');
  }

  async createTransactionNotification(userId: string, transactionId: string, amount: number, type: 'expense' | 'income'): Promise<Notification> {
    const message = `Transaction ${transactionId}: ${type === 'income' ? 'Received' : 'Paid'} $${amount.toFixed(2)}`;
    return this.createNotification(userId, message, 'transaction', 'normal');
  }

  async getNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  }> {
    const userNotifications = await this.findByUserId(userId);
    const unreadNotifications = await this.findUnreadByUserId(userId);
    
    const byType: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    
    userNotifications.forEach(notification => {
      byType[notification.type] = (byType[notification.type] || 0) + 1;
      byPriority[notification.getPriority()] = (byPriority[notification.getPriority()] || 0) + 1;
    });
    
    return {
      total: userNotifications.length,
      unread: unreadNotifications.length,
      byType,
      byPriority,
    };
  }
}
