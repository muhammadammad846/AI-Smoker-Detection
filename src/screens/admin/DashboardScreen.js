import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Dimensions, StatusBar, Platform, Alert } from 'react-native';
import {
  Text,
  Card,
  IconButton,
  useTheme,
  ActivityIndicator,
  TouchableRipple,
  Avatar
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { getChallans } from '../../services/challanService';
import { getUsers } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';



const DashboardScreen = ({ navigation }) => {
  const { logout } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    paid: 0,
    cancelled: 0,
    students: 0,
    cameras: 4,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Are you sure you want to terminate current session?');
      if (!confirmed) return;
      try {
        await logout();
      } catch (err) {
        console.error("Logout Failed", err);
        window.alert("Could not complete logout request.");
      }
    } else {
      Alert.alert(
        "CONFIRM LOGOUT",
        "Are you sure you want to terminate current session?",
        [
          { text: "CANCEL", style: "cancel" },
          {
            text: "TERMINATE",
            onPress: async () => {
              try {
                await logout();
              } catch (err) {
                console.error("Logout Failed", err);
                Alert.alert("Logout Error", "Could not complete logout request.");
              }
            },
            style: 'destructive'
          }
        ]
      );
    }
  };

  const loadData = async () => {
    try {
      const [challans, users] = await Promise.all([getChallans(), getUsers()]);
      const totalRevenue = challans
        .filter(c => c.status === 'paid')
        .reduce((sum, c) => sum + (Number(c.amount) || 0), 0);

      setStats({
        total: challans.length,
        pending: challans.filter(c => c.status === 'pending').length,
        paid: challans.filter(c => c.status === 'paid').length,
        cancelled: challans.filter(c => c.status === 'cancelled').length,
        students: users.filter(u => u.role === 'student').length,
        cameras: 4,
        totalRevenue
      });
    } catch (error) {
      console.error('Dashboard Load Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation]);

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>SYNCHRONIZING CORE...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); loadData(); }}
            tintColor={theme.colors.primary}
          />
        }
      >
        <LinearGradient colors={theme.colors.headerGradient} style={styles.heroSection}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.welcomeText}>SYSTEM STATUS: NOMINAL</Text>
              <Text style={styles.titleText}>Command Center</Text>
            </View>
            <View style={styles.headerRight}>
              <IconButton
                icon="logout-variant"
                iconColor="#FFFFFF"
                size={22}
                onPress={handleLogout}
                style={styles.logoutBtn}
              />
              <View style={styles.statusBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.statusText}>LIVE</Text>
              </View>
            </View>
          </View>

          <Card style={styles.revenueCard} elevation={6}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.revenueGradient}
            >
              <View style={styles.revenueHeader}>
                <Text style={styles.revenueLabel}>CUMULATIVE REVENUE</Text>
                <Icon name="chart-bell-curve-cumulative" size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.revenueValue}>Rs {stats.totalRevenue.toLocaleString()}</Text>

              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: '82%', backgroundColor: theme.colors.success }]} />
              </View>
              <View style={styles.progressFooter}>
                <Text style={styles.progressLabel}>Daily Target Reach: 82%</Text>
                <Text style={[styles.progressTrend, { color: theme.colors.success }]}>+12.4% ↑</Text>
              </View>
            </LinearGradient>
          </Card>
        </LinearGradient>

        <View style={styles.mainContent}>
          <Text style={styles.sectionTitle}>OPERATIONAL ANALYTICS</Text>

          <View style={styles.grid}>
            <MetricCard
              label="TOTAL INCIDENTS"
              value={stats.total}
              icon="shield-alert-outline"
              color={theme.colors.primary}
              bg="rgba(15, 23, 42, 0.08)"
            />
            <MetricCard
              label="PENDING ACTION"
              value={stats.pending}
              icon="timer-sand"
              color={theme.colors.warning}
              bg="rgba(245, 158, 11, 0.1)"
            />
            <MetricCard
              label="RESOLVED"
              value={stats.paid}
              icon="check-decagram-outline"
              color={theme.colors.success}
              bg="rgba(34, 197, 94, 0.1)"
            />
            <MetricCard
              label="VOIDED"
              value={stats.cancelled}
              icon="close-octagon-outline"
              color={theme.colors.error}
              bg="rgba(239, 68, 68, 0.1)"
            />
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 32 }]}>INFRASTRUCTURE NODES</Text>

          <View style={styles.assetRow}>
            <TouchableRipple
              style={styles.assetCard}
              onPress={() => navigation.navigate('Users')}
              borderless
            >
              <View style={styles.assetInner}>
                <Avatar.Icon size={42} icon="account-supervisor-circle" backgroundColor="rgba(15, 23, 42, 0.08)" color={theme.colors.primary} />
                <View style={styles.assetInfo}>
                  <Text style={styles.assetValue}>{stats.students}</Text>
                  <Text style={styles.assetLabel}>ENTITIES REGISTERED</Text>
                </View>
              </View>
            </TouchableRipple>

            <TouchableRipple
              style={styles.assetCard}
              onPress={() => navigation.navigate('LiveCam')}
              borderless
            >
              <View style={styles.assetInner}>
                <Avatar.Icon size={42} icon="cctv" backgroundColor="rgba(34, 197, 94, 0.08)" color={theme.colors.success} />
                <View style={styles.assetInfo}>
                  <Text style={styles.assetValue}>{stats.cameras}</Text>
                  <Text style={styles.assetLabel}>CAMERAS ONLINE</Text>
                </View>
              </View>
            </TouchableRipple>
          </View>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const MetricCard = ({ label, value, icon, color, bg }) => {
  const theme = useTheme();
  return (
    <Card style={styles.metricCard} elevation={2}>
      <View style={styles.metricCardInner}>
        <View style={[styles.iconBox, { backgroundColor: bg }]}>
          <Icon name={icon} size={28} color={color} />
        </View>
        <Text style={styles.metricVal}>{value}</Text>
        <Text style={styles.metricLab}>{label}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  loadingText: { color: '#6B7280', fontSize: 11, fontWeight: '800', marginTop: 16, letterSpacing: 2 },
  heroSection: { paddingTop: Platform.OS === 'ios' ? 70 : 60, paddingBottom: 50, paddingHorizontal: 20, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  logoutBtn: { backgroundColor: 'rgba(255, 255, 255, 0.1)', marginRight: 10 },
  welcomeText: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  titleText: { color: '#ffffff', fontSize: 32, fontWeight: '900', marginTop: 4 },
  statusBadge: { backgroundColor: 'rgba(255,255,255,0.15)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 24 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E', marginRight: 8 },
  statusText: { color: '#ffffff', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  revenueCard: { borderRadius: 32, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  revenueGradient: { padding: 24 },
  revenueHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  revenueLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '900', letterSpacing: 1.5 },
  revenueValue: { color: '#ffffff', fontSize: 38, fontWeight: '900' },
  progressContainer: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, marginTop: 24 },
  progressBar: { height: 8, borderRadius: 4 },
  progressFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  progressLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '700' },
  progressTrend: { fontSize: 11, fontWeight: '900' },
  mainContent: { padding: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '900', color: '#6B7280', letterSpacing: 2.5, marginBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  metricCard: { width: '48%', marginBottom: 16, borderRadius: 32, backgroundColor: '#FFFFFF' },
  metricCardInner: { padding: 24 },
  iconBox: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  metricVal: { fontSize: 32, fontWeight: '900', color: '#111827' },
  metricLab: { fontSize: 11, fontWeight: '800', color: '#6B7280', marginTop: 8, letterSpacing: 0.5 },
  assetRow: { flexDirection: 'row', gap: 16 },
  assetCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 32, overflow: 'hidden', borderWeight: 1, borderColor: '#E2E8F0' },
  assetInner: { padding: 20, alignItems: 'center', flexDirection: 'row' },
  assetInfo: { marginLeft: 16 },
  assetValue: { fontSize: 26, fontWeight: '900', color: '#111827' },
  assetLabel: { fontSize: 10, fontWeight: '900', color: '#6B7280', letterSpacing: 1 }
});

export default DashboardScreen;
