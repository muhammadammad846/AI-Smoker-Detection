#!/usr/bin/env python3
"""
YOLOv8 Image Detection Script
Detects smoking and faces in a single image. Uses detection_config for thresholds.
"""

import sys
import json
import cv2
from ultralytics import YOLO
import os
import uuid
from datetime import datetime

try:
    from detection_config import DETECTION_CONF_THRESHOLD, is_smoking_class, is_relevant_class
except ImportError:
    DETECTION_CONF_THRESHOLD = 0.55
    def is_smoking_class(n):
        return n and any(k in n.lower() for k in ("smoker", "smoking", "cigarette", "cigar", "smoke"))
    def is_relevant_class(n):
        return n and (is_smoking_class(n) or any(k in n.lower() for k in ("person", "face", "human")))

# --------------------------
# Read arguments
# sys.argv[1] = image_path
# sys.argv[2] = model_path
# --------------------------
if len(sys.argv) < 3:
    print(json.dumps({"error": "Image path and model path required"}))
    sys.exit(1)

image_path = sys.argv[1]
model_path = sys.argv[2]

# --------------------------
# Validate paths
# --------------------------
if not os.path.exists(model_path):
    print(json.dumps({"error": f"Model not found: {model_path}"}))
    sys.exit(1)

if not os.path.exists(image_path):
    print(json.dumps({"error": f"Image not found: {image_path}"}))
    sys.exit(1)

# --------------------------
# Load YOLO model
# --------------------------
os.environ["YOLO_VERBOSE"] = "false"
model = YOLO(model_path)

# --------------------------
# Output directory
# --------------------------
REPORTS_DIR = os.path.join(os.getcwd(), "reports")
os.makedirs(REPORTS_DIR, exist_ok=True)


def detect_smoking_image(image_path):
    image = cv2.imread(image_path)
    if image is None:
        return {"error": "Could not read image", "detections": []}

    results = model(image, conf=DETECTION_CONF_THRESHOLD, verbose=False)
    detections = []

    for r in results:
        for box, conf, cls_id in zip(r.boxes.xyxy.cpu().numpy(),
                                     r.boxes.conf.cpu().numpy(),
                                     r.boxes.cls.cpu().numpy()):
            x1, y1, x2, y2 = map(int, box)
            class_name = model.names[int(cls_id)]
            confidence = float(conf)

            if not is_relevant_class(class_name) or confidence < DETECTION_CONF_THRESHOLD:
                continue

            detections.append({
                "label": class_name,
                "confidence": confidence,
                "bbox": [x1, y1, x2, y2]
            })

            color = (0, 0, 255) if is_smoking_class(class_name) else (0, 255, 0)
            cv2.rectangle(image, (x1, y1), (x2, y2), color, 2)
            cv2.putText(image, f"{class_name} {conf:.2f}", (x1, y1 - 5),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)

    # Save annotated image
    output_filename = f"{uuid.uuid4()}_result.jpg"
    output_path = os.path.join(REPORTS_DIR, output_filename)
    cv2.imwrite(output_path, image)

    return {
        "detections": detections,
        "timestamp": datetime.utcnow().isoformat(),
        "report_image": output_path
    }


if __name__ == "__main__":
    try:
        result = detect_smoking_image(image_path)
        print(json.dumps(result))
        sys.stdout.flush()
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.stdout.flush()
        sys.exit(1)
