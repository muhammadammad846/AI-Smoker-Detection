# 📱 Build APK Guide - Production Ready

This guide will help you build a production APK for your CCTV Smoking Detection app.

---

## ⚠️ Important: Before Building

### 1. Update Production URLs

**You MUST update these files with your production backend URL:**

**File 1: `src/services/apiService.js`**
```javascript
const API_BASE_URL = __DEV__
  ? 'http://192.168.18.56:3000/api'  // Development
  : 'https://YOUR-PRODUCTION-URL.com/api';  // ⚠️ UPDATE THIS
```

**File 2: `src/services/socketService.js`**
```javascript
const SOCKET_URL = __DEV__ 
  ? 'http://192.168.18.56:3000'  // Development
  : 'https://YOUR-PRODUCTION-URL.com';  // ⚠️ UPDATE THIS
```

**Replace `YOUR-PRODUCTION-URL.com` with:**
- Your deployed backend URL (e.g., `https://your-backend.herokuapp.com`)
- Or your server IP address (e.g., `http://your-server-ip:3000`)

---

## 🚀 Build APK - Step by Step

### Step 1: Install EAS CLI

```powershell
npm.cmd install -g eas-cli
```

### Step 2: Login to Expo

```powershell
eas.cmd login
```

Create a free Expo account if you don't have one.

### Step 3: Configure Build

The `eas.json` file is already created with APK build configuration.

### Step 4: Build APK

**Option A: Build APK (Preview/Testing)**
```powershell
eas.cmd build --platform android --profile preview
```

**Option B: Build Production APK**
```powershell
eas.cmd build --platform android --profile production
```

### Step 5: Download APK

After build completes:
1. You'll get a download link in the terminal
2. Or visit: https://expo.dev/accounts/[your-account]/builds
3. Download the APK file
4. Install on Android device

---

## 📋 Build Options

### Preview Build (Recommended for Testing)
- Builds APK for testing
- Faster build time
- Good for internal distribution

### Production Build
- Optimized APK
- Production-ready
- Ready for Play Store (if needed)

---

## ⚙️ Alternative: Local Build (Advanced)

If you have Android Studio installed:

```powershell
# Install dependencies
npm.cmd install

# Prebuild native code
npx expo prebuild --platform android

# Build APK locally
cd android
.\gradlew assembleRelease

# APK will be in: android/app/build/outputs/apk/release/
```

---

## 🔧 Configuration Files Created

1. **`eas.json`** - EAS Build configuration
   - Preview profile (APK for testing)
   - Production profile (APK for release)

2. **`app.json`** - Updated with:
   - Android versionCode: 1
   - Required permissions
   - Package name: `com.cctv.smokingdetection`

---

## 📝 Pre-Build Checklist

Before building, ensure:

- [ ] ✅ Production backend URL updated in `apiService.js`
- [ ] ✅ Production backend URL updated in `socketService.js`
- [ ] ✅ Backend is deployed and accessible
- [ ] ✅ Firebase configuration is correct
- [ ] ✅ All features tested in development
- [ ] ✅ App icon and splash screen are set
- [ ] ✅ App name is correct in `app.json`

---

## 🎯 Quick Build Commands

```powershell
# 1. Install EAS CLI
npm.cmd install -g eas-cli

# 2. Login
eas.cmd login

# 3. Build APK (Preview)
eas.cmd build --platform android --profile preview

# 4. Build APK (Production)
eas.cmd build --platform android --profile production
```

---

## 📦 What You'll Get

After build completes:
- **APK file** - Ready to install on Android devices
- **Download link** - Provided in terminal
- **Build details** - Available on Expo dashboard

---

## 🚨 Important Notes

1. **Backend Must Be Deployed**
   - APK needs to connect to your backend
   - Update production URLs before building
   - Test backend is accessible from mobile network

2. **Firebase Configuration**
   - Ensure Firebase config is correct
   - Test Firebase connection works

3. **Network Access**
   - APK needs internet access
   - Backend must be publicly accessible
   - Or use same network for testing

4. **Permissions**
   - Camera permission is required
   - App will request permissions on first use

---

## ✅ After Building

1. **Download APK** from Expo dashboard
2. **Transfer to Android device**
3. **Enable "Install from Unknown Sources"** in Android settings
4. **Install APK** on device
5. **Test the app** with production backend

---

## 🆘 Troubleshooting

### Build Fails
- Check `eas.json` configuration
- Verify `app.json` is valid
- Check Expo account is logged in

### APK Doesn't Connect to Backend
- Verify production URLs are correct
- Check backend is accessible
- Test backend URL in browser

### App Crashes on Startup
- Check Firebase configuration
- Verify all dependencies are included
- Check console logs

---

## 📞 Support

- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **Expo Dashboard:** https://expo.dev
- **Build Status:** Check Expo dashboard for build progress

---

**Ready to build?** Follow the steps above and you'll have your APK in 10-20 minutes! 🚀
