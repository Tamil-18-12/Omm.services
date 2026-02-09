@echo off
echo.
echo ========================================
echo   Stopping OM Service Pro Server
echo ========================================
echo.

taskkill /F /IM node.exe 2>nul

if %errorlevel% equ 0 (
    echo ✅ All Node.js processes stopped
) else (
    echo ℹ️  No Node.js processes were running
)

timeout /t 2 /nobreak >nul

echo.
echo ✅ Ready to start server!
echo.
pause
