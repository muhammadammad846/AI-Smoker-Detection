# 🚀 Quick Push to GitHub

## ⚡ Fastest Way - 3 Steps

### Step 1: Set Git User (One Time)

```powershell
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

**Use your GitHub username and email!**

### Step 2: Create GitHub Repository

1. Go to: **https://github.com/new**
2. Name: `cctv-smoking-detection`
3. **DO NOT** check "Initialize with README"
4. Click **"Create repository"**

### Step 3: Push Code

**Copy and run these commands (replace YOUR_USERNAME and REPO_NAME):**

```powershell
cd "D:\ammad project"

# Add all files
git add .

# Commit
git commit -m "Initial commit: Complete CCTV Smoking Detection System"

# Add remote (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push
git branch -M main
git push -u origin main
```

---

## ✅ Done!

Your code is now on GitHub! 🎉

**Next:** Deploy backend using Railway (see `BACKEND_DEPLOYMENT_GUIDE.md`)

---

## 🔐 Protected Files

These are **NOT** pushed (safe!):
- ✅ `backend/ServiceAccount.json`
- ✅ `backend/.env`
- ✅ `backend/models/*.pt`
