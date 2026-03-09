# Deploy Backend on Railway

**Full step-by-step checklist:** see **`RAILWAY_COMPLETE.md`**.

Use this guide to deploy the **backend only** to Railway so your app/APK can connect to a live API.

---

## 1. Railway setup

1. Go to [railway.app](https://railway.app) and sign in (GitHub).
2. **New Project** → **Deploy from GitHub repo**.
3. Select **Razal-Loop/AI-Smoker-Detection** (or your fork).
4. After the repo is connected, open the new **service**.

---

## 2. Use backend as root

Railway must build and run only the `backend` folder.

- Open your service → **Settings** (or **Variables** tab and look for **Root Directory** / **Build**).
- Set **Root Directory** to: **`backend`**.
- So the project root for this service is `backend/` (where `server.js` and `package.json` live).

---

## 3. Environment variables

In the service → **Variables** (or **Environment**) add:

| Variable | Required | Example / notes |
|----------|----------|------------------|
| `SERVICE_ACCOUNT_JSON` | **Yes** | Full JSON of your Firebase service account key (paste as one line, or use Railway’s “multi-line” if supported). |
| `FIREBASE_STORAGE_BUCKET` | **Yes** | `your-project-id.firebasestorage.app` |
| `NODE_ENV` | Optional | `production` |
| `CORS_ORIGIN` | Optional | Your frontend origin, e.g. `https://yourapp.com` (or leave unset to allow `*`). |

**Getting `SERVICE_ACCOUNT_JSON`:**

- Firebase Console → Project Settings → Service accounts → Generate new private key → open the JSON file.
- Copy the **entire** JSON and paste as the value of `SERVICE_ACCOUNT_JSON` (no line breaks, or use Railway’s multi-line input).

---

## 4. YOLO model (`best.pt`)

The app expects the YOLO model at `backend/models/best.pt`.

**Option A – Commit the model (simplest)**  
- The repo allows committing `backend/models/best.pt` (see `.gitignore` exception).  
- Put `best.pt` in `backend/models/`, then commit and push.  
- Railway will then have the file on deploy.

**Option B – Download at start (no commit)**  
- Set Railway variable **`MODEL_URL`** to a URL that serves `best.pt` (e.g. Firebase Storage download URL).  
- On start, `scripts/ensure-model.js` downloads the file if missing.  
- See **`RAILWAY_COMPLETE.md`** for details.

**If you do neither:** API and server will run, but starting detection or processing an image will throw (missing model).

---

## 5. Build and deploy

- **Trigger deploy:** Push to the branch Railway watches (usually `main`), or use **Deploy** in the dashboard.
- Railway uses **Nixpacks** and your `backend/nixpacks.toml`: it installs Node, Python 3.10, runs `npm install` and `pip install -r requirements.txt`.
- **First build can take 10–20+ minutes** (PyTorch, `face-recognition`, etc.). If the build times out, consider a lighter `requirements.txt` for Railway (e.g. drop `face-recognition` and use detection without face matching).

---

## 6. After deploy

- In the service, open **Settings** → **Networking** → **Generate domain** (or use a custom domain).
- Your backend URL will be like: **`https://your-service-name.up.railway.app`**.

Use this URL for the frontend:

- **API base:** `https://your-service-name.up.railway.app/api`
- **Socket base:** `https://your-service-name.up.railway.app`

Set these in EAS Build (or app config) as:

- `EXPO_PUBLIC_API_URL` = `https://your-service-name.up.railway.app/api`
- `EXPO_PUBLIC_SOCKET_URL` = `https://your-service-name.up.railway.app`

---

## 7. Quick checklist

- [ ] New project from GitHub repo.
- [ ] **Root Directory** = `backend`.
- [ ] Variables: `SERVICE_ACCOUNT_JSON`, `FIREBASE_STORAGE_BUCKET`.
- [ ] Model: `best.pt` in repo (Option A) or downloaded at build/start (Option B).
- [ ] Deploy; wait for build to finish.
- [ ] Generate public domain; test `https://YOUR-DOMAIN.up.railway.app/api/health`.
- [ ] Set `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_SOCKET_URL` and build your APK.

---

## Troubleshooting

| Issue | What to do |
|--------|------------|
| Build timeout | Use a lighter `requirements.txt` (e.g. remove `face-recognition` and `torch` if you only need a placeholder), or contact Railway for longer build timeout. |
| “Model file missing” when starting detection | Ensure `backend/models/best.pt` exists (commit it or add download step). |
| 500 / Firebase errors | Check `SERVICE_ACCOUNT_JSON` is valid JSON and `FIREBASE_STORAGE_BUCKET` matches your project. |
| CORS errors from app | Set `CORS_ORIGIN` to your app’s origin (or leave unset to allow all). |
