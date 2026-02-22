import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Text,
  Title,
  ActivityIndicator,
  Avatar,
} from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { getUserById } from '../../services/userService';
import { theme } from '../../theme/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      if (currentUser) {
        const data = await getUserById(currentUser.uid);
        setUserData(data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Premium Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Avatar.Text
              size={100}
              label={userData?.name?.charAt(0)?.toUpperCase() || 'U'}
              style={styles.avatar}
              color="#ffffff"
            />
            <View style={[styles.onlineStatus, { backgroundColor: theme.colors.success }]} />
          </View>
          <Title style={styles.name}>{userData?.name || 'User'}</Title>
          <Text style={styles.roleLabel}>
            {userData?.role?.replace('_', ' ').toUpperCase() || 'STUDENT'}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Account Information</Text>

        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '10' }]}>
                <Icon name="badge" size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Student ID</Text>
                <Text style={styles.infoValue}>{userData?.studentId || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '10' }]}>
                <Icon name="email" size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>{currentUser?.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.primary + '10' }]}>
                <Icon name="event" size={22} color={theme.colors.primary} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Status</Text>
                <Text style={[styles.infoValue, { color: theme.colors.success }]}>Active</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Text style={styles.sectionTitle}>Security & Privacy</Text>
        <Card style={styles.infoCard}>
          <Card.Content>
            <View style={styles.infoRow}>
              <View style={[styles.iconBox, { backgroundColor: theme.colors.error + '10' }]}>
                <Icon name="lock" size={22} color={theme.colors.error} />
              </View>
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Last Password Change</Text>
                <Text style={styles.infoValue}>Never</Text>
              </View>
              <Icon name="chevron-right" size={24} color="#cbd5e1" />
            </View>
          </Card.Content>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  onlineStatus: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  name: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  roleLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 4,
  },
  content: {
    padding: 20,
    marginTop: -20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    marginTop: 24,
    marginLeft: 4,
  },
  infoCard: {
    borderRadius: 16,
    elevation: 2,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 60,
  },
});

export default ProfileScreen;












