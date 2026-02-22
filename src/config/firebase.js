import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVIqCrQPLf3lqTUtVW7Vk5tcEuXGnNqjE",
  authDomain: "cctv-smoking-detection.firebaseapp.com",
  projectId: "cctv-smoking-detection",
  storageBucket: "cctv-smoking-detection.firebasestorage.app",
  messagingSenderId: "496857301642",
  appId: "1:496857301642:web:c3954df69fc3402337e373",
  measurementId: "G-L79GH56MN0"
};

let app, auth, db, storage;

try {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    app = existingApps[0];
  } else {
    app = initializeApp(firebaseConfig);
  }

  // Initialize Auth with persistence for React Native
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });

  db = getFirestore(app);
  storage = getStorage(app);

  console.log('✅ Firebase initialized successfully with persistence');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  app = null;
  auth = null;
  db = null;
}

export { auth, db, storage };
export default app;


