import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import GuardsActivityScreen from '../screens/securityhead/GuardsActivityScreen';
import ChallansScreen from '../screens/securityhead/ChallansScreen';
import { useAuth } from '../context/AuthContext';
import { TouchableOpacity } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const SecurityHeadTabs = () => {
  const { logout } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Guards') {
            iconName = 'security';
          } else if (route.name === 'Challans') {
            iconName = 'receipt';
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
        name="Guards" 
        component={GuardsActivityScreen}
        options={{ title: 'Guards Activity' }}
      />
      <Tab.Screen 
        name="Challans" 
        component={ChallansScreen}
        options={{ title: 'All Challans' }}
      />
    </Tab.Navigator>
  );
};

const SecurityHeadNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="SecurityHeadTabs" 
        component={SecurityHeadTabs} 
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default SecurityHeadNavigator;












