import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { TextInput, Button, Text, Card, Snackbar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { login } from '../../services/authService';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Only admin can login via Firebase
      // Other users (students, guards, security heads) are created and managed by admin
      await login(email, password, 'admin');
      // Navigation will be handled by AuthNavigator based on auth state change
    } catch (err) {
      setError(err.message || 'Login failed. Only admin accounts can login here.');
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
            <View style={styles.iconContainer}>
              <Icon name="admin-panel-settings" size={64} color="#F44336" />
            </View>
            <Text variant="headlineMedium" style={styles.title}>
              CCTV Smoking Detection
            </Text>
            <Text variant="bodyMedium" style={styles.subtitle}>
              Admin Login Only
            </Text>
            <Text variant="bodySmall" style={styles.infoText}>
              Students, Guards, and Security Heads are managed by admin in the admin panel
            </Text>

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

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              disabled={loading}
              style={styles.button}
            >
              Sign In
            </Button>

            <Text style={styles.note}>
              Note: Only admin accounts can login here. Other users are created and managed by admin.
            </Text>
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#666',
  },
  infoText: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#999',
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    paddingVertical: 4,
  },
  note: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default LoginScreen;

