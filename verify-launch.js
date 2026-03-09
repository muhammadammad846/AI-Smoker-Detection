#!/usr/bin/env node
/**
 * Pre-launch verification: backend env, optional health check, and key files.
 * Run from project root: node verify-launch.js
 *
 * Env:
 *   BACKEND_URL  Optional. If set, fetches /api/health (e.g. https://your-app.fly.dev).
 *                If unset, tries http://localhost:3000 (skip with SKIP_HEALTH=1).
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const root = path.join(__dirname);
const backendDir = path.join(root, 'backend');
const backendEnv = path.join(backendDir, '.env');
const backendEnvExample = path.join(backendDir, '.env.example');
const serviceAccount = path.join(backendDir, 'ServiceAccount.json');
const modelPath = path.join(backendDir, 'models', 'best.pt');
const firestoreRules = path.join(root, 'firestore.rules');

function ok(msg) {
  console.log('  [OK]', msg);
}
function fail(msg) {
  console.log('  [FAIL]', msg);
}
function warn(msg) {
  console.log('  [WARN]', msg);
}

function checkBackendEnv() {
  let passed = true;
  if (!fs.existsSync(backendEnv)) {
    if (fs.existsSync(backendEnvExample)) {
      warn('backend/.env missing. Copy from backend/.env.example and fill values.');
    } else {
      fail('backend/.env missing.');
    }
    return false;
  }
  ok('backend/.env exists');
  const content = fs.readFileSync(backendEnv, 'utf8');
  if (!content.includes('FIREBASE_STORAGE_BUCKET') && !content.match(/FIREBASE_STORAGE_BUCKET\s*=/)) {
    warn('FIREBASE_STORAGE_BUCKET not set in backend/.env');
    passed = false;
  } else {
    ok('FIREBASE_STORAGE_BUCKET set');
  }
  if (process.env.NODE_ENV === 'production' && !content.includes('SERVICE_ACCOUNT_JSON')) {
    warn('SERVICE_ACCOUNT_JSON not in .env (required for deployed backend)');
    passed = false;
  }
  return passed;
}

function checkServiceAccount() {
  if (fs.existsSync(serviceAccount)) {
    ok('backend/ServiceAccount.json exists');
    return true;
  }
  warn('backend/ServiceAccount.json missing (needed for local backend; use SERVICE_ACCOUNT_JSON in production)');
  return false;
}

function checkModel() {
  if (fs.existsSync(modelPath)) {
    ok('backend/models/best.pt exists');
    return true;
  }
  warn('backend/models/best.pt missing (required for detection)');
  return false;
}

function checkFirestoreRules() {
  if (fs.existsSync(firestoreRules)) {
    ok('firestore.rules exists');
    return true;
  }
  fail('firestore.rules missing');
  return false;
}

function fetchHealth(url) {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https');
    const lib = isHttps ? https : http;
    const u = new URL(url);
    const req = lib.get(
      { hostname: u.hostname, port: u.port || (isHttps ? 443 : 80), path: u.pathname + u.search, timeout: 8000 },
      (res) => {
        let data = '';
        res.on('data', (ch) => (data += ch));
        res.on('end', () => {
          try {
            const j = JSON.parse(data);
            resolve(res.statusCode === 200 && j.status === 'ok');
          } catch (_) {
            resolve(false);
          }
        });
      }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function checkBackendHealth() {
  const skip = process.env.SKIP_HEALTH === '1' || process.env.SKIP_HEALTH === 'true';
  if (skip) {
    warn('Backend health check skipped (SKIP_HEALTH=1)');
    return true;
  }
  const base = process.env.BACKEND_URL || 'http://localhost:3000';
  const url = base.replace(/\/$/, '') + '/api/health';
  const reachable = await fetchHealth(url);
  if (reachable) {
    ok('Backend health OK: ' + url);
    return true;
  }
  warn('Backend not reachable at ' + url + ' (start backend or set BACKEND_URL for deployed URL)');
  return false;
}

async function main() {
  console.log('\n=== Pre-launch verify ===\n');

  let allOk = true;
  allOk = checkBackendEnv() && allOk;
  checkServiceAccount();
  allOk = checkModel() && allOk;
  allOk = checkFirestoreRules() && allOk;

  console.log('');
  await checkBackendHealth();

  console.log('\n---');
  if (allOk) {
    console.log('  All checks passed. Ready for launch.');
  } else {
    console.log('  Fix the items above, then run verify-launch again.');
  }
  console.log('  Set EXPO_PUBLIC_API_URL and EXPO_PUBLIC_SOCKET_URL in EAS for production builds.');
  console.log('  See LAUNCH_CHECKLIST.md for full steps.\n');

  process.exit(allOk ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
