import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Text, Card } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const WelcomeScreen = () => {
  const navigation = useNavigation();

  const roles = [
    {
      id: 'admin',
      label: 'Admin',
      icon: 'admin-panel-settings',
      color: '#F44336',
      description: 'System Administrator',
      navigateTo: 'AdminLogin',
    },
    {
      id: 'security_head',
      label: 'Security Head',
      icon: 'supervisor-account',
      color: '#FF9800',
      description: 'Security Department Head',
      navigateTo: 'SecurityHeadLogin',
    },
    {
      id: 'guard',
      label: 'Security Guard',
      icon: 'security',
      color: '#2196F3',
      description: 'Security Personnel',
      navigateTo: 'GuardLogin',
    },
    {
      id: 'student',
      label: 'Student',
      icon: 'school',
      color: '#4CAF50',
      description: 'Student Portal',
      navigateTo: 'StudentLogin',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Icon name="camera-alt" size={64} color="#32608dff" />
        <Text variant="headlineLarge" style={styles.title}>
          CCTV Smoking Detection
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Select your role to continue
        </Text>
      </View>

      <View style={styles.rolesContainer}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[styles.roleCard, { borderLeftColor: role.color }]}
            onPress={() => navigation.navigate(role.navigateTo)}
            activeOpacity={0.7}
          >
            <Card style={styles.card}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <View style={[styles.iconCircle, { backgroundColor: role.color + '20' }]}>
                    <Icon name={role.icon} size={32} color={role.color} />
                  </View>
                </View>
                <View style={styles.textContainer}>
                  <Text variant="titleLarge" style={[styles.roleTitle, { color: role.color }]}>
                    {role.label}
                  </Text>
                  <Text variant="bodyMedium" style={styles.roleDescription}>
                    {role.description}
                  </Text>
                </View>
                <Icon name="chevron-right" size={24} color="#666" />
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={styles.footerText}>
          CCTV Smoking Detection System
        </Text>
        <Text variant="bodySmall" style={styles.footerText}>
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    marginTop: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#212121',
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
    color: '#666',
  },
  rolesContainer: {
    flex: 1,
    gap: 16,
  },
  roleCard: {
    marginBottom: 12,
  },
  card: {
    elevation: 3,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  cardContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  roleTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roleDescription: {
    color: '#666',
    fontSize: 14,
  },
  footer: {
    marginTop: 32,
    marginBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#999',
    marginTop: 4,
  },
});

export default WelcomeScreen;

