@echo off
setlocal enabledelayedexpansion

:: Colors
set RED=0C
set GREEN=0A
set YELLOW=0E
set NC=07

:: Variables
set CURRENT_LINK=C:\opt\ayan-taraz\current
set RELEASES_DIR=C:\opt\ayan-taraz\releases

:: List available releases
echo %YELLOW%Available releases:%NC%
dir "%RELEASES_DIR%" /ad /o-d /b

:: Ask for release to rollback to
set /p ROLLBACK_RELEASE="Enter release directory to rollback to (e.g., 20260629_120000): "

:: Validate release
echo Checking %RELEASES_DIR%\%ROLLBACK_RELEASE%...
if not exist "%RELEASES_DIR%\%ROLLBACK_RELEASE%" (
  echo %RED%✗ Release %ROLLBACK_RELEASE% does not exist%NC%
  exit /b 1
)

:: Update current symlink
if exist "%CURRENT_LINK%" rmdir "%CURRENT_LINK%"
mklink /J "%CURRENT_LINK%" "%RELEASES_DIR%\%ROLLBACK_RELEASE%"
echo %GREEN%✓ Rollback to %ROLLBACK_RELEASE% complete%NC%

:: Restart services
cd /d "%CURRENT_LINK%"
docker compose down
docker compose up -d

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

echo %GREEN%🔙 Rollback to %ROLLBACK_RELEASE% successful!%NC%