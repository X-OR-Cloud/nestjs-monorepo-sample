import { Prop, Schema } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export interface Owner {
  userId: string;
  orgId?: string;
}

export interface Metadata {
  [key: string]: any;
}

export interface Attributes {
  [key: string]: any;
}

@Schema({
  timestamps: true,
  versionKey: false,
})
export abstract class BaseEntity extends Document {
  @Prop({ type: Date, default: null })
  deletedAt?: Date;

  @Prop({ type: Object, required: true })
  owner: Owner;

  @Prop({ type: Object, default: {} })
  attributes?: Attributes;

  @Prop({ type: Object, default: {} })
  metadata?: Metadata;

  // Timestamps from mongoose (createdAt, updatedAt)
  createdAt: Date;
  updatedAt: Date;

  constructor(partial?: Partial<BaseEntity>) {
    super();
    if (partial) {
      Object.assign(this, partial);
    }
    if (!this.owner) {
      this.owner = { userId: '', orgId: 'default-org' };
    }
    if (!this.attributes) {
      this.attributes = {};
    }
    if (!this.metadata) {
      this.metadata = {};
    }
  }

  // Helper method to mark entity as deleted (soft delete)
  markAsDeleted(): void {
    this.deletedAt = new Date();
    this.markAsChanged();
  }

  // Helper method to update changed timestamp
  markAsChanged(): void {
    this.updatedAt = new Date();
  }

  // Helper method to check if entity is deleted
  isDeleted(): boolean {
    return this.deletedAt !== undefined && this.deletedAt !== null;
  }

  // Helper method to add/update attributes
  setAttribute(key: string, value: any): void {
    if (!this.attributes) {
      this.attributes = {};
    }
    this.attributes[key] = value;
    this.markAsChanged();
  }

  // Helper method to get attribute
  getAttribute(key: string): any {
    return this.attributes?.[key];
  }

  // Helper method to add/update metadata
  setMetadata(key: string, value: any): void {
    if (!this.metadata) {
      this.metadata = {};
    }
    this.metadata[key] = value;
    this.markAsChanged();
  }

  // Helper method to get metadata
  getMetadata(key: string): any {
    return this.metadata?.[key];
  }

  // Priority methods for notifications and other entities
  setPriority(priority: 'low' | 'normal' | 'high' | 'urgent'): void {
    this.setAttribute('priority', priority);
  }

  getPriority(): 'low' | 'normal' | 'high' | 'urgent' {
    return this.getAttribute('priority') || 'normal';
  }

  // Common helper methods
  markAsRead(): void {
    this.setAttribute('read', true);
    this.setMetadata('readAt', new Date());
  }

  isRead(): boolean {
    return this.getAttribute('read') === true;
  }
}
