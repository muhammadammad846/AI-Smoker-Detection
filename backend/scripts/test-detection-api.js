#!/usr/bin/env node
/**
 * Test detection API: POST image to /api/detection/process and assert response.
 * Backend must be running (npm start in backend/).
 *
 * Usage:
 *   node test-detection-api.js
 *   node test-detection-api.js http://localhost:3000
 *   API_BASE_URL=https://your-backend.fly.dev node test-detection-api.js
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const BASE = process.env.API_BASE_URL || process.argv[2] || 'http://localhost:3000';
const baseUrl = BASE.replace(/\/$/, '').replace(/\/api$/, '');
const API_URL = baseUrl + '/api/detection/process';

const BACKEND_DIR = path.join(__dirname, '..');
const FIXTURE_PATH = path.join(BACKEND_DIR, 'test-fixtures', 'test.jpg');

// Minimal valid 1x1 pixel JPEG (fallback if no fixture)
const MINIMAL_JPEG_BASE64 = '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEBAREA/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhADEAEAAtb/2Q==';

function ensureTestImage() {
  if (fs.existsSync(FIXTURE_PATH)) {
    return fs.readFileSync(FIXTURE_PATH);
  }
  const dir = path.dirname(FIXTURE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const buf = Buffer.from(MINIMAL_JPEG_BASE64, 'base64');
  fs.writeFileSync(FIXTURE_PATH, buf);
  return buf;
}

function postMultipart(url, imageBuffer, filename) {
  filename = filename || 'test.jpg';
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const lib = isHttps ? https : http;
    const u = new URL(url);
    const boundary = '----NodeDetectionTest' + Date.now();
    const bodyStart =
      `--${boundary}\r\n` +
      `Content-Disposition: form-data; name="image"; filename="${filename}"\r\n` +
      `Content-Type: image/jpeg\r\n\r\n`;
    const bodyEnd = `\r\n--${boundary}--\r\n`;
    const body = Buffer.concat([
      Buffer.from(bodyStart, 'utf8'),
      imageBuffer,
      Buffer.from(bodyEnd, 'utf8'),
    ]);
    const options = {
      hostname: u.hostname,
      port: u.port || (isHttps ? 443 : 80),
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    };
    const req = lib.request(options, (res) => {
      let data = '';
      res.on('data', (ch) => (data += ch));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (_) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function run() {
  console.log('\n=== Detection API test ===');
  console.log('POST', API_URL);
  console.log('');

  let imageBuffer;
  try {
    imageBuffer = ensureTestImage();
    console.log('  Image: ' + (fs.existsSync(FIXTURE_PATH) ? FIXTURE_PATH : 'minimal JPEG (no fixture)'));
  } catch (e) {
    console.error('  Failed to prepare image:', e.message);
    process.exit(1);
  }

  try {
    const { status, body } = await postMultipart(API_URL, imageBuffer);
    if (status !== 200) {
      console.error('  Status:', status);
      console.error('  Body:', typeof body === 'object' ? JSON.stringify(body, null, 2) : body);
      process.exit(1);
    }
    if (body.error) {
      console.error('  API error:', body.error);
      process.exit(1);
    }
    const detections = body.detections || [];
    console.log('  Success:', body.success);
    console.log('  Detections:', detections.length);
    detections.forEach((d, i) => {
      console.log(`    ${i + 1}. ${d.label} (confidence: ${(d.confidence || 0).toFixed(2)}) bbox=${JSON.stringify(d.bbox)}`);
    });
    console.log('\n  Detection API OK.');
    process.exit(0);
  } catch (e) {
    console.error('  Request failed:', e.message);
    if (e.code === 'ECONNREFUSED') {
      console.error('  Make sure the backend is running: cd backend && npm start');
    }
    process.exit(1);
  }
}

run();
