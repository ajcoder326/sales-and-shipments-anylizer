@echo off
setlocal enabledelayedexpansion
title Kuber Industries - Sales Data Analyzer
mode con: cols=75 lines=30
color 0B

:: Change to script directory
cd /d "%~dp0"

cls
echo.
echo  ===========================================================================
echo                     KUBER INDUSTRIES                                    
echo                 SALES DATA ANALYZER                                     
echo  ===========================================================================
echo.

:: Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    color 0C
    echo   [ERROR] Node.js is not installed!
    echo   Please run setup_project.bat first.
    pause
    exit /b 1
)

:: Check dependencies
if not exist "node_modules" (
    color 0E
    echo   [SETUP] Installing dependencies...
    call npm install --silent
)

:: Get Local IP Address
echo   [NETWORK] Detecting local IP address...
set LOCAL_IP=
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /C:"IPv4 Address"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        if not defined LOCAL_IP set LOCAL_IP=%%b
    )
)

:: Trim spaces from LOCAL_IP
for /f "tokens=* delims= " %%a in ("!LOCAL_IP!") do set LOCAL_IP=%%a

if not defined LOCAL_IP (
    echo   [WARNING] Could not detect IP. Using localhost only.
    set LOCAL_IP=localhost
) else (
    echo   [OK] Local IP: !LOCAL_IP!
)

:: Kill any existing processes
echo   [CLEANUP] Stopping any existing services...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>nul
)

:: Start server in background
echo   [STARTING] Initializing server...

echo Set WshShell = CreateObject("WScript.Shell") > "%temp%\runhidden.vbs"
echo WshShell.Run "cmd /c cd /d ""%~dp0"" && node server.js > server.log 2>&1", 0, False >> "%temp%\runhidden.vbs"
cscript //nologo "%temp%\runhidden.vbs"

:: Wait for server
echo   [WAITING] Server is starting up...
timeout /t 2 /nologo >nul

:checkserver
powershell -Command "(New-Object Net.Sockets.TcpClient).Connect('localhost', 3000)" 2>nul
if %ERRORLEVEL% neq 0 (
    timeout /t 1 /nologo >nul
    goto checkserver
)
echo   [OK] Server is running!
echo.

:: Display final status
color 0A
cls
echo.
echo  ===========================================================================
echo             SERVER RUNNING SUCCESSFULLY!                              
echo  ===========================================================================
echo.
echo   THIS COMPUTER:
echo   --------------
echo      http://localhost:3000
echo.
echo  ---------------------------------------------------------------------------
echo.
echo   OFFICE NETWORK ACCESS (Share with colleagues on same WiFi):
echo   ------------------------------------------------------------
echo      http://!LOCAL_IP!:3000
echo.
echo   Share this URL with anyone on your office network!
echo.
echo  ---------------------------------------------------------------------------
echo.
echo   LOGIN:  admin / admin123
echo.
echo  ---------------------------------------------------------------------------
echo.
echo   Keep this window OPEN while using the application.
echo   Press any key to STOP the server.
echo.
echo  ===========================================================================
echo.

:: Open browser
echo   Opening browser...
start http://localhost:3000

echo.
echo   Server is running. Press any key to stop...
echo.
pause >nul

:: Cleanup
echo.
echo   [STOPPING] Shutting down server...

for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>nul
)

del "%temp%\runhidden.vbs" >nul 2>nul

echo   [OK] Server stopped!
echo.
timeout /t 2 /nologo >nul
endlocal
exit
