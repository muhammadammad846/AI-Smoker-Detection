# 🚀 Railway Settings Configuration Guide

## ✅ Exact Settings to Configure

Based on your Railway dashboard, here's what to set:

---

## 📋 Step-by-Step Configuration

### 1. **Root Directory** ⭐ **MOST IMPORTANT**

**Location:** Settings → "Add Root Directory"

**Set to:**
```
backend
```

**Why:** This tells Railway to treat the `backend/` folder as the root, so it can find `package.json` and detect Node.js.

---

### 2. **Build Command** (Optional - Auto-detected if Root Directory is set)

**Location:** Build → "Custom Build Command"

**If needed, set to:**
```bash
npm install && pip install -r requirements.txt
```

**Note:** Railway will auto-detect this if Root Directory is set to `backend`.

---

### 3. **Start Command** (Optional - Auto-detected if Root Directory is set)

**Location:** Deploy → "Custom Start Command"

**If needed, set to:**
```bash
node server.js
```

**Note:** Railway will auto-detect this from `backend/package.json` if Root Directory is set.

---

### 4. **Environment Variables**

**Location:** Variables tab

**Add these:**
```
PORT=3000
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NODE_ENV=production
```

**For ServiceAccount.json, add:**
```
SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
```
(Paste entire JSON content as value)

---

### 5. **Healthcheck Path** (Recommended)

**Location:** Deploy → "Healthcheck Path"

**Set to:**
```
/api/health
```

This helps Railway verify your app is running.

---

### 6. **Restart Policy**

**Location:** Deploy → "Restart Policy"

**Settings:**
- **Restart Policy:** `On Failure` ✅ (already set)
- **Max restart retries:** `10` ✅ (already set)

---

## 🎯 Quick Configuration Checklist

- [ ] **Root Directory:** Set to `backend`
- [ ] **Environment Variables:** Add PORT, FIREBASE_STORAGE_BUCKET, NODE_ENV
- [ ] **ServiceAccount JSON:** Add as SERVICE_ACCOUNT_JSON variable
- [ ] **Healthcheck Path:** Set to `/api/health` (optional but recommended)
- [ ] **Save** all settings
- [ ] **Redeploy**

---

## ✅ After Configuration

1. **Click "Update"** to save settings
2. **Redeploy** the service
3. **Check logs** to verify build succeeds
4. **Get your Railway URL** (e.g., `https://ai-smoker-detection.railway.app`)
5. **Test:** Visit `https://your-url.railway.app/api/health`

---

## 🔧 If Root Directory Doesn't Work

**Alternative: Use Custom Commands**

**Build Command:**
```bash
cd backend && npm install && pip install -r requirements.txt
```

**Start Command:**
```bash
cd backend && node server.js
```

---

## 📝 Important Notes

1. **Root Directory is the key fix** - Set it to `backend` first
2. **Python dependencies** - Railway will install from `requirements.txt` automatically
3. **Model file** - `best.pt` is too large for Git, upload separately or use Railway volume
4. **ServiceAccount.json** - Add as environment variable, not as file

---

**Set Root Directory to `backend` and you're done!** 🚀
