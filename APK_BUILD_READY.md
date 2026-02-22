# ✅ APK Build Setup Complete!

Your app is configured and ready to build as an APK!

---

## 📋 What's Been Configured

✅ **EAS Build Configuration** (`eas.json`)
- Preview build profile (for testing)
- Production build profile (for release)
- APK output format configured

✅ **App Configuration** (`app.json`)
- Android package name: `com.cctv.smokingdetection`
- Version code: 1
- Required permissions added
- Icon and splash screen configured

✅ **Build Scripts Created**
- `build-apk.ps1` - Automated build script
- `BUILD_APK_GUIDE.md` - Complete guide

---

## ⚠️ IMPORTANT: Before Building APK

### 1. Update Production URLs

**File: `src/services/apiService.js` (Line 6)**
```javascript
const API_BASE_URL = __DEV__
  ? 'http://192.168.18.56:3000/api'
  : 'https://YOUR-PRODUCTION-BACKEND-URL.com/api';  // ⚠️ UPDATE THIS
```

**File: `src/services/socketService.js` (Line 6)**
```javascript
const SOCKET_URL = __DEV__ 
  ? 'http://192.168.18.56:3000'
  : 'https://YOUR-PRODUCTION-BACKEND-URL.com';  // ⚠️ UPDATE THIS
```

**Replace with your actual production backend URL!**

---

## 🚀 Build APK - Quick Start

### Method 1: Using Build Script (Easiest)

```powershell
.\build-apk.ps1
```

The script will:
1. Check if EAS CLI is installed
2. Check if you're logged in
3. Ask for build type (Preview or Production)
4. Build the APK
5. Provide download link

### Method 2: Manual Build

**Step 1: Install EAS CLI**
```powershell
npm.cmd install -g eas-cli
```

**Step 2: Login to Expo**
```powershell
eas.cmd login
```
(Create free account if needed)

**Step 3: Build APK**

**For Testing (Preview):**
```powershell
eas.cmd build --platform android --profile preview
```

**For Production:**
```powershell
eas.cmd build --platform android --profile production
```

---

## 📦 What You'll Get

After build completes (10-20 minutes):
- ✅ **APK file** ready to install
- ✅ **Download link** in terminal
- ✅ **Build details** on Expo dashboard

**Download Location:**
- Terminal will show download link
- Or visit: https://expo.dev/accounts/[your-account]/builds

---

## 📱 Install APK on Android

1. **Download APK** from Expo dashboard
2. **Transfer to Android device** (USB, email, cloud)
3. **Enable "Install from Unknown Sources"**
   - Settings → Security → Unknown Sources
4. **Tap APK file** to install
5. **Open app** and test!

---

## ⚙️ Build Configuration Details

### Preview Build
- **Purpose:** Testing and internal distribution
- **Build Time:** ~10-15 minutes
- **Output:** APK file
- **Use Case:** Share with testers, internal use

### Production Build
- **Purpose:** Release-ready APK
- **Build Time:** ~15-20 minutes
- **Output:** Optimized APK
- **Use Case:** Public distribution, Play Store (if needed)

---

## ✅ Pre-Build Checklist

Before building, make sure:

- [ ] ✅ Production backend URL updated in `apiService.js`
- [ ] ✅ Production backend URL updated in `socketService.js`
- [ ] ✅ Backend server is deployed and accessible
- [ ] ✅ Firebase configuration is correct
- [ ] ✅ All features tested in development
- [ ] ✅ App name and icon are correct

---

## 🎯 Quick Commands Reference

```powershell
# Install EAS CLI
npm.cmd install -g eas-cli

# Login to Expo
eas.cmd login

# Build Preview APK
eas.cmd build --platform android --profile preview

# Build Production APK
eas.cmd build --platform android --profile production

# Check build status
eas.cmd build:list

# View build details
eas.cmd build:view
```

---

## 🔧 Troubleshooting

### EAS CLI Not Found
```powershell
npm.cmd install -g eas-cli
```

### Not Logged In
```powershell
eas.cmd login
```

### Build Fails
- Check `eas.json` is valid
- Verify `app.json` configuration
- Check Expo account status
- See error messages in terminal

### APK Doesn't Connect
- Verify production URLs are correct
- Test backend URL in browser
- Check backend is publicly accessible
- Verify network permissions in app

---

## 📝 Notes

1. **First Build:** May take longer (20-30 minutes)
2. **Subsequent Builds:** Faster (10-15 minutes)
3. **Free Account:** Limited builds per month (usually enough)
4. **Backend Required:** APK needs backend to be accessible
5. **Network:** Backend must be on public internet or same network

---

## 🚀 You're Ready!

**Everything is configured!** Just:

1. ✅ Update production URLs
2. ✅ Run build command
3. ✅ Download APK
4. ✅ Install and test!

**See `BUILD_APK_GUIDE.md` for detailed instructions.**

---

**Status:** ✅ **READY TO BUILD APK**
