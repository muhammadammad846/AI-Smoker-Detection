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
import { useAuth } from '../../context/AuthContext';
import { theme } from '../../theme/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const MyChallansScreen = () => {
  const { currentUser } = useAuth();
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallans();
  }, []);

  const loadChallans = async () => {
    try {
      const studentChallans = await getChallans({ studentId: currentUser?.uid });
      setChallans(studentChallans);
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
        return '#666';
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

  const stats = {
    total: challans.length,
    pending: challans.filter(c => c.status === 'pending').length,
    paid: challans.filter(c => c.status === 'paid').length,
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
      {/* Dashboard Summary */}
      <View style={styles.header}>
        <Title style={styles.headerTitle}>My Challans</Title>
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { borderLeftColor: theme.colors.primary }]}>
            <Text style={styles.statLabel}>Total</Text>
            <Text style={styles.statValue}>{stats.total}</Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: theme.colors.warning }]}>
            <Text style={styles.statLabel}>Pending</Text>
            <Text style={styles.statValue}>{stats.pending}</Text>
          </View>
          <View style={[styles.statBox, { borderLeftColor: theme.colors.success }]}>
            <Text style={styles.statLabel}>Paid</Text>
            <Text style={styles.statValue}>{stats.paid}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView}>
        {challans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="receipt" size={80} color={theme.colors.outline} />
            <Text style={styles.emptyText}>No challans recorded yet</Text>
            <Text style={styles.emptySubtext}>Your smoking violation records will appear here.</Text>
          </View>
        ) : (
          challans.map((challan) => (
            <Card key={challan.id} style={styles.card}>
              <Card.Content>
                <View style={styles.challanHeader}>
                  <View>
                    <Title style={styles.challanId}>#{challan.id.substring(0, 8).toUpperCase()}</Title>
                    <Text style={styles.challanDate}>{formatDate(challan.createdAt)}</Text>
                  </View>
                  <Chip
                    style={[
                      styles.chip,
                      { backgroundColor: getStatusColor(challan.status) + '15' },
                    ]}
                    selectedColor={getStatusColor(challan.status)}
                    textStyle={styles.chipText}
                  >
                    {challan.status?.toUpperCase()}
                  </Chip>
                </View>

                <View style={[styles.divider, { backgroundColor: theme.colors.outline }]} />

                <View style={styles.details}>
                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Fine Amount</Text>
                    <Text style={[styles.amountValue, { color: theme.colors.primary }]}>
                      ₹{challan.amount || 0}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Icon name="location-on" size={16} color="#64748b" />
                    <Text style={styles.infoText}>{challan.location || 'Unknown Location'}</Text>
                  </View>

                  {challan.description && (
                    <View style={styles.descriptionBox}>
                      <Text style={styles.descriptionText}>{challan.description}</Text>
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
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1e293b',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    borderLeftWidth: 4,
    elevation: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    marginTop: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#475569',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  challanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  challanId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  challanDate: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 2,
  },
  chip: {
    height: 28,
  },
  chipText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  details: {
    marginTop: 4,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  amountValue: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 8,
    color: '#475569',
    fontSize: 14,
  },
  descriptionBox: {
    backgroundColor: '#f1f5f9',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  descriptionText: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
});

export default MyChallansScreen;












