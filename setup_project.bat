@echo off
title Kuber Sales Analyzer - Project Setup
color 0B

echo.
echo ========================================================
echo   Kuber Industries - Sales Analyzer Setup
echo ========================================================
echo.

:: 1. Check for Node.js
echo [STEP 1/3] Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is NOT installed on this PC.
    echo.
    echo Please download and install Node.js from:
    echo https://nodejs.org/
    echo.
    echo After installing, run this script again.
    echo.
    pause
    exit /b 1
)
node --version
echo [OK] Node.js found.
echo.

:: 2. Install Dependencies
echo [STEP 2/3] Installing application dependencies...
if exist "node_modules" (
    echo [INFO] 'node_modules' folder already exists. Skipping install.
    echo        (Delete 'node_modules' folder if you want to reinstall)
) else (
    echo Installing packages... This make take 1-2 minutes...
    call npm install
    
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Failed to install dependencies.
        echo Please check your internet connection.
        pause
        exit /b 1
    )
)
echo [OK] Dependencies ready.
echo.

:: 3. Setup Database (Auto-creates on first run)
echo [STEP 3/3] Checking database...
if exist "sales_data.db" (
    echo [OK] Database file exists.
) else (
    echo [INFO] Database will be created automatically on first launch.
)
echo.

echo ========================================================
echo   SETUP COMPLETE!
echo ========================================================
echo.
echo You can now run the application using 'run_app.bat'
echo.
pause
