#!/usr/bin/env python3
"""
YOLOv8 Image Detection Script
Detects smoking and faces in a single image and generates annotated report
"""

import sys
import json
import cv2
from ultralytics import YOLO
import os
import uuid
from datetime import datetime

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

    # Run YOLO detection
    results = model(image, conf=0.5)
    detections = []

    for r in results:
        for box, conf, cls_id in zip(r.boxes.xyxy.cpu().numpy(),
                                     r.boxes.conf.cpu().numpy(),
                                     r.boxes.cls.cpu().numpy()):
            x1, y1, x2, y2 = map(int, box)
            class_name = model.names[int(cls_id)]

            # Check for smoking-related detections (smoker, cigarette, smoking, person)
            if class_name.lower() not in ["smoker", "smoking", "cigarette", "face", "person"]:
                continue

            detections.append({
                "label": class_name,
                "confidence": float(conf),
                "bbox": [x1, y1, x2, y2]
            })

            # Draw bounding boxes (red for smoking, green for others)
            color = (0, 0, 255) if class_name.lower() in ["smoker", "smoking", "cigarette"] else (0, 255, 0)
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
