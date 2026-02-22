# AI Detection – Tuned for Best Accuracy

## What’s Implemented

- **YOLO smoking detection** – Custom model `best.pt` with **configurable confidence** (default **0.55** to reduce false positives).
- **Robust class matching** – Any class name containing `smoker`, `smoking`, `cigarette`, `cigar`, `smoke` or `person`, `face`, `human` is handled (works with different model naming).
- **Stricter auto-challan** – Challans are auto-created only when a smoking detection has **confidence ≥ 0.6** (configurable via `CHALLAN_CONF_THRESHOLD`).
- **Face recognition** – Stricter match threshold **0.55** (default); only faces **≥ 60×60 px** are used for matching; small/blurry faces are skipped.
- **Face extraction** – When smoking is detected, faces are cropped with a small padding for better recognition; minimum face size filter avoids sending tiny crops.

Pipeline: image/frame → YOLO (conf ≥ 0.55) → optional face crop (min size) → face match (distance ≤ 0.55) → auto-challan only if smoking conf ≥ 0.6.

---

## Environment Variables (Optional Tuning)

Set in `backend/.env` or your deployment environment:

| Variable | Default | Description |
|----------|---------|-------------|
| `DETECTION_CONF_THRESHOLD` | 0.55 | YOLO min confidence to count as detection (higher = fewer false positives). |
| `CHALLAN_CONF_THRESHOLD` | 0.6 | Min confidence to auto-generate challan (Node + Python). |
| `FACE_MATCH_THRESHOLD` | 0.55 | Max face distance to accept match (lower = stricter). |
| `MIN_FACE_WIDTH` | 60 | Min face width (px) for recognition. |
| `MIN_FACE_HEIGHT` | 60 | Min face height (px) for recognition. |

- **Fewer false positives:** Increase `DETECTION_CONF_THRESHOLD` (e.g. 0.6) and/or `CHALLAN_CONF_THRESHOLD` (e.g. 0.65).
- **Fewer missed detections:** Decrease `DETECTION_CONF_THRESHOLD` (e.g. 0.5).
- **Stricter face matching:** Decrease `FACE_MATCH_THRESHOLD` (e.g. 0.5).

---

## Still Depends On

- **Quality of `best.pt`** – Train or replace with data from your environment for best results.
- **Lighting / angle** – Real-world conditions affect both YOLO and face matching.
- **Student photos** – Clear, frontal, well-lit photos improve identification.

---

## Quick Checks

- **YOLO:** `python backend/test_ai_models.py` or `python backend/test_ai_models_quick.py` (requires `backend/models/best.pt`).
- **Face recognition:** Optional; may require dlib/face_recognition (Windows can need extra setup).
