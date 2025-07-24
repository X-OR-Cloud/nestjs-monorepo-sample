#!/bin/bash

echo "🔍 Checking server status and CORS configuration..."

echo "📊 PM2 Status:"
pm2 status

echo ""
echo "🔄 Checking if services are responding..."

# Check each service
services=("3001:IAM" "3002:BPM" "3003:LGM" "3004:NSM")

for service in "${services[@]}"; do
    port=$(echo $service | cut -d: -f1)
    name=$(echo $service | cut -d: -f2)
    
    echo "Testing $name service on port $port..."
    
    # Test basic connectivity
    if curl -s -o /dev/null -w "%{http_code}" --max-time 5 "http://localhost:$port" | grep -q "200\|404\|401"; then
        echo "✅ $name service is responding on port $port"
        
        # Test CORS headers
        echo "Testing CORS headers for $name..."
        curl -s -I -X OPTIONS \
             -H "Origin: http://localhost:8080" \
             -H "Access-Control-Request-Method: POST" \
             -H "Access-Control-Request-Headers: Content-Type,Authorization" \
             "http://localhost:$port/auth/register" | grep -i "access-control"
        
    else
        echo "❌ $name service is not responding on port $port"
    fi
    echo ""
done

echo "🔄 If services are not running or CORS is missing, restart with:"
echo "npm run build:all && pm2 restart ecosystem.config.js"
