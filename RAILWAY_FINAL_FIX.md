# ✅ Railway Deployment - Final Fix

## 🔧 Configuration Files Created

I've created root-level configuration files that Railway can detect:

1. **`railway.toml`** - Railway deployment configuration
2. **`nixpacks.toml`** - Tells Railway to use Node.js + Python
3. **`package.json`** - Updated with Railway build/start scripts

---

## 🚀 What to Do in Railway

### Option 1: Set Root Directory (Easiest)

1. **Railway Dashboard** → Your Service → **Settings**
2. **Find "Root Directory"**
3. **Set to:** `backend`
4. **Save** and **Redeploy**

This tells Railway to treat the `backend/` folder as the root.

### Option 2: Use Root Configuration (Current Setup)

The root-level files I created will help Railway detect:
- Node.js runtime
- Python dependencies  
- Build commands
- Start command

**Just redeploy** and Railway should detect it now!

---

## 📋 Environment Variables

**In Railway → Variables tab, add:**

```
PORT=3000
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NODE_ENV=production
```

---

## 🔐 ServiceAccount.json

**Add as Railway Secret:**

1. Railway Dashboard → Variables
2. **Add Variable:**
   - Name: `SERVICE_ACCOUNT_JSON`
   - Value: Paste entire JSON content from `backend/ServiceAccount.json`
3. **Update `backend/server.js`** to read from env var:

```javascript
// Replace this line:
const serviceAccount = require('./serviceAccount.json');

// With this:
const serviceAccount = process.env.SERVICE_ACCOUNT_JSON 
  ? JSON.parse(process.env.SERVICE_ACCOUNT_JSON)
  : require('./serviceAccount.json');
```

---

## ✅ After Deployment

1. **Get your Railway URL** (e.g., `https://your-app.railway.app`)
2. **Test:** `https://your-app.railway.app/api/health`
3. **Update frontend:**
   - `src/services/apiService.js` - Replace production URL
   - `src/services/socketService.js` - Replace production URL
4. **Build APK**

---

## 🎯 Recommended: Set Root Directory

**The easiest fix is to set Root Directory to `backend` in Railway settings.**

This way Railway will:
- ✅ Detect `backend/package.json`
- ✅ Run `npm install` in backend
- ✅ Start with `node server.js`
- ✅ Everything works automatically

---

**Configuration files pushed to GitHub! Redeploy on Railway now!** 🚀
