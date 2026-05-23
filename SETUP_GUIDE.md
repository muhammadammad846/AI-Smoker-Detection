# Complete Setup Guide - CCTV Smoking Detection System

## 🚀 Quick Start

### Step 1: Install Frontend Dependencies
```bash
npm install
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Python Dependencies
```bash
# Activate your virtual environment first
cd backend
pip install -r requirements.txt
```

**Important:** The `face-recognition` library requires additional system dependencies:

**Windows:**
- Install Visual C++ Build Tools
- Install CMake
- Then: `pip install dlib face-recognition`

**Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt-get install build-essential cmake
sudo apt-get install libopenblas-dev liblapack-dev
sudo apt-get install libx11-dev libgtk-3-dev
sudo apt-get install python3-dev

# Mac
brew install cmake
brew install dlib

# Then install Python packages
pip install dlib face-recognition
```

### Step 4: Configure Firebase

1. **Update `src/config/firebase.js`** with your Firebase config
2. **Set up Firebase Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /student-photos/{allPaths=**} {
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      allow read: if request.auth != null;
    }
    match /detections/{allPaths=**} {
      allow read: if request.auth != null;
    }
  }
}
```

3. **Set up Firestore Security Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /challans/{challanId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /detections/{detectionId} {
      allow read: if request.auth != null;
      allow write: if false; // Only backend can write
    }
    match /cameras/{cameraId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Step 5: Configure Backend

1. **Create `.env` file in `backend/` directory:**
```env
PORT=3000
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NODE_ENV=production
```

2. **Verify `backend/ServiceAccount.json` exists** with your Firebase admin credentials

3. **Verify model file exists:** `backend/models/best.pt`

### Step 6: Update API URLs

**Find your computer's IP address:**
- Windows: Run `ipconfig` in CMD, look for IPv4 Address (e.g. 192.168.1.5)
- Mac/Linux: Run `ifconfig` or `ip addr`

**Edit `src/config/api.js`** and set `DEV_API` and `DEV_SOCKET`:

- **Physical device (same Wi‑Fi as your PC):** Use your computer's LAN IP, e.g. `http://192.168.1.5:3000/api`
- **Android emulator:** Use `http://10.0.2.2:3000/api` (10.0.2.2 is the host machine from the emulator)
- **iOS simulator:** `http://localhost:3000/api` often works, or use your machine's IP

Example:
```javascript
const DEV_API = 'http://192.168.18.56:3000/api';   // Replace with your IP or 10.0.2.2 for Android emulator
const DEV_SOCKET = 'http://192.168.18.56:3000';
```

### Step 7: Create Admin User in Firebase

**Option A – Script (recommended)**  
From the project root, run (uses Firebase Admin SDK; no Firestore rules change needed):

```bash
cd backend
npm run create-admin -- admin@example.com YourPassword "Admin Name"
```

Or with env vars:

```bash
cd backend
set ADMIN_EMAIL=admin@example.com
set ADMIN_PASSWORD=YourPassword
set ADMIN_NAME=Admin Name
npm run create-admin
```

