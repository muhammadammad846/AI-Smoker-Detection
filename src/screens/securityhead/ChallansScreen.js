import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Text,
  Title,
  ActivityIndicator,
  Chip,
  Button,
} from 'react-native-paper';
import { getChallans } from '../../services/challanService';
import { getUserById } from '../../services/userService';
import { theme } from '../../theme/theme';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ChallansScreen = () => {
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

  const totalRevenue = challans.filter(c => c.status === 'paid').reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const pendingCount = challans.filter(c => c.status === 'pending').length;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Security Head Overview Dashboard */}
      <View style={styles.header}>
        <Title style={styles.headerTitle}>System Audit</Title>
        <View style={styles.dashboardRow}>
          <View style={[styles.dashCard, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.dashLabel}>REVENUE</Text>
            <Text style={styles.dashValue}>₹{totalRevenue}</Text>
          </View>
          <View style={[styles.dashCard, { backgroundColor: theme.colors.warning }]}>
            <Text style={styles.dashLabel}>PENDING</Text>
            <Text style={styles.dashValue}>{pendingCount}</Text>
          </View>
          <View style={[styles.dashCard, { backgroundColor: '#334155' }]}>
            <Text style={styles.dashLabel}>TOTAL</Text>
            <Text style={styles.dashValue}>{challans.length}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Challan Logs</Text>
          <Button icon="filter-variant" mode="text" compact onPress={() => { }} labelStyle={{ fontSize: 10 }}>FILTER</Button>
        </View>

        {challans.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="receipt-long" size={64} color={theme.colors.outline} />
            <Text style={styles.emptyText}>No challans on record</Text>
          </View>
        ) : (
          challans.map((challan) => (
            <Card key={challan.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.mainInfo}>
                    <Title style={styles.studentName}>{challan.studentName || 'Student ID: ' + (challan.studentId ? challan.studentId.substring(0, 8) : 'Unknown')}</Title>
                    <View style={styles.idRow}>
                      <Icon name="tag" size={12} color="#94a3b8" />
                      <Text style={styles.challanId}>{challan.id.substring(0, 8).toUpperCase()}</Text>
                    </View>
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

                <View style={styles.footer}>
                  <View style={styles.footerItem}>
                    <Icon name="event" size={14} color="#64748b" />
                    <Text style={styles.footerText}>{formatDate(challan.createdAt)}</Text>
                  </View>

                  <View style={styles.footerItem}>
                    <Icon name="place" size={14} color="#64748b" />
                    <Text style={styles.footerText} numberOfLines={1}>{challan.location || 'Site A'}</Text>
                  </View>

                  <Text style={[styles.amountText, { color: theme.colors.primary }]}>₹{challan.amount || 0}</Text>
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
    padding: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 20,
  },
  dashboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dashCard: {
    flex: 1,
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 14,
    elevation: 4,
    alignItems: 'center',
  },
  dashLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 9,
    fontWeight: 'BOLD',
    letterSpacing: 1,
  },
  dashValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#64748b',
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mainInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  challanId: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    flex: 1,
  },
  footerText: {
    fontSize: 11,
    color: '#64748b',
    marginLeft: 6,
    fontWeight: '500',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
  },
});

export default ChallansScreen;












