@echo off
echo 🔧 Setting up environment files...
echo.

if not exist "apps\iam\.env" (
    copy "apps\iam\.env.example" "apps\iam\.env" >nul
    echo ✅ Created apps\iam\.env
) else (
    echo ⚠️  apps\iam\.env already exists
)

if not exist "apps\bpm\.env" (
    copy "apps\bpm\.env.example" "apps\bpm\.env" >nul
    echo ✅ Created apps\bpm\.env
) else (
    echo ⚠️  apps\bpm\.env already exists
)

if not exist "apps\lgm\.env" (
    copy "apps\lgm\.env.example" "apps\lgm\.env" >nul
    echo ✅ Created apps\lgm\.env
) else (
    echo ⚠️  apps\lgm\.env already exists
)

if not exist "apps\nsm\.env" (
    copy "apps\nsm\.env.example" "apps\nsm\.env" >nul
    echo ✅ Created apps\nsm\.env
) else (
    echo ⚠️  apps\nsm\.env already exists
)

echo.
echo 🎉 Environment setup complete!
echo 📝 Edit .env files to customize your configuration
echo 🔐 Remember: .env files are gitignored for security
pause
