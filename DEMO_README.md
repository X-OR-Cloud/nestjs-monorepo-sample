# NestJS Monorepo Demo

Demo project với 4 microservices: IAM, BPM, LGM, NSM

## Architecture

### IAM (Identity Access Management) - Port 3001
- **Module**: User
- **APIs**:
  - `POST /auth/register` - Đăng ký user mới
  - `POST /auth/login` - Đăng nhập và nhận JWT token
- **Events**: 
  - Emit `user-register` event → BPM
  - Emit `user-event` event → LGM

### BPM (Business Process Management) - Port 3002
- **Modules**: Account, Transaction
- **APIs** (yêu cầu JWT):
  - `GET /accounts` - Lấy danh sách tài khoản
  - `GET /transactions` - Lấy danh sách giao dịch
  - `POST /transactions` - Tạo giao dịch mới
- **Events**:
  - Listen `user-register` → Tạo account với balance = 0
  - Emit `transaction-create`, `user-event`, `notification` events

### LGM (Log Management) - Port 3003
- **Module**: Log
- **APIs** (yêu cầu JWT):
  - `GET /logs` - Lấy danh sách logs
- **Events**:
  - Listen `user-event` → Ghi log vào database

### NSM (Notification Service Management) - Port 3004
- **Module**: Notification
- **WebSocket**: Hỗ trợ real-time notifications với JWT auth
- **Events**:
  - Listen `notification` → Emit tới WebSocket clients

## Setup & Run

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Chạy từng service riêng biệt
```bash
# IAM Service (port 3001)
npm run start:iam

# BPM Service (port 3002)
npm run start:bpm

# LGM Service (port 3003)
npm run start:lgm

# NSM Service (port 3004)
npm run start:nsm
```

### 3. Chạy tất cả services cùng lúc
```bash
npm run start:all
```

## API Testing

### 1. Đăng ký user mới
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

### 2. Đăng nhập
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "password123"}'
```

### 3. Lấy accounts (cần JWT token)
```bash
curl -X GET http://localhost:3002/accounts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Tạo transaction (cần JWT token)
```bash
curl -X POST http://localhost:3002/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"amount": 100, "type": "income", "description": "Test transaction"}'
```

### 5. Lấy logs (cần JWT token)
```bash
curl -X GET http://localhost:3003/logs \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## WebSocket Connection (NSM)

Kết nối tới WebSocket tại `ws://localhost:3004` với JWT token:

```javascript
const socket = io('http://localhost:3004', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

socket.on('notification', (data) => {
  console.log('Received notification:', data);
});

socket.emit('getNotifications');
```

## Event Flow

1. **User Register**: IAM → `user-register` → BPM (tạo account) + `user-event` → LGM (log)
2. **User Login**: IAM → `user-event` → LGM (log)
3. **Create Transaction**: BPM → `transaction-create` + `user-event` → LGM + `notification` → NSM → WebSocket clients

## Technologies

- NestJS (Framework)
- JWT (Authentication)
- WebSocket (Real-time communication)
- EventEmitter (Inter-service communication)
- TypeScript
- Socket.IO
