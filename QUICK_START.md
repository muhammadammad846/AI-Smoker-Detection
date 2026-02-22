# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies (One-time setup)

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

### 2. Configure Firebase

1. Update `src/config/firebase.js` with your Firebase config
2. Create admin user in Firestore (see SETUP_GUIDE.md)

### 3. Update IP Address

Find your computer's IP:
- Windows: `ipconfig` → IPv4 Address
- Mac/Linux: `ifconfig` or `ip addr`

Update in:
- `src/services/apiService.js` (line 5)
- `src/services/socketService.js` (line 4)

### 4. Start Backend
```bash
cd backend
npm start
```

### 5. Start Frontend
```bash
npm start
```

Press `a` for Android or `i` for iOS, or scan QR code with Expo Go.

## ✅ Test Checklist

1. ✅ Backend running on port 3000
2. ✅ Frontend app opens
3. ✅ Can login as admin
4. ✅ Can add student with photo
5. ✅ Can start live detection
6. ✅ Socket.io connects
7. ✅ Detections appear
8. ✅ Face recognition works
9. ✅ Auto-challan generated

## 🎯 First Use

1. **Login as Admin**
   - Use admin credentials
   - Access admin dashboard

2. **Add a Student**
   - Go to Users → Add User
   - Select "Student"
   - Fill details + upload photo
   - Save

3. **Start Detection**
   - Go to Live Camera
   - Click "Start Detection"
   - Point camera at test subject
   - Watch for detections

4. **View Results**
   - Check detections list
   - View auto-generated challans
   - See matched student info

## 🔧 Common Issues

**Socket.io not connecting?**
- Check IP address is correct
- Ensure phone and computer on same WiFi
- Check firewall settings

**Face recognition not working?**
- Verify `face-recognition` installed: `pip show face-recognition`
- Check student photo is clear and front-facing
- Verify Python version 3.7+

**Photo upload fails?**
- Check Firebase Storage rules
- Verify Firebase Storage enabled
- Check network connection

Ready to go! 🎉





