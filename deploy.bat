@echo off
setlocal enabledelayedexpansion

:: Colors
set RED=0C
set GREEN=0A
set YELLOW=0E
set NC=07

:: Variables
set RELEASE_DIR=C:\opt\ayan-taraz\releases\%DATE:~-4%%DATE:~3,2%%DATE:~0,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%
set ENV_FILE=C:\opt\ayan-taraz\env\production.env
set CURRENT_LINK=C:\opt\ayan-taraz\current

:: Ensure directories exist
if not exist "C:\opt\ayan-taraz\releases" mkdir "C:\opt\ayan-taraz\releases"
if not exist "C:\opt\ayan-taraz\env" mkdir "C:\opt\ayan-taraz\env"
if not exist "C:\opt\ayan-taraz\uploads" mkdir "C:\opt\ayan-taraz\uploads"

:: Generate production.env if not exists
if not exist "%ENV_FILE%" (
  echo Creating %ENV_FILE%...
  (
    echo # API
    echo NODE_ENV=production
    echo PORT=3001
    echo.
    echo # CORS
    echo CORS_ORIGINS=http://202.133.91.13
    echo.
    echo # Database
    echo POSTGRES_USER=ayantaraz
    echo POSTGRES_DB=ayantaraz
    echo POSTGRES_PASSWORD=1BLTvcXfFFmKSzAtorghas0r
    echo DATABASE_URL=postgresql://ayantaraz:1BLTvcXfFFmKSzAtorghas0r@postgres:5432/ayantaraz?schema=public
    echo.
    echo # Redis
    echo REDIS_URL=redis://:ayantaraz_redis_2024@redis:6379
    echo REDIS_PASSWORD=ayantaraz_redis_2024
    echo.
    echo # Auth
    echo JWT_SECRET=ayantaraz_jwt_secret_2026_secure_64_chars_long_abcdefghijklmnopqrstuvwxyz0123456789
    echo JWT_EXPIRES_IN=30d
    echo SESSION_SECRET=ayantaraz_session_secret_2026_secure_64_chars
    echo.
    echo # Uploads
    echo FILE_ENCRYPTION_KEY=ayantaraz_file_encryption_key_32_bytes_long_1234567890
    echo.
    echo # SMS (Placeholder)
    echo SMS_API_KEY=CHANGE_ME
    echo.
    echo # Rate Limiting
    echo RATE_LIMIT_TTL=60000
    echo RATE_LIMIT=100
    echo.
    echo # Health
    echo HEALTH_CHECK_INTERVAL=30000
  ) > "%ENV_FILE%"
  echo %GREEN%✓ Created %ENV_FILE%%NC%
) else (
  echo %YELLOW%⚠ %ENV_FILE% already exists, skipping creation%NC%
)

:: Copy release files
set RELEASE_DIR=%RELEASE_DIR: =0%
echo %GREEN%→ Copying release files to %RELEASE_DIR%%NC%
mkdir "%RELEASE_DIR%"
copy ".env.production" "%RELEASE_DIR%\" /Y
copy "docker-compose.yml" "%RELEASE_DIR%\" /Y
xcopy "infra" "%RELEASE_DIR%\infra" /E /Y

:: Set permissions (Windows equivalent)
icacls "%RELEASE_DIR%" /inheritance:r /grant:r "ayan:(OI)(CI)F"

:: Create current symlink (Windows equivalent)
if exist "%CURRENT_LINK%" rmdir "%CURRENT_LINK%"
mklink /J "%CURRENT_LINK%" "%RELEASE_DIR%"
echo %GREEN%✓ Release symlinked to %CURRENT_LINK%%NC%

:: Pull images and start services
cd /d "%RELEASE_DIR%"
docker compose pull
docker compose up -d --build

:: Health check
echo %GREEN%→ Waiting for services to start...%NC%
timeout /t 15 /nobreak

for /f "tokens=*" %%i in ('curl -s http://localhost/health ^| jq -r .status') do set HEALTH_STATUS=%%i
if "%HEALTH_STATUS%" == "ok" (
  echo %GREEN%✓ All services are healthy%NC%
) else (
  echo %RED%✗ Health check failed: %HEALTH_STATUS%%NC%
  exit /b 1
)

:: Cleanup old releases (keep last 3)
echo %GREEN%→ Cleaning up old releases%NC%
for /f "skip=3 delims=" %%d in ('dir "C:\opt\ayan-taraz\releases" /ad /o-d /b') do (
  echo Removing old release: %%d
  rmdir /s /q "C:\opt\ayan-taraz\releases\%%d"
)

echo %GREEN%🚀 Deployment successful!%NC%