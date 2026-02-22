import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Title, Paragraph, ActivityIndicator, Button, Chip } from 'react-native-paper';
import { getChallans } from '../../services/challanService';
import { getUsers } from '../../services/userService';
import { getLiveDetections } from '../../services/cameraService';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DashboardScreen = () => {
  const navigation = useNavigation();
  const [stats, setStats] = useState({
    totalChallans: 0,
    pendingChallans: 0,
    paidChallans: 0,
    cancelledChallans: 0,
    totalStudents: 0,
    totalGuards: 0,
    totalSecurityHeads: 0,
    activeCameras: 0,
    todayDetections: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [recentChallans, setRecentChallans] = useState([]);

  useEffect(() => {
    loadDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [challans, students, guards, securityHeads, detections] = await Promise.all([
        getChallans(),
        getUsers('student'),
        getUsers('guard'),
        getUsers('security_head'),
        getLiveDetections(),
      ]);

      // Calculate total revenue from paid challans
      const totalRevenue = challans
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

      const pendingChallans = challans.filter(c => c.status === 'pending').length;
      const paidChallans = challans.filter(c => c.status === 'paid').length;
      const cancelledChallans = challans.filter(c => c.status === 'cancelled').length;
      
      
      

      // Get recent challans (last 5)
      const recent = challans
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setRecentChallans(recent);

      setStats({
        totalRevenue,
        totalChallans: challans.length,
        pendingChallans,
        paidChallans,
        cancelledChallans,
        totalStudents: students.length,
        totalGuards: guards.length,
        totalSecurityHeads: securityHeads.length,
        activeCameras: detections.activeCameras || 0,
        todayDetections: detections.totalDetections || 0,
        
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const StatCard = ({ icon, title, value, color, onPress }) => (
    <Card 
      style={styles.statCard} 
      onPress={onPress}
      mode={onPress ? 'elevated' : 'elevated'}
    >
      <Card.Content style={styles.statContent}>
        <Icon name={icon} size={32} color={color} />
        <View style={styles.statText}>
          <Title style={styles.statValue}>{value}</Title>
          <Paragraph style={styles.statTitle}>{title}</Paragraph>
        </View>
      </Card.Content>
    </Card>
  );

  const formatCurrency = (amount) => {
    return `₨${amount.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'paid': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Admin Dashboard</Title>
        <Text variant="bodySmall" style={styles.headerSubtitle}>
          System Overview & Statistics
        </Text>
      </View>

      {/* Revenue Card */}
      <Card style={styles.revenueCard}>
        <Card.Content>
          <View style={styles.revenueContent}>
            <Icon name="account-balance-wallet" size={40} color="#4CAF50" />
            <View style={styles.revenueText}>
              <Text variant="bodyMedium" style={styles.revenueLabel}>Total Revenue</Text>
              <Title style={styles.revenueValue}>{formatCurrency(stats.totalRevenue)}</Title>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="receipt"
          title="Total Challans"
          value={stats.totalChallans}
          color="#2196F3"
          onPress={() => navigation.navigate('Challans')}
        />
        <StatCard
          icon="pending"
          title="Pending"
          value={stats.pendingChallans}
          color="#FF9800"
          onPress={() => navigation.navigate('Challans')}
        />
        <StatCard
          icon="check-circle"
          title="Paid"
          value={stats.paidChallans}
          color="#4CAF50"
          onPress={() => navigation.navigate('Challans')}
        />
        <StatCard
          icon="cancel"
          title="Cancelled"
          value={stats.cancelledChallans}
          color="#F44336"
          onPress={() => navigation.navigate('Challans')}
        />
      </View>

      

      {/* User Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          icon="school"
          title="Students"
          value={stats.totalStudents}
          color="#4CAF50"
          onPress={() => navigation.navigate('Users')}
        />
        <StatCard
          icon="security"
          title="Guards"
          value={stats.totalGuards}
          color="#2196F3"
          onPress={() => navigation.navigate('Users')}
        />
        <StatCard
          icon="supervisor-account"
          title="Security Heads"
          value={stats.totalSecurityHeads}
          color="#FF9800"
          onPress={() => navigation.navigate('Users')}
        />
        <StatCard
          icon="camera-alt"
          title="Active Cameras"
          value={stats.activeCameras}
          color="#F44336"
          onPress={() => navigation.navigate('LiveCam')}
        />
      </View>

      {/* Recent Challans */}
      <Card style={styles.recentCard}>
        <Card.Content>
          <View style={styles.recentHeader}>
            <Title>Recent Challans</Title>
            <Button 
              mode="text" 
              compact
              onPress={() => navigation.navigate('Challans')}
            >
              View All
            </Button>
          </View>
          {recentChallans.length === 0 ? (
            <Text style={styles.emptyText}>No challans yet</Text>
          ) : (
            recentChallans.map((challan) => (
              <View key={challan.id} style={styles.recentItem}>
                <View style={styles.recentItemLeft}>
                  <Text style={styles.recentItemTitle}>
                    {challan.studentName || 'Unknown Student'}
                  </Text>
                  <Text style={styles.recentItemDate}>
                    {formatDate(challan.createdAt)}
                  </Text>
                </View>
                <View style={styles.recentItemRight}>
                  <Text style={styles.recentItemAmount}>
                    ₨{challan.amount || 0}
                  </Text>
                  <Chip
                    style={[styles.statusChip, { backgroundColor: getStatusColor(challan.status) + '33' }]}
                    textStyle={{ color: getStatusColor(challan.status), fontSize: 10, fontWeight: 'bold' }}
                  >
                    {challan.status?.toUpperCase()}
                  </Chip>
                </View>
              </View>
            ))
          )}
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title style={styles.actionsTitle}>Quick Actions</Title>
          <View style={styles.actionsGrid}>
            <Button
              mode="contained"
              icon="plus"
              onPress={() => navigation.navigate('Users')}
              style={styles.actionButton}
            >
              Add User
            </Button>
            <Button
              mode="contained"
              icon="receipt"
              onPress={() => navigation.navigate('Challans')}
              style={styles.actionButton}
            >
              View Challans
            </Button>
            <Button
              mode="contained"
              icon="camera"
              onPress={() => navigation.navigate('AddCamera')}
              style={styles.actionButton}
            >
              Add Camera
            </Button>
            <Button
              mode="contained"
              icon="camera"
              onPress={() => navigation.navigate('LiveCam')}
              style={styles.actionButton}
            >
              Live Camera
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
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
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#666',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 12,
    paddingHorizontal: 8,
    justifyContent: 'space-between', // NEW: Even spacing
  },
  statCard: {
    width: '48%',
    marginBottom: 12,        // Better vertical separation
    elevation: 2,
    backgroundColor: '#fff', // Add for uniformity if not already set
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 12,
    flex: 1,
  },
  statValue: {
    fontSize: 26,           // Slightly larger for emphasis
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
  },
  revenueCard: {
    margin: 12,
    marginTop: 0,
    elevation: 3,
    backgroundColor: '#E8F5E9',
  },
  revenueContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  revenueText: {
    marginLeft: 16,
    flex: 1,
  },
  revenueLabel: {
    color: '#666',
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  recentCard: {
    margin: 12,
    marginTop: 8,
    elevation: 2,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recentItemLeft: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  recentItemDate: {
    fontSize: 12,
    color: '#666',
  },
  recentItemRight: {
    alignItems: 'flex-end',
  },
  recentItemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 4,
  },
  statusChip: {
    height: 24,
    borderRadius: 8,
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
  },
  actionsCard: {
    margin: 12,
    marginTop: 8,
    elevation: 2,
  },
  actionsTitle: {
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // Center buttons
    // Use margin on Button for spacing if gap unsupported
  },
  actionButton: {
    marginHorizontal: 6,  // Spacing between buttons (left/right)
    marginBottom: 8,      // Vertical spacing
    minWidth: 120,        // Looks cleaner if buttons have similar width
  },
});

export default DashboardScreen;


