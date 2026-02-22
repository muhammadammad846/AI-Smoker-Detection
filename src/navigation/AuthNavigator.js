import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import AdminLoginScreen from '../screens/auth/AdminLoginScreen';
import StudentLoginScreen from '../screens/auth/StudentLoginScreen';
import GuardLoginScreen from '../screens/auth/GuardLoginScreen';
import SecurityHeadLoginScreen from '../screens/auth/SecurityHeadLoginScreen';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {currentUser ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
          <Stack.Screen name="StudentLogin" component={StudentLoginScreen} />
          <Stack.Screen name="GuardLogin" component={GuardLoginScreen} />
          <Stack.Screen name="SecurityHeadLogin" component={SecurityHeadLoginScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AuthNavigator;


