@echo off
echo.
echo ========================================
echo   Starting OM Service Pro Server
echo ========================================
echo.

REM Kill any existing node processes
echo 🔄 Checking for existing Node.js processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 🚀 Starting server...
echo.

REM Start the server
node server.js

pause
