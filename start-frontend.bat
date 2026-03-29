@echo off
REM StarOil - Start Frontend Development Server
REM Requires: Node.js 18+ installed

setlocal enabledelayedexpansion
set "SCRIPT_DIR=%~dp0"
set "FRONTEND_DIR=%SCRIPT_DIR%frontend"

echo.
echo ========================================
echo   StarOil Frontend Development Server
echo ========================================
echo.

cd /d "%FRONTEND_DIR%"

echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found in PATH
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo Installing dependencies...
call npm install

if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo Starting Vite dev server on port 5173...
echo.

call npm run dev

pause
