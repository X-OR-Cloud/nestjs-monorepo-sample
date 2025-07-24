import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { CrossServiceEvent } from '../events';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private client: ClientProxy;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
        queue: 'cross_service_events',
        queueOptions: {
          durable: true, // Persist messages
          arguments: {
            'x-message-ttl': 60000, // 1 minute TTL
            'x-max-retries': 3,
          },
        },
        socketOptions: {
          heartbeatIntervalInSeconds: 60,
          reconnectTimeInSeconds: 5,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      console.log('[RabbitMQ] Connected successfully');
    } catch (error) {
      console.error('[RabbitMQ] Connection failed:', error);
    }
  }

  async onModuleDestroy() {
    await this.client.close();
    console.log('[RabbitMQ] Connection closed');
  }

  async emitEvent(event: CrossServiceEvent): Promise<void> {
    try {
      // Add default metadata
      event.timestamp = event.timestamp || new Date();
      if (!event.correlationId) {
        event.correlationId = this.generateCorrelationId();
      }

      console.log(`[RabbitMQ] Emitting event: ${event.eventType} from ${event.source}`);
      
      // Use emit for fire-and-forget pattern
      this.client.emit(event.eventType, event);
      
      console.log(`[RabbitMQ] Event emitted successfully: ${event.correlationId}`);
    } catch (error) {
      console.error(`[RabbitMQ] Error emitting event:`, error);
      throw error;
    }
  }

  async sendRequest(pattern: string, data: any): Promise<any> {
    try {
      return await this.client.send(pattern, data).toPromise();
    } catch (error) {
      console.error(`[RabbitMQ] Error sending request:`, error);
      throw error;
    }
  }

  private generateCorrelationId(): string {
    return `rabbitmq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Health check method
  async isHealthy(): Promise<boolean> {
    try {
      // Send a ping to check connection
      await this.client.send('health.ping', { timestamp: new Date() }).toPromise();
      return true;
    } catch {
      return false;
    }
  }
}
