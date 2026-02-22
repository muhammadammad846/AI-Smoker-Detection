import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Snackbar,
  RadioButton,
  ActivityIndicator,
} from 'react-native-paper';
import { getUserById, updateUser } from '../../services/userService';
import { useNavigation, useRoute } from '@react-navigation/native';

const EditUserScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await getUserById(userId);
      if (user) {
        setName(user.name || '');
        setEmail(user.email || '');
        setRole(user.role || 'student');
        setStudentId(user.studentId || '');
      }
    } catch (err) {
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!name || !email) {
      setError('Please fill in all required fields');
      return;
    }

    if (role === 'student' && !studentId) {
      setError('Student ID is required for students');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const updates = {
        name,
        email,
        role,
        ...(role === 'student' && { studentId }),
        updatedAt: new Date().toISOString(),
      };

      await updateUser(userId, updates);

      setSuccess(true);
      setError('');
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update user');
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
              Edit User
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
              label="New Password (optional, leave blank to keep current)"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry
              style={styles.input}
              helperText="Minimum 6 characters"
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
              <TextInput
                label="Student ID"
                value={studentId}
                onChangeText={setStudentId}
                mode="outlined"
                style={styles.input}
              />
            )}

            <Button
              mode="contained"
              onPress={handleUpdateUser}
              loading={saving}
              disabled={saving}
              style={styles.button}
            >
              Update User
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
        User updated successfully!
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
  button: {
    marginTop: 16,
    paddingVertical: 4,
  },
});

export default EditUserScreen;

