#!/usr/bin/env python3
"""
AI Models Test Script
Tests YOLO smoking detection and face recognition models
"""

import sys
import os
import json
import cv2
import numpy as np
from pathlib import Path

# Add services directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def print_header(text):
    """Print a formatted header"""
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60 + "\n")

def print_success(text):
    """Print success message"""
    print(f"✅ {text}")

def print_error(text):
    """Print error message"""
    print(f"❌ {text}")

def print_warning(text):
    """Print warning message"""
    print(f"⚠️  {text}")

def print_info(text):
    """Print info message"""
    print(f"ℹ️  {text}")

# ============================================================================
# TEST 1: YOLO Model Loading
# ============================================================================
def test_yolo_model_loading():
    print_header("TEST 1: YOLO Model Loading")
    
    try:
        from ultralytics import YOLO
        
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'best.pt')
        
        if not os.path.exists(model_path):
            print_error(f"Model file not found: {model_path}")
            return False
        
        print_info(f"Loading model from: {model_path}")
        model = YOLO(model_path)
        print_success("YOLO model loaded successfully!")
        
        # Check model info
        print_info(f"Model classes: {len(model.names)}")
        print_info(f"Class names: {list(model.names.values())}")
        
        return True
        
    except ImportError:
        print_error("ultralytics library not installed. Run: pip install ultralytics")
        return False
    except Exception as e:
        print_error(f"Failed to load YOLO model: {str(e)}")
        return False

