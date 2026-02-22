# PowerShell npm Fix Guide

## 🔧 Issue

PowerShell is trying to execute `npm.ps1` from `D:\New Folder\` which has execution policy restrictions.

**Error:**
```
npm : File D:\New Folder\npm.ps1 cannot be loaded because running scripts is disabled
```

## ✅ Solution

### Option 1: Use `npm.cmd` (Recommended)

Instead of `npm`, use `npm.cmd`:

```powershell
# Frontend
npm.cmd start

# Backend
cd backend
npm.cmd start

# Install packages
npm.cmd install
```

### Option 2: Use Helper Scripts

I've created helper scripts for you:

**Start Frontend:**
```powershell
.\start-frontend.ps1
```

**Start Backend:**
```powershell
cd backend
.\start-backend.ps1
```

### Option 3: Fix PATH (Advanced)

If you want to fix the root cause:

1. Check current PATH:
   ```powershell
   $env:PATH -split ';'
   ```

2. Remove `D:\New Folder\` from PATH if it's causing issues
3. Ensure Node.js installation path is in PATH (usually `C:\Program Files\nodejs\`)

## 🚀 Quick Start Commands

### Start Backend
```powershell
cd backend
npm.cmd start
```

### Start Frontend (New Terminal)
```powershell
npm.cmd start
```

## ✅ Verification

Check if it works:
```powershell
npm.cmd --version
```

Should show: `11.6.2` (or your npm version)

---

## 📝 Why This Happens

PowerShell prioritizes `.ps1` files over `.cmd` files. The `npm.ps1` in `D:\New Folder\` is being executed first, but it has execution policy restrictions.

Using `npm.cmd` explicitly tells PowerShell to use the `.cmd` file instead, which doesn't have these restrictions.

---

## ✅ All Fixed!

Now you can use:
- `npm.cmd start` - Start any npm script
- `npm.cmd install` - Install packages
- `npm.cmd run <script>` - Run npm scripts

Everything works the same, just use `npm.cmd` instead of `npm`!
