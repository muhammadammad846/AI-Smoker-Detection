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

const CaughtStudentsScreen = () => {
  const [caughtStudents, setCaughtStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCaughtStudents();
  }, []);

  const loadCaughtStudents = async () => {
    try {
      // Get all pending challans (recently caught students)
      const allChallans = await getChallans();
      const pendingChallans = allChallans.filter(c => c.status === 'pending');

      // Fetch student names
      const studentsWithChallans = await Promise.all(
        pendingChallans.map(async (challan) => {
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

      setCaughtStudents(studentsWithChallans);
    } catch (error) {
      console.error('Error loading caught students:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
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
        <Title style={styles.headerTitle}>Recent Violations</Title>
        <Text style={styles.headerSubtitle}>Students caught smoking via AI detection</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {caughtStudents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Icon name="verified-user" size={48} color={theme.colors.success} />
            </View>
            <Text style={styles.emptyText}>All Clear!</Text>
            <Text style={styles.emptySubtext}>No recent smoking violations detected.</Text>
          </View>
        ) : (
          caughtStudents.map((student) => (
            <Card key={student.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.avatarContainer}>
                    <Icon name="person" size={24} color={theme.colors.primary} />
                  </View>
                  <View style={styles.studentInfo}>
                    <Title style={styles.studentName}>{student.studentName || 'Unknown Student'}</Title>
                    <Text style={styles.studentId}>ID: {student.studentId?.toUpperCase() || 'N/A'}</Text>
                  </View>
                  <Chip style={styles.pendingChip} textStyle={styles.pendingChipText}>PENDING</Chip>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Icon name="schedule" size={16} color="#64748b" />
                    <View style={styles.detailTextContent}>
                      <Text style={styles.detailLabel}>Time Detected</Text>
                      <Text style={styles.detailValue}>{formatDate(student.createdAt)}</Text>
                    </View>
                  </View>

                  <View style={styles.detailItem}>
                    <Icon name="place" size={16} color="#64748b" />
                    <View style={styles.detailTextContent}>
                      <Text style={styles.detailLabel}>Location</Text>
                      <Text style={styles.detailValue} numberOfLines={1}>{student.location || 'Building A'}</Text>
                    </View>
                  </View>

                  <View style={styles.detailItem}>
                    <Icon name="payments" size={16} color="#64748b" />
                    <View style={styles.detailTextContent}>
                      <Text style={styles.detailLabel}>Fine Amount</Text>
                      <Text style={[styles.detailValue, { color: theme.colors.error, fontWeight: '800' }]}>₹{student.amount || 0}</Text>
                    </View>
                  </View>

                  <View style={styles.detailItem}>
                    <Icon name="info" size={16} color="#64748b" />
                    <View style={styles.detailTextContent}>
                      <Text style={styles.detailLabel}>Status</Text>
                      <Text style={[styles.detailValue, { color: theme.colors.warning }]}>Action Required</Text>
                    </View>
                  </View>
                </View>

                <Button
                  mode="outlined"
                  onPress={() => { }}
                  style={styles.detailsButton}
                  labelStyle={styles.detailsButtonLabel}
                >
                  VIEW FULL RECORD
                </Button>
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
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    marginTop: 80,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0fdf4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  emptySubtext: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  card: {
    marginBottom: 16,
    borderRadius: 20,
    elevation: 2,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    lineHeight: 22,
  },
  studentId: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  pendingChip: {
    backgroundColor: '#fff7ed',
    height: 24,
  },
  pendingChipText: {
    color: '#c2410c',
    fontSize: 10,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  detailItem: {
    width: '50%',
    paddingHorizontal: 8,
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailTextContent: {
    marginLeft: 8,
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginTop: 1,
  },
  detailsButton: {
    marginTop: 4,
    borderRadius: 12,
    borderColor: '#e2e8f0',
  },
  detailsButtonLabel: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default CaughtStudentsScreen;












