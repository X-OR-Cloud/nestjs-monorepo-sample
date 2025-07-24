#!/bin/bash

echo "🚀 Testing Cross-Service Communication"
echo "=====================================\n"

BASE_URL="http://localhost"

# Test data
USER_DATA='{
  "username": "testuser123",
  "password": "password123"
}'

echo "1️⃣  Registering new user..."
echo "POST ${BASE_URL}:3001/auth/register"
echo "Data: ${USER_DATA}"

# Register user and capture response
REGISTER_RESPONSE=$(curl -s -X POST "${BASE_URL}:3001/auth/register" \
  -H "Content-Type: application/json" \
  -d "${USER_DATA}")

echo "Response: ${REGISTER_RESPONSE}\n"

# Wait for events to propagate
echo "⏳ Waiting for cross-service events to propagate..."
sleep 3

echo "\n2️⃣  Checking BPM Service - Auto-created Account"
echo "GET ${BASE_URL}:3002/accounts"
ACCOUNTS_RESPONSE=$(curl -s -X GET "${BASE_URL}:3002/accounts")
echo "Response: ${ACCOUNTS_RESPONSE}\n"

echo "\n3️⃣  Checking NSM Service - Welcome Notification"  
echo "GET ${BASE_URL}:3004/notifications"
NOTIFICATIONS_RESPONSE=$(curl -s -X GET "${BASE_URL}:3004/notifications")
echo "Response: ${NOTIFICATIONS_RESPONSE}\n"

echo "\n4️⃣  Checking LGM Service - Event Logs"
echo "GET ${BASE_URL}:3003/logs"
LOGS_RESPONSE=$(curl -s -X GET "${BASE_URL}:3003/logs")
echo "Response: ${LOGS_RESPONSE}\n"

echo "✅ Cross-service communication test completed!"
echo "\nEvent Flow:"
echo "IAM → user.registered → BPM → account.created → NSM → notification.sent → LGM (logs all)"
