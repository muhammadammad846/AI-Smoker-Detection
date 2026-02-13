#!/usr/bin/env python3
"""
Quick AI Models Test - Visual Test with Real Image
Tests YOLO detection and shows results visually
"""

import sys
import os
import cv2
import numpy as np
from pathlib import Path

def test_yolo_visual():
    """Test YOLO with visual output"""
    try:
        from ultralytics import YOLO
        
        print("="*60)
        print("  QUICK YOLO VISUAL TEST")
        print("="*60 + "\n")
        
        # Paths
        model_path = os.path.join(os.path.dirname(__file__), 'models', 'best.pt')
        test_dir = os.path.join(os.path.dirname(__file__), 'models', 'test', 'images')
        
        if not os.path.exists(model_path):
            print(f"❌ Model not found: {model_path}")
            return
        
        print(f"✅ Loading model: {os.path.basename(model_path)}")
        model = YOLO(model_path)
        print(f"✅ Model loaded! Classes: {list(model.names.values())}\n")
        
        # Find test images
        if os.path.exists(test_dir):
            test_images = list(Path(test_dir).glob('*.jpg'))
            if test_images:
                print(f"📸 Found {len(test_images)} test image(s)\n")
                
                for img_path in test_images[:3]:  # Test first 3 images
                    print(f"Testing: {img_path.name}")
                    
                    image = cv2.imread(str(img_path))
                    if image is None:
                        print(f"  ❌ Could not read image\n")
                        continue
                    
                    # Run detection
                    results = model(image, conf=0.5, verbose=False)
                    
                    # Draw results
                    annotated = image.copy()
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
                            
                            # Draw bounding box
                            color = (0, 0, 255) if 'smoker' in class_name.lower() else (0, 255, 0)
                            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 3)
                            cv2.putText(annotated, f"{class_name} {confidence:.2%}", 
                                       (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 
                                       0.7, color, 2)
                    
                    if detections:
                        print(f"  ✅ Found {len(detections)} detection(s):")
                        for det in detections:
                            print(f"     - {det['label']}: {det['confidence']:.2%}")
                    else:
                        print(f"  ⚠️  No detections (image may not contain smoking)")
                    
                    # Save annotated image
                    output_dir = os.path.join(os.path.dirname(__file__), 'reports')
                    os.makedirs(output_dir, exist_ok=True)
                    output_path = os.path.join(output_dir, f"test_{img_path.stem}_result.jpg")
                    cv2.imwrite(output_path, annotated)
                    print(f"  💾 Saved annotated image: {os.path.basename(output_path)}\n")
            else:
                print("⚠️  No test images found in test directory")
        else:
            print("⚠️  Test directory not found")
            print("   Creating a test image...")
            
            # Create a test image
            test_image = np.random.randint(0, 255, (640, 640, 3), dtype=np.uint8)
            test_path = os.path.join(os.path.dirname(__file__), 'test_quick.jpg')
            cv2.imwrite(test_path, test_image)
            
            print(f"   Testing with generated image...")
            results = model(test_image, conf=0.5, verbose=False)
            print(f"   ✅ Detection completed (no detections expected in random image)")
            
            if os.path.exists(test_path):
                os.remove(test_path)
        
        print("\n" + "="*60)
        print("  ✅ YOLO MODEL TEST COMPLETE")
        print("="*60)
        print("\nCheck the 'reports' folder for annotated test images!")
        
    except ImportError:
        print("❌ ultralytics not installed. Run: pip install ultralytics")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_yolo_visual()
