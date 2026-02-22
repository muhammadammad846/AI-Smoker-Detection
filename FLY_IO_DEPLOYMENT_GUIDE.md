# 🚀 Fly.io Deployment Guide - FREE Backend Hosting

## ✅ Why Fly.io?

- **100% FREE** (generous free tier)
- **No build timeouts** (Docker-based)
- **Socket.io works** (persistent connections)
- **Supports Node.js + Python**
- **Global edge deployment**
- **Easy setup**

---

## 📋 Prerequisites

1. **Fly.io Account**: Sign up at https://fly.io (free)
2. **Fly CLI**: Install the Fly.io command-line tool
3. **GitHub Account**: Your code should be on GitHub

---

## 🔧 Step 1: Install Fly CLI

### Windows (PowerShell):
```powershell
# Run as Administrator
iwr https://fly.io/install.ps1 -useb | iex
```

### macOS/Linux:
```bash
curl -L https://fly.io/install.sh | sh
```

### Verify Installation:
```bash
flyctl version
```

---

## 🔐 Step 2: Login to Fly.io

```bash
flyctl auth login
```

This will open your browser to authenticate.

---

## 🚀 Step 3: Deploy Your Backend

### Option A: Deploy from Local Machine

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Initialize Fly.io app:**
   ```bash
   flyctl launch
   ```
   
   This will:
   - Ask for app name (or use default)
   - Ask for region (choose closest to you)
   - Create `fly.toml` (already created for you)
   - Ask to deploy now (say No, we'll set secrets first)

3. **Set Environment Variables (Secrets):**
   
   **Get your Firebase Service Account JSON:**
   - Open `backend/ServiceAccount.json`
   - Copy the entire JSON content
   - Convert to single line (remove all line breaks)
   
   **Set secrets:**
   ```bash
   # Set Firebase Service Account (paste entire JSON as single line)
   flyctl secrets set SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
   
   # Set Firebase Storage Bucket
   flyctl secrets set FIREBASE_STORAGE_BUCKET='your-project-id.firebasestorage.app'
   
   # Optional: Set NODE_ENV
   flyctl secrets set NODE_ENV='production'
   ```

   **⚠️ Important:** Replace the JSON above with your actual ServiceAccount.json content (as a single line).

4. **Deploy:**
   ```bash
   flyctl deploy
   ```

### Option B: Deploy from GitHub (Recommended)

1. **Push your code to GitHub** (if not already):
   ```bash
   git add .
   git commit -m "Add Fly.io deployment files"
   git push origin main
   ```

2. **Connect GitHub to Fly.io:**
   - Go to https://fly.io/dashboard
   - Click "New App"
   - Select "Deploy from GitHub"
   - Authorize GitHub
   - Select your repository
   - Select `backend` as root directory
   - Fly.io will auto-detect Dockerfile

3. **Set Secrets in Dashboard:**
   - Go to your app in Fly.io dashboard
   - Click "Secrets" tab
   - Add:
     - `SERVICE_ACCOUNT_JSON` (your entire JSON as single line)
     - `FIREBASE_STORAGE_BUCKET` (your bucket name)
     - `NODE_ENV` = `production`

4. **Deploy:**
   - Fly.io will auto-deploy on every push to main
   - Or manually trigger from dashboard

---

## 🌐 Step 4: Get Your Backend URL

After deployment, Fly.io will provide:
- **URL**: `https://your-app-name.fly.dev`
- **Health Check**: `https://your-app-name.fly.dev/api/health`

**Test it:**
```bash
curl https://your-app-name.fly.dev/api/health
```

Should return: `{"status":"ok","message":"Server is running"}`

---

## 🔄 Step 5: Update Frontend

Update your frontend to use the Fly.io URL:

**File: `src/services/apiService.js`**
```javascript
const API_BASE_URL = __DEV__
  ? 'http://192.168.18.56:3000/api'  // Development
  : 'https://your-app-name.fly.dev/api';  // Production - Update this!
```

**File: `src/services/socketService.js`**
```javascript
const SOCKET_URL = __DEV__ 
  ? 'http://192.168.18.56:3000'
  : 'https://your-app-name.fly.dev';  // Production - Update this!
```

---

## 📊 Step 6: Monitor Your App

### View Logs:
```bash
flyctl logs
```

### View App Status:
```bash
flyctl status
```

### Open Dashboard:
```bash
flyctl dashboard
```

---

## 🔧 Common Commands

```bash
# Deploy
flyctl deploy

# View logs
flyctl logs

# SSH into container
flyctl ssh console

# Scale app
flyctl scale count 1

# View secrets
flyctl secrets list

# Update secrets
flyctl secrets set KEY='value'

# Remove secrets
flyctl secrets unset KEY

# Restart app
flyctl apps restart your-app-name
```

---

## 🐛 Troubleshooting

### Build Fails:
```bash
# Check logs
flyctl logs

# Rebuild locally
docker build -t test-build .
```

### App Won't Start:
```bash
# Check logs
flyctl logs

# Verify secrets are set
flyctl secrets list

# Test health endpoint
curl https://your-app-name.fly.dev/api/health
```

### Python Packages Fail to Install:
- Check Dockerfile has all build dependencies
- Verify requirements.txt is correct
- Check logs for specific error

### Socket.io Not Working:
- Verify app is running (not sleeping)
- Check CORS settings in server.js
- Verify WebSocket is enabled in Fly.io

---

## 💰 Free Tier Limits

Fly.io Free Tier includes:
- **3 shared VMs** (1GB RAM each)
- **160GB outbound data/month**
- **Unlimited inbound data**
- **No build timeouts**
- **Persistent connections** (Socket.io works!)

**Your app uses:**
- 1 VM (2GB RAM) = ✅ Within free tier
- Socket.io connections = ✅ Supported
- Python ML packages = ✅ Supported

---

## 🎯 Next Steps

1. ✅ Deploy to Fly.io
2. ✅ Test health endpoint
3. ✅ Update frontend API URLs
4. ✅ Test Socket.io connection
5. ✅ Build Android APK with new backend URL

---

## 📝 Notes

- **First deployment** may take 10-15 minutes (installing Python packages)
- **Subsequent deployments** are faster (Docker layer caching)
- **App stays running** (no spin-down like Render)
- **Socket.io works** perfectly (persistent connections)

---

## ✅ Success Checklist

- [ ] Fly CLI installed
- [ ] Logged into Fly.io
- [ ] App created
- [ ] Secrets set (SERVICE_ACCOUNT_JSON, FIREBASE_STORAGE_BUCKET)
- [ ] App deployed successfully
- [ ] Health endpoint works
- [ ] Frontend updated with new URL
- [ ] Socket.io connection tested

---

**Your backend is now live on Fly.io - 100% FREE! 🎉**
