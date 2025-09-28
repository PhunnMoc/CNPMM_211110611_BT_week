@echo off
REM Database Setup Script for Windows
REM This script automates the complete database setup process

echo.
echo ========================================
echo    Shopping Website Database Setup
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if MySQL is installed
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: MySQL is not installed or not in PATH
    echo Please install MySQL from https://dev.mysql.com/downloads/
    pause
    exit /b 1
)

REM Run the database setup
echo Starting database setup...
cd backend\scripts
node setup-database.js

if %errorlevel% neq 0 (
    echo.
    echo Database setup failed!
    pause
    exit /b 1
)

echo.
echo Database setup completed successfully!
echo.
pause
