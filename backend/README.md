# Backend Server - CCTV Smoking Detection

Express.js backend server with YOLOv8 integration for real-time smoking detection.

## Features

- RESTful API for challans, users, and detections
- Real-time detection using YOLOv8
- Socket.io for live updates
- Image processing endpoint
- Camera feed processing

## Installation

```bash
npm install
pip install -r requirements.txt
```

## Configuration

1. Copy `.env.example` to `.env`
2. Update environment variables
3. Place YOLOv8 model at `models/smoking_detection.pt` (optional)

## Running

```bash
# Development
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3000`

## API Endpoints

See main README.md for complete API documentation.

## YOLOv8 Integration

The backend uses YOLOv8 for smoking detection. Two Python scripts are provided:

- `yolo_detection.py` - Real-time camera feed processing
- `yolo_detection_image.py` - Single image processing

### Model Requirements

- Trained YOLOv8 model for smoking detection
- Or use general YOLOv8 model (yolov8n.pt) for testing

### Training Custom Model

1. Prepare dataset with smoking images
2. Annotate with bounding boxes
3. Train using Ultralytics:
```python
from ultralytics import YOLO
model = YOLO('yolov8n.pt')
model.train(data='dataset.yaml', epochs=100)
model.save('models/smoking_detection.pt')
```

## Development

The backend uses in-memory storage for development. For production:
- Replace with MongoDB, PostgreSQL, or Firebase
- Add authentication middleware
- Implement rate limiting
- Add logging and monitoring

## Notes

- Mock detection is used if Python scripts are not available
- Socket.io broadcasts detections in real-time
- File uploads are stored in `uploads/` directory (auto-created)