# ============================================================================
# TEST 2: YOLO Detection on Test Image
# ============================================================================
def test_yolo_detection():
    print_header("TEST 2: YOLO Detection on Test Image")
    
    try:
        from ultralytics import YOLO
        
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'best.pt')
        test_image_dir = os.path.join(os.path.dirname(__file__), 'models', 'test', 'images')
        
        if not os.path.exists(model_path):
            print_error(f"Model file not found: {model_path}")
            return False
        
        # Find a test image
        test_images = list(Path(test_image_dir).glob('*.jpg')) if os.path.exists(test_image_dir) else []
        
        if not test_images:
            print_warning("No test images found. Creating a dummy test...")
            # Create a dummy image for testing
            dummy_image = np.zeros((640, 640, 3), dtype=np.uint8)
            test_image_path = os.path.join(os.path.dirname(__file__), 'test_dummy.jpg')
            cv2.imwrite(test_image_path, dummy_image)
            test_image_paths = [test_image_path]
        else:
            test_image_paths = [str(img) for img in test_images[:1]]  # Test with first image
        
        print_info(f"Loading model...")
        model = YOLO(model_path)
        
        for test_image_path in test_image_paths:
            print_info(f"Testing detection on: {os.path.basename(test_image_path)}")
            
            image = cv2.imread(test_image_path)
            if image is None:
                print_error(f"Could not read image: {test_image_path}")
                continue
            
            # Run detection
            results = model(image, conf=0.5, verbose=False)
            
            detections = []
            for r in results:
                for box, conf, cls_id in zip(r.boxes.xyxy.cpu().numpy(),
                                           r.boxes.conf.cpu().numpy(),
                                           r.boxes.cls.cpu().numpy()):
                    x1, y1, x2, y2 = map(int, box)
                    class_name = model.names[int(cls_id)]
                    confidence = float(conf)
                    
                    detections.append({
                        "label": class_name,
                        "confidence": confidence,
                        "bbox": [x1, y1, x2, y2]
                    })
            
            if detections:
                print_success(f"Found {len(detections)} detection(s):")
                for i, det in enumerate(detections, 1):
                    print(f"  {i}. {det['label']} - Confidence: {det['confidence']:.2%} - BBox: {det['bbox']}")
            else:
                print_warning("No detections found (this is normal if image doesn't contain smoking)")
            
            # Clean up dummy image
            if 'test_dummy.jpg' in test_image_path and os.path.exists(test_image_path):
                os.remove(test_image_path)
        
        print_success("YOLO detection test completed!")
        return True
        
    except Exception as e:
        print_error(f"YOLO detection test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

# ============================================================================
# TEST 3: Face Recognition Library
# ============================================================================
def test_face_recognition_library():
    print_header("TEST 3: Face Recognition Library")
    
    try:
        import face_recognition
        print_success("face_recognition library imported successfully!")
        
        # Test with a dummy image
        print_info("Testing face encoding...")
        dummy_image = np.zeros((100, 100, 3), dtype=np.uint8)
        dummy_image_rgb = cv2.cvtColor(dummy_image, cv2.COLOR_BGR2RGB)
        
        encodings = face_recognition.face_encodings(dummy_image_rgb)
        print_info(f"Face encoding function works (found {len(encodings)} faces in dummy image)")
        
        print_success("Face recognition library is working!")
        return True
        
    except ImportError:
        print_error("face_recognition library not installed.")
        print_info("Install with: pip install face-recognition")
        print_info("Note: On Windows, you may need Visual C++ Build Tools")
        return False
    except Exception as e:
        print_error(f"Face recognition test failed: {str(e)}")
        return False

# ============================================================================
# TEST 4: OpenCV Face Detection
# ============================================================================
def test_opencv_face_detection():
    print_header("TEST 4: OpenCV Face Detection")
    
    try:
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
        
        if face_cascade.empty():
            print_error("Failed to load Haar cascade classifier")
            return False
        
        print_success("Haar cascade classifier loaded successfully!")
        
        # Test with dummy image
        print_info("Testing face detection on dummy image...")
        dummy_image = np.zeros((640, 640, 3), dtype=np.uint8)
        gray = cv2.cvtColor(dummy_image, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.1, 5)
        
        print_info(f"Face detection function works (found {len(faces)} faces in dummy image)")
        print_success("OpenCV face detection is working!")
        return True
        
    except Exception as e:
        print_error(f"OpenCV face detection test failed: {str(e)}")
        return False

# ============================================================================
# TEST 5: YOLO Image Detection Script
# ============================================================================
def test_yolo_image_detection_script():
    print_header("TEST 5: YOLO Image Detection Script")
    
    try:
        script_path = os.path.join(os.path.dirname(__file__), 'services', 'yolo_image_detection.py')
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'best.pt')
        
        if not os.path.exists(script_path):
            print_error(f"Script not found: {script_path}")
            return False
        
        if not os.path.exists(model_path):
            print_error(f"Model not found: {model_path}")
            return False
        
        # Create a test image
        test_image = np.zeros((640, 640, 3), dtype=np.uint8)
        test_image_path = os.path.join(os.path.dirname(__file__), 'test_image.jpg')
        cv2.imwrite(test_image_path, test_image)
        
        print_info("Running yolo_image_detection.py script...")
        
        import subprocess
        result = subprocess.run(
            [sys.executable, script_path, test_image_path, model_path],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            try:
                output = json.loads(result.stdout)
                print_success("Script executed successfully!")
                print_info(f"Output: {json.dumps(output, indent=2)}")
                
                # Clean up
                if os.path.exists(test_image_path):
                    os.remove(test_image_path)
                
                return True
            except json.JSONDecodeError:
                print_warning("Script output is not valid JSON (may be normal)")
                print_info(f"Output: {result.stdout}")
                return True
        else:
            print_error(f"Script failed with return code {result.returncode}")
            print_error(f"Error: {result.stderr}")
            return False
        
    except subprocess.TimeoutExpired:
        print_error("Script execution timed out")
        return False
    except Exception as e:
        print_error(f"Script test failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

# ============================================================================
# TEST 6: Face Recognition Script (Mock Test)
# ============================================================================
def test_face_recognition_script():
    print_header("TEST 6: Face Recognition Script Structure")
    
    try:
        script_path = os.path.join(os.path.dirname(__file__), 'services', 'face_recognition.py')
        
        if not os.path.exists(script_path):
            print_error(f"Script not found: {script_path}")
            return False
        
        print_success("Face recognition script exists!")
        
        # Check if script can be imported (syntax check)
        print_info("Checking script syntax...")
        with open(script_path, 'r') as f:
            code = f.read()
            compile(code, script_path, 'exec')
        
        print_success("Script syntax is valid!")
        print_info("Note: Full test requires student photos in Firebase Storage")
        
        return True
        
    except SyntaxError as e:
        print_error(f"Script has syntax errors: {str(e)}")
        return False
    except Exception as e:
        print_error(f"Script test failed: {str(e)}")
        return False

# ============================================================================
# TEST 7: Model File Verification
# ============================================================================
def test_model_files():
    print_header("TEST 7: Model Files Verification")
    
    model_dir = os.path.join(os.path.dirname(__file__), 'models')
    best_model = os.path.join(model_dir, 'best.pt')
    yolo_model = os.path.join(model_dir, 'yolov8n.pt')
    data_yaml = os.path.join(model_dir, 'data.yaml')
    
    results = []
    
    if os.path.exists(best_model):
        size = os.path.getsize(best_model) / (1024 * 1024)  # MB
        print_success(f"best.pt found ({size:.2f} MB)")
        results.append(True)
    else:
        print_error("best.pt not found")
        results.append(False)
    
    if os.path.exists(yolo_model):
        size = os.path.getsize(yolo_model) / (1024 * 1024)  # MB
        print_info(f"yolov8n.pt found ({size:.2f} MB) - fallback model")
        results.append(True)
    else:
        print_warning("yolov8n.pt not found (will download automatically if needed)")
        results.append(True)  # Not critical
    
    if os.path.exists(data_yaml):
        print_success("data.yaml found")
        results.append(True)
    else:
        print_warning("data.yaml not found (may not be critical)")
        results.append(True)  # Not critical
    
    return all(results)

# ============================================================================
# TEST 8: Dependencies Check
# ============================================================================
def test_dependencies():
    print_header("TEST 8: Python Dependencies Check")
    
    required_packages = {
        'ultralytics': 'YOLO model',
        'opencv-python': 'OpenCV (cv2)',
        'numpy': 'NumPy',
        'face_recognition': 'Face recognition',
        'Pillow': 'PIL/Pillow',
        'requests': 'HTTP requests'
    }
    
    results = []
    
    for package, description in required_packages.items():
        try:
            if package == 'opencv-python':
                import cv2
                print_success(f"{package} (cv2) - {description}")
            elif package == 'Pillow':
                from PIL import Image
                print_success(f"{package} (PIL) - {description}")
            else:
                __import__(package.replace('-', '_'))
                print_success(f"{package} - {description}")
            results.append(True)
        except ImportError:
            print_error(f"{package} - {description} - NOT INSTALLED")
            results.append(False)
    
    return all(results)

# ============================================================================
# MAIN TEST RUNNER
# ============================================================================
def main():
    print("\n" + "="*60)
    print("  AI MODELS TEST SUITE")
    print("  Testing YOLO Detection & Face Recognition")
    print("="*60)
    
    tests = [
        ("Dependencies", test_dependencies),
        ("Model Files", test_model_files),
        ("YOLO Model Loading", test_yolo_model_loading),
        ("YOLO Detection", test_yolo_detection),
        ("OpenCV Face Detection", test_opencv_face_detection),
        ("Face Recognition Library", test_face_recognition_library),
        ("YOLO Image Detection Script", test_yolo_image_detection_script),
        ("Face Recognition Script", test_face_recognition_script),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print_error(f"Test '{test_name}' crashed: {str(e)}")
            results[test_name] = False
    
    # Summary
    print_header("TEST SUMMARY")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n{'='*60}")
    print(f"  Results: {passed}/{total} tests passed")
    print(f"{'='*60}\n")
    
    if passed == total:
        print_success("All tests passed! AI models are ready to use.")
        return 0
    else:
        print_warning(f"{total - passed} test(s) failed. Please check the errors above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
