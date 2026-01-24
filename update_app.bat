@echo off
title Kuber Sales Analyzer - Update App
color 0B

echo.
echo ========================================================
echo   Updating Application from GitHub
echo ========================================================
echo.

:: 1. Check Internet
echo [INFO] Checking connection...
ping google.com -n 1 -w 1000 >nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] No internet connection.
    pause
    exit /b 1
)

:: 2. Pull Changes
echo [INFO] Pulling latest changes from GitHub...
git pull origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCCESS] Application updated successfully!
    echo.
    echo You may need to restart the server if it's running.
    echo.
) else (
    echo.
    echo [ERROR] Failed to update.
    echo Detailed error above.
)

echo.
pause
