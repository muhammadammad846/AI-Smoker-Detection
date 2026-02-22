import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Text,
  Title,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { getUsers } from '../../services/userService';
import { getLiveDetections } from '../../services/cameraService';
import { theme } from '../../theme/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const GuardsActivityScreen = () => {
  const [guards, setGuards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState({});

  useEffect(() => {
    loadGuardsActivity();
    const interval = setInterval(loadGuardsActivity, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const loadGuardsActivity = async () => {
    try {
      console.log('🔍 Fetching guards list...');
      const { auth } = require('../../config/firebase');
      console.log('👤 Current user:', auth.currentUser ? auth.currentUser.uid : 'NOT LOGGED IN');

      const guardsList = await getUsers('guard');
      console.log('✅ Guards loaded:', guardsList.length);

      // Get guard activity from API
      const { getGuardsActivityAPI } = require('../../services/apiService');
      let activity = {};

      try {
        const activityResponse = await getGuardsActivityAPI();
        console.log('📡 API Response received');
        if (Array.isArray(activityResponse)) {
          activityResponse.forEach(guardActivity => {
            activity[guardActivity.guardId] = {
              isActive: guardActivity.isActive || false,
              lastActive: guardActivity.lastActive,
              watchingCameras: 1,
            };
          });
        }
      } catch (apiError) {
        console.warn('⚠️ API fetch failed:', apiError.message);
        // Fallback: mark all guards as inactive
        guardsList.forEach(guard => {
          activity[guard.id] = {
            isActive: false,
            lastActive: null,
            watchingCameras: 0,
          };
        });
      }

      setActivityData(activity);
      setGuards(guardsList);
    } catch (error) {
      console.error('❌ Error loading guards activity:', error);
      console.error('Stack trace:', error.stack);
    } finally {
      setLoading(false);
    }
  };

  const getActiveCount = () => Object.values(activityData).filter(a => a.isActive).length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Security Head Dashboard Header */}
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Guard Force Status</Title>
        <View style={styles.statsRow}>
          <View style={styles.mainStat}>
            <Text style={styles.mainStatValue}>{getActiveCount()}</Text>
            <Text style={styles.mainStatLabel}>ACTIVE GUARDS</Text>
          </View>
          <View style={styles.dividerVertical} />
          <View style={styles.subStat}>
            <Text style={styles.subStatValue}>{guards.length}</Text>
            <Text style={styles.subStatLabel}>REGISTERED</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Duty Roster & Live Status</Text>

        {guards.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="security" size={64} color={theme.colors.outline} />
            <Text style={styles.emptyText}>No guards registered</Text>
          </View>
        ) : (
          guards.map((guard) => {
            const activity = activityData[guard.id] || {};
            return (
              <Card key={guard.id} style={styles.card}>
                <Card.Content>
                  <View style={styles.guardRow}>
                    <View style={[styles.statusRing, { borderColor: activity.isActive ? theme.colors.success : theme.colors.outline }]}>
                      <Icon
                        name="person"
                        size={28}
                        color={activity.isActive ? theme.colors.primary : '#94a3b8'}
                      />
                      {activity.isActive && <View style={[styles.pulseDot, { backgroundColor: theme.colors.success }]} />}
                    </View>

                    <View style={styles.guardMainInfo}>
                      <Title style={styles.guardName}>{guard.name || guard.email}</Title>
                      <Text style={styles.guardEmail}>{guard.email}</Text>
                    </View>

                    <Chip
                      style={[
                        styles.statusChip,
                        {
                          backgroundColor: activity.isActive
                            ? theme.colors.success + '15'
                            : '#f1f5f9',
                        },
                      ]}
                      textStyle={{
                        color: activity.isActive ? theme.colors.success : '#64748b',
                        fontSize: 10,
                        fontWeight: 'bold',
                      }}
                    >
                      {activity.isActive ? 'ON DUTY' : 'OFFLINE'}
                    </Chip>
                  </View>

                  {activity.isActive && (
                    <View style={styles.activityDetails}>
                      <View style={styles.detailItem}>
                        <Icon name="videocam" size={16} color={theme.colors.primary} />
                        <Text style={styles.detailLabel}>
                          Monitoring {activity.watchingCameras || 1} System(s)
                        </Text>
                      </View>

                      {activity.lastActive && (
                        <View style={styles.detailItem}>
                          <Icon name="access-time" size={16} color="#64748b" />
                          <Text style={styles.detailLabel}>
                            Last heartbeat: {new Date(activity.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </Card.Content>
              </Card>
            );
          })
        )}
      </ScrollView>
    </View>
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
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    padding: 16,
    borderRadius: 16,
  },
  mainStat: {
    flex: 1,
    alignItems: 'center',
  },
  mainStatValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  mainStatLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 4,
    letterSpacing: 1,
  },
  dividerVertical: {
    width: 1,
    height: 40,
    backgroundColor: '#cbd5e1',
  },
  subStat: {
    flex: 1,
    alignItems: 'center',
  },
  subStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#334155',
  },
  subStatLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94a3b8',
    marginTop: 4,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 16,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 16,
  },
  card: {
    marginBottom: 12,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  guardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#f8fafc',
  },
  pulseDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  guardMainInfo: {
    marginLeft: 16,
    flex: 1,
  },
  guardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    lineHeight: 20,
  },
  guardEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  statusChip: {
    height: 24,
  },
  activityDetails: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
    marginLeft: 8,
  },
});

export default GuardsActivityScreen;


