const admin = require('firebase-admin');
const serviceAccount = require('./ServiceAccount.json');

// Test with and without fixing newlines
const privateKey = serviceAccount.private_key.replace(/\\n/g, '\n');

console.log('Original private key has literal \\n:', serviceAccount.private_key.includes('\\n'));
console.log('Fixed private key has literal \\n:', privateKey.includes('\\n'));

admin.initializeApp({
  credential: admin.credential.cert({
    ...serviceAccount,
    private_key: privateKey
  }),
  storageBucket: `${serviceAccount.project_id}.appspot.com`
});

async function run() {
  try {
    console.log('Testing connection to Firebase Auth...');
    const listUsersResult = await admin.auth().listUsers(1);
    console.log('✅ Auth connection successful! Found users count:', listUsersResult.users.length);
    
    console.log('Testing connection to Firestore...');
    const db = admin.firestore();
    const snapshot = await db.collection('users').limit(1).get();
    console.log('✅ Firestore connection successful! Documents found:', snapshot.size);
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}

run();
