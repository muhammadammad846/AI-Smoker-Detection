# 🚀 Push to GitHub Guide

## ✅ Pre-Push Checklist

**Sensitive Files Protected:**
- ✅ `backend/ServiceAccount.json` - Added to .gitignore
- ✅ `backend/.env` - Added to .gitignore
- ✅ `backend/models/*.pt` - Added to .gitignore (model files)
- ✅ All `.env` files - Added to .gitignore
- ✅ `node_modules/` - Already in .gitignore
- ✅ `venv/` - Already in .gitignore

---

## 📋 Steps to Push to GitHub

### Step 1: Create GitHub Repository

1. **Go to GitHub:** https://github.com
2. **Click "+" → "New repository"**
3. **Repository name:** `cctv-smoking-detection` (or your choice)
4. **Description:** "AI-powered CCTV smoking detection system with face recognition"
5. **Visibility:** Choose Public or Private
6. **DO NOT** initialize with README, .gitignore, or license (we already have these)
7. **Click "Create repository"**

### Step 2: Push Your Code

**After creating the repo, GitHub will show you commands. Use these:**

```powershell
# Make sure you're in the project directory
cd "D:\ammad project"

# Add all files (sensitive files are already ignored)
git add .

# Create initial commit
git commit -m "Initial commit: Complete CCTV Smoking Detection System"

# Add GitHub remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🔐 Important: Sensitive Files

**These files are NOT pushed (protected by .gitignore):**
- ✅ `backend/ServiceAccount.json` - Firebase credentials
- ✅ `backend/.env` - Environment variables
- ✅ `backend/models/*.pt` - YOLO model files (too large)
- ✅ All `node_modules/` - Dependencies
- ✅ `backend/venv/` - Python virtual environment

**You'll need to:**
1. Add `ServiceAccount.json` manually to your deployment platform
2. Set environment variables in deployment platform
3. Upload model file separately (or use Firebase Storage)

---

## 📝 Repository Structure

Your GitHub repo will include:
- ✅ All source code
- ✅ All documentation
- ✅ Configuration files
- ✅ Build scripts
- ❌ No sensitive credentials
- ❌ No large model files
- ❌ No dependencies

---

## 🚀 Quick Push Commands

**Replace `YOUR_USERNAME` and `REPO_NAME` with your actual values:**

```powershell
# 1. Add all files
git add .

# 2. Commit
git commit -m "Initial commit: Complete CCTV Smoking Detection System"

# 3. Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 4. Push
git branch -M main
git push -u origin main
```

---

## ✅ After Pushing

1. **Verify on GitHub:**
   - Check all files are there
   - Verify sensitive files are NOT there
   - Check README displays correctly

2. **For Deployment:**
   - Connect Railway/Render to your GitHub repo
   - Deploy from GitHub
   - Add sensitive files as environment variables

---

## 🔒 Security Notes

**Never commit:**
- ❌ `ServiceAccount.json`
- ❌ `.env` files
- ❌ API keys
- ❌ Passwords
- ❌ Private keys

**All protected by .gitignore!** ✅

---

**Ready to push?** Follow the steps above! 🚀
