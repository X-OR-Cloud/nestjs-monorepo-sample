@echo off
echo Starting NestJS Microservices Demo...
echo.

REM Start all services in background
echo Starting IAM Service (Port 3001)...
start "IAM Service" cmd /k "cd /d \"%~dp0\" && npm run start:iam"

timeout /t 3 /nobreak > nul

echo Starting BPM Service (Port 3002)...
start "BPM Service" cmd /k "cd /d \"%~dp0\" && npm run start:bpm"

timeout /t 3 /nobreak > nul

echo Starting LGM Service (Port 3003)...
start "LGM Service" cmd /k "cd /d \"%~dp0\" && npm run start:lgm"

timeout /t 3 /nobreak > nul

echo Starting NSM Service (Port 3004)...
start "NSM Service" cmd /k "cd /d \"%~dp0\" && npm run start:nsm"

echo.
echo All services are starting...
echo.
echo Services will be available at:
echo - IAM Service: http://localhost:3001
echo - BPM Service: http://localhost:3002  
echo - LGM Service: http://localhost:3003
echo - NSM Service: http://localhost:3004
echo.
echo To test the cross-service communication:
echo 1. Register a user: POST http://localhost:3001/auth/register
echo 2. Check BPM for auto-created account: GET http://localhost:3002/accounts
echo 3. Check NSM for welcome notification: GET http://localhost:3004/notifications
echo 4. Check LGM for event logs: GET http://localhost:3003/logs
echo.
pause
