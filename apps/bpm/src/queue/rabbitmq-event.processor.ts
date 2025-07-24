import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { 
  UserRegisteredEvent, 
  AccountCreatedEvent,
  TransactionCreateEvent 
} from '../../../../libs/shared/src/events';
import { QueueService } from '../../../../libs/shared/src/queue/queue.service';
import { AccountService } from '../account/account.service';

@Controller()
export class RabbitMQEventProcessor {
  constructor(
    private queueService: QueueService,
    private accountService: AccountService,
  ) {}

  @EventPattern('user.registered')
  async handleUserRegistered(
    @Payload() event: UserRegisteredEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    console.log(`[BPM-RabbitMQ] Processing user.registered - User: ${event.data.username}`);
    
    try {
      // Create default savings account for new user
      const defaultAccount = await this.accountService.createDefaultAccount(
        event.data.userId,
        event.data.username,
      );

      // Send account created event
      const accountCreatedEvent: AccountCreatedEvent = {
        eventType: 'account.created',
        source: 'bpm',
        data: {
          accountId: defaultAccount.id,
          userId: event.data.userId,
          accountType: 'savings',
          balance: 0,
        },
        timestamp: new Date(),
        correlationId: event.correlationId,
      };

      await this.queueService.emitEvent(accountCreatedEvent);
      
      console.log(`[BPM-RabbitMQ] Account created and event emitted for user: ${event.data.username}`);
      
      // Acknowledge message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
    } catch (error) {
      console.error(`[BPM-RabbitMQ] Error processing user.registered event:`, error);
      
      // Reject message and requeue
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.nack(originalMsg, false, true);
      
      throw error;
    }
  }
}