**Option B – Manual**  
1. In [Firebase Console](https://console.firebase.google.com) → Authentication → Add user (email/password).  
2. Copy the user’s UID.  
3. In Firestore, create a document in the `users` collection with that UID as the document ID and fields: `email`, `name`, `role` (value `"admin"`), `createdAt`.

**If you already signed up in the app but see "Missing or insufficient permissions"**  
Your Auth user exists but there is no Firestore document. Run the script with your existing email and password so it creates the `users/{uid}` document (it will not create a new Auth user):

```bash
cd backend
node scripts/create-admin-user.js "your@email.com" "YourPassword" "Your Name"
```

## 🧪 Testing the System

### Test 1: Start Backend Server
```bash
cd backend
npm start
```
Expected: `Server running on port 3000`

### Test 2: Start Frontend
```bash
npm start
```
Then press:
- `a` for Android
- `i` for iOS
- Scan QR code with Expo Go app

### Test 3: Login as Admin
1. Open app
2. Select "Admin Login"
3. Enter admin credentials
4. Should see Admin Dashboard

### Test 4: Add a Student with Photo
1. Navigate to Users → Add User
2. Select "Student" role
3. Fill in details
4. Upload student photo
5. Click "Add User"
6. Verify student appears in users list

### Test 5: Test Live Detection
1. Navigate to Live Camera
2. Click "Start Detection"
3. Point camera at test subject
4. Verify frames are being sent
5. Check for detections in console

### Test 6: Test Face Recognition
1. Add a student with clear front-facing photo
2. Start live detection
3. Point camera at the same person
4. Verify student is identified in detection results
5. Check if challan is auto-generated

## 🔧 Troubleshooting

### Issue: "Network request failed" / "Error getting live detections"

1. **Backend must be running** on your machine: `cd backend && npm start` (port 3000).
2. **Correct URL in the app:** Edit `src/config/api.js`:
   - **Physical device:** Use your PC's IP (same Wi‑Fi as the device). Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to get it.
   - **Android emulator:** Use `http://10.0.2.2:3000/api` and `http://10.0.2.2:3000` for `DEV_SOCKET`.
3. **Firewall:** Allow Node/backend on port 3000 (Windows Firewall or antivirus).
4. **Restart the app** after changing `src/config/api.js` (and rebuild if using a dev build).

On startup in dev you should see in the console: `[API config] API_BASE_URL: http://...` — confirm it matches where your backend is running.

### Issue: "Socket.io-client" not found
**Solution:**
```bash
npm install socket.io-client
npx expo start --clear
```

### Issue: Face recognition fails
**Solution:**
1. Verify `face-recognition` is installed: `pip show face-recognition`
2. Check Python version: `python --version` (needs 3.7+)
3. On Windows, ensure Visual C++ Build Tools are installed
4. Try: `pip install --upgrade face-recognition dlib`

### Issue: Photo upload fails
**Solution:**
1. Check Firebase Storage rules
2. Verify Firebase Storage is enabled
3. Check network connection
4. Verify image format (JPEG/PNG)

### Issue: Backend can't find Python
**Solution:**
- Windows: Ensure Python is in PATH or update `pythonCmd` in detectionService.js
- Linux/Mac: Use `python3` instead of `python`

### Issue: Model file not found
**Solution:**
1. Verify `backend/models/best.pt` exists
2. Check file permissions
3. Verify path in detectionService.js

## 📱 Running on Physical Device

### For Android:
1. Connect device via USB
2. Enable USB debugging
3. Run: `npm run android`
4. Or use Expo Go app and scan QR code

### For iOS:
1. Connect device via USB
2. Run: `npm run ios`
3. Or use Expo Go app and scan QR code

**Important:** Ensure phone and computer are on the same WiFi network for Socket.io to work.

## 🎯 Production Deployment

### Backend Deployment:
1. Deploy to Heroku, Railway, or AWS
2. Set environment variables
3. Update API URLs in frontend
4. Ensure Python dependencies are installed

### Frontend Deployment:
1. Build with EAS Build: `eas build`
2. Or use Expo's build service
3. Update API URLs to production URLs

## ✅ Verification Checklist

- [ ] All npm packages installed
- [ ] Python packages installed (including face-recognition)
- [ ] Firebase configured
- [ ] Firebase Storage rules set
- [ ] Firestore rules set
- [ ] Backend .env configured
- [ ] API URLs updated in frontend
- [ ] Model file (best.pt) exists
- [ ] Admin user created in Firestore
- [ ] Backend server starts successfully
- [ ] Frontend app starts successfully
- [ ] Can login as admin
- [ ] Can add student with photo
- [ ] Can start live detection
- [ ] Socket.io connection works
- [ ] Face recognition works
- [ ] Auto-challan generation works

## 🆘 Getting Help

If you encounter issues:
1. Check console logs (both frontend and backend)
2. Verify all dependencies are installed
3. Check Firebase configuration
4. Verify network connectivity
5. Check file permissions

## 📚 Documentation Files

- `COMPLETE_SYSTEM_SUMMARY.md` - Full system overview
- `STUDENT_FACE_RECOGNITION_SETUP.md` - Face recognition details
- `FRONTEND_COMPLETION.md` - Frontend features
- `backend/PRODUCTION_FIXES.md` - Backend fixes

All systems are ready for testing! 🚀





