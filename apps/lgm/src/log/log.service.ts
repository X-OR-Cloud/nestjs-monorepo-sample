import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Log } from './entities/log.entity';
import { UserActionEvent } from '../../../../libs/shared/src/events';

@Injectable()
export class LogService {
  private logs: Log[] = [];

  @OnEvent('user-event')
  async handleUserEvent(event: UserActionEvent) {
    console.log('Logging user event:', event);
    const log = new Log({
      service: event.service,
      action: event.action,
      time: event.time,
      owner: {
        userId: event.userId,
        orgId: 'default-org',
      },
    });
    
    // Set log-specific attributes and metadata
    log.setAttribute('eventType', 'user-action');
    log.setAttribute('originalEvent', JSON.stringify(event));
    log.setMetadata('processingTime', new Date());
    log.setMetadata('logSource', 'event-emitter');
    
    // Set log level based on action
    if (event.action.includes('error') || event.action.includes('fail')) {
      log.setLogLevel('ERROR');
    } else if (event.action.includes('warn')) {
      log.setLogLevel('WARN');
    } else {
      log.setLogLevel('INFO');
    }
    
    this.logs.push(log);
    console.log('Log created:', log);
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
