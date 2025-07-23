# BaseEntity Documentation

## Overview

`BaseEntity` là abstract class cơ bản cho tất cả entities trong hệ thống monorepo. Nó cung cấp các trường chung và helper methods để quản lý lifecycle của entities.

## Core Fields

### Required Fields
- `id: string` - Unique identifier, auto-generated nếu không provided
- `createdAt: Date` - Timestamp khi entity được tạo
- `changedAt: Date` - Timestamp khi entity được update lần cuối
- `owner: Owner` - Thông tin ownership của entity

### Optional Fields
- `deletedAt?: Date` - Timestamp khi entity bị soft delete
- `attributes?: Attributes` - Dynamic attributes (key-value pairs)
- `metadata?: Metadata` - System metadata (key-value pairs)

## Owner Interface

```typescript
interface Owner {
  userId: string;    // ID của user sở hữu entity
  orgId?: string;    // ID của organization (optional)
}
```

## Helper Methods

### Lifecycle Methods
- `markAsDeleted()` - Soft delete entity
- `markAsChanged()` - Update changedAt timestamp
- `isDeleted(): boolean` - Check if entity is soft deleted

### Attributes Management
- `setAttribute(key: string, value: any)` - Set/update attribute
- `getAttribute(key: string): any` - Get attribute value

### Metadata Management
- `setMetadata(key: string, value: any)` - Set/update metadata
- `getMetadata(key: string): any` - Get metadata value

## Usage Examples

### Creating a User Entity

```typescript
import { BaseEntity } from '@libs/shared/entities';

export class User extends BaseEntity {
  username: string;
  password: string;

  constructor(partial: Partial<User>) {
    super(partial);
    Object.assign(this, partial);
  }
}

// Usage
const user = new User({
  username: 'john_doe',
  password: 'hashed_password',
  owner: {
    userId: 'self-reference-will-be-set',
    orgId: 'acme-corp'
  }
});

// Set custom attributes
user.setAttribute('lastLoginAt', new Date());
user.setAttribute('preferredLanguage', 'en');

// Set system metadata
user.setMetadata('createdByAdmin', true);
user.setMetadata('migrationVersion', '1.0');
```

### Working with Attributes & Metadata

```typescript
// Attributes - Business-specific data
entity.setAttribute('status', 'active');
entity.setAttribute('priority', 'high');
entity.setAttribute('tags', ['important', 'urgent']);

// Metadata - System/technical data
entity.setMetadata('processingTime', 150);
entity.setMetadata('cacheExpiry', new Date());
entity.setMetadata('debugInfo', { step: 'validation', success: true });

// Retrieving data
const status = entity.getAttribute('status');
const processingTime = entity.getMetadata('processingTime');
```

### Soft Delete Pattern

```typescript
// Instead of hard delete
// database.delete(entity);

// Use soft delete
entity.markAsDeleted();

// Check if deleted
if (entity.isDeleted()) {
  console.log('Entity was deleted at:', entity.deletedAt);
}

// Filter out deleted entities
const activeEntities = allEntities.filter(e => !e.isDeleted());
```

### Ownership & Multi-tenancy

```typescript
// Find entities by user
const userEntities = entities.filter(e => 
  e.owner.userId === currentUserId && !e.isDeleted()
);

// Find entities by organization
const orgEntities = entities.filter(e => 
  e.owner.orgId === currentOrgId && !e.isDeleted()
);

// Find user entities within specific org
const userOrgEntities = entities.filter(e => 
  e.owner.userId === currentUserId && 
  e.owner.orgId === currentOrgId && 
  !e.isDeleted()
);
```

## Benefits

1. **Consistency** - Tất cả entities có cùng base structure
2. **Auditability** - Automatic tracking của creation/modification times
3. **Soft Delete** - Safe deletion pattern
4. **Flexibility** - Dynamic attributes và metadata
5. **Multi-tenancy** - Built-in ownership model
6. **Type Safety** - TypeScript support với proper typing

## Entity Examples in Project

### User Entity (IAM)
```typescript
export class User extends BaseEntity {
  username: string;
  password: string;
  // inherits: id, createdAt, changedAt, owner, attributes, metadata
}
```

### Account Entity (BPM)
```typescript
export class Account extends BaseEntity {
  balance: number;
  
  deposit(amount: number): void {
    this.balance += amount;
    this.markAsChanged();
    this.setMetadata('lastOperation', 'deposit');
  }
}
```

### Transaction Entity (BPM)
```typescript
export class Transaction extends BaseEntity {
  amount: number;
  type: 'expense' | 'income';
  description?: string;
  
  getDisplayAmount(): string {
    return this.type === 'expense' ? `-$${this.amount}` : `+$${this.amount}`;
  }
}
```

### Log Entity (LGM)
```typescript
export class Log extends BaseEntity {
  service: string;
  action: string;
  time: Date;
  
  setLogLevel(level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'): void {
    this.setMetadata('logLevel', level);
  }
}
```

### Notification Entity (NSM)
```typescript
export class Notification extends BaseEntity {
  message: string;
  type: string;
  read: boolean;
  
  markAsRead(): void {
    this.read = true;
    this.setMetadata('readAt', new Date());
    this.markAsChanged();
  }
}
```
