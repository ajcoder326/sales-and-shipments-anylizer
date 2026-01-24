@echo off
title Kuber Sales Analyzer - Ngrok Setup
color 0E

echo.
echo ========================================================
echo   Ngrok Tunnel Setup
echo ========================================================
echo.

:: 1. Check for ngrok.exe
if not exist "ngrok.exe" (
    echo [ERROR] 'ngrok.exe' was NOT found in this folder.
    echo.
    echo 1. Please download ngrok from: https://ngrok.com/download
    echo 2. Extract the ZIP file.
    echo 3. Copy 'ngrok.exe' into this folder:
    echo    %CD%
    echo.
    pause
    exit /b 1
)

echo [OK] Ngrok found.
echo.

:: 2. Prompt for Authtoken
echo STEP A: AUTHENTICATION
echo To keep your tunnel running without expiration, you need an Authtoken.
echo You can get it from: https://dashboard.ngrok.com/get-started/your-authtoken
echo.
set /p TOKEN=">> Please Paste your Ngrok Authtoken here: "

if "%TOKEN%"=="" (
    echo.
    echo [ERROR] No token entered.
    goto DOMAIN_SETUP
)

echo.
echo Configuring ngrok...
ngrok config add-authtoken %TOKEN%

:DOMAIN_SETUP
echo.
echo --------------------------------------------------------
echo.
echo STEP B: PERMANENT URL (Optional)
echo.
echo Ngrok now offers ONE free static domain for all users.
echo Example: 'my-app.ngrok-free.app'
echo.
echo If you have claimed a static domain on your ngrok dashboard:
echo https://dashboard.ngrok.com/cloud-edge/domains
echo.
echo Press ENTER to skip if you don't have one.
echo.
set /p DOMAIN=">> Enter your Static Domain (e.g. app.ngrok-free.app): "

if not "%DOMAIN%"=="" (
    echo %DOMAIN%> ngrok_domain.config
    echo.
    echo [SUCCESS] Static domain saved!
    echo Your app will now always open at: https://%DOMAIN%
) else (
    if exist "ngrok_domain.config" del "ngrok_domain.config"
    echo.
    echo [INFO] Using random URL mode.
)

echo.
echo ========================================================
echo   SETUP COMPLETE!
echo ========================================================
echo.
echo You can now use 'run_app.bat' to start the server.
echo.
pause
