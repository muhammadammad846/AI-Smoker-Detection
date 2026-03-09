# Pre-launch checklist

Use this before releasing the app or building a production APK.

---

## 1. Backend

- [ ] Backend is **deployed** (e.g. Fly.io, Railway) and reachable
- [ ] For **Railway**: follow **`RAILWAY_COMPLETE.md`** (Root Directory = `backend`, variables, model via commit or `MODEL_URL`)
- [ ] `GET https://your-backend-url/api/health` returns `{"status":"ok"}`
- [ ] **Secrets/env** set on the host:
  - `SERVICE_ACCOUNT_JSON` — full Firebase service account JSON
  - `FIREBASE_STORAGE_BUCKET` = `cctv-smoking-detection.firebasestorage.app`
  - Optional: `CORS_ORIGIN` or `FRONTEND_URL` to restrict CORS
- [ ] If using server-side detection: `backend/models/best.pt` is present on the server (and Python deps installed)

**Quick verify:** From project root run `npm run verify-launch` (or `BACKEND_URL=https://your-backend npm run verify-launch`).

---

## 2. Production API URLs (critical)

Production builds use **build-time** env. If these are not set, the app will point to a placeholder and **will not work**.

- [ ] In **Expo dashboard** → your project → **Environment variables** → **production** profile, set:
  - `EXPO_PUBLIC_API_URL` = `https://your-backend-url/api`
  - `EXPO_PUBLIC_SOCKET_URL` = `https://your-backend-url`
- [ ] Build after setting: `eas build --platform android --profile production`

---

## 3. Firebase

- [ ] **Firestore rules** deployed: `firebase deploy --only firestore:rules`
- [ ] **Storage rules** in Firebase Console reviewed (e.g. `student-photos/`, `detections/`)
- [ ] **Admin user** exists: run `cd backend && npm run create-admin -- admin@example.com YourPassword "Admin"` or create in Firebase Auth + Firestore `users/{uid}` with `role: "admin"`

---

## 4. App build & test

- [ ] Production build: `eas build --platform android --profile production`
- [ ] Install APK and test:
  - [ ] Admin login
  - [ ] Live detections (if used)
  - [ ] Challans list / create
  - [ ] Users list / add user

---

## 5. Verify script (optional)

From **project root**:

```bash
npm run verify-launch
```

Or with a deployed backend URL:

```bash
BACKEND_URL=https://your-app.fly.dev npm run verify-launch
```

Skips health check if backend is not running: `SKIP_HEALTH=1 npm run verify-launch`

---

## Quick reference

| Item | Where / command |
|------|------------------|
| Backend URL | Your hosting (e.g. `https://your-service.up.railway.app`) |
| Railway deploy | **`RAILWAY_COMPLETE.md`** |
| EAS env | expo.dev → project → Environment variables → production |
| Firestore rules | `firestore.rules` then `firebase deploy --only firestore:rules` |
| Create admin | `cd backend && npm run create-admin -- <email> <password> "Name"` |
| Full checklist | `PRODUCTION_READINESS_CHECKLIST.md` |
