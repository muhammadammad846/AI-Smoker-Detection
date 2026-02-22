const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');

const CHALLAN_CONF_THRESHOLD = parseFloat(process.env.CHALLAN_CONF_THRESHOLD || '0.6', 10);

function isSmokingLabel(label) {
  if (!label || typeof label !== 'string') return false;
  const n = label.toLowerCase();
  return ['smoker', 'smoking', 'cigarette', 'cigar', 'smoke'].some(k => n.includes(k));
}

function smokingConfidenceOk(detection) {
  const conf = detection && (detection.confidence != null ? detection.confidence : 1);
  return typeof conf === 'number' && !Number.isNaN(conf) && conf >= CHALLAN_CONF_THRESHOLD;
}

class DetectionService {
  constructor() {
    this.activeDetections = {};     // Tracks active cameras
    this.pythonProcesses = {};      // One Python process per camera
  }

  /**
   * START LIVE DETECTION
   * @param {string} cameraId
   * @param {SocketIO.Server} io
   * @param {string} cameraUrl - "0", "1", "http://...", "rtsp://..."
   */
  async startDetection(cameraId, io, cameraUrl = null) {
    if (this.activeDetections[cameraId]?.isActive) {
      console.log(`[${cameraId}] Detection already active`);
      return;
    }

    this.activeDetections[cameraId] = {
      isActive: true,
      startTime: new Date().toISOString(),
    };

    const pythonScript = path.join(__dirname, 'yolo_live_detection.py');
    const modelPath = path.resolve(__dirname, '../models/best.pt');

    if (!fs.existsSync(pythonScript)) {
      throw new Error("Python live detection script missing.");
    }
    if (!fs.existsSync(modelPath)) {
      throw new Error("YOLO model file missing.");
    }

    // Default to camera ID if no URL provided
    const cameraSource = cameraUrl || cameraId;
    const args = [pythonScript, cameraId, cameraSource, modelPath];
    
    // Use python3 if available, fallback to python
    const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
    const pyProcess = spawn(pythonCmd, args);

    this.pythonProcesses[cameraId] = pyProcess;

    // Listen for Python stdout (JSON detections)
    pyProcess.stdout.on('data', async (data) => {
      const lines = data.toString().split('\n').filter(Boolean);
      for (let line of lines) {
        try {
          const detection = JSON.parse(line.trim());
          await this.handleDetection(detection, cameraId, io);
        } catch (err) {
          // Ignore non-JSON lines (like print statements)
          if (line.trim() && !line.trim().startsWith('{')) {
            console.log(`[${cameraId}] Python output:`, line.trim());
          }
        }
      }
    });

    // Listen for Python stderr (errors)
    pyProcess.stderr.on('data', (data) => {
      console.error(`[${cameraId}] Python error:`, data.toString());
    });

    // Handle process exit and auto-reconnect
    pyProcess.on('close', (code) => {
      console.warn(`[${cameraId}] Detection process exited with code ${code}`);
      delete this.pythonProcesses[cameraId];
      if (this.activeDetections[cameraId]?.isActive) {
        console.log(`[${cameraId}] Attempting to restart detection in 5s...`);
        setTimeout(() => this.startDetection(cameraId, io, cameraUrl || cameraId), 5000);
      }
    });

    pyProcess.on('error', (err) => {
      console.error(`[${cameraId}] Failed to start Python process:`, err);
      delete this.pythonProcesses[cameraId];
      this.activeDetections[cameraId].isActive = false;
    });
  }

  /**
   * STOP LIVE DETECTION
   */
  async stopDetection(cameraId) {
    if (!this.activeDetections[cameraId]) {
      return;
    }

    this.activeDetections[cameraId].isActive = false;

    if (this.pythonProcesses[cameraId]) {
      try {
        this.pythonProcesses[cameraId].kill();
      } catch (err) {
        console.error(`[${cameraId}] Error killing process:`, err);
      }
      delete this.pythonProcesses[cameraId];
    }

    delete this.activeDetections[cameraId];
    console.log(`[${cameraId}] Detection stopped.`);
  }

  /**
   * MATCH FACE WITH STUDENT
   * Uses face recognition to identify student from detected face
   */
  async matchFaceWithStudent(faceImagePath) {
    try {
      const db = admin.firestore();
      // Get all students
      const studentsSnapshot = await db.collection('users')
        .where('role', '==', 'student')
        .get();
      
      const students = [];
      studentsSnapshot.forEach(doc => {
        const data = doc.data();
        // Filter students with photos (Firestore doesn't support != null)
        if (data.photoUrl) {
          students.push({
            id: doc.id,
            name: data.name,
            email: data.email,
            studentId: data.studentId,
            photoUrl: data.photoUrl
          });
        }
      });

      if (students.length === 0) {
        return null;
      }

      const pythonScript = path.join(__dirname, 'face_recognition.py');
      const studentsJson = JSON.stringify(students);

      return new Promise((resolve, reject) => {
        const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
        const proc = spawn(pythonCmd, [pythonScript, faceImagePath, studentsJson]);
        
        let output = '';
        let errorOutput = '';

        proc.stdout.on('data', (data) => {
          output += data.toString();
        });

        proc.stderr.on('data', (data) => {
          errorOutput += data.toString();
        });

        proc.on('close', (code) => {
          if (code === 0) {
            try {
              const result = JSON.parse(output);
              resolve(result.matchedStudent);
            } catch (err) {
              console.error('Error parsing face recognition result:', err);
              resolve(null);
            }
          } else {
            console.error('Face recognition failed:', errorOutput);
            resolve(null);
          }
        });

        proc.on('error', (err) => {
          console.error('Face recognition process error:', err);
          resolve(null);
        });
      });
    } catch (err) {
      console.error('Error matching face:', err);
      return null;
    }
  }

