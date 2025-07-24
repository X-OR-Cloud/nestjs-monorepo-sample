import { Injectable } from '@nestjs/common';
import { CrossServiceEvent } from '../events';

export interface QueueJob {
  id: string;
  data: any;
  eventType: string;
  processedAt?: Date;
  attempts: number;
  status: 'waiting' | 'processing' | 'completed' | 'failed';
}

@Injectable()
export class InMemoryQueueService {
  private jobs: Map<string, QueueJob> = new Map();
  private processors: Map<string, Function[]> = new Map();
  private jobCounter = 0;

  async emitEvent(event: CrossServiceEvent): Promise<void> {
    const jobId = `job_${++this.jobCounter}_${Date.now()}`;
    
    const job: QueueJob = {
      id: jobId,
      data: event,
      eventType: event.eventType,
      attempts: 0,
      status: 'waiting',
    };

    this.jobs.set(jobId, job);
    console.log(`[InMemoryQueue] Job added: ${jobId} for event: ${event.eventType}`);

    // Process the job immediately (simulate queue processing)
    setTimeout(() => this.processJob(jobId), 100);
  }

  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job) return;

    const processors = this.processors.get(job.eventType) || [];
    const wildcardProcessors = this.processors.get('*') || [];
    const allProcessors = [...processors, ...wildcardProcessors];

    if (allProcessors.length === 0) {
      console.log(`[InMemoryQueue] No processors for event type: ${job.eventType}`);
      return;
    }

    job.status = 'processing';
    job.attempts++;

    try {
      // Process with all registered processors
      await Promise.all(
        allProcessors.map(processor => 
          processor({ data: job.data, id: job.id })
        )
      );

      job.status = 'completed';
      job.processedAt = new Date();
      console.log(`[InMemoryQueue] Job completed: ${jobId}`);
    } catch (error) {
      job.status = 'failed';
      console.error(`[InMemoryQueue] Job failed: ${jobId}`, error.message);
      
      // Retry logic (up to 3 attempts)
      if (job.attempts < 3) {
        job.status = 'waiting';
        setTimeout(() => this.processJob(jobId), 1000 * job.attempts);
      }
    }
  }

  registerProcessor(eventType: string, processor: Function): void {
    if (!this.processors.has(eventType)) {
      this.processors.set(eventType, []);
    }
    this.processors.get(eventType)!.push(processor);
    console.log(`[InMemoryQueue] Processor registered for: ${eventType}`);
  }

  getQueueStats(): {
    totalJobs: number;
    waiting: number;
    processing: number;
    completed: number;
    failed: number;
  } {
    const jobs = Array.from(this.jobs.values());
    return {
      totalJobs: jobs.length,
      waiting: jobs.filter(j => j.status === 'waiting').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      completed: jobs.filter(j => j.status === 'completed').length,
      failed: jobs.filter(j => j.status === 'failed').length,
    };
  }

  getAllJobs(): QueueJob[] {
    return Array.from(this.jobs.values());
  }
}
