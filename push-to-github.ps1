# Push to GitHub Script
# This script helps you push your repository to GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Push to GitHub - Setup Guide" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git not initialized!" -ForegroundColor Red
    Write-Host "Initializing git..." -ForegroundColor Yellow
    git init
    Write-Host ""
}

# Check if files are staged
$staged = git diff --cached --name-only
if ($staged.Count -eq 0) {
    Write-Host "⚠️  No files staged. Staging all files..." -ForegroundColor Yellow
    git add .
    Write-Host ""
}

# Check if there's a commit
$lastCommit = git log -1 --oneline 2>$null
if (-not $lastCommit) {
    Write-Host "Creating initial commit..." -ForegroundColor Yellow
    git commit -m "Initial commit: Complete CCTV Smoking Detection System - Production Ready"
    Write-Host "✅ Commit created!" -ForegroundColor Green
    Write-Host ""
}

# Check for remote
$remote = git remote -v 2>$null
if (-not $remote) {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "  GitHub Repository Setup" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Step 1: Create a new repository on GitHub:" -ForegroundColor Cyan
    Write-Host "  1. Go to: https://github.com/new" -ForegroundColor White
    Write-Host "  2. Repository name: cctv-smoking-detection" -ForegroundColor White
    Write-Host "  3. Description: AI-powered CCTV smoking detection system" -ForegroundColor White
    Write-Host "  4. Choose Public or Private" -ForegroundColor White
    Write-Host "  5. DO NOT initialize with README" -ForegroundColor White
    Write-Host "  6. Click 'Create repository'" -ForegroundColor White
    Write-Host ""
    Write-Host "Step 2: After creating, enter your GitHub repository URL:" -ForegroundColor Cyan
    Write-Host "  Format: https://github.com/YOUR_USERNAME/REPO_NAME.git" -ForegroundColor White
    Write-Host ""
    
    $repoUrl = Read-Host "Enter GitHub repository URL"
    
    if ($repoUrl) {
        Write-Host ""
        Write-Host "Adding remote..." -ForegroundColor Yellow
        git remote add origin $repoUrl
        
        Write-Host "Setting branch to main..." -ForegroundColor Yellow
        git branch -M main
        
        Write-Host ""
        Write-Host "Pushing to GitHub..." -ForegroundColor Green
        git push -u origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "  ✅ Successfully pushed to GitHub!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "Your repository: $repoUrl" -ForegroundColor Cyan
            Write-Host ""
        } else {
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Red
            Write-Host "  ❌ Push failed!" -ForegroundColor Red
            Write-Host "========================================" -ForegroundColor Red
            Write-Host ""
            Write-Host "Possible issues:" -ForegroundColor Yellow
            Write-Host "  - Repository URL incorrect" -ForegroundColor White
            Write-Host "  - Not authenticated with GitHub" -ForegroundColor White
            Write-Host "  - Repository doesn't exist" -ForegroundColor White
            Write-Host ""
            Write-Host "Try:" -ForegroundColor Yellow
            Write-Host "  git remote set-url origin $repoUrl" -ForegroundColor White
            Write-Host "  git push -u origin main" -ForegroundColor White
            Write-Host ""
        }
    } else {
        Write-Host "No URL provided. Exiting." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "To add remote manually:" -ForegroundColor Cyan
        Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git" -ForegroundColor White
        Write-Host "  git branch -M main" -ForegroundColor White
        Write-Host "  git push -u origin main" -ForegroundColor White
        Write-Host ""
    }
} else {
    Write-Host "✅ Remote already configured:" -ForegroundColor Green
    git remote -v
    Write-Host ""
    
    $push = Read-Host "Push to GitHub? (y/n)"
    if ($push -eq "y") {
        Write-Host ""
        Write-Host "Pushing to GitHub..." -ForegroundColor Green
        git push -u origin main
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Successfully pushed!" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "❌ Push failed. Check errors above." -ForegroundColor Red
        }
    }
}

Write-Host ""
