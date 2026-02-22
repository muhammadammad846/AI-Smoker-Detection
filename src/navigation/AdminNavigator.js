import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DashboardScreen from '../screens/admin/DashboardScreen';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';
import ChallansScreen from '../screens/admin/ChallansScreen';
import LiveCameraScreen from '../screens/admin/LiveCameraScreen';
import AddUserScreen from '../screens/admin/AddUserScreen';
import EditChallanScreen from '../screens/admin/EditChallanScreen';
import EditUserScreen from '../screens/admin/EditUserScreen';
import CreateChallanScreen from '../screens/admin/CreateChallanScreen';
import AddCameraScreen from '../screens/admin/AddCameraScreen';
import { useAuth } from '../context/AuthContext';
import { TouchableOpacity } from 'react-native';
import { logout } from '../services/authService';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const AdminTabs = () => {
  const { logout: authLogout } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') {
            iconName = 'dashboard';
          } else if (route.name === 'Users') {
            iconName = 'people';
          } else if (route.name === 'Challans') {
            iconName = 'receipt';
          } else if (route.name === 'LiveCam') {
            iconName = 'camera-alt';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerRight: () => (
          <TouchableOpacity
            onPress={authLogout}
            style={{ marginRight: 15 }}
          >
            <Icon name="logout" size={24} color="#2196F3" />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Users" component={ManageUsersScreen} />
      <Tab.Screen name="Challans" component={ChallansScreen} />
      <Tab.Screen name="LiveCam" component={LiveCameraScreen} />
    </Tab.Navigator>
  );
};

const AdminNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="AdminTabs" 
        component={AdminTabs} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddUser" 
        component={AddUserScreen}
        options={{ title: 'Add User' }}
      />
      <Stack.Screen 
        name="EditChallan" 
        component={EditChallanScreen}
        options={{ title: 'Edit Challan' }}
      />
      <Stack.Screen 
        name="EditUser" 
        component={EditUserScreen}
        options={{ title: 'Edit User' }}
      />
      <Stack.Screen 
        name="CreateChallan" 
        component={CreateChallanScreen}
        options={{ title: 'Create Challan' }}
      />
      <Stack.Screen
        name="AddCamera"
        component={AddCameraScreen}
        options={{ title: 'Add Camera' }}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;


