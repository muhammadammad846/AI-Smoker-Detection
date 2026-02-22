# 🚀 Push to GitHub - Step by Step

## ✅ Pre-Flight Check

**Sensitive Files Protected:**
- ✅ `backend/ServiceAccount.json` - Will NOT be pushed
- ✅ `backend/.env` - Will NOT be pushed  
- ✅ `backend/models/*.pt` - Will NOT be pushed (too large)
- ✅ All credentials safe!

---

## 📋 Quick Steps

### Step 1: Configure Git (First Time Only)

```powershell
# Set your name and email (use your GitHub email)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 2: Create GitHub Repository

1. **Go to:** https://github.com/new
2. **Repository name:** `cctv-smoking-detection` (or your choice)
3. **Description:** "AI-powered CCTV smoking detection system"
4. **Visibility:** Public or Private
5. **DO NOT** check "Initialize with README"
6. **Click "Create repository"**

### Step 3: Push Your Code

**After creating the repo, run these commands:**

```powershell
# Make sure you're in project directory
cd "D:\ammad project"

# Add all files
git add .

# Create commit
git commit -m "Initial commit: Complete CCTV Smoking Detection System - Production Ready"

# Add GitHub remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🎯 Or Use the Automated Script

**Run the helper script:**

```powershell
.\push-to-github.ps1
```

This script will:
1. ✅ Check git setup
2. ✅ Stage all files
3. ✅ Create commit
4. ✅ Guide you through GitHub setup
5. ✅ Push to GitHub

---

## 🔐 What Gets Pushed

### ✅ Will Be Pushed:
- All source code
- All documentation
- Configuration files
- Build scripts
- Package files

### ❌ Will NOT Be Pushed (Protected):
- `backend/ServiceAccount.json` - Firebase credentials
- `backend/.env` - Environment variables
- `backend/models/*.pt` - Model files (too large)
- `node_modules/` - Dependencies
- `backend/venv/` - Python virtual environment

---

## 🚨 Important Notes

1. **GitHub Authentication:**
   - If push fails, you may need to authenticate
   - Use Personal Access Token (not password)
   - Or use GitHub CLI: `gh auth login`

2. **Large Files:**
   - Model file (`best.pt`) is ~6MB
   - Too large for GitHub (100MB limit, but slow)
   - Consider using Git LFS or storing elsewhere

3. **Sensitive Data:**
   - All credentials are protected
   - Add manually to deployment platform
   - Never commit secrets!

---

## ✅ After Pushing

1. **Verify on GitHub:**
   - Check repository exists
   - Verify all files are there
   - Check sensitive files are NOT there

2. **For Deployment:**
   - Connect Railway/Render to your repo
   - Deploy from GitHub
   - Add `ServiceAccount.json` as secret

---

## 🆘 Troubleshooting

### "Author identity unknown"
```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### "Authentication failed"
- Use Personal Access Token instead of password
- Or: `gh auth login` (GitHub CLI)

### "Repository not found"
- Check repository name is correct
- Verify you have access
- Check URL format

---

**Ready?** Run `.\push-to-github.ps1` or follow the manual steps above! 🚀
