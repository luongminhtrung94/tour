@echo off
REM TOPTHAI TRAVEL COMPANY - Quick Start Script
REM This script helps you start the website with Docker

echo ========================================
echo TOPTHAI TRAVEL COMPANY
echo Quick Start Script
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

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    echo.
    pause
    exit /b 1
)

echo [INFO] Docker is running
echo.

REM Build and start the containers
echo [INFO] Building and starting containers...
echo.
docker compose up -d --build

if errorlevel 1 (
    echo.
    echo [ERROR] Failed to start containers
    echo Check the error messages above
    pause
    exit /b 1
)

echo.
echo ========================================
echo [SUCCESS] Application started!
echo ========================================
echo.
echo Website: http://localhost:3000
echo Health Check: http://localhost:3000/healthz
echo.
echo Useful commands:
echo   View logs:    docker compose logs -f
echo   Stop:         docker compose down
echo   Restart:      docker compose restart
echo.
echo Press any key to view logs...
pause >nul

docker compose logs -f

