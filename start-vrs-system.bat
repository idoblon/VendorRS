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

echo [1/5] Checking environment files...
if not exist ".env" (
  echo Frontend .env file not found. Creating default .env file...
  echo VITE_API_URL=http://localhost:5000 > .env
  echo Frontend .env file created.
)

if not exist "backend\.env" (
  echo Backend .env file not found. Please create one based on .env.example
  echo You can copy backend\.env.example to backend\.env and modify as needed
  pause
  exit
)

echo Environment files checked.
echo.

echo [2/5] Checking MongoDB status...
echo Please ensure MongoDB is running on localhost:27017
echo.

echo [3/5] Starting Backend Server...
cd backend
start "VRS Backend" cmd /k "npm run dev"
echo Backend starting on http://localhost:5000
echo.

timeout /t 3 /nobreak >nul

echo [4/5] Starting Frontend Development Server...
cd ..
start "VRS Frontend" cmd /k "npm run dev"
echo Frontend starting on http://localhost:5173
echo.

timeout /t 2 /nobreak >nul

echo [5/5] Opening System in Browser...
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo ========================================
echo    VRS System Started Successfully!
echo ========================================
echo.
echo Backend API: http://localhost:5000
echo Frontend App: http://localhost:5173
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