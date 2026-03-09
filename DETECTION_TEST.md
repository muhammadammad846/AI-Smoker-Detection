# Detection test (backend + trained data)

This guide runs **detailed** detection tests: model load, class names (trained data), image detection via Python, and full API + live flow with the backend.

---

## 1. What the model is trained on

- **Model file:** `backend/models/best.pt` (YOLO format).
- **Class names** come from the model itself (e.g. `smoker`, `cigarette`, or whatever your training used). To see them, run the Python detection test (Step 2) — it prints **Model classes: [...]**.
- **Relevant labels** used in the app: any class whose name contains `smoker`, `smoking`, `cigarette`, `cigar`, or `smoke` is treated as smoking; `person`, `face`, `human` are used for face/body. Thresholds are in `backend/services/detection_config.py` (and env: `DETECTION_CONF_THRESHOLD`, `CHALLAN_CONF_THRESHOLD`).

---

## 2. Python detection test (model + trained data)

From **backend** directory:

```bash
cd backend
python scripts/run_detection_test.py
```

Optional: test on a specific image (e.g. smoking/person from your dataset):

```bash
python scripts/run_detection_test.py path/to/your/image.jpg
```

This script:

- Checks `backend/models/best.pt` exists.
- Loads the model and prints **class names** (the labels it was trained on).
- Runs detection on an image: `test-fixtures/test.jpg`, or `models/test/images/*.jpg`, or a path you pass; if none exist, creates a minimal 640×640 image and runs on it.
- Prints each detection: **label**, **confidence**, **bbox**.
- Exits 0 if the pipeline runs (even if 0 detections on a blank/dummy image).

**Requirements:** `ultralytics`, `opencv-python`. Install with:

```bash
pip install ultralytics opencv-python
```

---

## 3. Full AI models test (existing)

Broader tests (YOLO load, detection, image script, face recognition if available):

```bash
cd backend
python test_ai_models.py
```

Uses `backend/models/best.pt` and, if present, images under `backend/models/test/images/`.

---

## 4. Detection API test (backend must be running)

Tests **POST /api/detection/process** (same as the app’s “process image” flow).

**Terminal 1 – start backend:**

```bash
cd backend
npm start
```

**Terminal 2 – run API test:**

```bash
cd backend
node scripts/test-detection-api.js
```

Optional: point to a different host:

```bash
node scripts/test-detection-api.js https://your-backend.fly.dev
# or
API_BASE_URL=https://your-backend.fly.dev node scripts/test-detection-api.js
```

The script:

- Uses `backend/test-fixtures/test.jpg` if it exists (e.g. after running the Python test), otherwise writes a minimal JPEG and uses that.
- POSTs the image to `/api/detection/process`.
- Prints **success** and **detections** (label, confidence, bbox). Non-200 or `body.error` fails the script.

---

## 5. Live detection (start/stop + detections list)

1. **Start backend** (see Step 4).
2. **Start detection** for a camera (e.g. `cam1`):

   ```bash
   curl -X POST http://localhost:3000/api/detection/start -H "Content-Type: application/json" -d "{\"cameraId\":\"cam1\"}"
   ```

   With a camera source (e.g. webcam `0`):

   ```bash
   curl -X POST http://localhost:3000/api/detection/start -H "Content-Type: application/json" -d "{\"cameraId\":\"cam1\",\"cameraUrl\":\"0\"}"
   ```

3. **Get live detections:**

   ```bash
   curl http://localhost:3000/api/detections/live
   ```

   Response is an array of recent detections (cameraId, label, confidence, timestamp, etc.).

4. **Stop detection:**

   ```bash
   curl -X POST http://localhost:3000/api/detection/stop -H "Content-Type: application/json" -d "{\"cameraId\":\"cam1\"}"
   ```

**Note:** Live detection uses `yolo_live_detection.py` and requires a camera (e.g. `0`) or a video URL. Without a camera, the process may exit; the **image** and **API** tests above do not require a camera.

---

## 6. Mobile app flow (frame-by-frame)

The app can send frames over Socket.io to the backend. The backend uses `yolo_frame_detection.py` (stdin = JPEG buffer, stdout = JSON with `detections`, `snapshot`, `faceImages`). To test that flow end-to-end:

1. Backend running.
2. App configured to use that backend (see `src/config/api.js`).
3. In the app: open Live Camera → Start Detection. Frames are sent to the server; detections appear in the UI and in backend logs.

---

## 7. Quick checklist

| Test | Command | Requires |
|------|--------|----------|
| Model + class names + image detection | `cd backend && python scripts/run_detection_test.py [image]` | `best.pt`, Python deps |
| Full AI models | `cd backend && python test_ai_models.py` | `best.pt`, optional test images |
| Detection API | Backend running, then `cd backend && node scripts/test-detection-api.js` | Backend on port 3000 |
| Live start/stop + list | `curl` to `/api/detection/start`, `/api/detections/live`, `/api/detection/stop` | Backend, optional camera |
| Mobile frame detection | App → Live Camera → Start Detection | Backend + app, same network |

---

## 8. Test data for “trained on” behavior

- Add a real image from your training set (or similar) as `backend/test-fixtures/test.jpg`, or pass it to `run_detection_test.py path/to/image.jpg`.
- Or put images in `backend/models/test/images/` (e.g. `test1.jpg`); the Python test and `test_ai_models.py` can use them.
- For live detection, use a webcam or a video file/URL that shows persons/smoking if you want to see non-zero detections consistent with your trained classes.
