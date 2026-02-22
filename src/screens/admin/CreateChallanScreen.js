import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Snackbar,
  ActivityIndicator,
  RadioButton,
  Searchbar,
  Chip,
  Divider,
} from 'react-native-paper';
import { createChallan } from '../../services/challanService';
import { getUsers } from '../../services/userService';
import { getDetectionsWithStudents } from '../../services/detectionService';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CreateChallanScreen = () => {
  const navigation = useNavigation();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [recentDetections, setRecentDetections] = useState([]);
  const [showDetections, setShowDetections] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('pending');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadStudents();
    loadRecentDetections();
  }, []);

  const loadStudents = async () => {
    try {
      const allStudents = await getUsers('student');
      setStudents(allStudents);
    } catch (err) {
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentDetections = async () => {
    try {
      const detections = await getDetectionsWithStudents(20);
      setRecentDetections(detections);
    } catch (err) {
      console.error('Failed to load detections:', err);
    }
  };

  const handleSelectFromDetection = (detection) => {
    if (detection.matchedStudent) {
      setSelectedStudent({
        id: detection.matchedStudent.id,
        name: detection.matchedStudent.name,
        email: detection.matchedStudent.email,
        studentId: detection.matchedStudent.studentId,
      });
      setDescription(detection.description || 'Smoking detected via AI camera system');
      setLocation(detection.location || 'Campus');
      setShowDetections(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    if (!selectedStudent) {
      setError('Please select a student');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await createChallan({
        studentId: selectedStudent.id,
        amount: parseFloat(amount),
        status,
        description,
        location,
      });
      setSuccess(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create challan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              Create New Challan
            </Text>

            {/* Quick Actions */}
            {recentDetections.length > 0 && (
              <View style={styles.quickActions}>
                <Button
                  mode={showDetections ? "contained" : "outlined"}
                  onPress={() => setShowDetections(!showDetections)}
                  icon="camera-alt"
                  style={styles.quickActionButton}
                >
                  {showDetections ? 'Hide' : 'Show'} Recent Detections ({recentDetections.length})
                </Button>
              </View>
            )}

            {showDetections && recentDetections.length > 0 && (
              <Card style={styles.detectionsCard}>
                <Card.Content>
                  <Text variant="titleMedium" style={styles.detectionsTitle}>
                    Recent Detections with Identified Students
                  </Text>
                  <ScrollView style={styles.detectionsList} nestedScrollEnabled>
                    {recentDetections.map((detection) => (
                      <Card
                        key={detection.id}
                        style={styles.detectionCard}
                        onPress={() => handleSelectFromDetection(detection)}
                      >
                        <Card.Content>
                          <View style={styles.detectionHeader}>
                            <Icon name="warning" size={24} color="#FF5722" />
                            <View style={styles.detectionInfo}>
                              <Text style={styles.detectionStudentName}>
                                {detection.matchedStudent?.name || detection.studentName || 'Unknown'}
                              </Text>
                              <Text style={styles.detectionTime}>
                                {detection.timestamp 
                                  ? new Date(detection.timestamp).toLocaleString()
                                  : 'Just now'}
                              </Text>
                            </View>
                            {detection.imageUrl && (
                              <Image 
                                source={{ uri: detection.imageUrl }} 
                                style={styles.detectionThumbnail}
                                resizeMode="cover"
                              />
                            )}
                          </View>
                          {detection.matchConfidence && (
                            <Chip 
                              style={styles.confidenceChip}
                              textStyle={{ fontSize: 10 }}
                            >
                              Match: {(detection.matchConfidence * 100).toFixed(1)}%
                            </Chip>
                          )}
                        </Card.Content>
                      </Card>
                    ))}
                  </ScrollView>
                </Card.Content>
              </Card>
            )}

            <Divider style={styles.divider} />

            {/* Student Selection */}
            <Text variant="bodyMedium" style={styles.sectionLabel}>
              Select Student
            </Text>
            <Searchbar
              placeholder="Search students..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
            />
            <ScrollView style={styles.studentList} nestedScrollEnabled>
              {filteredStudents.map((student) => (
                <Card
                  key={student.id}
                  style={[
                    styles.studentCard,
                    selectedStudent?.id === student.id && styles.studentCardSelected,
                  ]}
                  onPress={() => setSelectedStudent(student)}
                >
                  <Card.Content>
                    <Text style={styles.studentName}>{student.name || student.email}</Text>
                    {student.studentId && (
                      <Text style={styles.studentId}>ID: {student.studentId}</Text>
                    )}
                    <Text style={styles.studentEmail}>{student.email}</Text>
                  </Card.Content>
                </Card>
              ))}
              {filteredStudents.length === 0 && (
                <Text style={styles.emptyText}>No students found</Text>
              )}
            </ScrollView>

            {selectedStudent && (
              <Card style={styles.selectedCard}>
                <Card.Content>
                  <Text variant="bodyMedium" style={styles.selectedLabel}>
                    Selected: {selectedStudent.name || selectedStudent.email}
                  </Text>
                </Card.Content>
              </Card>
            )}

            <TextInput
              label="Amount (₹)"
              value={amount}
              onChangeText={setAmount}
              mode="outlined"
              keyboardType="numeric"
              left={<TextInput.Icon icon="currency-inr" />}
              style={styles.input}
            />

            <Text variant="bodyMedium" style={styles.statusLabel}>
              Status
            </Text>
            <RadioButton.Group onValueChange={setStatus} value={status}>
              <View style={styles.radioOption}>
                <RadioButton value="pending" />
                <Text>Pending</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="paid" />
                <Text>Paid</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="cancelled" />
                <Text>Cancelled</Text>
              </View>
            </RadioButton.Group>

            <TextInput
              label="Location"
              value={location}
              onChangeText={setLocation}
              mode="outlined"
              left={<TextInput.Icon icon="map-marker" />}
              style={styles.input}
            />

            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={4}
              left={<TextInput.Icon icon="note-text" />}
              style={styles.input}
            />

            <Button
              mode="contained"
              onPress={handleCreate}
              loading={saving}
              disabled={saving || !selectedStudent}
              style={styles.button}
            >
              Create Challan
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={3000}
      >
        {error}
      </Snackbar>

      <Snackbar
        visible={success}
        onDismiss={() => setSuccess(false)}
        duration={2000}
      >
        Challan created successfully!
      </Snackbar>
    </KeyboardAvoidingView>
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
  scrollContent: {
    padding: 16,
  },
  card: {
    elevation: 4,
  },
  title: {
    marginBottom: 24,
    fontWeight: 'bold',
  },
  sectionLabel: {
    marginTop: 8,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  searchbar: {
    marginBottom: 12,
  },
  studentList: {
    maxHeight: 200,
    marginBottom: 16,
  },
  studentCard: {
    marginBottom: 8,
    elevation: 1,
  },
  studentCardSelected: {
    borderWidth: 2,
    borderColor: '#2196F3',
    elevation: 3,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  studentId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 12,
    color: '#999',
  },
  selectedCard: {
    marginBottom: 16,
    backgroundColor: '#E3F2FD',
    elevation: 2,
  },
  selectedLabel: {
    color: '#2196F3',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
  input: {
    marginBottom: 16,
  },
  statusLabel: {
    marginTop: 8,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    paddingVertical: 4,
  },
  quickActions: {
    marginBottom: 16,
  },
  quickActionButton: {
    marginBottom: 8,
  },
  detectionsCard: {
    marginBottom: 16,
    maxHeight: 300,
  },
  detectionsTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  detectionsList: {
    maxHeight: 250,
  },
  detectionCard: {
    marginBottom: 8,
    elevation: 2,
  },
  detectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detectionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  detectionStudentName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  detectionTime: {
    fontSize: 12,
    color: '#666',
  },
  detectionThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 8,
  },
  confidenceChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  divider: {
    marginVertical: 16,
  },
});

export default CreateChallanScreen;



