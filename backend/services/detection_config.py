#!/usr/bin/env python3
"""
Shared detection config (env + defaults) for best accuracy.
Tune via environment variables for production.
"""
import os

# YOLO confidence: above this to count as detection (default 0.55 = fewer false positives)
DETECTION_CONF_THRESHOLD = float(os.environ.get("DETECTION_CONF_THRESHOLD", "0.55"))

# Minimum confidence to auto-generate challan (stricter than display; set in Node too)
CHALLAN_CONF_THRESHOLD = float(os.environ.get("CHALLAN_CONF_THRESHOLD", "0.60"))

# Face match: max distance to accept as same person (lower = stricter; 0.55 = fewer wrong matches)
FACE_MATCH_THRESHOLD = float(os.environ.get("FACE_MATCH_THRESHOLD", "0.55"))

# Minimum face size (pixels) to send for recognition; smaller faces are skipped
MIN_FACE_WIDTH = int(os.environ.get("MIN_FACE_WIDTH", "60"))
MIN_FACE_HEIGHT = int(os.environ.get("MIN_FACE_HEIGHT", "60"))

# Class name keywords (model may use different names)
SMOKING_KEYWORDS = ("smoker", "smoking", "cigarette", "cigar", "smoke")
PERSON_KEYWORDS = ("person", "face", "human")


def is_smoking_class(name):
    if not name:
        return False
    n = name.lower().strip()
    return any(k in n for k in SMOKING_KEYWORDS)


def is_person_or_face_class(name):
    if not name:
        return False
    n = name.lower().strip()
    return any(k in n for k in PERSON_KEYWORDS)


def is_relevant_class(name):
    return is_smoking_class(name) or is_person_or_face_class(name)
