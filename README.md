# NestJS Microservices Monorepo with Queue-Based Communication

## 🏗️ Architecture Overview

This project demonstrates a comprehensive NestJS monorepo architecture with 4 microservices communicating through Redis-based queues (with in-memory fallback for development).

### 📦 Project Structure

```
nest-monorepo-demo/
├── apps/                           # Microservices
│   ├── iam/                       # Identity & Access Management
│   │   ├── src/
│   │   │   ├── auth/              # JWT authentication
│   │   │   ├── user/              # User management
│   │   │   └── queue/             # Event processors
│   │   └── .env                   # IAM-specific config
│   │
│   ├── bpm/                       # Business Process Management
│   │   ├── src/
│   │   │   ├── account/           # Account management
│   │   │   ├── transaction/       # Transaction handling
│   │   │   └── queue/             # Event processors
│   │   └── .env                   # BPM-specific config
│   │
│   ├── lgm/                       # Log Management
│   │   ├── src/
│   │   │   ├── log/               # Audit logging
│   │   │   └── queue/             # Event processors
│   │   └── .env                   # LGM-specific config
│   │
│   └── nsm/                       # Notification Service Management
│       ├── src/
│       │   ├── notification/      # Push notifications
│       │   ├── websocket/         # Real-time communication
│       │   └── queue/             # Event processors
│       └── .env                   # NSM-specific config
│
├── libs/                          # Shared libraries
│   └── shared/
│       └── src/
│           ├── auth/              # Shared authentication
│           ├── database/          # MongoDB configuration
│           ├── entities/          # BaseEntity pattern
│           ├── events/            # Cross-service event types
│           └── queue/             # Queue management
│
├── test-queue.js                  # Redis queue test
├── test-mock-queue.js            # In-memory queue demo
└── README.md                     # This file
```

## 🚀 Services Overview

### 🔐 IAM Service (Identity & Access Management)  
- **Port**: 3001
- **Database**: `iam_db`
- **Responsibilities**:
  - User registration and authentication
  - JWT token generation and validation
  - Password management
  - Emits `user.registered` events

### 💼 BPM Service (Business Process Management)
- **Port**: 3002
- **Database**: `bpm_db`
- **Responsibilities**:
  - Account creation and management
  - Transaction processing
  - Business logic execution
  - Listens to `user.registered`, emits `account.created`

### 📊 LGM Service (Log Management)
- **Port**: 3003
- **Database**: `lgm_db`
- **Responsibilities**:
  - Audit trail logging
  - System event monitoring
  - Compliance tracking
  - Listens to ALL events (`*` processor)

### 🔔 NSM Service (Notification Service Management)
- **Port**: 3004
- **Database**: `nsm_db`
- **Responsibilities**:
  - Push notifications
  - WebSocket real-time updates
  - Email/SMS notifications
  - Listens to `user.registered`, `account.created`

## 🔧 Technical Stack

- **Framework**: NestJS 10.x
- **Database**: MongoDB with Mongoose
- **Queue System**: Redis + Bull (with in-memory fallback)
- **Authentication**: JWT
- **Real-time**: WebSocket
- **Validation**: class-validator, class-transformer
- **Testing**: Jest

## 📋 Prerequisites

- Node.js 18+
- MongoDB (or MongoDB Atlas)
- Redis (optional - uses in-memory fallback)
- npm or yarn

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy environment files for each service:
```bash
# Copy environment templates
cp apps/iam/.env.example apps/iam/.env
cp apps/bpm/.env.example apps/bpm/.env
cp apps/lgm/.env.example apps/lgm/.env
cp apps/nsm/.env.example apps/nsm/.env
```

### 3. Configure MongoDB
Update `.env` files with your MongoDB connection strings:
```env
# Example for each service
MONGODB_URI=mongodb://localhost:27017/iam_db  # Change db name per service
JWT_SECRET=your-jwt-secret-here
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Test the System
```bash
# Test queue system (requires Redis)
node test-queue.js

# Test with in-memory mock (no Redis required)
node test-mock-queue.js
```

## 🔄 Event Flow Example

Here's how a typical user registration flows through the system:

1. **IAM Service** receives registration request
2. **IAM Service** creates user and emits `user.registered` event
3. **BPM Service** processes event and creates default account
4. **BPM Service** emits `account.created` event
5. **NSM Service** processes event and sends welcome notification
6. **LGM Service** logs all events for audit trail

### Event Types

#### `user.registered`
```typescript
{
  eventType: 'user.registered',
  source: 'iam',
  data: {
    userId: 'user_123',
    username: 'john_doe',
    email: 'john@example.com'
  },
  timestamp: Date,
  correlationId: 'corr_abc123'
}
```

#### `account.created`
```typescript
{
  eventType: 'account.created',
  source: 'bpm',
  data: {
    accountId: 'acc_456',
    userId: 'user_123',
    accountType: 'savings',
    balance: 0
  },
  timestamp: Date,
  correlationId: 'corr_abc123'
}
```

## 🏛️ BaseEntity Pattern

All entities inherit from a shared `BaseEntity` class providing:

```typescript
class BaseEntity {
  id: string;                    // Unique identifier
  owner: { userId, orgId };      // Ownership info
  attributes: Map<string, any>;  // Flexible attributes
  metadata: Map<string, any>;    // System metadata
  context: Map<string, any>;     // Request context
  isDeleted(): boolean;          // Soft delete
  setAttribute(key, value);      // Set custom attribute
  setMetadata(key, value);       // Set system metadata
  addContext(key, value);        // Add request context
}
```

## 🔐 Authentication

JWT-based authentication with service-specific secrets:
- Each service has its own JWT secret
- Tokens include user ID and organization ID
- Shared authentication module for validation

## 📊 Queue System

### Production (Redis + Bull)
```typescript
// Real queue service with Redis backend
@Injectable()
class QueueService {
  async emitEvent(event: CrossServiceEvent) {
    await this.eventQueue.add(event.eventType, event, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    });
  }
}
```

### Development (In-Memory Mock)
```typescript
// Mock queue for development without Redis
@Injectable()
class MockQueueService {
  async emitEvent(event: CrossServiceEvent) {
    // Process immediately with registered processors
    setTimeout(() => this.processJob(job), 100);
  }
}
```

## 🧪 Testing

### Queue System Test
```bash
# Test with Redis (if available)
node test-queue.js

# Test with mock queue
node test-mock-queue.js
```

## 🔧 Configuration

### Environment Variables

Each service supports these environment variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/service_db

# JWT Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Redis Queue (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Service-specific
PORT=3001
NODE_ENV=development
```

## 🔍 Key Features

- ✅ **Microservices Architecture**: 4 independent services (IAM, BPM, LGM, NSM)
- ✅ **Queue-Based Communication**: Redis queues with Bull for reliability
- ✅ **Shared Libraries**: Common authentication, database, and event patterns
- ✅ **BaseEntity Pattern**: Flexible entity system with ownership and metadata
- ✅ **Event-Driven Design**: Cross-service communication via events
- ✅ **MongoDB Integration**: Separate databases per service
- ✅ **JWT Authentication**: Service-specific secrets and validation
- ✅ **Development Mock**: In-memory queue for development without Redis
- ✅ **Error Handling**: Retry mechanisms and failure handling
- ✅ **Audit Logging**: Centralized event logging via LGM service

---

**Built with ❤️ using NestJS Microservices Architecture**
