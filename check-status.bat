@echo off
REM StarOil Status Check Script
REM Verifies both backend and frontend servers are running

setlocal enabledelayedexpansion

echo.
echo =========================================
echo   StarOil Application Status Check
echo =========================================
echo.

REM Add Node.js to PATH
set "PATH=C:\Program Files\nodejs;%PATH%"

REM Check Node.js
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo   ✗ Node.js NOT found
    goto error
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
    echo   ✓ Node.js !NODE_VER!
)

REM Check npm
echo Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo   ✗ npm NOT found
    goto error
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
    echo   ✓ npm !NPM_VER!
)

echo.
echo Checking ports...

REM Check port 3000 (Backend)
echo Checking Backend (port 3000)...
netstat -ano 2>nul | find ":3000 " >nul
if errorlevel 1 (
    echo   ✗ Backend NOT running on port 3000
    echo.
    echo To start backend:
    echo   1. Open a new terminal (PowerShell or CMD)
    echo   2. Run: cd "%cd%\backend"
    echo   3. Run: npm run dev
) else (
    echo   ✓ Backend is RUNNING on port 3000
)

echo.

REM Check port 5173 (Frontend)
echo Checking Frontend (port 5173)...
netstat -ano 2>nul | find ":5173 " >nul
if errorlevel 1 (
    echo   ✗ Frontend NOT running on port 5173
    echo.
    echo To start frontend:
    echo   1. Open a new terminal (PowerShell or CMD)
    echo   2. Run: cd "%cd%\frontend"
    echo   3. Run: npm run dev
) else (
    echo   ✓ Frontend is RUNNING on port 5173
)

echo.
echo =========================================

REM Check if both running
netstat -ano 2>nul | find ":3000 " >nul
set BACKEND_OK=%ERRORLEVEL%

netstat -ano 2>nul | find ":5173 " >nul
set FRONTEND_OK=%ERRORLEVEL%

if %BACKEND_OK%==0 if %FRONTEND_OK%==0 (
    echo.
    echo ✓ BOTH SERVERS ARE RUNNING!
    echo.
    echo Access the application at:
    echo   http://localhost:5173
    echo.
    echo Login with:
    echo   Email: admin@staroil.local
    echo   Password: StarOil123!
    echo.
) else (
    echo.
    echo Please start both servers before accessing the application.
    echo.
)

echo =========================================
echo.
pause
exit /b 0

:error
echo.
echo ERROR: Unable to verify setup
echo Please ensure Node.js 18+ is installed from https://nodejs.org/
echo.
pause
exit /b 1