  /**
   * HANDLE DETECTION RESULTS
   * Save image to Firebase Storage, metadata to Firestore, emit via Socket.io
   * Match faces with students and auto-generate challans
   */
  async handleDetection(detection, cameraId, io) {
    if (!detection || !detection.detected) {
      return;
    }

    let imageUrl = null;
    let matchedStudent = null;

    // Save IMAGE to Firebase Storage
    if (detection.report_image && fs.existsSync(detection.report_image)) {
      try {
        const bucket = admin.storage().bucket();
        const buffer = fs.readFileSync(detection.report_image);
        const filename = `detections/${cameraId}_${uuidv4()}.jpg`;
        const file = bucket.file(filename);
        await file.save(buffer, { contentType: "image/jpeg" });
        imageUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;
        detection.imageUrl = imageUrl;

        // Try to match face with student
        if (detection.label === 'face' || detection.label === 'smoker') {
          matchedStudent = await this.matchFaceWithStudent(detection.report_image);
          if (matchedStudent) {
            detection.matchedStudent = matchedStudent;
            console.log(`[${cameraId}] Matched student: ${matchedStudent.name} (${matchedStudent.studentId})`);
          }
        }

        // Remove local temp file
        fs.unlink(detection.report_image, (err) => {
          if (err) console.error(`[${cameraId}] Failed to delete temp image:`, err);
        });
      } catch (err) {
        console.error(`[${cameraId}] Firebase save error:`, err);
      }
    }

    // Save metadata to Firestore
    try {
      const db = admin.firestore();
      const detectionData = {
        ...detection,
        cameraId,
        timestamp: new Date().toISOString(),
        imageUrl,
      };

      if (matchedStudent) {
        detectionData.studentId = matchedStudent.id;
        detectionData.studentName = matchedStudent.name;
        detectionData.studentEmail = matchedStudent.email;
        detectionData.studentStudentId = matchedStudent.studentId;
        detectionData.matchConfidence = matchedStudent.confidence;
      }

      await db.collection("detections").add(detectionData);

      // Auto-generate challan only when confidence is high enough (fewer false positives)
      if (matchedStudent && isSmokingLabel(detection.label) && smokingConfidenceOk(detection)) {
        try {
          await db.collection("challans").add({
            studentId: matchedStudent.id,
            studentName: matchedStudent.name,
            studentEmail: matchedStudent.email,
            amount: 500, // Default fine amount
            status: 'pending',
            description: `Smoking detected via AI camera system`,
            location: detection.location || 'Campus',
            detectionId: detection.id || null,
            detectionImageUrl: imageUrl,
            createdAt: new Date().toISOString(),
            autoGenerated: true,
          });
          console.log(`[${cameraId}] Auto-generated challan for ${matchedStudent.name}`);
        } catch (challanErr) {
          console.error(`[${cameraId}] Failed to auto-generate challan:`, challanErr);
        }
      }
    } catch (err) {
      console.error(`[${cameraId}] Firestore save error:`, err);
    }

    // Emit via Socket.io
    if (io) {
      io.emit("detection", { cameraId, ...detection, matchedStudent });
    }
  }

