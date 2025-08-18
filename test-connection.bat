@echo off
title VRS - Connection Test
color 0A

echo.
echo ========================================
echo    VRS - Testing Backend Connection
echo ========================================
echo.

node test-connection.js

echo.
echo Press any key to close this window...
pause >nul