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

export abstract class BaseEntity {
  id: string;
  createdAt: Date;
  changedAt: Date;
  deletedAt?: Date;
  owner: Owner;
  attributes?: Attributes;
  metadata?: Metadata;

  constructor(partial: Partial<BaseEntity>) {
    Object.assign(this, partial);
    
    // Set defaults if not provided
    if (!this.id) {
      this.id = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9);
    }
    
    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    
    if (!this.changedAt) {
      this.changedAt = new Date();
    }
  }

  // Helper method to mark entity as deleted (soft delete)
  markAsDeleted(): void {
    this.deletedAt = new Date();
    this.changedAt = new Date();
  }

  // Helper method to update changed timestamp
  markAsChanged(): void {
    this.changedAt = new Date();
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
}
