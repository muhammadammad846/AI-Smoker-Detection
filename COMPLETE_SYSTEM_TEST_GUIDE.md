# How to Test the Complete System

This guide walks you through testing the full CCTV Smoking Detection system (backend + app + Firebase + AI) on your machine.

---

## Prerequisites

- **Node.js** (v18+)
- **Python 3.10+** (for YOLO and optional face recognition)
- **Firebase project** – Auth, Firestore, Storage enabled
- **Same Wi‑Fi** for phone and computer (when testing on a real device)
- **YOLO model** – `backend/models/best.pt` (required for detection)

---

## 1. Backend Setup & Test

### 1.1 Install and configure

```powershell
cd backend
npm install
```

Create `backend/.env` (copy from `.env.example`):

```env
PORT=3000
NODE_ENV=development
FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
```

- For **local runs**, put your Firebase service account JSON at `backend/ServiceAccount.json` (or set `SERVICE_ACCOUNT_JSON` in `.env` with the full JSON string).
- Ensure **Firestore** and **Storage** are set up and rules deployed.

### 1.2 Start backend

```powershell
cd backend
npm start
```

You should see: `Server running on port 3000`.

### 1.3 Quick API check

- **Health:** Open in browser or use curl:
  - `http://localhost:3000/api/health`
  - Expected: JSON like `{ "status": "ok" }` or similar.

- **From another machine (e.g. phone):** Use your PC’s **local IP** instead of `localhost`, e.g. `http://192.168.1.10:3000/api/health`.

### 1.4 (Optional) Test AI models

From project root:

```powershell
cd backend
python test_ai_models_quick.py
```

Or full AI tests:

```powershell
python test_ai_models.py
```

- Requires `backend/models/best.pt` and Python deps: `ultralytics`, `opencv-python`. Face recognition tests need `face_recognition` (optional, can fail on some Windows setups).

---

## 2. Frontend Setup & Test

### 2.1 Install

```powershell
# From project root (e.g. d:\ammad project)
npm install
```

### 2.2 Point app to your backend

The app uses **`src/config/api.js`** for the backend URL in development.

- If your backend runs on the **same PC** as Expo and you test on **phone**, set your computer’s IP in `src/config/api.js`:

  - Replace `192.168.18.56` with your IP in:
    - `DEV_API` (e.g. `http://YOUR_IP:3000/api`)
    - `DEV_SOCKET` (e.g. `http://YOUR_IP:3000`)

- To find your IP:
  - **Windows:** `ipconfig` → look for IPv4 (e.g. 192.168.1.10).
  - **Mac/Linux:** `ifconfig` or `ip addr`.

- If you use **Android emulator**, often you need `10.0.2.2` instead of localhost (set that as your “IP” in the URLs above).

### 2.3 Start Expo

```powershell
# From project root
npm start
```

- Scan QR with **Expo Go** (Android/iOS) or press **a** (Android emulator) / **i** (iOS simulator).
- Ensure phone and computer are on the **same Wi‑Fi** when using a real device.

---

## 3. End-to-End Test Flow

Use this order so dependencies (users, photos, detection) are in place.

### 3.1 Firebase / first user

- Create an **admin user** in Firebase (Auth + Firestore `users` with `role: "admin"`), or use your existing setup.
- Log in as **admin** in the app.

### 3.2 Admin tests

| Step | Action | What to check |
|------|--------|----------------|
| 1 | Login as admin | Dashboard or home loads |
| 2 | Add a student | Include **photo** and **student ID** (needed for face recognition) |
| 3 | Add a guard (optional) | User appears in list |
| 4 | Open **Challans** | List loads (may be empty) |
| 5 | Create challan manually | Choose student, amount, save; appears in list |
| 6 | Open **Live Camera** | Camera permission; “Start Detection” visible |

### 3.3 Live detection (backend must be running)

| Step | Action | What to check |
|------|--------|----------------|
| 1 | Admin → Live Camera | Tap **Start Detection** |
| 2 | Allow camera | Frames are sent (see backend logs if needed) |
| 3 | Point at test image/person | Detections appear if model sees smoking/person (depends on `best.pt`) |
| 4 | Stop Detection | Stops without error |

- If you have **student photos** and a clear face in frame with smoking detected, the system may match the student and **auto-create a challan** (check Challans list and backend logs).

### 3.4 Guard tests (optional)

- Log in as **guard** (create one as admin if needed).
- Open **Live Camera** → start/stop detection.
- Check **Caught Students** / **Challans** (guards see their scope).

### 3.5 Student tests

- Log in as **student**.
- Open **My Challans** → only that student’s challans.
- **Profile** shows correct info.

### 3.6 Security Head tests (optional)

- Log in as **security head**.
- View challans and guard activity as intended.

---

## 4. Quick Command Reference

| Task | Command |
|------|--------|
| Start backend | `cd backend && npm start` |
| Start frontend | `npm start` (from project root) |
| Backend health | Open `http://YOUR_IP:3000/api/health` |
| Test YOLO (quick) | `cd backend && python test_ai_models_quick.py` |
| Test AI (full) | `cd backend && python test_ai_models.py` |

---

## 5. Troubleshooting

| Problem | What to do |
|--------|-------------|
| App can’t reach backend | Same Wi‑Fi; correct IP in `src/config/api.js`; backend running; firewall allows port 3000. |
| “Network error” in app | Confirm `http://YOUR_IP:3000/api/health` works in browser on the **phone** (or use same URL in app’s config). |
| Socket.io not connecting | Same as above; Socket URL in `src/config/api.js` must use same IP and port (no `/api` in socket URL). |
| No detection results | Backend running; `backend/models/best.pt` present; check backend console for Python errors. |
| Face recognition not matching | Student must have **photo** in Firestore; face clearly visible; optional: install `face_recognition` (and dlib) on backend. |
| Firebase errors | Check `src/config/firebase.js` and backend service account; Firestore/Storage rules and indexes. |
| Expo “Unable to resolve module” | From project root run `npm install` again; restart Expo with `npm start`. |

---

## 6. Checklist Summary

- [ ] Backend: `npm install` + `.env` + `ServiceAccount.json` (or env)
- [ ] Backend: `npm start` → “Server running on port 3000”
- [ ] Backend: `http://YOUR_IP:3000/api/health` returns OK
- [ ] Frontend: `src/config/api.js` has your IP for DEV_API and DEV_SOCKET
- [ ] Frontend: `npm start` → app opens in Expo Go or emulator
- [ ] Firebase: Admin user exists; can log in
- [ ] Admin: Add student with photo; create challan; open Live Camera
- [ ] Live Camera: Start Detection → frames sent; detections if model triggers
- [ ] (Optional) AI: `python test_ai_models_quick.py` passes

When all of the above work, the **complete system** is tested end to end. For a detailed feature checklist (all roles and edge cases), see **TESTING_CHECKLIST.md**.
