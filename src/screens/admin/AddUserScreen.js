import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image, Alert } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Snackbar,
  RadioButton,
  ActivityIndicator,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { addUser } from '../../services/userService';
import { uploadStudentPhoto } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const AddUserScreen = () => {
  const { currentUser } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [studentId, setStudentId] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigation = useNavigation();

  const requestImagePickerPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need camera roll permission to upload student photos.');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestImagePickerPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      setError('Failed to pick image');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need camera permission to take student photos.');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (err) {
      console.error('Error taking photo:', err);
      setError('Failed to take photo');
    }
  };

  const handleAddUser = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (role === 'student' && !studentId) {
      setError('Student ID is required for students');
      return;
    }

    if (role === 'student' && !photoUri) {
      setError('Student photo is required for face recognition');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userData = {
        name,
        role,
        ...(role === 'student' && {
          studentId,
          photoUri, // Pass the local URI, the service will handle the upload
        }),
      };

      // Get auth token for backend API (admin verification)
      let authToken = null;
      if (currentUser) {
        try {
          authToken = await currentUser.getIdToken();
        } catch (tokenErr) {
          console.warn('Could not get auth token:', tokenErr);
        }
      }

      await addUser(email, password, userData, authToken);
      setSuccess(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineSmall" style={styles.title}>
              Add New User
            </Text>

            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
            />

            <Text variant="bodyMedium" style={styles.roleLabel}>
              Role
            </Text>
            <RadioButton.Group onValueChange={setRole} value={role}>
              <View style={styles.radioOption}>
                <RadioButton value="student" />
                <Text>Student</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="guard" />
                <Text>Security Guard</Text>
              </View>
              <View style={styles.radioOption}>
                <RadioButton value="security_head" />
                <Text>Security Head</Text>
              </View>
            </RadioButton.Group>

            {role === 'student' && (
              <>
                <TextInput
                  label="Student ID"
                  value={studentId}
                  onChangeText={setStudentId}
                  mode="outlined"
                  style={styles.input}
                />

                <Text variant="bodyMedium" style={styles.photoLabel}>
                  Student Photo (Required for Face Recognition)
                </Text>

                <View style={styles.photoContainer}>
                  {photoUri ? (
                    <View style={styles.photoPreview}>
                      <Image source={{ uri: photoUri }} style={styles.photo} />
                      <Button
                        mode="outlined"
                        onPress={() => setPhotoUri(null)}
                        style={styles.removePhotoButton}
                      >
                        Remove
                      </Button>
                    </View>
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Icon name="camera-alt" size={48} color="#CCC" />
                      <Text style={styles.photoPlaceholderText}>
                        No photo selected
                      </Text>
                    </View>
                  )}

                  <View style={styles.photoButtons}>
                    <Button
                      mode="outlined"
                      onPress={pickImage}
                      icon="image"
                      style={styles.photoButton}
                    >
                      Choose from Gallery
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={takePhoto}
                      icon="camera"
                      style={styles.photoButton}
                    >
                      Take Photo
                    </Button>
                  </View>
                </View>
              </>
            )}

            <Button
              mode="contained"
              onPress={handleAddUser}
              loading={loading || photoUploading}
              disabled={loading || photoUploading}
              style={styles.button}
            >
              Add User
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
        User added successfully!
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  input: {
    marginBottom: 16,
  },
  roleLabel: {
    marginTop: 8,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoLabel: {
    marginTop: 8,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  photoContainer: {
    marginBottom: 16,
  },
  photoPreview: {
    alignItems: 'center',
    marginBottom: 12,
  },
  photo: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  removePhotoButton: {
    marginTop: 8,
  },
  photoPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#CCC',
    borderStyle: 'dashed',
  },
  photoPlaceholderText: {
    marginTop: 8,
    color: '#999',
    fontSize: 12,
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  photoButton: {
    flex: 1,
  },
  button: {
    marginTop: 16,
    paddingVertical: 4,
  },
});

export default AddUserScreen;
