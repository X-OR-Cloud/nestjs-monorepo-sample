import { Injectable } from '@nestjs/common';
import { CrossServiceEvent } from '../events';

@Injectable()
export abstract class QueueService {
  abstract emitEvent(event: CrossServiceEvent): Promise<void>;
  abstract isHealthy?(): Promise<boolean>;
}
