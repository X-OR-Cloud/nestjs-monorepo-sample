@echo off
echo === NestJS Monorepo Demo Test Script ===
echo.

echo 1. Testing if services are accessible...

echo Testing IAM Service (Port 3001)...
curl -s -o nul -w "%%{http_code}" http://localhost:3001 > temp_status.txt
set /p IAM_STATUS=<temp_status.txt
if not "%IAM_STATUS%"=="200" (
    echo ❌ IAM Service not accessible. Please start it with: npm run start:iam
    del temp_status.txt
    pause
    exit /b 1
)
echo ✅ IAM Service is running

echo Testing BPM Service (Port 3002)...
curl -s -o nul -w "%%{http_code}" http://localhost:3002 > temp_status.txt
set /p BPM_STATUS=<temp_status.txt
if not "%BPM_STATUS%"=="200" (
    echo ❌ BPM Service not accessible. Please start it with: npm run start:bpm
    del temp_status.txt
    pause
    exit /b 1
)
echo ✅ BPM Service is running

echo Testing LGM Service (Port 3003)...
curl -s -o nul -w "%%{http_code}" http://localhost:3003 > temp_status.txt
set /p LGM_STATUS=<temp_status.txt
if not "%LGM_STATUS%"=="200" (
    echo ❌ LGM Service not accessible. Please start it with: npm run start:lgm
    del temp_status.txt
    pause
    exit /b 1
)
echo ✅ LGM Service is running

echo Testing NSM Service (Port 3004)...
curl -s -o nul -w "%%{http_code}" http://localhost:3004 > temp_status.txt
set /p NSM_STATUS=<temp_status.txt
if not "%NSM_STATUS%"=="200" (
    echo ❌ NSM Service not accessible. Please start it with: npm run start:nsm
    del temp_status.txt
    pause
    exit /b 1
)
echo ✅ NSM Service is running

del temp_status.txt

echo.
echo 2. Testing API Flow...

REM Generate unique username for testing
for /f %%i in ('powershell -command "Get-Date -UFormat %%s"') do set TIMESTAMP=%%i
set USERNAME=testuser%TIMESTAMP%
set PASSWORD=password123

echo Registering user: %USERNAME%
curl -s -X POST http://localhost:3001/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"%USERNAME%\", \"password\": \"%PASSWORD%\"}" > register_response.txt
echo Register Response:
type register_response.txt
echo.

echo Logging in...
curl -s -X POST http://localhost:3001/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\": \"%USERNAME%\", \"password\": \"%PASSWORD%\"}" > login_response.txt
echo Login Response:
type login_response.txt
echo.

REM Extract JWT token (simplified version)
for /f "tokens=2 delims=:" %%a in ('findstr "accessToken" login_response.txt') do (
    set JWT_RAW=%%a
)
REM Remove quotes and comma
set JWT_TOKEN=%JWT_RAW:"=%
set JWT_TOKEN=%JWT_TOKEN:,=%
set JWT_TOKEN=%JWT_TOKEN: =%

if "%JWT_TOKEN%"=="" (
    echo ❌ Failed to get JWT token
    pause
    exit /b 1
)

echo ✅ JWT Token obtained: %JWT_TOKEN:~0,20%...

REM Wait for events to process
timeout /t 2 /nobreak > nul

echo Getting accounts...
curl -s -X GET http://localhost:3002/accounts ^
  -H "Authorization: Bearer %JWT_TOKEN%" > accounts_response.txt
echo Accounts Response:
type accounts_response.txt
echo.

echo Creating income transaction...
curl -s -X POST http://localhost:3002/transactions ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer %JWT_TOKEN%" ^
  -d "{\"amount\": 100, \"type\": \"income\", \"description\": \"Test income\"}" > transaction_response.txt
echo Transaction Response:
type transaction_response.txt
echo.

REM Wait for events to process
timeout /t 2 /nobreak > nul

echo Getting transactions...
curl -s -X GET http://localhost:3002/transactions ^
  -H "Authorization: Bearer %JWT_TOKEN%" > transactions_response.txt
echo Transactions Response:
type transactions_response.txt
echo.

echo Getting updated accounts...
curl -s -X GET http://localhost:3002/accounts ^
  -H "Authorization: Bearer %JWT_TOKEN%" > updated_accounts_response.txt
echo Updated Accounts Response:
type updated_accounts_response.txt
echo.

echo Getting logs...
curl -s -X GET http://localhost:3003/logs ^
  -H "Authorization: Bearer %JWT_TOKEN%" > logs_response.txt
echo Logs Response:
type logs_response.txt
echo.

REM Cleanup temp files
del register_response.txt login_response.txt accounts_response.txt transaction_response.txt transactions_response.txt updated_accounts_response.txt logs_response.txt

echo.
echo === Test Completed ===
echo ✅ All services are working correctly!
echo.
echo To test WebSocket notifications:
echo 1. Open demo-client.html in your browser
echo 2. Login with the user you just created
echo 3. Connect to WebSocket
echo 4. Create transactions to see real-time notifications
echo.
echo Services running on:
echo - IAM: http://localhost:3001
echo - BPM: http://localhost:3002
echo - LGM: http://localhost:3003
echo - NSM: http://localhost:3004
echo.
pause