  /**
   * IMAGE UPLOAD DETECTION
   */
  async detectSmoking(imagePath) {
    const pythonScript = path.join(__dirname, 'yolo_image_detection.py');
    const modelPath = path.resolve(__dirname, '../models/best.pt');

    if (!fs.existsSync(pythonScript)) {
      throw new Error("Python image detection script missing.");
    }
    if (!fs.existsSync(modelPath)) {
      throw new Error("YOLO model file missing.");
    }

    return new Promise((resolve, reject) => {
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      const pyProcess = spawn(pythonCmd, [pythonScript, imagePath, modelPath]);
      let output = "";
      let errorOutput = "";

      pyProcess.stdout.on("data", (data) => {
        output += data.toString();
      });

      pyProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
        console.error("Python error:", data.toString());
      });

      pyProcess.on("close", (code) => {
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve(result);
          } catch (err) {
            reject(new Error(`Invalid JSON output from Python: ${output.substring(0, 200)}`));
          }
        } else {
          reject(new Error(`Detection failed with code ${code}: ${errorOutput.substring(0, 200)}`));
        }
      });

      pyProcess.on("error", (err) => {
        reject(new Error(`Failed to start Python process: ${err.message}`));
      });
    });
  }

  /**
   * PROCESS SINGLE FRAME FROM MOBILE APP (Socket.io)
   * @param {string} cameraId
   * @param {Buffer} frameBuffer - JPEG buffer
   * @param {SocketIO.Server} io
   */
  async processFrame(cameraId, frameBuffer, io) {
    const pythonScript = path.join(__dirname, 'yolo_frame_detection.py');
    const modelPath = path.resolve(__dirname, '../models/best.pt');

    if (!fs.existsSync(pythonScript) || !fs.existsSync(modelPath)) {
      throw new Error("Python script or model missing");
    }

    return new Promise((resolve, reject) => {
      const pythonCmd = process.platform === 'win32' ? 'python' : 'python3';
      const proc = spawn(pythonCmd, [pythonScript, modelPath]);

      let output = '';
      let errorOutput = '';

      proc.stdout.on('data', (data) => {
        output += data.toString();
      });

      proc.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`[${cameraId}] Python error:`, data.toString());
      });

      proc.on('close', async (code) => {
        if (code !== 0) {
          reject(new Error(`Python process exited with code ${code}: ${errorOutput.substring(0, 200)}`));
          return;
        }

        try {
          const result = JSON.parse(output);
          
          // Save snapshot if detected
          if (result.detections?.length > 0 && result.snapshot) {
            try {
              const bucket = admin.storage().bucket();
              const fileName = `detections/${cameraId}_${uuidv4()}.jpg`;
              const file = bucket.file(fileName);
              await file.save(Buffer.from(result.snapshot, 'base64'), { contentType: 'image/jpeg' });
              result.imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            } catch (err) {
              console.error(`[${cameraId}] Failed to save snapshot:`, err);
            }
          }

          // Match faces and identify students
          let matchedStudent = null;
          const hasSmoking = result.detections?.some(d => 
            d.label?.toLowerCase().includes('smoker') || 
            d.label?.toLowerCase().includes('smoking') ||
            d.label?.toLowerCase().includes('cigarette')
          );

          if (hasSmoking && result.faceImages && result.faceImages.length > 0) {
            try {
              // Create temp directory if it doesn't exist
              const tempDir = path.join(__dirname, '../temp');
              if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
              }

              // Try to match each detected face
              for (const faceImage of result.faceImages) {
                if (faceImage.image) {
                  // Save base64 face image temporarily
                  const tempPath = path.join(tempDir, `face_${uuidv4()}.jpg`);
                  const imageBuffer = Buffer.from(faceImage.image, 'base64');
                  fs.writeFileSync(tempPath, imageBuffer);
                  
                  matchedStudent = await this.matchFaceWithStudent(tempPath);
                  
                  // Clean up temp file
                  fs.unlink(tempPath, () => {});
                  
                  if (matchedStudent) {
                    result.matchedStudent = matchedStudent;
                    console.log(`[${cameraId}] Matched student: ${matchedStudent.name} (confidence: ${matchedStudent.confidence})`);
                    break; // Use first match
                  }
                }
              }
            } catch (err) {
              console.error(`[${cameraId}] Face matching error:`, err);
            }
          }

          // Save to Firestore
          if (result.detections?.length > 0) {
            try {
              const db = admin.firestore();
              const detectionData = {
                cameraId,
                detections: result.detections,
                timestamp: new Date().toISOString(),
                imageUrl: result.imageUrl,
              };

              if (matchedStudent) {
                detectionData.studentId = matchedStudent.id;
                detectionData.studentName = matchedStudent.name;
                detectionData.studentEmail = matchedStudent.email;
                detectionData.studentStudentId = matchedStudent.studentId;
                detectionData.matchConfidence = matchedStudent.confidence;
              }

              await db.collection("detections").add(detectionData);

              const hasSmokingHighConf = result.detections.some(d =>
                isSmokingLabel(d.label) && smokingConfidenceOk(d)
              );

              if (matchedStudent && hasSmokingHighConf) {
                try {
                  await db.collection("challans").add({
                    studentId: matchedStudent.id,
                    studentName: matchedStudent.name,
                    studentEmail: matchedStudent.email,
                    amount: 500,
                    status: 'pending',
                    description: 'Smoking detected via AI camera system',
                    location: 'Campus',
                    detectionImageUrl: result.imageUrl,
                    createdAt: new Date().toISOString(),
                    autoGenerated: true,
                  });
                  console.log(`[${cameraId}] Auto-generated challan for ${matchedStudent.name}`);
                } catch (challanErr) {
                  console.error(`[${cameraId}] Failed to auto-generate challan:`, challanErr);
                }
              }
            } catch (err) {
              console.error(`[${cameraId}] Failed to save to Firestore:`, err);
            }
          }

          // Emit via socket
          if (io) {
            io.emit('detection', { cameraId, ...result });
          }

          resolve(result);
        } catch (err) {
          reject(new Error(`Failed to parse result: ${err.message}`));
        }
      });

      proc.on('error', (err) => {
        reject(new Error(`Failed to start Python process: ${err.message}`));
      });

      // Send frame buffer to Python via stdin
      proc.stdin.write(frameBuffer);
      proc.stdin.end();
    });
  }
}

module.exports = new DetectionService();
