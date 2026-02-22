import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ChallansListScreen from '../screens/guard/ChallansListScreen';
import CaughtStudentsScreen from '../screens/guard/CaughtStudentsScreen';
import LiveCameraScreen from '../screens/guard/LiveCameraScreen';
import { useAuth } from '../context/AuthContext';
import { TouchableOpacity } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const GuardTabs = () => {
  const { logout } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Challans') {
            iconName = 'receipt';
          } else if (route.name === 'Caught') {
            iconName = 'warning';
          } else if (route.name === 'LiveCam') {
            iconName = 'camera-alt';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerRight: () => (
          <TouchableOpacity
            onPress={logout}
            style={{ marginRight: 15 }}
          >
            <Icon name="logout" size={24} color="#2196F3" />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen 
        name="Challans" 
        component={ChallansListScreen}
        options={{ title: 'Challans' }}
      />
      <Tab.Screen 
        name="Caught" 
        component={CaughtStudentsScreen}
        options={{ title: 'Caught Students' }}
      />
      <Tab.Screen 
        name="LiveCam" 
        component={LiveCameraScreen}
        options={{ title: 'Live Camera' }}
      />
    </Tab.Navigator>
  );
};

const GuardNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="GuardTabs" 
        component={GuardTabs} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default GuardNavigator;


