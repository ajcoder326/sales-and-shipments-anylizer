@echo off
title Kuber Sales Analyzer - Push Changes
color 0E

echo.
echo ========================================================
echo   Pushing Changes to GitHub
echo ========================================================
echo.

:: 1. Ask for Commit Message
set /p MSG=">> Enter description of changes: "

if "%MSG%"=="" (
    set MSG="Update from local PC"
)

:: 2. Git Commands
echo.
echo [INFO] Adding files...
git add .

echo [INFO] Committing...
git commit -m "%MSG%"

echo [INFO] Pushing to GitHub...
git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo [SUCCESS] Changes pushed to GitHub!
) else (
    echo.
    echo [ERROR] Push failed.
    echo Please ensure you have SSH keys set up or access rights.
)

echo.
pause
