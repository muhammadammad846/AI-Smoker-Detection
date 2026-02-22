# 🎯 Railway Simple Solution

## ⚡ Quick Fix - 2 Steps

### Step 1: Set Root Directory in Railway

1. **Railway Dashboard** → Your Service
2. **Settings** tab
3. **Find "Root Directory"**
4. **Change to:** `backend`
5. **Save**

### Step 2: Redeploy

1. Click **"Redeploy"** or **"Deploy"**
2. Railway will now:
   - ✅ Detect Node.js from `backend/package.json`
   - ✅ Run `npm install` in backend folder
   - ✅ Start with `node server.js`

---

## ✅ That's It!

**Setting Root Directory to `backend` is the simplest solution.**

Railway will automatically:
- Detect Node.js
- Install dependencies
- Start the server

---

## 📋 Environment Variables

**Add in Railway → Variables:**

```
PORT=3000
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NODE_ENV=production
```

---

## 🔐 ServiceAccount.json

**Option 1: Add as Secret Variable**
- Name: `SERVICE_ACCOUNT_JSON`
- Value: Paste JSON content

**Option 2: Upload to Railway Volume**
- Create volume
- Upload file

---

**Just set Root Directory to `backend` and redeploy!** 🚀
