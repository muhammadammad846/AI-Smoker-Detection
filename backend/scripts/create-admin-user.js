#!/usr/bin/env node
/**
 * Create an admin user in Firebase Auth + Firestore.
 * Uses Firebase Admin SDK (bypasses Firestore rules).
 *
 * Usage:
 *   node create-admin-user.js <email> <password> [name]
 *   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=secret ADMIN_NAME="Admin" node create-admin-user.js
 *
 * Requires: backend/serviceAccount.json or SERVICE_ACCOUNT_JSON env.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

let serviceAccount;
if (process.env.SERVICE_ACCOUNT_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_JSON);
  } catch (e) {
    console.error('Invalid SERVICE_ACCOUNT_JSON');
    process.exit(1);
  }
} else {
  try {
    serviceAccount = require(path.join(__dirname, '..', 'serviceAccount.json'));
  } catch (e) {
    console.error('Missing ServiceAccount. Set SERVICE_ACCOUNT_JSON or add backend/serviceAccount.json');
    process.exit(1);
  }
}

const admin = require('firebase-admin');

if (!admin.apps.length) {
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.firebasestorage.app`;
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket,
  });
}

const email = process.env.ADMIN_EMAIL || process.argv[2];
const password = process.env.ADMIN_PASSWORD || process.argv[3];
const name = process.env.ADMIN_NAME || process.argv[4] || 'Admin User';

if (!email || !password) {
  console.error('Usage: node create-admin-user.js <email> <password> [name]');
  console.error('   Or: ADMIN_EMAIL=... ADMIN_PASSWORD=... [ADMIN_NAME=...] node create-admin-user.js');
  process.exit(1);
}

async function main() {
  const db = admin.firestore();
  let uid;

  try {
    const existing = await admin.auth().getUserByEmail(email);
    uid = existing.uid;
    console.log('Existing Firebase Auth user found, UID:', uid);
  } catch {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });
    uid = userRecord.uid;
    console.log('Created Firebase Auth user, UID:', uid);
  }

  await db.collection('users').doc(uid).set({
    email,
    name,
    role: 'admin',
    createdAt: new Date().toISOString(),
  }, { merge: true });

  console.log('Firestore users/%s set with role: admin', uid);
  console.log('Done. You can log in with this email and password in the admin login screen.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
