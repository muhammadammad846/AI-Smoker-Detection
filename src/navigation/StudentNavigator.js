import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MyChallansScreen from '../screens/student/MyChallansScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import { useAuth } from '../context/AuthContext';
import { TouchableOpacity } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const StudentTabs = () => {
  const { logout } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'MyChallans') {
            iconName = 'receipt';
          } else if (route.name === 'Profile') {
            iconName = 'person';
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
        name="MyChallans" 
        component={MyChallansScreen}
        options={{ title: 'My Challans' }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const StudentNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="StudentTabs" 
        component={StudentTabs} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default StudentNavigator;












