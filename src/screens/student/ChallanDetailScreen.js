import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Platform } from 'react-native';
import { Card, Text, Button, Avatar, useTheme, Snackbar } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { getProofImageUrl } from '../../services/detectionService';
import { updateChallan } from '../../services/challanService';
import { formatChallanDate, getStatusColor } from '../../utils/challanUtils';

const QR_SIZE = 21;
const buildQrPattern = (value) => {
  const matrix = [];
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 1000000007;
  }

  for (let row = 0; row < QR_SIZE; row += 1) {
    const rowCells = [];
    for (let col = 0; col < QR_SIZE; col += 1) {
      const isFinder = (row < 4 && col < 4) || (row < 4 && col > QR_SIZE - 5) || (row > QR_SIZE - 5 && col < 4);
      if (isFinder) {
        rowCells.push(true);
      } else {
        hash = (hash * 13 + row * 29 + col * 7) % 997;
        rowCells.push(hash % 2 === 0);
      }
    }
    matrix.push(rowCells);
  }
  return matrix;
};

const QrCodeBlock = ({ value }) => {
  const matrix = useMemo(() => buildQrPattern(value), [value]);
  return (
    <View style={styles.qrBlock}>
      {matrix.map((row, rowIndex) => (
        <View style={styles.qrRow} key={`row-${rowIndex}`}>
          {row.map((filled, colIndex) => (
            <View
              key={`cell-${rowIndex}-${colIndex}`}
              style={[styles.qrCell, { backgroundColor: filled ? '#0F172A' : '#F8FAFC' }]}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const ChallanDetailScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const { challan } = route.params || {};
  const [status, setStatus] = useState(challan?.status || 'pending');
  const [paying, setPaying] = useState(false);
  const [message, setMessage] = useState('');

  const proofUrl = getProofImageUrl(challan);
  const statusColor = getStatusColor(status, theme.colors);
  const reason = challan?.description || 'The AI surveillance system detected smoking behavior in your area and generated a fine based on the incident evidence.';
  const qrValue = `challan:${challan?.id}|amount:${challan?.amount}|status:${status}`;

  const handlePay = async () => {
    if (!challan || status === 'paid') return;
    setPaying(true);
    try {
      await updateChallan(challan.id, { status: 'paid', paidAt: new Date().toISOString() });
      setStatus('paid');
      setMessage('Payment confirmed. Your challan has been marked paid.');
    } catch (error) {
      setMessage('Payment failed. Please try again later.');
      console.error('Challan payment error:', error);
    } finally {
      setPaying(false);
    }
  };

  if (!challan) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>NO CHALLAN DATA</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.emptyButton}>
          RETURN
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.header}>
          <View style={styles.headerRow}>
            <Button
              mode="contained"
              icon="chevron-left"
              onPress={() => navigation.goBack()}
              compact
              style={styles.backButtonTop}
              buttonColor="rgba(255,255,255,0.16)"
              labelStyle={styles.backButtonLabel}
            >
              BACK
            </Button>
            <Text style={styles.headerTitle}>CHALLAN DOSSIER</Text>
            <View style={{ width: 64 }} />
          </View>
        </LinearGradient>

        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.statusChip}>
              <Text style={[styles.statusChipText, { color: statusColor }]}>{status.toUpperCase()}</Text>
            </View>
            <Text style={styles.cardHeading}>Reason for this challan</Text>
            <Text style={styles.cardBodyText}>{reason}</Text>
            <Text style={styles.sectionTitle}>Incident details</Text>
            <DetailRow label="Challan ID" value={challan.id} />
            <DetailRow label="Issued on" value={formatChallanDate(challan.createdAt)} />
            <DetailRow label="Location" value={challan.location || 'UNKNOWN'} />
            <DetailRow label="Amount" value={`₨ ${challan.amount || 0}`} />
            <DetailRow label="Student" value={challan.studentName || 'Your account'} />
          </Card.Content>
        </Card>

        <Card style={styles.evidenceCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Evidence preview</Text>
            {proofUrl ? (
              <View style={styles.proofImageWrap}>
                <Avatar.Image size={120} source={{ uri: proofUrl }} style={styles.proofAvatar} />
              </View>
            ) : (
              <View style={styles.noProofBox}>
                <Icon name="image-off-outline" size={44} color="#94A3B8" />
                <Text style={styles.noProofText}>No visual proof available for this challan.</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.qrCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Payment QR Code</Text>
            <Text style={styles.qrHint}>Scan this QR code to settle the fine quickly.</Text>
            <QrCodeBlock value={qrValue} />
            <Text style={styles.qrReference}>Reference: {challan.id}</Text>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handlePay}
          loading={paying}
          disabled={status === 'paid'}
          style={[styles.payButton, status === 'paid' && styles.paidButton]}
          contentStyle={styles.payButtonContent}
        >
          {status === 'paid' ? 'ALREADY PAID' : 'PAY NOW'}
        </Button>

        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.closeButton}>
          CLOSE
        </Button>
      </ScrollView>
      <Snackbar visible={!!message} onDismiss={() => setMessage('')} duration={3000}>
        {message}
      </Snackbar>
    </View>
  );
};

const DetailRow = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingBottom: 40 },
  header: { paddingTop: Platform.OS === 'ios' ? 70 : 60, paddingBottom: 28, paddingHorizontal: 20, borderBottomLeftRadius: 36, borderBottomRightRadius: 36 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  backButtonTop: { borderRadius: 18, minWidth: 90 },
  backButtonLabel: { fontSize: 12, fontWeight: '900' },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  card: { marginHorizontal: 20, marginTop: -30, borderRadius: 28, paddingVertical: 24, paddingHorizontal: 20, backgroundColor: '#FFFFFF', elevation: 3 },
  statusChip: { alignSelf: 'flex-start', backgroundColor: 'rgba(15, 23, 42, 0.06)', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 18, marginBottom: 16 },
  statusChipText: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  cardHeading: { fontSize: 16, fontWeight: '900', color: '#0F172A', marginBottom: 10 },
  cardBodyText: { fontSize: 14, color: '#475569', lineHeight: 22 },
  sectionTitle: { fontSize: 12, color: '#64748B', fontWeight: '900', letterSpacing: 1.5, marginTop: 20, marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  detailLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '700' },
  detailValue: { fontSize: 13, color: '#0F172A', fontWeight: '900', maxWidth: '60%', textAlign: 'right' },
  evidenceCard: { marginHorizontal: 20, marginTop: 16, borderRadius: 28, backgroundColor: '#FFFFFF', elevation: 3 },
  proofImageWrap: { alignItems: 'center', paddingVertical: 20 },
  proofAvatar: { backgroundColor: '#F8FAFC' },
  noProofBox: { alignItems: 'center', justifyContent: 'center', padding: 28, borderRadius: 20, backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' },
  noProofText: { marginTop: 12, fontSize: 12, color: '#94A3B8', fontWeight: '700', textAlign: 'center' },
  qrCard: { marginHorizontal: 20, marginTop: 16, borderRadius: 28, backgroundColor: '#FFFFFF', elevation: 3 },
  qrHint: { fontSize: 12, color: '#64748B', lineHeight: 18, marginBottom: 16 },
  qrBlock: { alignSelf: 'center', width: 240, aspectRatio: 1, padding: 8, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 14 },
  qrRow: { flex: 1, flexDirection: 'row' },
  qrCell: { flex: 1, margin: 1, borderRadius: 2 },
  qrReference: { fontSize: 11, color: '#94A3B8', marginTop: 8, textAlign: 'center', letterSpacing: 0.5 },
  payButton: { marginHorizontal: 20, marginTop: 24, borderRadius: 20, backgroundColor: '#0F172A' },
  paidButton: { backgroundColor: '#94A3B8' },
  payButtonContent: { height: 56 },
  closeButton: { marginHorizontal: 20, marginTop: 12, borderRadius: 20, borderColor: '#0F172A' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginBottom: 20 },
  emptyButton: { minWidth: 160, borderRadius: 18 },
});

export default ChallanDetailScreen;
