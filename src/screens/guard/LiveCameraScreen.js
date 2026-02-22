import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
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
import { connectSocket, disconnectSocket, sendFrame, onDetection, onDetectionResult, onDetectionError } from '../../services/socketService';
import { theme } from '../../theme/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');
const CAMERA_ID = 'guard-cam-1';

const LiveCameraScreen = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [detectionActive, setDetectionActive] = useState(false);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [lastDetection, setLastDetection] = useState(null);
  const [systemHealth, setSystemHealth] = useState('Online');
  const cameraRef = useRef(null);
  const frameIntervalRef = useRef(null);

  useEffect(() => {
    const socket = connectSocket();

    const unsubscribeDetection = onDetection((data) => {
      setDetections(prev => [data, ...prev].slice(0, 20));
      setLastDetection(data);
    });

    const unsubscribeResult = onDetectionResult((result) => {
      if (result.detections && result.detections.length > 0) {
        setDetections(prev => [result, ...prev].slice(0, 20));
        setLastDetection(result);
      }
    });

    const unsubscribeError = onDetectionError((error) => {
      setError(error.error || 'Detection error occurred');
      setSystemHealth('Error');
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
        sendFrame(CAMERA_ID, photo.base64);
      }
    } catch (err) {
      console.error('Error capturing frame:', err);
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (detectionActive && permission?.granted) {
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
        await stopDetection(CAMERA_ID);
        setDetectionActive(false);
      } else {
        await startDetection(CAMERA_ID);
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
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Icon name="camera-alt" size={64} color={theme.colors.outline} />
        <Text style={styles.permissionText}>Camera access is required</Text>
        <Button mode="contained" onPress={requestPermission} style={styles.grantButton}>
          Grant Permission
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* System Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusGroup}>
          <View style={[styles.statusIndicator, { backgroundColor: systemHealth === 'Online' ? theme.colors.success : theme.colors.error }]} />
          <Text style={styles.statusText}>System: {systemHealth}</Text>
        </View>
        <Text style={styles.cameraIdText}>CAM-ID: {CAMERA_ID.toUpperCase()}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.cameraFrame}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing="back"
            mode="picture"
          />
          <View style={styles.cameraOverlay}>
            <View style={styles.overlayTop}>
              <View style={[styles.liveBadge, { backgroundColor: detectionActive ? theme.colors.error : '#64748b' }]}>
                <View style={[styles.pulseDot, { backgroundColor: '#ffffff' }]} />
                <Text style={styles.liveText}>{detectionActive ? 'LIVE' : 'STANDBY'}</Text>
              </View>
            </View>

            <View style={styles.overlayBottom}>
              {processing && (
                <View style={styles.processingIndicator}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.processingText}>ANALYZING...</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.controls}>
          <Button
            mode="contained"
            onPress={handleToggleDetection}
            loading={loading}
            disabled={loading}
            icon={detectionActive ? 'stop' : 'play-arrow'}
            style={[styles.actionButton, { backgroundColor: detectionActive ? theme.colors.error : theme.colors.primary }]}
            contentStyle={styles.buttonContent}
            labelStyle={styles.buttonLabel}
          >
            {detectionActive ? 'STOP MONITORING' : 'START MONITORING'}
          </Button>
        </View>

        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Detection History</Title>
            <Chip style={styles.countChip}>{detections.length}</Chip>
          </View>

          <ScrollView style={styles.detectionsList} showsVerticalScrollIndicator={false}>
            {detections.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="videocam-off" size={48} color={theme.colors.outline} />
                <Text style={styles.emptyText}>No activity recorded</Text>
              </View>
            ) : (
              detections.map((detection, index) => (
                <Card key={index} style={styles.detectionCard}>
                  <View style={styles.cardLayout}>
                    {detection.imageUrl ? (
                      <Image
                        source={{ uri: detection.imageUrl }}
                        style={styles.cardThumbnail}
                      />
                    ) : (
                      <View style={[styles.cardThumbnail, styles.placeholderThumbnail]}>
                        <Icon name="image" size={24} color="#cbd5e1" />
                      </View>
                    )}

                    <View style={styles.cardInfo}>
                      <View style={styles.infoTop}>
                        <Text style={styles.detectionLabel}>
                          {detection.label || 'Smoking Alert'}
                        </Text>
                        <Text style={styles.timeText}>
                          {detection.timestamp ? new Date(detection.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                        </Text>
                      </View>

                      {detection.matchedStudent ? (
                        <View style={styles.studentBadge}>
                          <Icon name="person" size={14} color={theme.colors.primary} />
                          <Text style={styles.studentName} numberOfLines={1}>
                            {detection.matchedStudent.name}
                          </Text>
                        </View>
                      ) : (
                        <Text style={styles.unidentifiedText}>Unidentified subject</Text>
                      )}

                      {detection.confidence && (
                        <View style={styles.confidenceBarContainer}>
                          <View style={[styles.confidenceBar, { width: `${detection.confidence * 100}%`, backgroundColor: theme.colors.primary }]} />
                          <Text style={styles.confidenceText}>{(detection.confidence * 100).toFixed(0)}% Match</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Card>
              ))
            )}
          </ScrollView>
        </View>
      </View>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        action={{ label: 'Dismiss', onPress: () => setError('') }}
      >
        {error}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a', // Dark theme for camera screen
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1e293b',
  },
  statusGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  cameraIdText: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  cameraFrame: {
    height: 240,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000',
    elevation: 8,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: 'space-between',
  },
  overlayTop: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  liveText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  overlayBottom: {
    alignItems: 'center',
  },
  processingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  processingText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 8,
    letterSpacing: 1,
  },
  controls: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  actionButton: {
    borderRadius: 12,
    elevation: 4,
  },
  buttonContent: {
    height: 56,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  historySection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  countChip: {
    height: 24,
    backgroundColor: '#e2e8f0',
  },
  detectionsList: {
    flex: 1,
  },
  emptyContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
  },
  detectionCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  cardLayout: {
    flexDirection: 'row',
    height: 90,
  },
  cardThumbnail: {
    width: 90,
    height: 90,
  },
  placeholderThumbnail: {
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  infoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
  },
  timeText: {
    fontSize: 11,
    color: '#94a3b8',
    marginLeft: 8,
  },
  studentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  studentName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 4,
    maxWidth: 120,
  },
  unidentifiedText: {
    fontSize: 11,
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  confidenceBarContainer: {
    height: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
    position: 'relative',
    marginTop: 4,
  },
  confidenceBar: {
    height: '100%',
    borderRadius: 2,
  },
  confidenceText: {
    position: 'absolute',
    right: 0,
    top: -14,
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
  },
  permissionText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
    marginBottom: 24,
  },
  grantButton: {
    borderRadius: 8,
    width: 200,
  },
});

export default LiveCameraScreen;

