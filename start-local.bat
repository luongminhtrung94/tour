@echo off
REM TOPTHAI TRAVEL COMPANY - Local Development Script
REM This script helps you start the website locally (without Docker)

echo ========================================
echo TOPTHAI TRAVEL COMPANY
echo Local Development Script
echo ========================================
echo.

REM Check if .env file exists
if not exist .env (
    echo [WARNING] .env file not found!
    echo.
    echo Please create a .env file from .env.example:
    echo   1. Copy .env.example to .env
    echo   2. Edit .env with your SMTP credentials
    echo.
    echo Example:
    echo   copy .env.example .env
    echo   notepad .env
    echo.
    pause
    exit /b 1
)

echo [INFO] .env file found
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js 18+ from https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node --version
echo.

REM Check if node_modules exists
if not exist node_modules (
    echo [INFO] Installing dependencies...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
) else (
    echo [INFO] Dependencies already installed
    echo.
)

REM Create data directory if it doesn't exist
if not exist data (
    echo [INFO] Creating data directory...
    mkdir data
)

echo [INFO] Starting server...
echo.
echo ========================================
echo Website: http://localhost:3000
echo Health Check: http://localhost:3000/healthz
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

REM Update .env to use local path for database
set DATABASE_URL=./data/topthai.db

REM Start the server
node server/index.js

