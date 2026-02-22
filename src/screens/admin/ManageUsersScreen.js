import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  Card,
  Text,
  Title,
  Button,
  FAB,
  ActivityIndicator,
  Dialog,
  Portal,
  Paragraph,
  Chip,
  Searchbar,
  SegmentedButtons,
} from 'react-native-paper';
import { getUsers } from '../../services/userService';
import { deleteUser } from '../../services/userService';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ManageUsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ visible: false, userId: null });
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const navigation = useNavigation();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter]);

  const loadUsers = async () => {
    try {
      const allUsers = await getUsers();
      // Filter out admin users from the list (admin manages others)
      const nonAdminUsers = allUsers.filter(user => user.role !== 'admin');
      setUsers(nonAdminUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.studentId?.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  };

  const handleDelete = async () => {
    if (deleteDialog.userId) {
      try {
        await deleteUser(deleteDialog.userId);
        await loadUsers();
        setDeleteDialog({ visible: false, userId: null });
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return '#F44336';
      case 'student':
        return '#2196F3';
      case 'guard':
        return '#4CAF50';
      case 'security_head':
        return '#FF9800';
      default:
        return '#666';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return 'admin-panel-settings';
      case 'student':
        return 'school';
      case 'guard':
        return 'security';
      case 'security_head':
        return 'supervisor-account';
      default:
        return 'person';
    }
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
      <View style={styles.filterContainer}>
        <Searchbar
          placeholder="Search users..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <SegmentedButtons
          value={roleFilter}
          onValueChange={setRoleFilter}
          buttons={[
            { value: 'all', label: 'All' },
            { value: 'student', label: 'Students' },
            { value: 'guard', label: 'Guards' },
            { value: 'security_head', label: 'Security Head' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>
      <ScrollView style={styles.scrollView}>
        {filteredUsers.length === 0 && !loading && (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>No users found</Text>
            </Card.Content>
          </Card>
        )}
        {filteredUsers.map((user) => (
          <Card key={user.id} style={styles.card}>
            <Card.Content>
              <View style={styles.userHeader}>
                <View style={styles.userInfo}>
                  <Icon
                    name={getRoleIcon(user.role)}
                    size={24}
                    color={getRoleColor(user.role)}
                  />
                  <View style={styles.userDetails}>
                    <Title>{user.name || user.email}</Title>
                    <Text style={styles.email}>{user.email}</Text>
                  </View>
                </View>
                <Chip
                  style={[styles.chip, { backgroundColor: getRoleColor(user.role) + '20' }]}
                  textStyle={{ color: getRoleColor(user.role) }}
                >
                  {user.role?.replace('_', ' ').toUpperCase()}
                </Chip>
              </View>
              {user.studentId && (
                <Paragraph style={styles.studentId}>
                  Student ID: {user.studentId}
                </Paragraph>
              )}
            </Card.Content>
            <Card.Actions>
              <Button
                onPress={() => navigation.navigate('EditUser', { userId: user.id })}
                textColor="#2196F3"
              >
                Edit
              </Button>
              <Button
                onPress={() => setDeleteDialog({ visible: true, userId: user.id })}
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
        onPress={() => navigation.navigate('AddUser')}
      />

      <Portal>
        <Dialog
          visible={deleteDialog.visible}
          onDismiss={() => setDeleteDialog({ visible: false, userId: null })}
        >
          <Dialog.Title>Delete User</Dialog.Title>
          <Dialog.Content>
            <Paragraph>Are you sure you want to delete this user?</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialog({ visible: false, userId: null })}>
              Cancel
            </Button>
            <Button onPress={handleDelete} textColor="#F44336">
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  segmentedButtons: {
    marginBottom: 8,
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
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  email: {
    color: '#666',
    fontSize: 12,
  },
  chip: {
    marginLeft: 8,
  },
  studentId: {
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

export default ManageUsersScreen;


