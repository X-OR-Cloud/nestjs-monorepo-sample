import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { 
  CrossServiceEvent, 
  UserRegisteredEvent, 
  AccountCreatedEvent,
  TransactionCreateEvent 
} from '../../../../libs/shared/src/events';
import { LogService } from '../log/log.service';

@Controller()
export class RabbitMQEventProcessor {
  constructor(private logService: LogService) {}

  @EventPattern('user.registered')
  async handleUserRegistered(
    @Payload() event: UserRegisteredEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.processEventLog(event, context);
  }

  @EventPattern('account.created') 
  async handleAccountCreated(
    @Payload() event: AccountCreatedEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    await this.processEventLog(event, context);
  }

  @EventPattern('transaction.create')
  async handleTransactionCreate(
    @Payload() event: TransactionCreateEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    // Convert to CrossServiceEvent format
    const crossServiceEvent: CrossServiceEvent = {
      eventType: 'transaction.create',
      source: 'bpm',
      data: event,
      timestamp: new Date(),
    };
    await this.processEventLog(crossServiceEvent, context);
  }

  // Generic handler for any cross-service event (fallback)
  @EventPattern('*')
  async handleAnyEvent(
    @Payload() event: CrossServiceEvent,
    @Ctx() context: RmqContext,
  ): Promise<void> {
    console.log(`[LGM-RabbitMQ] Processing generic event: ${event.eventType} from ${event.source}`);
    await this.processEventLog(event, context);
  }

  private async processEventLog(event: CrossServiceEvent, context: RmqContext): Promise<void> {
    try {
      console.log(`[LGM-RabbitMQ] Logging event: ${event.eventType} from ${event.source}`);
      
      await this.logService.logEvent(event);
      
      // Acknowledge message
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.ack(originalMsg);
      
    } catch (error) {
      console.error(`[LGM-RabbitMQ] Error logging event:`, error);
      
      // Reject and requeue on error
      const channel = context.getChannelRef();
      const originalMsg = context.getMessage();
      channel.nack(originalMsg, false, true);
      
      throw error;
    }
  }
}
