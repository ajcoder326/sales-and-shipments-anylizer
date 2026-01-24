@echo off
title Kuber Sales Analyzer - Launcher
color 0A

echo.
echo ========================================================
echo   Starting Kuber Sales Analyzer
echo ========================================================
echo.

:: Check if setup was done
if not exist "node_modules" (
    echo [ERROR] Dependencies not found!
    echo Please run 'setup_project.bat' first.
    echo.
    pause
    exit /b 1
)

:: 1. Start Local Server in a new window
echo [INFO] Launching Local Server...
start "Kuber Local Server" cmd /k "node server.js"

:: Wait for server to initialize
echo Waiting for server to start...
timeout /t 5 >nul

:: 2. Check for Ngrok and Start it
echo [INFO] Configuring Ngrok...

:: Determine Ngrok Command
set NGROK_CMD=ngrok
if exist "ngrok.exe" set NGROK_CMD=ngrok.exe
where ngrok >nul 2>nul
if %ERRORLEVEL% equ 0 set NGROK_CMD=ngrok

:: Check for Static Domain
set DOMAIN_FLAG=
if exist "ngrok_domain.config" (
    set /p MY_DOMAIN=<ngrok_domain.config
)

if defined MY_DOMAIN (
    echo [INFO] Using Static Domain: %MY_DOMAIN%
    set ARGS=http --domain=%MY_DOMAIN% 3000
) else (
    echo [INFO] Using Random Domain
    set ARGS=http 3000
)

:: Run Ngrok
echo [INFO] Starting public tunnel...
start "Kuber Public Access (Ngrok)" cmd /k "echo Share the URL below with users: && echo. && %NGROK_CMD% %ARGS%"

:: 3. Open Browser
echo [INFO] Opening Local Dashboard...
start http://localhost:3000

echo.
echo ========================================================
echo   RUNNING!
echo ========================================================
echo.
echo 1. Keep the "Kuber Local Server" window OPEN.
echo 2. If Ngrok started, copy the URL from that window to share.
echo.
pause
