# Build APK Script
# This script helps you build the APK for production

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CCTV Smoking Detection - APK Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if EAS CLI is installed
Write-Host "Checking EAS CLI..." -ForegroundColor Yellow
$easInstalled = Get-Command eas.cmd -ErrorAction SilentlyContinue

if (-not $easInstalled) {
    Write-Host "❌ EAS CLI not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Installing EAS CLI..." -ForegroundColor Yellow
    npm.cmd install -g eas-cli
    Write-Host ""
}

# Check if logged in
Write-Host "Checking Expo login status..." -ForegroundColor Yellow
$loginCheck = eas.cmd whoami 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to Expo!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please login first:" -ForegroundColor Yellow
    Write-Host "  eas.cmd login" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ Logged in!" -ForegroundColor Green
Write-Host ""

# Ask for build type
Write-Host "Select build type:" -ForegroundColor Yellow
Write-Host "  1. Preview (Testing APK)" -ForegroundColor White
Write-Host "  2. Production (Release APK)" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Enter choice (1 or 2)"

if ($choice -eq "1") {
    $profile = "preview"
    Write-Host ""
    Write-Host "Building Preview APK..." -ForegroundColor Green
} elseif ($choice -eq "2") {
    $profile = "production"
    Write-Host ""
    Write-Host "⚠️  WARNING: Make sure you've updated production URLs!" -ForegroundColor Yellow
    Write-Host "   - src/services/apiService.js" -ForegroundColor White
    Write-Host "   - src/services/socketService.js" -ForegroundColor White
    Write-Host ""
    $confirm = Read-Host "Continue? (y/n)"
    if ($confirm -ne "y") {
        Write-Host "Build cancelled." -ForegroundColor Yellow
        exit 0
    }
    Write-Host ""
    Write-Host "Building Production APK..." -ForegroundColor Green
} else {
    Write-Host "Invalid choice!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting build..." -ForegroundColor Cyan
Write-Host "This may take 10-20 minutes..." -ForegroundColor Yellow
Write-Host ""

# Build APK
eas.cmd build --platform android --profile $profile

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✅ Build Completed Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Download your APK from:" -ForegroundColor Yellow
    Write-Host "  https://expo.dev/accounts/[your-account]/builds" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ❌ Build Failed!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check the error messages above." -ForegroundColor Yellow
    Write-Host "See BUILD_APK_GUIDE.md for troubleshooting." -ForegroundColor Yellow
    Write-Host ""
}
