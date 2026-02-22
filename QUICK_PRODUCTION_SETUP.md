# 🚀 Quick Production Setup - Make it 100% Ready

**Current Status:** 95% Ready  
**Time to 100%:** ~1 hour

---

## ⚡ Quick Steps to Production

### 1. Deploy Backend (Choose One)

#### Option A: Heroku (Easiest)

```powershell
# Install Heroku CLI (if not installed)
# Download from: https://devcenter.heroku.com/articles/heroku-cli

cd backend
heroku create your-app-name
git init
git add .
git commit -m "Initial commit"
git push heroku main

# Set environment variables
heroku config:set FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
heroku config:set NODE_ENV=production
heroku config:set PORT=3000

# Your backend URL will be: https://your-app-name.herokuapp.com
```

#### Option B: Railway (Simple)

1. Go to: https://railway.app
2. New Project → Deploy from GitHub
3. Select backend folder
4. Set environment variables
5. Deploy

#### Option C: Your Server

```bash
# On your server
cd /path/to/backend
npm install
pip install -r requirements.txt

# Create .env file
echo "PORT=3000" > .env
echo "FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com" >> .env
echo "NODE_ENV=production" >> .env

# Run with PM2
npm install -g pm2
pm2 start server.js --name cctv-backend
pm2 save
```

### 2. Update Production URLs (2 minutes)

**File: `src/services/apiService.js`**
```javascript
const API_BASE_URL = __DEV__
  ? 'http://192.168.18.56:3000/api'
  : 'https://YOUR-BACKEND-URL.herokuapp.com/api';  // ✅ Replace with your URL
```

**File: `src/services/socketService.js`**
```javascript
const SOCKET_URL = __DEV__ 
  ? 'http://192.168.18.56:3000'
  : 'https://YOUR-BACKEND-URL.herokuapp.com';  // ✅ Replace with your URL
```

### 3. Test Backend (5 minutes)

```powershell
# Test backend is accessible
curl https://your-backend-url.herokuapp.com/api/health

# Should return: {"status":"ok","message":"Server is running"}
```

### 4. Build APK (20 minutes)

```powershell
# Install EAS CLI
npm.cmd install -g eas-cli

# Login
eas.cmd login

# Build
eas.cmd build --platform android --profile production
```

---

## ✅ That's It!

After these 4 steps, you'll have:
- ✅ Backend deployed
- ✅ Production URLs configured
- ✅ APK built and ready
- ✅ 100% production ready!

---

## 📝 Quick Checklist

- [ ] Backend deployed
- [ ] Backend URL obtained
- [ ] `apiService.js` updated
- [ ] `socketService.js` updated
- [ ] Backend tested
- [ ] APK built
- [ ] APK tested

---

**Total Time:** ~1 hour  
**Result:** 100% Production Ready! 🚀
