#!/usr/bin/env node
/**
 * Setup Verification Script
 * Checks if all required files and configurations are in place
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying System Setup...\n');

let allGood = true;

// Check frontend files
console.log('📱 Frontend Checks:');
const frontendChecks = [
  { file: 'package.json', desc: 'Package.json exists' },
  { file: 'src/config/firebase.js', desc: 'Firebase config exists' },
  { file: 'src/services/apiService.js', desc: 'API service exists' },
  { file: 'src/services/socketService.js', desc: 'Socket service exists' },
  { file: 'src/screens/admin/AddUserScreen.js', desc: 'AddUserScreen exists' },
];

frontendChecks.forEach(check => {
  if (fs.existsSync(check.file)) {
    console.log(`  ✅ ${check.desc}`);
  } else {
    console.log(`  ❌ ${check.desc} - MISSING`);
    allGood = false;
  }
});

// Check backend files
console.log('\n🔧 Backend Checks:');
const backendChecks = [
  { file: 'backend/package.json', desc: 'Backend package.json exists' },
  { file: 'backend/server.js', desc: 'Server.js exists' },
  { file: 'backend/services/detectionService.js', desc: 'DetectionService exists' },
  { file: 'backend/services/face_recognition.py', desc: 'Face recognition script exists' },
  { file: 'backend/services/yolo_frame_detection.py', desc: 'Frame detection script exists' },
  { file: 'backend/models/best.pt', desc: 'YOLO model file exists' },
  { file: 'backend/ServiceAccount.json', desc: 'Firebase ServiceAccount exists' },
  { file: 'backend/requirements.txt', desc: 'Python requirements exists' },
];

backendChecks.forEach(check => {
  if (fs.existsSync(check.file)) {
    console.log(`  ✅ ${check.desc}`);
  } else {
    console.log(`  ❌ ${check.desc} - MISSING`);
    allGood = false;
  }
});

// Check configuration
console.log('\n⚙️  Configuration Checks:');
const configChecks = [
  { 
    file: 'src/services/apiService.js', 
    check: (content) => content.includes('YOUR_IP') || content.includes('192.168') || content.includes('localhost'),
    desc: 'API URL configured',
    warning: true
  },
  {
    file: 'src/services/socketService.js',
    check: (content) => content.includes('YOUR_IP') || content.includes('192.168') || content.includes('localhost'),
    desc: 'Socket URL configured',
    warning: true
  },
  {
    file: 'backend/.env',
    check: () => true,
    desc: 'Backend .env file exists',
    warning: false
  },
];

configChecks.forEach(check => {
  if (fs.existsSync(check.file)) {
    const content = fs.readFileSync(check.file, 'utf8');
    if (check.check(content)) {
      if (check.warning && content.includes('YOUR_IP')) {
        console.log(`  ⚠️  ${check.desc} - NEEDS UPDATE (replace YOUR_IP)`);
      } else {
        console.log(`  ✅ ${check.desc}`);
      }
    } else {
      console.log(`  ❌ ${check.desc} - CHECK REQUIRED`);
      allGood = false;
    }
  } else {
    if (check.warning) {
      console.log(`  ⚠️  ${check.desc} - FILE NOT FOUND`);
    } else {
      console.log(`  ❌ ${check.desc} - MISSING`);
      allGood = false;
    }
  }
});

// Check dependencies
console.log('\n📦 Dependency Checks:');
const depChecks = [
  { dir: 'node_modules', desc: 'Frontend dependencies installed' },
  { dir: 'backend/node_modules', desc: 'Backend dependencies installed' },
];

depChecks.forEach(check => {
  if (fs.existsSync(check.dir)) {
    console.log(`  ✅ ${check.desc}`);
  } else {
    console.log(`  ❌ ${check.desc} - Run: npm install`);
    allGood = false;
  }
});

// Summary
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ All critical files are in place!');
  console.log('\n⚠️  Remember to:');
  console.log('  1. Update API URLs with your IP address');
  console.log('  2. Configure Firebase (Storage & Firestore rules)');
  console.log('  3. Create admin user in Firestore');
  console.log('  4. Install Python dependencies (face-recognition)');
  console.log('\n📚 See START_HERE.md for complete setup instructions');
} else {
  console.log('❌ Some files are missing. Please check the errors above.');
  console.log('\n📚 See SETUP_GUIDE.md for detailed setup instructions');
}
console.log('='.repeat(50) + '\n');





