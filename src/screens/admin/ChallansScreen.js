import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Text,
  Title,
  Button,
  FAB,
  ActivityIndicator,
  Chip,
  Dialog,
  Portal,
  Paragraph,
  Searchbar,
  SegmentedButtons,
  Menu,
  Snackbar,
} from 'react-native-paper';
import { getChallans, deleteChallan } from '../../services/challanService';
import { getUserById } from '../../services/userService';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ChallansScreen = () => {
  const [challans, setChallans] = useState([]);
  const [filteredChallans, setFilteredChallans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ visible: false, challanId: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    loadChallans();
    const unsubscribe = navigation.addListener('focus', () => {
      loadChallans();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    filterAndSortChallans();
  }, [challans, searchQuery, statusFilter, sortBy]);

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

  const filterAndSortChallans = () => {
    let filtered = [...challans];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => 
        c.studentName?.toLowerCase().includes(query) ||
        c.studentId?.toLowerCase().includes(query) ||
        c.id?.toLowerCase().includes(query) ||
        c.location?.toLowerCase().includes(query)
      );
    }

    // Sort challans
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'amount':
          return (parseFloat(b.amount) || 0) - (parseFloat(a.amount) || 0);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'name':
          return (a.studentName || '').localeCompare(b.studentName || '');
        default:
          return 0;
      }
    });

    setFilteredChallans(filtered);
  };

  const handleDelete = async () => {
    if (deleteDialog.challanId) {
      try {
        await deleteChallan(deleteDialog.challanId);
        await loadChallans();
        setDeleteDialog({ visible: false, challanId: null });
        setSuccessMessage('Challan deleted successfully');
      } catch (error) {
        console.error('Error deleting challan:', error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#FF9800';
      case 'paid':
        return '#4CAF50';
      case 'cancelled':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filters and Search */}
      <View style={styles.filterContainer}>
        <Searchbar
          placeholder="Search challans..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <View style={styles.filterRow}>
          <SegmentedButtons
            value={statusFilter}
            onValueChange={setStatusFilter}
            buttons={[
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'paid', label: 'Paid' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            style={styles.segmentedButtons}
          />
          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setSortMenuVisible(true)}
                icon="sort"
                style={styles.sortButton}
              >
                Sort
              </Button>
            }
          >
            <Menu.Item onPress={() => { setSortBy('date'); setSortMenuVisible(false); }} title="Date (Newest)" />
            <Menu.Item onPress={() => { setSortBy('amount'); setSortMenuVisible(false); }} title="Amount (High)" />
            <Menu.Item onPress={() => { setSortBy('status'); setSortMenuVisible(false); }} title="Status" />
            <Menu.Item onPress={() => { setSortBy('name'); setSortMenuVisible(false); }} title="Student Name" />
          </Menu>
        </View>
        <Text variant="bodySmall" style={styles.resultCount}>
          {filteredChallans.length} challan{filteredChallans.length !== 1 ? 's' : ''} found
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {filteredChallans.length === 0 && !loading && (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>No challans found</Text>
            </Card.Content>
          </Card>
        )}
        {filteredChallans.map((challan) => (
          <Card key={challan.id} style={styles.card}>
            <Card.Content>
              <View style={styles.challanHeader}>
                <View style={styles.challanInfo}>
                  <Title>{challan.studentName || 'Unknown Student'}</Title>
                  <Text style={styles.challanId}>ID: {challan.id.substring(0, 8)}</Text>
                </View>
                <Chip
                  style={[styles.chip, { backgroundColor: getStatusColor(challan.status) + '20' }]}
                  textStyle={{ color: getStatusColor(challan.status) }}
                >
                  {challan.status?.toUpperCase()}
                </Chip>
              </View>
              <View style={styles.details}>
                <View style={styles.detailRow}>
                  <Icon name="attach-money" size={16} color="#666" />
                  <Text style={styles.detailText}>Amount: ₹{challan.amount || 0}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Icon name="calendar-today" size={16} color="#666" />
                  <Text style={styles.detailText}>Date: {formatDate(challan.createdAt)}</Text>
                </View>
                {challan.location && (
                  <View style={styles.detailRow}>
                    <Icon name="location-on" size={16} color="#666" />
                    <Text style={styles.detailText}>Location: {challan.location}</Text>
                  </View>
                )}
                {challan.description && (
                  <Paragraph style={styles.description}>{challan.description}</Paragraph>
                )}
              </View>
            </Card.Content>
            <Card.Actions>
              <Button
                onPress={() => navigation.navigate('EditChallan', { challan })}
              >
                Edit
              </Button>
              <Button
                onPress={() => setDeleteDialog({ visible: true, challanId: challan.id })}
                textColor="#F44336"
              >
                Delete
              </Button>
            </Card.Actions>
          </Card>
        ))}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateChallan')}
        label="New Challan"
      />

      <Portal>
        <Dialog
          visible={deleteDialog.visible}
          onDismiss={() => setDeleteDialog({ visible: false, challanId: null })}
        >
          <Dialog.Title>Delete Challan</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to delete this challan?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialog({ visible: false, challanId: null })}>
              Cancel
            </Button>
            <Button onPress={handleDelete} textColor="#F44336">
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar
        visible={!!successMessage}
        onDismiss={() => setSuccessMessage('')}
        duration={2000}
      >
        {successMessage}
      </Snackbar>
    </View>
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
  filterContainer: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  searchbar: {
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  segmentedButtons: {
    flex: 1,
    marginRight: 8,
  },
  sortButton: {
    minWidth: 100,
  },
  resultCount: {
    marginTop: 8,
    color: '#666',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  emptyCard: {
    marginTop: 20,
    elevation: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    padding: 20,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  challanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  challanInfo: {
    flex: 1,
  },
  challanId: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  chip: {
    marginLeft: 8,
  },
  details: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
  },
  description: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ChallansScreen;


