#!/usr/bin/env node
/**
 * Production-level API smoke test.
 * Run with backend already running (local or deployed).
 *
 * Usage:
 *   node test-production.js
 *   node test-production.js https://your-app.fly.dev
 *   API_BASE_URL=https://your-app.fly.dev node test-production.js
 */
const http = require('http');
const https = require('https');

const baseUrl = process.env.API_BASE_URL || process.argv[2] || 'http://localhost:3000';
const base = baseUrl.replace(/\/$/, '').replace(/\/api$/, '');
const isHttps = base.startsWith('https');

function request(path) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, base + '/');
    const lib = isHttps ? https : http;
    const req = lib.get(url, { timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', (ch) => (data += ch));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function run() {
  const results = [];
  const ok = (name, pass, detail = '') => {
    results.push({ name, pass, detail });
    console.log(pass ? `  \u2713 ${name}` : `  \u2717 ${name}${detail ? ': ' + detail : ''}`);
  };

  console.log('\nProduction API smoke test');
  console.log('Base URL:', base);
  console.log('');

  try {
    const health = await request('/api/health');
    ok('GET /api/health', health.status === 200, health.status !== 200 ? `status ${health.status}` : '');
  } catch (e) {
    ok('GET /api/health', false, e.message || String(e));
  }

  try {
    const cameras = await request('/api/cameras');
    ok('GET /api/cameras', cameras.status === 200, cameras.status !== 200 ? `status ${cameras.status}` : '');
  } catch (e) {
    ok('GET /api/cameras', false, e.message || String(e));
  }

  try {
    const live = await request('/api/detections/live');
    ok('GET /api/detections/live', live.status === 200, live.status !== 200 ? `status ${live.status}` : '');
  } catch (e) {
    ok('GET /api/detections/live', false, e.message || String(e));
  }

  try {
    const challans = await request('/api/challans');
    ok('GET /api/challans', challans.status === 200, challans.status !== 200 ? `status ${challans.status}` : '');
  } catch (e) {
    ok('GET /api/challans', false, e.message || String(e));
  }

  const passed = results.filter((r) => r.pass).length;
  const failed = results.filter((r) => !r.pass).length;
  console.log('');
  console.log(`Result: ${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
