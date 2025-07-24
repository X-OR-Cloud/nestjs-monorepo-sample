import { Injectable } from '@nestjs/common';
import { CrossServiceEvent } from '../events';
import { InMemoryQueueService } from './in-memory-queue.service';

@Injectable()
export class MockQueueService {
  constructor(private inMemoryQueue: InMemoryQueueService) {}

  async emitEvent(event: CrossServiceEvent): Promise<void> {
    try {
      // Add default metadata
      event.timestamp = event.timestamp || new Date();
      if (!event.correlationId) {
        event.correlationId = this.generateCorrelationId();
      }

      console.log(`[MockQueueService] Emitting event: ${event.eventType} from ${event.source}`);
      await this.inMemoryQueue.emitEvent(event);
    } catch (error) {
      console.error(`[MockQueueService] Error emitting event:`, error);
      throw error;
    }
  }

  registerProcessor(eventType: string, processor: Function): void {
    this.inMemoryQueue.registerProcessor(eventType, processor);
  }

  getQueueStats() {
    return this.inMemoryQueue.getQueueStats();
  }

  getAllJobs() {
    return this.inMemoryQueue.getAllJobs();
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
