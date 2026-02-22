# Fly.io Deployment Script for Windows PowerShell
# This script helps you deploy your backend to Fly.io

Write-Host "🚀 Fly.io Deployment Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if flyctl is installed
Write-Host "Checking Fly CLI installation..." -ForegroundColor Yellow
try {
    $flyVersion = flyctl version 2>&1
    Write-Host "✅ Fly CLI is installed: $flyVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Fly CLI is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Install Fly CLI:" -ForegroundColor Yellow
    Write-Host "Run as Administrator: iwr https://fly.io/install.ps1 -useb | iex" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "Checking if you're logged in..." -ForegroundColor Yellow
try {
    flyctl auth whoami 2>&1 | Out-Null
    Write-Host "✅ You are logged in to Fly.io" -ForegroundColor Green
} catch {
    Write-Host "❌ You are not logged in!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please login first:" -ForegroundColor Yellow
    Write-Host "flyctl auth login" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "📋 Deployment Steps:" -ForegroundColor Cyan
Write-Host "1. Make sure you have set your secrets:" -ForegroundColor Yellow
Write-Host "   flyctl secrets set SERVICE_ACCOUNT_JSON='your-json-here'" -ForegroundColor White
Write-Host "   flyctl secrets set FIREBASE_STORAGE_BUCKET='your-bucket-name'" -ForegroundColor White
Write-Host ""
Write-Host "2. Deploy your app:" -ForegroundColor Yellow
Write-Host "   flyctl deploy" -ForegroundColor White
Write-Host ""

$continue = Read-Host "Do you want to deploy now? (y/n)"
if ($continue -eq "y" -or $continue -eq "Y") {
    Write-Host ""
    Write-Host "🚀 Deploying to Fly.io..." -ForegroundColor Cyan
    flyctl deploy
} else {
    Write-Host ""
    Write-Host "Deployment cancelled. Run 'flyctl deploy' when ready." -ForegroundColor Yellow
}
