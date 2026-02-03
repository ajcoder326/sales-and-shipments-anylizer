@echo off
setlocal enabledelayedexpansion
title Kuber Industries - Project Setup
mode con: cols=80 lines=35
color 0B

cd /d "%~dp0"

cls
echo.
echo  ╔════════════════════════════════════════════════════════════════════════╗
echo  ║                                                                        ║
echo  ║      KUBER INDUSTRIES - SALES DATA ANALYZER                            ║
echo  ║                                                                        ║
echo  ║                    FIRST TIME SETUP                                    ║
echo  ║                                                                        ║
echo  ╚════════════════════════════════════════════════════════════════════════╝
echo.

:: ========== STEP 1: Check Node.js ==========
echo  ┌────────────────────────────────────────────────────────────────────────┐
echo  │  STEP 1: Checking Node.js Installation                                 │
echo  └────────────────────────────────────────────────────────────────────────┘
echo.

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo   [ERROR] Node.js is NOT installed!
    echo.
    echo   Please download and install Node.js from:
    echo   https://nodejs.org/
    echo.
    echo   After installing, run this setup again.
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo   [OK] Node.js is installed: %NODE_VERSION%
echo.

:: ========== STEP 2: Install Dependencies ==========
echo  ┌────────────────────────────────────────────────────────────────────────┐
echo  │  STEP 2: Installing Dependencies                                       │
echo  └────────────────────────────────────────────────────────────────────────┘
echo.

if exist "node_modules" (
    echo   [OK] Dependencies already installed!
) else (
    echo   Installing npm packages...
    call npm install
    if %ERRORLEVEL% neq 0 (
        color 0C
        echo   [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    echo   [OK] Dependencies installed successfully!
)
echo.

:: ========== STEP 3: Get Network Info ==========
echo  ┌────────────────────────────────────────────────────────────────────────┐
echo  │  STEP 3: Network Configuration                                         │
echo  └────────────────────────────────────────────────────────────────────────┘
echo.

set LOCAL_IP=
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4 Address"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        if not defined LOCAL_IP set LOCAL_IP=%%b
    )
)
for /f "tokens=* delims= " %%a in ("!LOCAL_IP!") do set LOCAL_IP=%%a

echo   Your Local IP Address: !LOCAL_IP!
echo   Office users can access: http://!LOCAL_IP!:3000
echo.

:: ========== STEP 4: Create Desktop Shortcut ==========
echo  ┌────────────────────────────────────────────────────────────────────────┐
echo  │  STEP 4: Create Desktop Shortcut                                       │
echo  └────────────────────────────────────────────────────────────────────────┘
echo.

set /p CREATE_SHORTCUT="   Create desktop shortcut? (Y/n): "
if /i not "!CREATE_SHORTCUT!"=="n" (
    set SCRIPT_PATH=%~dp0start.bat
    set SHORTCUT_NAME=Kuber Sales Analyzer
    
    echo Set oWS = WScript.CreateObject("WScript.Shell") > "%temp%\CreateShortcut.vbs"
    echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\!SHORTCUT_NAME!.lnk" >> "%temp%\CreateShortcut.vbs"
    echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%temp%\CreateShortcut.vbs"
    echo oLink.TargetPath = "!SCRIPT_PATH!" >> "%temp%\CreateShortcut.vbs"
    echo oLink.WorkingDirectory = "%~dp0" >> "%temp%\CreateShortcut.vbs"
    echo oLink.Description = "Kuber Industries Sales Data Analyzer" >> "%temp%\CreateShortcut.vbs"
    echo oLink.IconLocation = "shell32.dll,21" >> "%temp%\CreateShortcut.vbs"
    echo oLink.Save >> "%temp%\CreateShortcut.vbs"
    
    cscript //nologo "%temp%\CreateShortcut.vbs"
    del "%temp%\CreateShortcut.vbs"
    
    echo   [OK] Desktop shortcut created!
) else (
    echo   [SKIP] Shortcut not created.
)
echo.

:: ========== SETUP COMPLETE ==========
color 0A
echo  ╔════════════════════════════════════════════════════════════════════════╗
echo  ║                                                                        ║
echo  ║                    ✓ SETUP COMPLETE!                                   ║
echo  ║                                                                        ║
echo  ╠════════════════════════════════════════════════════════════════════════╣
echo  ║                                                                        ║
echo  ║   To start the application:                                            ║
echo  ║   - Double-click "Kuber Sales Analyzer" on your desktop                ║
echo  ║   - Or run: start.bat                                                  ║
echo  ║                                                                        ║
echo  ║   Your office network URL: http://!LOCAL_IP!:3000                      ║
echo  ║   Login: admin / admin123                                              ║
echo  ║                                                                        ║
echo  ╚════════════════════════════════════════════════════════════════════════╝
echo.

set /p START_NOW="   Start the application now? (Y/n): "
if /i not "!START_NOW!"=="n" (
    endlocal
    call start.bat
) else (
    endlocal
    pause
)
