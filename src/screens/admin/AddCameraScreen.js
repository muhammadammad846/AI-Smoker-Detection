import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, Card, Snackbar, RadioButton } from 'react-native-paper';
import { addCameraAPI } from '../../services/apiService';
import { useNavigation } from '@react-navigation/native';

const AddCameraScreen = () => {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [location, setLocation] = useState('');
  const [type, setType] = useState('IP');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigation = useNavigation();

  const handleAddCamera = async () => {
    if (!id || !name || !url) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await addCameraAPI({ id, name, url, location, type });
      setSuccess(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to add camera');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="headlineSmall" style={styles.title}>Add New Camera</Text>
          <TextInput
            label="Camera ID"
            value={id}
            onChangeText={setId}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Stream URL / IP"
            value={url}
            onChangeText={setUrl}
            mode="outlined"
            style={styles.input}
            autoCapitalize="none"
            helperText="e.g. rtsp://ip:port/stream or 0 for USB webcam"
          />
          <TextInput
            label="Location (optional)"
            value={location}
            onChangeText={setLocation}
            mode="outlined"
            style={styles.input}
          />
          <Text style={styles.roleLabel}>Camera Type</Text>
          <RadioButton.Group onValueChange={setType} value={type}>
            <View style={styles.radioOption}>
              <RadioButton value="IP" /><Text>IP Camera</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="USB" /><Text>USB/Webcam</Text>
            </View>
          </RadioButton.Group>
          <Button mode="contained" onPress={handleAddCamera} loading={loading} disabled={loading} style={styles.button}>
            Add Camera
          </Button>
        </Card.Content>
      </Card>
      <Snackbar visible={!!error} onDismiss={() => setError('')} duration={3000}>{error}</Snackbar>
      <Snackbar visible={success} onDismiss={() => setSuccess(false)} duration={2000}>Camera added successfully!</Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 12,
  },
  roleLabel: {
    marginTop: 6,
    marginBottom: 4,
    color: '#666',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
});

export default AddCameraScreen;







