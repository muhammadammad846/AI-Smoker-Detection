import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Text,
  Title,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { getChallans } from '../../services/challanService';
import { getUserById } from '../../services/userService';
import { theme } from '../../theme/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ChallansListScreen = () => {
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallans();
  }, []);

  const loadChallans = async () => {
    try {
      const allChallans = await getChallans();
      // Fetch student names for each challan
      const challansWithNames = await Promise.all(
        allChallans.map(async (challan) => {
          if (challan.studentId) {
            try {
              const student = await getUserById(challan.studentId);
              return { ...challan, studentName: student?.name || 'Unknown' };
            } catch {
              return { ...challan, studentName: 'Unknown' };
            }
          }
          return challan;
        })
      );
      setChallans(challansWithNames);
    } catch (error) {
      console.error('Error loading challans:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return theme.colors.warning;
      case 'paid':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      default:
        return '#64748b';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Challan Register</Title>
        <View style={styles.badgeRow}>
          <Chip style={styles.headerChip} icon="receipt">{challans.length} Total</Chip>
          <Chip style={[styles.headerChip, { backgroundColor: theme.colors.warning + '20' }]} textStyle={{ color: theme.colors.warning }}>
            {challans.filter(c => c.status === 'pending').length} Pending
          </Chip>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {challans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="history" size={64} color={theme.colors.outline} />
            <Text style={styles.emptyText}>No challans found</Text>
          </View>
        ) : (
          challans.map((challan) => (
            <Card key={challan.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.studentInfo}>
                    <Title style={styles.studentName}>{challan.studentName || 'Unknown Student'}</Title>
                    <Text style={styles.challanId}>REF: {challan.id.substring(0, 8).toUpperCase()}</Text>
                  </View>
                  <Chip
                    style={[
                      styles.statusChip,
                      { backgroundColor: getStatusColor(challan.status) + '15' },
                    ]}
                    selectedColor={getStatusColor(challan.status)}
                    textStyle={styles.statusText}
                  >
                    {challan.status?.toUpperCase()}
                  </Chip>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailsContainer}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Icon name="payments" size={16} color="#64748b" />
                      <Text style={styles.detailValue}>₹{challan.amount || 0}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Icon name="calendar-today" size={16} color="#64748b" />
                      <Text style={styles.detailValue}>{formatDate(challan.createdAt)}</Text>
                    </View>
                  </View>

                  {challan.location && (
                    <View style={[styles.detailItem, { marginTop: 8 }]}>
                      <Icon name="place" size={16} color="#64748b" />
                      <Text style={styles.detailValue}>{challan.location}</Text>
                    </View>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))
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
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
  },
  headerChip: {
    marginRight: 8,
    height: 28,
  },
  scrollView: {
    flex: 1,
    padding: 16,
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  challanId: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  statusChip: {
    height: 24,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 12,
  },
  detailsContainer: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailValue: {
    marginLeft: 6,
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
});

export default ChallansListScreen;












