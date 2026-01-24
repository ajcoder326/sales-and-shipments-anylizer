@echo off
title Kuber Industries - Sales Analyzer
color 0A

echo.
echo ========================================
echo   Kuber Industries Sales Analyzer
echo   Local Server Setup
echo ========================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing dependencies for the first time...
    echo This may take a few minutes...
    echo.
    call npm install
    echo.
    echo [SUCCESS] Dependencies installed!
    echo.
)

echo [INFO] Starting the server...
echo.
echo ========================================
echo   Server will start at:
echo   http://localhost:3000
echo.
echo   To share via ngrok:
echo   1. Open another terminal
echo   2. Run: ngrok http 3000
echo   3. Share the generated URL
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

:: Start the server
node server.js

pause
