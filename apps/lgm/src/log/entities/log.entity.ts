import { BaseEntity } from '../../../../../libs/shared/src/entities';

export class Log extends BaseEntity {
  service: string;
  action: string;
  time: Date;

  constructor(partial: Partial<Log>) {
    super(partial);
    Object.assign(this, partial);
    
    // Set log-specific metadata
    this.setMetadata('logLevel', 'INFO');
    this.setMetadata('service', this.service);
    this.setMetadata('action', this.action);
  }

  // Business methods
  setLogLevel(level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'): void {
    this.setMetadata('logLevel', level);
  }

  getLogLevel(): string {
    return this.getMetadata('logLevel') || 'INFO';
  }

  addContext(key: string, value: any): void {
    this.setAttribute(key, value);
  }
}
