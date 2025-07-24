import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Log } from './entities/log.entity';
import { UserActionEvent, CrossServiceEvent } from '../../../../libs/shared/src/events';

@Injectable()
export class LogService {
  private logs: Log[] = [];

  async createLog(level: 'info' | 'warn' | 'error', message: string, userId: string, metadata?: any): Promise<Log> {
    const log = new Log({
      service: 'lgm',
      action: 'cross-service-event',
      time: new Date(),
      owner: {
        userId: userId,
        orgId: 'default-org',
      },
    });
    
    // Set log-specific attributes and metadata
    log.setAttribute('message', message);
    log.setAttribute('eventType', 'cross-service');
    log.setMetadata('processingTime', new Date());
    log.setMetadata('logSource', 'cross-service-event');
    
    if (metadata) {
      Object.keys(metadata).forEach(key => {
        log.setMetadata(key, metadata[key]);
      });
    }
    
    // Set log level
    switch (level) {
      case 'error':
        log.setLogLevel('ERROR');
        break;
      case 'warn':
        log.setLogLevel('WARN');
        break;
      default:
        log.setLogLevel('INFO');
    }
    
    this.logs.push(log);
    console.log(`[LGM] Log created: ${level.toUpperCase()} - ${message}`);
    return log;
  }

  async findAll(): Promise<Log[]> {
    return this.logs.filter(log => !log.isDeleted());
  }

  async findByUserId(userId: string): Promise<Log[]> {
    return this.logs.filter(log => 
      log.owner.userId === userId && !log.isDeleted()
    );
  }

  async findByService(service: string): Promise<Log[]> {
    return this.logs.filter(log => 
      log.service === service && !log.isDeleted()
    );
  }

  async findByAction(action: string): Promise<Log[]> {
    return this.logs.filter(log => 
      log.action === action && !log.isDeleted()
    );
  }

  async findByLogLevel(level: string): Promise<Log[]> {
    return this.logs.filter(log => 
      log.getLogLevel() === level && !log.isDeleted()
    );
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Log[]> {
    return this.logs.filter(log => 
      log.time >= startDate && 
      log.time <= endDate && 
      !log.isDeleted()
    );
  }

  async logEvent(event: CrossServiceEvent): Promise<Log> {
    const log = new Log({
      service: 'lgm',
      action: 'event-processing',
      time: new Date(),
      owner: {
        userId: event.data.userId || 'system',
        orgId: 'default-org',
      },
    });
    
    log.setAttribute('eventType', event.eventType);
    log.setAttribute('source', event.source);
    log.setAttribute('correlationId', event.correlationId);
    log.setMetadata('originalEvent', event);
    log.setMetadata('processingTime', new Date());
    log.setLogLevel('INFO');
    
    this.logs.push(log);
    console.log(`[LGM] Event logged: ${event.eventType} from ${event.source}`);
    return log;
  }

  async createManualLog(userId: string, service: string, action: string, level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' = 'INFO', context?: any): Promise<Log> {
    const log = new Log({
      service,
      action,
      time: new Date(),
      owner: {
        userId,
        orgId: 'default-org',
      },
    });
    
    log.setLogLevel(level);
    log.setAttribute('eventType', 'manual');
    log.setMetadata('logSource', 'manual-creation');
    
    if (context) {
      log.addContext('additionalContext', context);
    }
    
    this.logs.push(log);
    return log;
  }
}
