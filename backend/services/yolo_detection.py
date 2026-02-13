#!/usr/bin/env python3
"""
YOLOv8 Smoking Detection Script (Production-ready)
Detects smoking in real-time from camera feed
"""

import sys
import json
import cv2
from ultralytics import YOLO
import os

# Config
MODEL_PATH = "models/smoking_detection.pt"
CONF_THRESHOLD = 0.5
SAVE_DETECTIONS = False  # Set True to save annotated frames
OUTPUT_DIR = "detections"

# Suppress extra YOLO logs
os.environ["YOLO_VERBOSE"] = "False"
os.environ["ULTRALYTICS_QUICKSTART"] = "True"

# Load model
try:
    model = YOLO(MODEL_PATH)
except Exception:
    print("Warning: Custom model not found, using YOLOv8n", file=sys.stderr)
    model = YOLO("yolov8n.pt")

# Create output folder if needed
if SAVE_DETECTIONS and not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def detect_smoking(frame):
    """Run YOLOv8 detection on a single frame"""
    detections = []
    try:
        results = model(frame, conf=CONF_THRESHOLD)
    except Exception as e:
        print(f"Detection error: {str(e)}", file=sys.stderr)
        return detections

    for result in results:
        boxes = result.boxes
        for box in boxes:
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            class_name = model.names[cls]

            # Replace 'person' with your trained smoking class name
            if class_name == "person" and conf > 0.7:
                x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                detections.append({
                    "class": class_name,
                    "confidence": conf,
                    "bbox": [x1, y1, x2, y2],
                    "detected": True
                })
                if SAVE_DETECTIONS:
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(frame, f"{class_name} {conf:.2f}", (x1, y1-5),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0,255,0), 2)

    if SAVE_DETECTIONS and detections:
        filename = os.path.join(OUTPUT_DIR, f"detection_{cv2.getTickCount()}.jpg")
        cv2.imwrite(filename, frame)

    return detections

def main():
    camera_id = sys.argv[1] if len(sys.argv) > 1 else "0"

    try:
        cap = cv2.VideoCapture(int(camera_id) if camera_id.isdigit() else camera_id)
    except Exception:
        print(json.dumps({"error": "Invalid camera ID"}), file=sys.stderr)
        sys.exit(1)

    if not cap.isOpened():
        print(json.dumps({"error": "Could not open camera"}), file=sys.stderr)
        sys.exit(1)

    print("Starting detection...", file=sys.stderr)

    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                print(json.dumps({"error": "Failed to read frame"}), file=sys.stderr)
                break

            detections = detect_smoking(frame)

            if detections:
                output = {
                    "timestamp": str(cv2.getTickCount()),
                    "cameraId": camera_id,
                    "detections": detections
                }
                print(json.dumps(output))
                sys.stdout.flush()

            cv2.waitKey(1)

    except KeyboardInterrupt:
        print("Stopping detection...", file=sys.stderr)
    finally:
        cap.release()

if __name__ == "__main__":
    main()

