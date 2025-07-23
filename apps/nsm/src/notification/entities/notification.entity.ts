import { BaseEntity } from '../../../../../libs/shared/src/entities';

export class Notification extends BaseEntity {
  message: string;
  type: string;
  read: boolean;

  constructor(partial: Partial<Notification>) {
    super(partial);
    Object.assign(this, partial);
    
    // Set notification-specific metadata
    this.setMetadata('notificationType', this.type);
    this.setMetadata('readStatus', this.read);
    this.setMetadata('priority', 'normal');
    
    // Default read status
    if (this.read === undefined) {
      this.read = false;
    }
  }

  // Business methods
  markAsRead(): void {
    this.read = true;
    this.setMetadata('readStatus', true);
    this.setMetadata('readAt', new Date());
    this.markAsChanged();
  }

  markAsUnread(): void {
    this.read = false;
    this.setMetadata('readStatus', false);
    this.markAsChanged();
  }

  setPriority(priority: 'low' | 'normal' | 'high' | 'urgent'): void {
    this.setMetadata('priority', priority);
  }

  getPriority(): string {
    return this.getMetadata('priority') || 'normal';
  }

  isHighPriority(): boolean {
    const priority = this.getPriority();
    return priority === 'high' || priority === 'urgent';
  }
}
