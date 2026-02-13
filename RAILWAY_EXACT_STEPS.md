# 🎯 Railway Configuration - Exact Steps

## ⚡ Quick Fix (2 Minutes)

### Step 1: Set Root Directory

**In Railway Dashboard:**

1. Scroll to **"Add Root Directory"** section
2. **Click "Add Root Directory"**
3. **Enter:** `backend`
4. **Click "Update"** (bottom of page)

### Step 2: Add Environment Variables

**Go to Variables tab:**

1. **Click "New Variable"**
2. Add these one by one:

```
PORT=3000
```

```
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```
(Replace with your actual Firebase Storage bucket)

```
NODE_ENV=production
```

```
SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"cctv-smoking-detection",...}
```
(Paste entire content from `backend/ServiceAccount.json`)

### Step 3: Set Healthcheck (Optional but Recommended)

**In Deploy section:**

1. Find **"Healthcheck Path"**
2. Enter: `/api/health`
3. Click **"Update"**

### Step 4: Redeploy

1. Go to **Deployments** tab
2. Click **"Redeploy"** or wait for auto-deploy
3. Watch the build logs

---

## ✅ What Railway Will Do

After setting Root Directory to `backend`:

1. ✅ Detects `backend/package.json`
2. ✅ Detects Node.js runtime
3. ✅ Runs `npm install` in backend folder
4. ✅ Installs Python dependencies (from nixpacks.toml)
5. ✅ Starts with `node server.js`

---

## 🔍 Verify It Works

After deployment:

1. **Get your Railway URL** (shown in Railway dashboard)
2. **Test:** `https://your-app.railway.app/api/health`
3. **Should return:** `{"status":"ok","message":"Server is running"}`

---

## 🚨 If Build Still Fails

**Check Build Logs for:**
- Node.js detection
- npm install success
- Python installation
- Any error messages

**Common Issues:**
- Root Directory not set correctly
- Missing environment variables
- ServiceAccount JSON format error

---

## 📋 Configuration Summary

**Required Settings:**
- ✅ Root Directory: `backend`
- ✅ PORT: `3000`
- ✅ FIREBASE_STORAGE_BUCKET: `your-bucket.appspot.com`
- ✅ SERVICE_ACCOUNT_JSON: `{...}` (full JSON)

**Optional but Recommended:**
- Healthcheck Path: `/api/health`

---

**Set Root Directory to `backend` and add the environment variables - that's all you need!** 🚀
