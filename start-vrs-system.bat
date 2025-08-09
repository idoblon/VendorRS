@echo off
title VRS - Vendor Request System Startup
color 0A

echo.
echo ========================================
echo    VRS - Vendor Request System
echo ========================================
echo.

echo Starting VRS Backend and Frontend...
echo.

echo [1/4] Checking MongoDB status...
echo Please ensure MongoDB is running on localhost:27017
echo.

echo [2/4] Starting Backend Server...
cd backend
start "VRS Backend" cmd /k "npm run dev"
echo Backend starting on http://localhost:5000
echo.

timeout /t 3 /nobreak >nul

echo [3/4] Starting Frontend Development Server...
cd ..
start "VRS Frontend" cmd /k "npm run dev"
echo Frontend starting on http://localhost:3000
echo.

timeout /t 2 /nobreak >nul

echo [4/4] Opening System in Browser...
timeout /t 5 /nobreak >nul
start http://localhost:3000

echo.
echo ========================================
echo    VRS System Started Successfully!
echo ========================================
echo.
echo Backend API: http://localhost:5000
echo Frontend App: http://localhost:3000
echo Health Check: http://localhost:5000/health
echo.
echo Login Credentials:
echo Credentials are configured through environment variables.
echo Please check your .env file for the actual values.
echo.
echo Login with admin credentials from your .env file
echo.
echo Press any key to close this window...
pause >nul