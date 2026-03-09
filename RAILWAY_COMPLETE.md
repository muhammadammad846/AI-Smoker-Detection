# Railway deployment – complete checklist

Use this to deploy the backend to Railway so the app works end-to-end.

---

## 1. Railway project

1. Go to [railway.app](https://railway.app) and sign in (GitHub).
2. **New Project** → **Deploy from GitHub repo**.
3. Select your repo (e.g. the one containing this project).
4. Open the new **service**.

---

## 2. Root directory

- Service → **Settings** → **Root Directory** → set to **`backend`**.
- Railway will build and run from the `backend/` folder (where `server.js` and `package.json` are).

---

## 3. Required variables

Service → **Variables** (or **Environment**) → add:

| Variable | Required | Value |
|----------|----------|--------|
| `SERVICE_ACCOUNT_JSON` | **Yes** | Full Firebase service account JSON (single line). From Firebase Console → Project settings → Service accounts → Generate new private key → copy entire JSON. |
| `FIREBASE_STORAGE_BUCKET` | **Yes** | `cctv-smoking-detection.firebasestorage.app` |

Optional:

| Variable | Purpose |
|----------|---------|
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | Your app origin(s), e.g. `https://yourapp.com` (or leave unset for `*`). |

---

## 4. YOLO model (`best.pt`)

Use **one** of these:

**Option A – Commit the model (simplest)**  
- The repo now allows committing `backend/models/best.pt` (`.gitignore` exception).
- Add the file: `backend/models/best.pt`, then commit and push.
- Railway will have it on every deploy.

**Option B – Download at startup**  
- Upload `best.pt` to a private URL (e.g. Firebase Storage, get a download URL).
- In Railway **Variables**, add:  
  `MODEL_URL` = that URL (e.g. `https://firebasestorage.googleapis.com/...`).
- On start, the app runs `ensure-model.js`, which downloads `best.pt` if missing. No need to commit the file.

If you do neither, the server will start but detection (image/live) will fail with “model file missing”.

---

## 5. Deploy

- Push to the branch Railway watches (usually `main`), or click **Deploy** in the dashboard.
- Railway uses **Nixpacks** and `backend/nixpacks.toml`: Node 18, Python 3.10, `npm install`, `pip install -r requirements.txt`.
- First build can take **10–20+ minutes** (Python deps). If it times out, see “Build timeout” in Troubleshooting below.

---

## 6. Public URL

- Service → **Settings** → **Networking** → **Generate domain** (or add a custom domain).
- Backend URL will look like: **`https://your-service-name.up.railway.app`**.

Test:

```bash
curl https://your-service-name.up.railway.app/api/health
```

Expected: `{"status":"ok","message":"Server is running"}`.

---

## 7. Connect the app

Set these for your **production** app build (EAS or env):

- `EXPO_PUBLIC_API_URL` = `https://your-service-name.up.railway.app/api`
- `EXPO_PUBLIC_SOCKET_URL` = `https://your-service-name.up.railway.app`

In **Expo dashboard** → your project → **Environment variables** → **production** profile, add both, then run:

```bash
eas build --platform android --profile production
```

---

## 8. Quick checklist

- [ ] New project from GitHub repo.
- [ ] **Root Directory** = `backend`.
- [ ] Variables: `SERVICE_ACCOUNT_JSON`, `FIREBASE_STORAGE_BUCKET`.
- [ ] Model: commit `backend/models/best.pt` **or** set `MODEL_URL`.
- [ ] Deploy; wait for build to finish.
- [ ] Generate domain; test `/api/health`.
- [ ] Set `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_SOCKET_URL`; build and test the app.

---

## Troubleshooting

| Issue | What to do |
|-------|------------|
| Build timeout | Use a lighter `requirements.txt` for Railway (e.g. remove `face-recognition` and rely on detection without face matching), or reduce Python deps. |
| “Model file missing” when running detection | Ensure `best.pt` is present: either commit it (Option A) or set `MODEL_URL` (Option B) and redeploy. |
| 500 / Firebase errors | Check `SERVICE_ACCOUNT_JSON` is valid JSON and `FIREBASE_STORAGE_BUCKET` matches your project. |
| CORS errors from app | Set `CORS_ORIGIN` to your app’s origin or leave unset to allow all. |

---

## Reference

- Backend config: `backend/railway.json`, `backend/nixpacks.toml`.
- Model download at start: `backend/scripts/ensure-model.js` (runs when `MODEL_URL` is set and `best.pt` is missing).
- General launch steps: `LAUNCH_CHECKLIST.md`.
