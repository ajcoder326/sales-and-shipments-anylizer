@echo off
:: This script creates a desktop shortcut for easy access
cd /d "%~dp0"

set SCRIPT_PATH=%~dp0start.bat
set SHORTCUT_NAME=Kuber Sales Analyzer

:: Create VBScript to make shortcut
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%temp%\CreateShortcut.vbs"
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\%SHORTCUT_NAME%.lnk" >> "%temp%\CreateShortcut.vbs"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%temp%\CreateShortcut.vbs"
echo oLink.TargetPath = "%SCRIPT_PATH%" >> "%temp%\CreateShortcut.vbs"
echo oLink.WorkingDirectory = "%~dp0" >> "%temp%\CreateShortcut.vbs"
echo oLink.Description = "Kuber Industries Sales Data Analyzer" >> "%temp%\CreateShortcut.vbs"
echo oLink.IconLocation = "shell32.dll,21" >> "%temp%\CreateShortcut.vbs"
echo oLink.Save >> "%temp%\CreateShortcut.vbs"

cscript //nologo "%temp%\CreateShortcut.vbs"
del "%temp%\CreateShortcut.vbs"

echo.
echo ================================================
echo   Desktop shortcut created successfully!
echo   Look for "Kuber Sales Analyzer" on your desktop
echo ================================================
echo.
pause
