# CCTV Smoking Detection System

A complete AI-powered smoking detection system with face recognition and automatic challan generation for campus security.

## 🎯 Features

- ✅ **AI-Powered Detection** - YOLO model detects smoking in real-time
- ✅ **Face Recognition** - Automatically identifies students from photos
- ✅ **Auto-Challan Generation** - Creates challans when students are caught smoking
- ✅ **Real-Time Monitoring** - Live camera feeds with Socket.io
- ✅ **Role-Based Access** - Admin, Guard, Student, Security Head portals
- ✅ **Student Photo Management** - Admin uploads student photos for recognition
- ✅ **Complete Dashboard** - Statistics, reports, and management tools

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Frontend
npm install

# Backend
cd backend
npm install

# Python (in virtual environment)
pip install -r requirements.txt
```

### 2. Configure Firebase
- Update `src/config/firebase.js` with your Firebase config
- Set up Firebase Storage and Firestore rules (see SETUP_GUIDE.md)
- Create admin user in Firestore

### 3. Update Network Configuration
- Find your computer's IP address
- Update `src/services/apiService.js` and `socketService.js` with your IP

### 4. Start the System
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm start
```

## 📚 Documentation

- **`START_HERE.md`** - Begin here! Complete setup guide
- **`SETUP_GUIDE.md`** - Detailed setup instructions
- **`QUICK_START.md`** - Quick reference guide
- **`TESTING_CHECKLIST.md`** - Complete testing guide
- **`COMPLETE_SYSTEM_SUMMARY.md`** - System architecture overview
- **`STUDENT_FACE_RECOGNITION_SETUP.md`** - Face recognition details

## 🏗️ System Architecture

### Backend
- **Node.js/Express** - REST API server
- **Socket.io** - Real-time communication
- **Python** - AI detection and face recognition
- **Firebase Admin** - User management and storage
- **YOLO Model** - Smoking detection

### Frontend
- **React Native/Expo** - Mobile app
- **Firebase** - Authentication and database
- **Socket.io Client** - Real-time updates
- **React Navigation** - Screen navigation

## 👥 User Roles

### Admin
- Add users (students, guards, security heads)
- Upload student photos
- View all challans
- Create/edit/delete challans
- View dashboard with statistics
- Monitor live cameras

### Security Guard
- Start/stop live detection
- View caught students
- View challans
- Monitor cameras

### Student
- View own challans
- View profile
- Check challan status

### Security Head
- View all challans
- Monitor guards activity
- View system statistics

## 🔐 Security

- Admin-only user creation (backend enforced)
- Role-based access control
- Firebase Authentication
- Firestore security rules
- Token-based API authentication

## 📋 Requirements

- Node.js 14+
- Python 3.7+
- Firebase project
- YOLO model file (best.pt)
- Face recognition library (dlib + face-recognition)

## 🧪 Testing

Run the verification script:
```bash
node verify_setup.js
```

See `TESTING_CHECKLIST.md` for complete testing guide.

## 🐛 Troubleshooting

Common issues and solutions are documented in:
- `SETUP_GUIDE.md` - Setup troubleshooting
- `QUICK_START.md` - Quick fixes

## 📞 Support

For detailed help, refer to:
1. `START_HERE.md` - Initial setup
2. `SETUP_GUIDE.md` - Detailed instructions
3. `TESTING_CHECKLIST.md` - Testing procedures

## 📄 License

Private project - All rights reserved

---

**Ready to start?** See `START_HERE.md` for step-by-step setup instructions! 🚀





