# 🔧 Environment Setup Guide

## 📋 **Required Environment Files**

Các file `.env` được gitignore để bảo mật. Bạn cần tạo chúng từ template:

```bash
# Copy template files to create actual .env files
cp apps/iam/.env.example apps/iam/.env
cp apps/bpm/.env.example apps/bpm/.env  
cp apps/lgm/.env.example apps/lgm/.env
cp apps/nsm/.env.example apps/nsm/.env
```

## 🔐 **Environment Variables Explained**

### Common Variables (All Services)
- `PORT`: Service port number
- `MONGODB_URI`: MongoDB connection string  
- `JWT_SECRET`: JWT signing secret (keep secure!)
- `NODE_ENV`: Environment (development/production)
- `SERVICE_NAME`: Service identifier
- `LOG_LEVEL`: Logging level (debug/info/warn/error)

### RabbitMQ Configuration
- `RABBITMQ_URL`: RabbitMQ connection string
- `USE_RABBITMQ`: Enable RabbitMQ (true/false)

## ⚠️ **Security Notes**

1. **Never commit actual .env files** - They contain sensitive data
2. **Update JWT secrets** for production deployment
3. **Use environment-specific RabbitMQ credentials**
4. **Secure your MongoDB connection strings**

## 🚀 **Quick Setup Script**

Create `setup-env.bat` (Windows) or `setup-env.sh` (Linux/Mac):

```bash
@echo off
echo Setting up environment files...
copy apps\iam\.env.example apps\iam\.env
copy apps\bpm\.env.example apps\bpm\.env
copy apps\lgm\.env.example apps\lgm\.env
copy apps\nsm\.env.example apps\nsm\.env
echo Environment setup complete!
```

## 🔄 **After Git Clone**

1. Run setup script or manually copy .env.example files
2. Update RabbitMQ credentials if needed
3. Update MongoDB URIs for your environment
4. Generate new JWT secrets for production

---

**🔒 Remember: .env files are gitignored for security. Always use .env.example for templates!**
