#!/usr/bin/env python3
"""
Detailed detection test: model load, class names (trained data), and run detection on an image.
Use this to verify detection works with the backend and on data the model was trained on.

Usage:
  python run_detection_test.py                    # use test image or create dummy
  python run_detection_test.py path/to/image.jpg # use specific image

Requires: backend/models/best.pt, ultralytics, opencv-python
"""

import sys
import os
import json

# Run from backend/ so paths resolve
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(BACKEND_DIR, "services"))

def log(msg, kind="info"):
    prefix = {"info": "  ", "ok": "  [OK] ", "fail": "  [FAIL] ", "head": "\n=== "}
    print(prefix.get(kind, "  ") + msg)

def main():
    print("\n" + "=" * 60)
    print("  DETECTION TEST (model + trained data)")
    print("=" * 60)

    model_path = os.path.join(BACKEND_DIR, "models", "best.pt")
    test_fixture = os.path.join(BACKEND_DIR, "test-fixtures", "test.jpg")
    test_image_dir = os.path.join(BACKEND_DIR, "models", "test", "images")

    # 1) Model file
    if not os.path.exists(model_path):
        log(f"Model not found: {model_path}", "fail")
        log("Add backend/models/best.pt (YOLO model trained for smoking detection).", "info")
        return 1
    log(f"Model file: {model_path}", "ok")

    # 2) Load model and print class names (trained data)
    try:
        from ultralytics import YOLO
        import cv2
        import numpy as np
    except ImportError as e:
        log(f"Missing dependency: {e}", "fail")
        log("Run: pip install ultralytics opencv-python", "info")
        return 1

    try:
        model = YOLO(model_path)
    except Exception as e:
        log(f"Failed to load model: {e}", "fail")
        return 1

    class_names = list(model.names.values())
    log(f"Model loaded. Classes ({len(class_names)}): {class_names}", "ok")
    log("These are the labels the model was trained on (e.g. smoker, cigarette).", "info")

    # 3) Resolve test image
    image_path = None
    if len(sys.argv) >= 2 and os.path.exists(sys.argv[1]):
        image_path = sys.argv[1]
        log(f"Using image: {image_path}", "ok")
    elif os.path.exists(test_fixture):
        image_path = test_fixture
        log(f"Using fixture: {test_fixture}", "ok")
    elif os.path.exists(test_image_dir):
        import glob
        imgs = glob.glob(os.path.join(test_image_dir, "*.jpg")) + glob.glob(os.path.join(test_image_dir, "*.png"))
        if imgs:
            image_path = imgs[0]
            log(f"Using first test image: {image_path}", "ok")

    if not image_path:
        log("No test image found; creating minimal 640x640 image.", "info")
        os.makedirs(os.path.dirname(test_fixture) or ".", exist_ok=True)
        dummy = np.zeros((640, 640, 3), dtype=np.uint8)
        dummy[:] = (40, 40, 40)  # dark gray
        cv2.imwrite(test_fixture, dummy)
        image_path = test_fixture
        log(f"Created: {test_fixture}", "ok")

    # 4) Run detection (same config as yolo_image_detection)
    try:
        from detection_config import DETECTION_CONF_THRESHOLD, is_relevant_class
    except ImportError:
        DETECTION_CONF_THRESHOLD = 0.55
        def is_relevant_class(n):
            return n and any(k in n.lower() for k in ("smoker", "smoking", "cigarette", "cigar", "smoke", "person", "face", "human"))

    img = cv2.imread(image_path)
    if img is None:
        log(f"Could not read image: {image_path}", "fail")
        return 1

    log(f"Running detection (conf >= {DETECTION_CONF_THRESHOLD})...", "info")
    results = model(img, conf=DETECTION_CONF_THRESHOLD, verbose=False)
    detections = []

    for r in results:
        if r.boxes is None:
            continue
        for box, conf, cls_id in zip(
            r.boxes.xyxy.cpu().numpy(),
            r.boxes.conf.cpu().numpy(),
            r.boxes.cls.cpu().numpy(),
        ):
            x1, y1, x2, y2 = map(int, box)
            class_name = model.names[int(cls_id)]
            confidence = float(conf)
            if not is_relevant_class(class_name):
                continue
            detections.append({
                "label": class_name,
                "confidence": round(confidence, 4),
                "bbox": [x1, y1, x2, y2],
            })

    # 5) Report
    log(f"Detections: {len(detections)}", "head" if detections else "info")
    if detections:
        for i, d in enumerate(detections, 1):
            print(f"    {i}. {d['label']} conf={d['confidence']:.2f} bbox={d['bbox']}")
    else:
        log("No relevant detections (normal for dummy/blank image).", "info")
        log("Use an image with a person/smoker to verify trained classes.", "info")

    log("Detection pipeline OK.", "ok")
    print()
    return 0

if __name__ == "__main__":
    sys.exit(main())
