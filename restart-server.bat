@echo off
echo.
echo ========================================
echo   OM SERVICE - Starting Server
echo ========================================
echo.
echo Killing any existing Node processes...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo.
echo Starting server on PORT 3001...
echo.
node server.js