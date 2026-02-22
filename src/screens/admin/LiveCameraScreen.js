import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Image } from 'react-native';
import { CameraView, useCameraPermissions, useCameraDevice } from 'expo-camera';
import {
  Card,
  Text,
  Title,
  Button,
  ActivityIndicator,
  Chip,
  Snackbar,
} from 'react-native-paper';
import { getDetectionStatus, startDetection, stopDetection } from '../../services/cameraService';
import { getCamerasAPI } from '../../services/apiService';
import { connectSocket, disconnectSocket, sendFrame, onDetection, onDetectionResult, onDetectionError } from '../../services/socketService';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');
const DEFAULT_CAMERA_ID = 'mobile-cam-1';

const LiveCameraScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState(DEFAULT_CAMERA_ID);
  const [detectionActive, setDetectionActive] = useState(false);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lastDetection, setLastDetection] = useState(null);
  const cameraRef = useRef(null);
  const frameIntervalRef = useRef(null);

  useEffect(() => {
    // Connect socket on mount
    const socket = connectSocket();

    // Set up detection listeners
    const unsubscribeDetection = onDetection((data) => {
      console.log('Detection received:', data);
      setDetections(prev => [data, ...prev].slice(0, 20)); // Keep last 20
      setLastDetection(data);
    });

    const unsubscribeResult = onDetectionResult((result) => {
      console.log('Detection result:', result);
      if (result.detections && result.detections.length > 0) {
        setDetections(prev => [result, ...prev].slice(0, 20));
        setLastDetection(result);
      }
    });

    const unsubscribeError = onDetectionError((error) => {
      console.error('Detection error:', error);
      setError(error.error || 'Detection error occurred');
    });

    return () => {
      unsubscribeDetection();
      unsubscribeResult();
      unsubscribeError();
      disconnectSocket();
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

  useEffect(() => {
    let cancelled = false;
    getCamerasAPI()
      .then((list) => {
        if (!cancelled && list && list.length > 0) {
          setCameras(list);
          const firstId = list[0].id || list[0].cameraId;
          if (firstId) setSelectedCameraId(firstId);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const captureAndSendFrame = async () => {
    if (!cameraRef.current || processing) return;

    try {
      setProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
        skipProcessing: false,
      });

      if (photo?.base64) {
        sendFrame(selectedCameraId, photo.base64);
      }
    } catch (err) {
      console.error('Error capturing frame:', err);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (detectionActive && permission?.granted) {
      // Capture and send frame every 2 seconds
      frameIntervalRef.current = setInterval(captureAndSendFrame, 2000);
    } else {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
      }
    }

    return () => {
      if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
      }
    };
  }, [detectionActive, permission?.granted]);

  const handleToggleDetection = async () => {
    setLoading(true);
    try {
      if (detectionActive) {
        await stopDetection(selectedCameraId);
        setDetectionActive(false);
        if (frameIntervalRef.current) {
          clearInterval(frameIntervalRef.current);
          frameIntervalRef.current = null;
        }
      } else {
        await startDetection(selectedCameraId);
        setDetectionActive(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to toggle detection');
    } finally {
      setLoading(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>No access to camera</Text>
        <Button mode="contained" onPress={requestPermission} style={{ marginTop: 16 }}>
          Grant Permission
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
          mode="picture"
        />
        <View style={styles.overlay}>
          <Chip
            icon={detectionActive ? 'check-circle' : 'cancel'}
            style={[
              styles.statusChip,
              { backgroundColor: detectionActive ? '#4CAF50' : '#F44336' },
            ]}
            textStyle={{ color: '#FFF' }}
          >
            {detectionActive ? 'Detection Active' : 'Detection Inactive'}
          </Chip>
          {processing && (
            <Chip
              icon="sync"
              style={[styles.statusChip, { backgroundColor: '#2196F3', marginTop: 8 }]}
              textStyle={{ color: '#FFF' }}
            >
              Processing...
            </Chip>
          )}
        </View>
      </View>

      {cameras.length > 1 && (
        <View style={styles.cameraPicker}>
          <Text style={styles.cameraPickerLabel}>Camera:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cameraChips}>
            {cameras.map((cam) => {
              const id = cam.id || cam.cameraId || cam.name;
              const label = cam.name || id;
              const selected = selectedCameraId === id;
              return (
                <Chip
                  key={id}
                  selected={selected}
                  onPress={() => !detectionActive && setSelectedCameraId(id)}
                  style={[styles.cameraChip, selected && styles.cameraChipSelected]}
                  textStyle={{ color: selected ? '#FFF' : undefined }}
                >
                  {label}
                </Chip>
              );
            })}
          </ScrollView>
        </View>
      )}
      <View style={styles.controls}>
        <Button
          mode="contained"
          onPress={handleToggleDetection}
          loading={loading}
          disabled={loading}
          icon={detectionActive ? 'stop' : 'play'}
          style={styles.button}
        >
          {detectionActive ? 'Stop Detection' : 'Start Detection'}
        </Button>
      </View>

      {lastDetection && lastDetection.detections?.length > 0 && (
        <Card style={styles.alertCard}>
          <Card.Content>
            <View style={styles.alertHeader}>
              <Icon name="warning" size={24} color="#FF5722" />
              <Text style={styles.alertText}>
                {lastDetection.detections.length} detection(s) found!
              </Text>
            </View>
            {lastDetection.imageUrl && (
              <Image
                source={{ uri: lastDetection.imageUrl }}
                style={styles.detectionImage}
                resizeMode="contain"
              />
            )}
          </Card.Content>
        </Card>
      )}

      <ScrollView style={styles.detectionsContainer}>
        <Title style={styles.sectionTitle}>Recent Detections</Title>
        {detections.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>No detections yet</Text>
              <Text style={styles.emptySubtext}>
                Start detection to begin monitoring
              </Text>
            </Card.Content>
          </Card>
        ) : (
          detections.map((detection, index) => (
            <Card key={index} style={styles.detectionCard}>
              <Card.Content>
                <View style={styles.detectionHeader}>
                  <Icon name="warning" size={24} color="#FF5722" />
                  <View style={styles.detectionInfo}>
                    <Text style={styles.detectionLabel}>
                      {detection.label || 'Smoking Detected'}
                    </Text>
                    <Text style={styles.detectionTime}>
                      {detection.timestamp
                        ? new Date(detection.timestamp).toLocaleString()
                        : 'Just now'}
                    </Text>
                  </View>
                </View>
                {detection.confidence && (
                  <Text style={styles.detectionConfidence}>
                    Confidence: {(detection.confidence * 100).toFixed(1)}%
                  </Text>
                )}
                {detection.cameraId && (
                  <Text style={styles.detectionCamera}>
                    Camera: {detection.cameraId}
                  </Text>
                )}
                {detection.matchedStudent && (
                  <View style={styles.matchedStudentContainer}>
                    <Icon name="person" size={20} color="#4CAF50" />
                    <View style={styles.matchedStudentInfo}>
                      <Text style={styles.matchedStudentName}>
                        Student: {detection.matchedStudent.name}
                      </Text>
                      <Text style={styles.matchedStudentId}>
                        ID: {detection.matchedStudent.studentId}
                      </Text>
                      {detection.matchConfidence && (
                        <Text style={styles.matchConfidence}>
                          Match: {(detection.matchConfidence * 100).toFixed(1)}%
                        </Text>
                      )}
                    </View>
                  </View>
                )}
                {detection.imageUrl && (
                  <Image
                    source={{ uri: detection.imageUrl }}
                    style={styles.detectionThumbnail}
                    resizeMode="cover"
                  />
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
      >
        {error}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraContainer: {
    height: 300,
    margin: 16,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 4,
    position: 'relative',
  },
  camera: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    padding: 16,
  },
  statusChip: {
    marginTop: 8,
  },
  controls: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 4,
  },
  alertCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF5722',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5722',
  },
  detectionImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 8,
  },
  detectionsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  emptyCard: {
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  emptySubtext: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 4,
  },
  detectionCard: {
    marginBottom: 12,
    elevation: 2,
  },
  detectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detectionInfo: {
    marginLeft: 12,
    flex: 1,
  },
  detectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detectionTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  detectionConfidence: {
    marginTop: 4,
    fontSize: 12,
    color: '#2196F3',
    fontWeight: '600',
  },
  detectionCamera: {
    marginTop: 4,
    fontSize: 12,
    color: '#666',
  },
  detectionThumbnail: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
  matchedStudentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
  },
  matchedStudentInfo: {
    marginLeft: 8,
    flex: 1,
  },
  matchedStudentName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  matchedStudentId: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  matchConfidence: {
    fontSize: 11,
    color: '#2196F3',
    marginTop: 2,
    fontWeight: '600',
  },
  cameraPicker: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  cameraPickerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cameraChips: {
    flexGrow: 0,
  },
  cameraChip: {
    marginRight: 8,
  },
  cameraChipSelected: {
    backgroundColor: '#2196F3',
  },
});

export default LiveCameraScreen;
