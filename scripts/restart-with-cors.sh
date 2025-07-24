#!/bin/bash

echo "🔄 Rebuilding and restarting all services with CORS support..."

echo "📦 Building all services..."
npm run build:all

echo "🛑 Stopping PM2 services..."
pm2 stop ecosystem.config.js

echo "🚀 Starting services with CORS enabled..."
pm2 start ecosystem.config.js --env production

echo "📊 PM2 Status:"
pm2 status

echo "✅ All services restarted with CORS support!"
echo ""
echo "🌐 Services available at:"
echo "   - IAM: http://103.252.73.254:3001"
echo "   - BPM: http://103.252.73.254:3002" 
echo "   - LGM: http://103.252.73.254:3003"
echo "   - NSM: http://103.252.73.254:3004"
