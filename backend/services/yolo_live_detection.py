import sys
import json
import cv2
import os
from datetime import datetime
import uuid
from ultralytics import YOLO
import time

# --------------------------
# Arguments
# --------------------------
if len(sys.argv) < 4:
    print(json.dumps({"error": "cameraId, camera URL, and model path required"}))
    sys.exit(1)

camera_id = sys.argv[1]
camera_url = sys.argv[2]
MODEL_PATH = sys.argv[3]

if not os.path.exists(MODEL_PATH):
    print(json.dumps({"error": f"Model not found: {MODEL_PATH}"}))
    sys.exit(1)

# --------------------------
# Load YOLO model
# --------------------------
try:
    model = YOLO(MODEL_PATH)
    # Suppress verbose output
    import os
    os.environ["YOLO_VERBOSE"] = "False"
except Exception as e:
    print(json.dumps({"error": f"Failed to load model: {str(e)}"}), file=sys.stderr)
    sys.exit(1)

# Face detector
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

# --------------------------
# Reports directory
# --------------------------
REPORT_DIR = "reports"
os.makedirs(REPORT_DIR, exist_ok=True)

# --------------------------
# Open camera with retry
# --------------------------
def open_camera(url, max_retries=5, wait_sec=2):
    for attempt in range(max_retries):
        try:
            cap = cv2.VideoCapture(url if not url.isdigit() else int(url))
            if cap.isOpened():
                return cap
        except Exception:
            pass
        time.sleep(wait_sec)
    return None

cap = open_camera(camera_url)
if not cap:
    print(json.dumps({"error": f"Could not open camera: {camera_url}"}))
    sys.exit(1)

# --------------------------
# Main loop
# --------------------------
while True:
    ret, frame = cap.read()
    if not ret:
        print(json.dumps({"error": "Failed to read frame"}))
        time.sleep(1)
        cap.release()
        cap = open_camera(camera_url)
        if not cap:
            break
        continue

    detections_list = []

    # --------------------------
    # YOLO detection
    # --------------------------
    try:
        results = model(frame, conf=0.5, verbose=False)
    except Exception as e:
        print(json.dumps({"error": f"Detection failed: {str(e)}"}), file=sys.stderr)
        time.sleep(1)
        continue
    for r in results:
        for box, conf, cls_id in zip(r.boxes.xyxy.cpu().numpy(),
                                     r.boxes.conf.cpu().numpy(),
                                     r.boxes.cls.cpu().numpy()):
            label = model.names[int(cls_id)]
            if label.lower() not in ["smoker", "smoking", "cigarette"]:
                continue

            x1, y1, x2, y2 = map(int, box)
            # Draw red box
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
            cv2.putText(frame, f"{label} {conf:.2f}", (x1, y1-5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,0,255), 2)

            cropped = frame[y1:y2, x1:x2]
            report_filename = f"{REPORT_DIR}/{uuid.uuid4()}.jpg"
            cv2.imwrite(report_filename, cropped)

            detections_list.append({
                "cameraId": camera_id,
                "timestamp": datetime.utcnow().isoformat(),
                "label": label,
                "confidence": float(conf),
                "bbox": [x1, y1, x2, y2],
                "report_image": report_filename,
                "detected": True
            })

    # --------------------------
    # Face detection
    # --------------------------
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 5)
    for (x, y, w, h) in faces:
        # Draw red box
        cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 0, 255), 2)
        cv2.putText(frame, "face", (x, y-5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0,0,255), 2)

        face_report = frame[y:y+h, x:x+w]
        face_filename = f"{REPORT_DIR}/{uuid.uuid4()}_face.jpg"
        cv2.imwrite(face_filename, face_report)

        detections_list.append({
            "cameraId": camera_id,
            "timestamp": datetime.utcnow().isoformat(),
            "label": "face",
            "confidence": 1.0,
            "bbox": [int(x), int(y), int(x+w), int(y+h)],
            "report_image": face_filename,
            "detected": True
        })

    # --------------------------
    # Output JSON per detection
    # --------------------------
    for det in detections_list:
        print(json.dumps(det))
        sys.stdout.flush()

    # --------------------------
    # Show live frame (only if display available)
    # --------------------------
    try:
        cv2.imshow(f"Live Detection - {camera_id}", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    except cv2.error:
        # No display available (headless server), skip imshow
        pass

cap.release()
cv2.destroyAllWindows()
