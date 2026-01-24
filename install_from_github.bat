@echo off
title Kuber Sales Analyzer - Fresh Installer
color 0B

echo.
echo ========================================================
echo   Installing Kuber Sales Analyzer from GitHub
echo ========================================================
echo.

:: 1. Check for Git
echo [Step 1] Checking for Git...
where git >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Git is not installed on this PC.
    echo.
    echo Please download and install Git from: https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)

:: 2. Clone Repository
echo.
echo [Step 2] Downloading application code...
if exist "sales-and-shipments-anylizer" (
    echo [INFO] Folder already exists. Updating instead...
    cd sales-and-shipments-anylizer
    git pull
) else (
    git clone https://github.com/ajcoder326/sales-and-shipments-anylizer.git
    cd sales-and-shipments-anylizer
)

:: 3. Run Setup
echo.
echo [Step 3] Running Project Setup...
call setup_project.bat

echo.
echo ========================================================
echo   INSTALLATION COMPLETE!
echo ========================================================
echo.
echo The application is installed in the "sales-and-shipments-anylizer" folder.
echo.
echo You can run it now by opening the folder and clicking 'run_app.bat'
echo.
pause
