@echo off
echo ========================================
echo VRS Backend Setup Script
echo ========================================
echo.

echo Installing Node.js dependencies...
call npm install

echo.
echo ========================================
echo Dependencies installed successfully!
echo ========================================
echo.

echo Starting MongoDB (make sure MongoDB is installed)...
echo Please ensure MongoDB is running on localhost:27017
echo.

echo Seeding database with sample data...
call npm run seed

echo.
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.

echo To start the server, run:
echo npm run dev
echo.

echo Server will be available at:
echo http://localhost:5000
echo.

echo Health check endpoint:
echo http://localhost:5000/health
echo.

pause