@echo off
REM StarOil - Start Backend Development Server
REM Requires: Node.js 18+ installed

setlocal enabledelayedexpansion
set "SCRIPT_DIR=%~dp0"
set "BACKEND_DIR=%SCRIPT_DIR%backend"

echo.
echo ========================================
echo   StarOil Backend API Server
echo ========================================
echo.

cd /d "%BACKEND_DIR%"

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Starting backend server on port 3000...
echo.

call npm run dev

pause
