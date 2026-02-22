# Production Readiness Checklist

**Last Updated:** 2025-02  
**Status:** Production-ready code; deploy backend and set env to go live.

---

## Overall status

| Area | Status |
|------|--------|
| Code & features | Complete |
| API/Socket URLs | Env-based (see below) |
| Backend validation | Challans + cameras validated |
| Firestore rules | Tightened (users + challans) |
| Error handling | processImage + cameraService fixed |
| Camera list in Live screen | Implemented |
| Edit user | Profile update; password via Forgot password |

---

## 1. Production URLs (frontend)

URLs are **env-based**. No need to edit `apiService.js` or `socketService.js` by hand.

- **Config:** `src/config/api.js` reads from `Constants.expoConfig.extra` or `process.env`.
- **Build-time:** Set in **EAS Build** (or in `app.config.js` / env):

  - `EXPO_PUBLIC_API_URL` = `https://your-backend.fly.dev/api` (or your backend base + `/api`)
  - `EXPO_PUBLIC_SOCKET_URL` = `https://your-backend.fly.dev`

- **app.config.js** passes these into `expo.extra` so the app uses them in production builds.

**Checklist:**

- [ ] Backend deployed and URL known
- [ ] EAS env set: `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_SOCKET_URL`
- [ ] Production build tested (or run with correct env and confirm config)

---

## 2. Backend deployment

- **Fly.io:** See `FLY_IO_QUICK_START.md` and `backend/FLY_IO_DEPLOYMENT_GUIDE.md`. Set secrets: `SERVICE_ACCOUNT_JSON`, `FIREBASE_STORAGE_BUCKET`; optionally `CORS_ORIGIN` / `FRONTEND_URL`.
- **Render / Railway / other:** Use `backend/.env.example` and deploy; set same vars.

**Checklist:**

- [ ] Backend runs and `/api/health` returns 200
- [ ] `SERVICE_ACCOUNT_JSON` and `FIREBASE_STORAGE_BUCKET` set
- [ ] In production, `CORS_ORIGIN` or `FRONTEND_URL` set if you restrict CORS

---

## 3. Backend environment

Copy `backend/.env.example` to `backend/.env` and fill:

- `PORT`, `NODE_ENV`
- `FIREBASE_STORAGE_BUCKET`
- For deployed backend: `SERVICE_ACCOUNT_JSON` (full JSON string)
- Production: `CORS_ORIGIN` or `FRONTEND_URL` (optional but recommended)

---

## 4. Firestore rules

- **Users:** `read: if request.auth != null` (no longer open read).
- **Challans:** Students can read only their own (`studentId == request.auth.uid`); admins/security_heads/guards can read all. Writes unchanged (admin / security_head).
- Deploy: `firebase deploy --only firestore:rules`.

**Checklist:**

- [ ] Rules deployed
- [ ] Test: student sees only own challans; admin sees all

---

## 5. Security & hardening (done in code)

- **CORS:** Backend uses `CORS_ORIGIN` or `FRONTEND_URL` in production when set.
- **Challan API:** POST/PUT validate `studentId`, `amount`, `status`.
- **processImage:** Uses proper `response.ok` and error handling.
- **cameraService:** Mock fallbacks only in `__DEV__`; production throws on API failure.
- **Edit user:** Saves profile; password change is via “Forgot password” on login (no backend password-update endpoint).

---

## 6. Pre-launch checklist

### Backend

- [ ] Deployed and reachable
- [ ] Health: `GET /api/health`
- [ ] Firebase (Service Account + Storage bucket) configured
- [ ] CORS set if restricting origins

### Frontend / APK

- [ ] `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_SOCKET_URL` set for production build
- [ ] EAS build: `eas build --platform android --profile production`
- [ ] Install APK and test login, detection, challans, live camera

### Firebase

- [ ] Firestore rules deployed and tested
- [ ] Auth and Storage configured for production

---

## 7. Optional improvements

- **API auth:** Most routes are unauthenticated (app-only). Add auth/role checks if exposing API publicly.
- **Firebase config in app:** Move from hardcoded config to env (e.g. Expo env vars) for multiple environments.
- **Logging:** Reduce or gate `console.log` by `__DEV__` in production.

---

## Quick reference

| What | Where |
|------|--------|
| API/Socket base URLs | `src/config/api.js`; set via `app.config.js` extra or `EXPO_PUBLIC_*` |
| Backend env template | `backend/.env.example` |
| Firestore rules | `firestore.rules` |
| Fly.io deploy | `FLY_IO_QUICK_START.md`, `backend/fly.toml` |
| APK build | `BUILD_APK_GUIDE.md`, `eas.json` |

Once backend is deployed and env/URLs are set, the system is production-ready for launch.
