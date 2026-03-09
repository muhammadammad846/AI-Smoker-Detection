#!/usr/bin/env node
/**
 * Ensures backend/models/best.pt exists. For Railway/deployed backends.
 * - If MODEL_URL env is set and best.pt is missing, downloads it.
 * - Otherwise exits 0 (no-op).
 * Run before server start: node scripts/ensure-model.js && node server.js
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const MODEL_URL = process.env.MODEL_URL;
const MODELS_DIR = path.join(__dirname, '..', 'models');
const MODEL_PATH = path.join(MODELS_DIR, 'best.pt');

if (!MODEL_URL) {
  process.exit(0);
}

if (fs.existsSync(MODEL_PATH)) {
  process.exit(0);
}

const isHttps = MODEL_URL.startsWith('https');
const lib = isHttps ? https : http;

console.log('[ensure-model] Downloading best.pt from MODEL_URL...');
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

lib.get(MODEL_URL, (res) => {
  if (res.statusCode !== 200) {
    console.error('[ensure-model] Download failed:', res.statusCode);
    process.exit(1);
  }
  const file = fs.createWriteStream(MODEL_PATH);
  res.pipe(file);
  file.on('finish', () => {
    file.close();
    console.log('[ensure-model] best.pt ready.');
    process.exit(0);
  });
}).on('error', (err) => {
  console.error('[ensure-model] Error:', err.message);
  process.exit(1);
});
