import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { 
  UserRegisteredEvent, 
  AccountCreatedEvent,
  TransactionCreateEvent 
} from '../../../../libs/shared/src/events';
import { NotificationService } from '../notification/notification.service';

@Controller()
export class RabbitMQEventProcessor {
  constructor(private notificationService: NotificationService) {}

  @EventPattern('user.registered')
  async handleUserRegistered(
    @Payload() event: UserRegisteredEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    console.log(`[NSM-RabbitMQ] Processing user.registered - User: ${event.data.username}`);
    
    try {
      await this.notificationService.createWelcomeNotification(
        event.data.userId,
        event.data.username,
        event.data.email,
      );
      
      console.log(`[NSM-RabbitMQ] Welcome notification created for user: ${event.data.username}`);
      
      // Acknowledge message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
    } catch (error) {
      console.error(`[NSM-RabbitMQ] Error creating welcome notification:`, error);
      
      // Reject and requeue
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.nack(originalMsg, false, true);
      
      throw error;
    }
  }

  @EventPattern('account.created')
  async handleAccountCreated(
    @Payload() event: AccountCreatedEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    console.log(`[NSM-RabbitMQ] Processing account.created - Account: ${event.data.accountId}`);
    
    try {
      await this.notificationService.createAccountNotification(
        event.data.userId,
        event.data.accountId,
        event.data.accountType,
      );
      
      console.log(`[NSM-RabbitMQ] Account notification created for account: ${event.data.accountId}`);
      
      // Acknowledge message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
    } catch (error) {
      console.error(`[NSM-RabbitMQ] Error creating account notification:`, error);
      
      // Reject and requeue
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.nack(originalMsg, false, true);
      
      throw error;
    }
  }

  @EventPattern('transaction.create')
  async handleTransactionCreate(
    @Payload() event: TransactionCreateEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    console.log(`[NSM-RabbitMQ] Processing transaction.create - Transaction: ${event.transactionId}`);
    
    try {
      await this.notificationService.createTransactionNotification(
        event.userId,
        event.transactionId,
        event.amount,
        event.type,
      );
      
      console.log(`[NSM-RabbitMQ] Transaction notification created for transaction: ${event.transactionId}`);
      
      // Acknowledge message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
    } catch (error) {
      console.error(`[NSM-RabbitMQ] Error creating transaction notification:`, error);
      
      // Reject and requeue
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.nack(originalMsg, false, true);
      
      throw error; 
    }
  }
}
