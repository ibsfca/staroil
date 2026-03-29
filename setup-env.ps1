#!/usr/bin/env pwsh
<#
    StarOil Development Environment Setup Script
    Adds Node.js to PATH and provides startup commands
#>

# Add Node.js to PATH if not already there
if (-not ($env:PATH -like "*nodejs*")) {
    $env:PATH = "C:\Program Files\nodejs;$env:PATH"
    Write-Host "✓ Added Node.js to PATH" -ForegroundColor Green
}

# Verify node is available
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "✓ Node.js $(node --version) available" -ForegroundColor Green
    Write-Host "✓ npm $(npm --version) available" -ForegroundColor Green
} else {
    Write-Host "✗ Node.js not found in PATH" -ForegroundColor Red
    exit 1
}

# Show available commands
Write-Host "`n========== StarOil Development Commands ==========" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start Backend Server:" -ForegroundColor Yellow
Write-Host '   cd "$HOME/Downloads/ngrok-v3-stable-windows-amd64/StarOil/backend"'
Write-Host "   npm run dev"
Write-Host ""
Write-Host "2. Start Frontend Dev Server:" -ForegroundColor Yellow
Write-Host '   cd "$HOME/Downloads/ngrok-v3-stable-windows-amd64/StarOil/frontend"'
Write-Host "   npm install"
Write-Host "   npm run dev"
Write-Host ""
Write-Host "3. Access Application:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:5173"
Write-Host "   Backend API: http://localhost:3000/api"
Write-Host "   Email: admin@staroil.local"
Write-Host "   Password: StarOil123!"
Write-Host ""
Write-Host "=================================================" -ForegroundColor Cyan
