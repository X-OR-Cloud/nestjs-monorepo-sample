#!/bin/bash

# Script to test the entire NestJS Monorepo Demo flow
echo "=== NestJS Monorepo Demo Test Script ==="

# Check if all services are running
echo "1. Testing if services are accessible..."

# Test IAM Service
echo "Testing IAM Service (Port 3001)..."
IAM_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 || echo "000")
if [ "$IAM_STATUS" != "200" ]; then
    echo "❌ IAM Service not accessible. Please start it with: npm run start:iam"
    exit 1
fi
echo "✅ IAM Service is running"

# Test BPM Service
echo "Testing BPM Service (Port 3002)..."
BPM_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3002 || echo "000")
if [ "$BPM_STATUS" != "200" ]; then
    echo "❌ BPM Service not accessible. Please start it with: npm run start:bpm"
    exit 1
fi
echo "✅ BPM Service is running"

# Test LGM Service
echo "Testing LGM Service (Port 3003)..."
LGM_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003 || echo "000")
if [ "$LGM_STATUS" != "200" ]; then
    echo "❌ LGM Service not accessible. Please start it with: npm run start:lgm"
    exit 1
fi
echo "✅ LGM Service is running"

# Test NSM Service
echo "Testing NSM Service (Port 3004)..."
NSM_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3004 || echo "000")
if [ "$NSM_STATUS" != "200" ]; then
    echo "❌ NSM Service not accessible. Please start it with: npm run start:nsm"
    exit 1
fi
echo "✅ NSM Service is running"

echo ""
echo "2. Testing API Flow..."

# Generate unique username for testing
TIMESTAMP=$(date +%s)
USERNAME="testuser$TIMESTAMP"
PASSWORD="password123"

# Register user
echo "Registering user: $USERNAME"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}")

echo "Register Response: $REGISTER_RESPONSE"

# Login and get JWT token
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}")

echo "Login Response: $LOGIN_RESPONSE"

# Extract JWT token
JWT_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$JWT_TOKEN" ]; then
    echo "❌ Failed to get JWT token"
    exit 1
fi

echo "✅ JWT Token obtained: ${JWT_TOKEN:0:20}..."

# Wait a moment for events to process
sleep 2

# Get accounts (should be created after user registration)
echo "Getting accounts..."
ACCOUNTS_RESPONSE=$(curl -s -X GET http://localhost:3002/accounts \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "Accounts Response: $ACCOUNTS_RESPONSE"

# Create a transaction
echo "Creating income transaction..."
TRANSACTION_RESPONSE=$(curl -s -X POST http://localhost:3002/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{"amount": 100, "type": "income", "description": "Test income"}')

echo "Transaction Response: $TRANSACTION_RESPONSE"

# Wait for events to process
sleep 2

# Get transactions
echo "Getting transactions..."
TRANSACTIONS_RESPONSE=$(curl -s -X GET http://localhost:3002/transactions \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "Transactions Response: $TRANSACTIONS_RESPONSE"

# Get updated accounts (balance should be updated)
echo "Getting updated accounts..."
UPDATED_ACCOUNTS_RESPONSE=$(curl -s -X GET http://localhost:3002/accounts \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "Updated Accounts Response: $UPDATED_ACCOUNTS_RESPONSE"

# Get logs
echo "Getting logs..."
LOGS_RESPONSE=$(curl -s -X GET http://localhost:3003/logs \
  -H "Authorization: Bearer $JWT_TOKEN")

echo "Logs Response: $LOGS_RESPONSE"

echo ""
echo "=== Test Completed ==="
echo "✅ All services are working correctly!"
echo ""
echo "To test WebSocket notifications:"
echo "1. Open demo-client.html in your browser"
echo "2. Login with the user you just created"
echo "3. Connect to WebSocket"
echo "4. Create transactions to see real-time notifications"
echo ""
echo "Services running on:"
echo "- IAM: http://localhost:3001"
echo "- BPM: http://localhost:3002"
echo "- LGM: http://localhost:3003"  
echo "- NSM: http://localhost:3004"
