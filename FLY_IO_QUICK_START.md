# ⚡ Fly.io Quick Start - Deploy in 5 Minutes

## 🎯 Quick Steps

### 1. Install Fly CLI (One-time)

**Windows PowerShell (Run as Administrator):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**Verify:**
```powershell
flyctl version
```

### 2. Login to Fly.io

```powershell
flyctl auth login
```

### 3. Navigate to Backend

```powershell
cd backend
```

### 4. Initialize App (First Time Only)

```powershell
flyctl launch
```

- App name: `cctv-smoking-detection` (or choose your own)
- Region: Choose closest to you (e.g., `iad`, `ord`, `dfw`)
- Deploy now? **Say No** (we'll set secrets first)

### 5. Set Secrets (Required)

**Get your Firebase Service Account JSON:**
- Open `backend/ServiceAccount.json`
- Copy entire content
- Remove all line breaks (make it one line)

**Set secrets:**
```powershell
# Replace with your actual JSON (single line)
flyctl secrets set SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'

# Replace with your Firebase Storage bucket
flyctl secrets set FIREBASE_STORAGE_BUCKET='your-project-id.firebasestorage.app'
```

### 6. Deploy!

```powershell
flyctl deploy
```

**First deployment takes 10-15 minutes** (installing Python packages)

### 7. Get Your URL

After deployment, Fly.io shows your URL:
```
https://cctv-smoking-detection.fly.dev
```

**Test it:**
```powershell
curl https://cctv-smoking-detection.fly.dev/api/health
```

Should return: `{"status":"ok","message":"Server is running"}`

---

## 🔄 Update Frontend

**File: `src/services/apiService.js`**
```javascript
const API_BASE_URL = __DEV__
  ? 'http://192.168.18.56:3000/api'
  : 'https://cctv-smoking-detection.fly.dev/api';  // ✅ Your Fly.io URL
```

**File: `src/services/socketService.js`**
```javascript
const SOCKET_URL = __DEV__ 
  ? 'http://192.168.18.56:3000'
  : 'https://cctv-smoking-detection.fly.dev';  // ✅ Your Fly.io URL
```

---

## 📊 Useful Commands

```powershell
# View logs
flyctl logs

# View app status
flyctl status

# Open dashboard
flyctl dashboard

# Restart app
flyctl apps restart cctv-smoking-detection

# View secrets
flyctl secrets list
```

---

## ✅ That's It!

Your backend is now live on Fly.io - **100% FREE!** 🎉

---

## 🐛 Troubleshooting

**Build fails?**
- Check logs: `flyctl logs`
- Verify Dockerfile exists in `backend/` folder

**App won't start?**
- Check secrets: `flyctl secrets list`
- Verify SERVICE_ACCOUNT_JSON is set correctly

**Can't connect?**
- Check health endpoint: `curl https://your-app.fly.dev/api/health`
- View logs: `flyctl logs`

---

**Need help?** Check `FLY_IO_DEPLOYMENT_GUIDE.md` for detailed instructions.
