# 🎯 START HERE - Complete System Setup

## Welcome! 👋

This is a complete CCTV Smoking Detection System with:
- ✅ AI-powered smoking detection
- ✅ Face recognition for student identification
- ✅ Automatic challan generation
- ✅ Real-time monitoring
- ✅ Role-based access (Admin, Guard, Student, Security Head)

## 📋 Setup Order

### 1️⃣ Install Dependencies (5 minutes)

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
```

**Python (in virtual environment):**
```bash
cd backend
pip install -r requirements.txt
```

**⚠️ Important:** Install `face-recognition` separately:
```bash
# Windows: Install Visual C++ Build Tools first, then:
pip install dlib face-recognition

# Linux/Mac: Install system dependencies first (see SETUP_GUIDE.md)
pip install dlib face-recognition
```

### 2️⃣ Configure Firebase (10 minutes)

1. **Update `src/config/firebase.js`** with your Firebase project config
2. **Set Firebase Storage Rules** (see SETUP_GUIDE.md)
3. **Set Firestore Security Rules** (see SETUP_GUIDE.md)
4. **Create Admin User:**
   - Create user in Firebase Authentication
   - Create document in Firestore `users` collection:
     - Document ID: Your Firebase Auth UID
     - Fields: `email`, `name`, `role: "admin"`

### 3️⃣ Configure Backend (5 minutes)

1. **Create `backend/.env` file:**
```env
PORT=3000
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NODE_ENV=production
```

2. **Verify `backend/ServiceAccount.json` exists** (Firebase admin credentials)

3. **Verify `backend/models/best.pt` exists** (YOLO model file)

### 4️⃣ Update Network Configuration (2 minutes)

**Find your IP address:**
- Windows: `ipconfig` → IPv4 Address
- Mac/Linux: `ifconfig` or `ip addr`

**Update these files:**

1. **`src/services/apiService.js`** (line 5):
```javascript
const API_BASE_URL = __DEV__ 
  ? 'http://YOUR_IP_HERE:3000/api'
  : 'https://your-production-url.com/api';
```

2. **`src/services/socketService.js`** (line 4):
```javascript
const SOCKET_URL = __DEV__ 
  ? 'http://YOUR_IP_HERE:3000'
  : 'https://your-production-url.com';
```

### 5️⃣ Start the System (2 minutes)

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
✅ Should see: `Server running on port 3000`

**Terminal 2 - Frontend:**
```bash
npm start
```
✅ Press `a` for Android, `i` for iOS, or scan QR code

## 🧪 Quick Test

1. **Login as Admin** (use credentials you created)
2. **Add a Student:**
   - Go to Users → Add User
   - Select "Student"
   - Fill details + **upload photo** (required!)
   - Save
3. **Start Detection:**
   - Go to Live Camera
   - Click "Start Detection"
   - Point camera at test subject
4. **Verify:**
   - Detections appear
   - Student is identified (if face matches)
   - Challan auto-generated (if smoking detected + student matched)

## 📚 Documentation

- **`SETUP_GUIDE.md`** - Detailed setup instructions
- **`QUICK_START.md`** - Quick reference
- **`TESTING_CHECKLIST.md`** - Complete testing guide
- **`COMPLETE_SYSTEM_SUMMARY.md`** - System overview
- **`STUDENT_FACE_RECOGNITION_SETUP.md`** - Face recognition details

## 🆘 Troubleshooting

**Can't connect to backend?**
- Check IP address is correct
- Ensure backend is running
- Check firewall settings
- Verify same WiFi network

**Face recognition not working?**
- Verify `face-recognition` installed: `pip show face-recognition`
- Check Python version (needs 3.7+)
- On Windows: Install Visual C++ Build Tools

**Photo upload fails?**
- Check Firebase Storage rules
- Verify Storage is enabled
- Check network connection

## ✅ Verification

Before testing, verify:
- [ ] All npm packages installed
- [ ] Python packages installed (including face-recognition)
- [ ] Firebase configured
- [ ] Backend .env created
- [ ] API URLs updated
- [ ] Model file exists
- [ ] Admin user created
- [ ] Backend starts successfully
- [ ] Frontend starts successfully

## 🎉 You're Ready!

Once all steps are complete:
1. Start backend: `cd backend && npm start`
2. Start frontend: `npm start`
3. Login as admin
4. Add students with photos
5. Start detection
6. Watch the magic happen! ✨

**Need help?** Check the detailed guides in the documentation files above.

Happy testing! 🚀





