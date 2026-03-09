# Production-Level Testing

Run backend and app in production mode and verify critical flows.

---

## 1. Backend in production mode (local)

From project root:

```bash
cd backend
npm run start:production
```

Or with env (any OS):

- **Windows (PowerShell):** `$env:NODE_ENV="production"; node server.js`
- **Windows (CMD):** `set NODE_ENV=production && node server.js`
- **Mac/Linux:** `NODE_ENV=production node server.js`

Ensure `.env` exists (copy from `.env.example`) with at least:

- `FIREBASE_STORAGE_BUCKET=cctv-smoking-detection.firebasestorage.app`
- Optional: `CORS_ORIGIN` / `FRONTEND_URL` if you restrict CORS.

---

## 2. API smoke test (backend must be running)

In another terminal:

```bash
cd backend
npm run test:production
```

Tests:

- `GET /api/health`
- `GET /api/cameras`
- `GET /api/detections/live`
- `GET /api/challans`

Against a **deployed** backend:

```bash
cd backend
API_BASE_URL=https://your-app.fly.dev node scripts/test-production.js
```

Or:

```bash
node scripts/test-production.js https://your-app.fly.dev
```

All checks should pass (exit code 0).

---

## 3. App in production mode (Expo)

So the app uses production code paths and your production API URL:

**Option A – Deployed backend**

Set env and start Expo (no dev client):

- **Windows (PowerShell):**
  ```powershell
  $env:EXPO_PUBLIC_API_URL="https://your-app.fly.dev/api"
  $env:EXPO_PUBLIC_SOCKET_URL="https://your-app.fly.dev"
  npx expo start --no-dev
  ```
- **Mac/Linux:**
  ```bash
  EXPO_PUBLIC_API_URL=https://your-app.fly.dev/api EXPO_PUBLIC_SOCKET_URL=https://your-app.fly.dev npx expo start --no-dev
  ```

**Option B – Local backend in production**

Use your machine’s IP or emulator host (e.g. `10.0.2.2` for Android emulator):

- **Windows (PowerShell):**
  ```powershell
  $env:EXPO_PUBLIC_API_URL="http://10.0.2.2:3000/api"
  $env:EXPO_PUBLIC_SOCKET_URL="http://10.0.2.2:3000"
  npx expo start --no-dev
  ```

Then open on device/emulator and test:

- Login (admin / security head / guard / student)
- Live detections (start/stop, list)
- Challans (list, create if admin)
- Cameras (list, add if admin)
- User list and add user (admin)

---

## 4. Production build (APK) and test

Build an APK with production profile (uses EAS env for `EXPO_PUBLIC_*`):

```bash
eas build --platform android --profile production
```

Before building, in [EAS dashboard](https://expo.dev) → your project → **Environment variables**, set:

- `EXPO_PUBLIC_API_URL` = `https://your-backend.fly.dev/api`
- `EXPO_PUBLIC_SOCKET_URL` = `https://your-backend.fly.dev`

Install the APK on a device and run through the same flows as in section 3.

---

## 5. Checklist (production-level test)

- [ ] Backend runs with `NODE_ENV=production` (local or deployed)
- [ ] `npm run test:production` passes (local or with `API_BASE_URL` set to deployed URL)
- [ ] Expo started with `--no-dev` and correct `EXPO_PUBLIC_*` URLs
- [ ] Login works for each role
- [ ] Live detections load and start/stop works
- [ ] Challans and cameras APIs work from the app
- [ ] (Optional) Production APK built with EAS and tested on device

---

## Quick reference

| Task                    | Command / step |
|-------------------------|----------------|
| Start backend (prod)    | `cd backend && npm run start:production` |
| Smoke test (local)      | `cd backend && npm run test:production`  |
| Smoke test (deployed)   | `cd backend && API_BASE_URL=https://... node scripts/test-production.js` |
| Expo production (no dev)| `EXPO_PUBLIC_API_URL=... EXPO_PUBLIC_SOCKET_URL=... npx expo start --no-dev` |
| Build APK               | `eas build --platform android --profile production` |
