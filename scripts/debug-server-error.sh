#!/bin/bash

echo "🔍 Checking PM2 logs for errors..."

echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🔍 Recent IAM service logs (last 50 lines):"
pm2 logs iam-service --lines 50

echo ""
echo "🔍 Recent error logs from all services:"
pm2 logs --err --lines 20

echo ""
echo "🔍 Environment variables check:"
echo "Checking if .env files exist in each service..."

services=("iam" "bpm" "lgm" "nsm")
for service in "${services[@]}"; do
    if [ -f "apps/$service/.env" ]; then
        echo "✅ apps/$service/.env exists"
        echo "   Variables: $(grep -c "=" apps/$service/.env) found"
    else
        echo "❌ apps/$service/.env missing"
    fi
done

echo ""
echo "🔍 MongoDB connection test:"
echo "Testing MongoDB connectivity..."

# Test MongoDB connection if available
if command -v mongosh &> /dev/null; then
    echo "Testing MongoDB connection..."
    mongosh --eval "db.runCommand('ping')" --quiet 2>/dev/null || echo "❌ MongoDB connection failed"
else
    echo "⚠️  mongosh not available, skipping MongoDB test"
fi
