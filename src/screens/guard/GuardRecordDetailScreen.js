import React from 'react';
import { View, StyleSheet, ScrollView, Image, StatusBar, Platform } from 'react-native';
import { Card, Text, Button, useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { getProofImageUrl } from '../../services/detectionService';
import { formatChallanDate, getStatusColor } from '../../utils/challanUtils';

const GuardRecordDetailScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { challan } = route.params || {};
  const proofUrl = getProofImageUrl(challan);
  const statusColor = getStatusColor(challan?.status, theme.colors);

  if (!challan) {
    return (
      <View style={styles.center}>
        <Icon name="alert-decagram-outline" size={72} color="#ef4444" />
        <Text style={styles.emptyText}>NO RECORD SELECTED</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.emptyAction}>
          RETURN TO ALERTS
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#020617', '#1f2937']} style={styles.header}>
          <View style={styles.navRow}>
            <Button
              mode="contained"
              icon="chevron-left"
              compact
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              buttonColor="rgba(255,255,255,0.16)"
              labelStyle={styles.backLabel}
            >
              BACK
            </Button>
            <Text style={styles.title}>SYSTEM RECORD</Text>
            <View style={{ width: 76 }} />
          </View>
        </LinearGradient>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <View style={styles.statusRow}>
              <Text style={styles.recordLabel}>ALERT ID</Text>
              <Text style={[styles.statusValue, { color: statusColor }]}>{challan.status?.toUpperCase() || 'UNKNOWN'}</Text>
            </View>
            <Text style={styles.recordHeading}>Captured violation details</Text>
            <Text style={styles.recordText}>{challan.description || 'This record was generated from the guard system and contains the current challan enforcement details.'}</Text>
            <View style={styles.metaGrid}>
              <MetaItem label="CHALLAN REF" value={challan.id || 'N/A'} />
              <MetaItem label="ISSUED" value={formatChallanDate(challan.createdAt, true)} />
              <MetaItem label="LOCATION" value={challan.location || 'UNKNOWN'} />
              <MetaItem label="AMOUNT" value={`₨ ${challan.amount || 0}`} />
            </View>
          </Card.Content>
        </Card>

        {proofUrl ? (
          <Card style={styles.imageCard}>
            <Image source={{ uri: proofUrl }} style={styles.image} />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageTag}>EVIDENCE PREVIEW</Text>
            </View>
          </Card>
        ) : (
          <Card style={styles.noImageCard}>
            <Card.Content style={styles.noImageContent}>
              <Icon name="image-off-outline" size={48} color="#94a3b8" />
              <Text style={styles.noImageText}>No visual evidence is attached to this record.</Text>
            </Card.Content>
          </Card>
        )}

        <Card style={styles.detailsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>STUDENT DETAILS</Text>
            <DetailRow label="Student" value={challan.studentName || 'UNKNOWN'} />
            <DetailRow label="Student UID" value={challan.studentId || 'N/A'} />
            <DetailRow label="Status" value={challan.status?.toUpperCase() || 'N/A'} />
            <DetailRow label="Evidence" value={proofUrl ? 'Available' : 'Not available'} />
          </Card.Content>
        </Card>

        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.closeButton} contentStyle={styles.closeButtonContent}>
          BACK TO ALERTS
        </Button>
      </ScrollView>
    </View>
  );
};

const MetaItem = ({ label, value }) => (
  <View style={styles.metaItem}>
    <Text style={styles.metaLabel}>{label}</Text>
    <Text style={styles.metaValue}>{value || 'N/A'}</Text>
  </View>
);

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 40 },
  header: { paddingTop: Platform.OS === 'ios' ? 70 : 60, paddingBottom: 26, paddingHorizontal: 20, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButton: { borderRadius: 18, minWidth: 96 },
  backLabel: { fontSize: 12, fontWeight: '900' },
  title: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 1.5 },
  summaryCard: { marginHorizontal: 20, marginTop: -30, borderRadius: 28, backgroundColor: '#FFFFFF', elevation: 3 },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  recordLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '900', letterSpacing: 1.2 },
  statusValue: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  recordHeading: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 10 },
  recordText: { fontSize: 13, color: '#475569', lineHeight: 20 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 18, gap: 12 },
  metaItem: { width: '50%', marginBottom: 12 },
  metaLabel: { fontSize: 9, color: '#94a3b8', fontWeight: '900', letterSpacing: 1 },
  metaValue: { fontSize: 13, color: '#0F172A', fontWeight: '900', marginTop: 4 },
  imageCard: { marginHorizontal: 20, marginTop: 20, borderRadius: 28, overflow: 'hidden', backgroundColor: '#000' },
  image: { width: '100%', height: 220 },
  imageOverlay: { position: 'absolute', bottom: 12, left: 12, backgroundColor: 'rgba(15, 23, 42, 0.8)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  imageTag: { color: '#FFFFFF', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  noImageCard: { marginHorizontal: 20, marginTop: 20, borderRadius: 28, backgroundColor: '#FFFFFF', elevation: 3 },
  noImageContent: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  noImageText: { marginTop: 12, fontSize: 12, color: '#94a3b8', textAlign: 'center', lineHeight: 18 },
  detailsCard: { marginHorizontal: 20, marginTop: 20, borderRadius: 28, backgroundColor: '#FFFFFF', elevation: 3 },
  sectionTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, color: '#64748B', marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  detailLabel: { fontSize: 11, color: '#94a3b8', fontWeight: '900' },
  detailValue: { fontSize: 13, color: '#0F172A', fontWeight: '900', textAlign: 'right', maxWidth: '60%' },
  closeButton: { marginHorizontal: 20, marginTop: 24, borderRadius: 20, backgroundColor: '#0F172A' },
  closeButtonContent: { height: 56 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#0F172A', fontWeight: '900', letterSpacing: 1 },
  emptyAction: { marginTop: 24, borderRadius: 20 },
});

export default GuardRecordDetailScreen;
