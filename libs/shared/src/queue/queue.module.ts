import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbitmq.service';
import { MockQueueService } from './mock-queue.service';
import { InMemoryQueueService } from './in-memory-queue.service';
import { QueueService } from './queue.service';

@Module({
  providers: [
    InMemoryQueueService,
    MockQueueService,
    RabbitMQService,
    {
      provide: QueueService,
      useFactory: () => {
        // Use RabbitMQ in production, mock in development
        const isProduction = process.env.NODE_ENV === 'production';
        const hasRabbitMQ = process.env.RABBITMQ_URL || process.env.USE_RABBITMQ === 'true';
        
        if (isProduction || hasRabbitMQ) {
          console.log('[QueueModule] Using RabbitMQ for queue service');
          return new RabbitMQService();
        } else {
          console.log('[QueueModule] Using MockQueue for queue service (set USE_RABBITMQ=true to use RabbitMQ)');
          const inMemoryService = new InMemoryQueueService();
          return new MockQueueService(inMemoryService);
        }
      },
    },
  ],
  exports: [QueueService],
})
export class QueueModule {}
