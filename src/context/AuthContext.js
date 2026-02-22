import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase is not configured, skip auth setup
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        // Fetch user role from Firestore - CRITICAL for RBAC
        if (db) {
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const role = userData.role;
              
              // Debug logging
              console.log('📄 User document found:');
              console.log('Document ID:', userDoc.id);
              console.log('User UID:', user.uid);
              console.log('User data:', JSON.stringify(userData, null, 2));
              console.log('Role value:', role);
              console.log('Role type:', typeof role);
              
              // Validate role is one of the allowed roles
              const validRoles = ['admin', 'student', 'guard', 'security_head'];
              
              // Normalize role (trim whitespace, convert to lowercase for comparison)
              const normalizedRole = role ? role.toString().trim().toLowerCase() : null;
              
              // Check if role exists and is valid
              if (!normalizedRole) {
                console.error('❌ Role field is missing or empty');
                console.error('Available fields:', Object.keys(userData));
                console.error('Field values:', userData);
                
                // Try to get role from AsyncStorage as fallback
                const storedRole = await AsyncStorage.getItem('userRole');
                if (storedRole && validRoles.includes(storedRole)) {
                  console.log('⚠️ Using stored role from AsyncStorage:', storedRole);
                  setUserRole(storedRole);
                } else {
                  setUserRole(null);
                }
              } else if (validRoles.includes(normalizedRole)) {
                // Role is valid - use the original value (preserve case)
                const actualRole = validRoles.find(r => r === normalizedRole);
                setUserRole(actualRole);
                await AsyncStorage.setItem('userRole', actualRole);
                console.log('✅ User role loaded successfully:', actualRole);
              } else {
                // Invalid role - but don't sign out, show error
                console.error('❌ Invalid user role:', role);
                console.error('Normalized role:', normalizedRole);
                console.error('Expected one of:', validRoles);
                console.error('Full user data:', userData);
                
                // Check if it's a case/whitespace issue
                if (role && role.toString().toLowerCase().includes('admin')) {
                  console.error('⚠️ Role contains "admin" but format is wrong. Expected: "admin"');
                }
                
                setUserRole(null);
                // Don't sign out - let user see the error message
              }
            } else {
              // User document doesn't exist in Firestore
              // This is likely the issue - admin user needs to be created in Firestore
              console.error('❌ User document not found in Firestore');
              console.error('User UID:', user.uid);
              console.error('User Email:', user.email);
              console.error('⚠️ Please create a user document in Firestore with role="admin"');
              setUserRole(null);
              // Don't sign out - let user see the error message
            }
          } catch (error) {
            console.error('❌ Error fetching user role:', error);
            console.error('Error details:', error.message);
            setUserRole(null);
          }
        } else {
          console.error('❌ Firestore database not initialized');
          setUserRole(null);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        await AsyncStorage.removeItem('userRole');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshUserRole = async () => {
    if (!auth || !db || !currentUser) {
      console.error('Cannot refresh role: Firebase or user not available');
      return;
    }

    try {
      console.log('🔄 Manually refreshing user role...');
      setLoading(true);
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;
        
        console.log('📄 Refresh - User document found:');
        console.log('Document ID:', userDoc.id);
        console.log('User UID:', currentUser.uid);
        console.log('User data:', JSON.stringify(userData, null, 2));
        console.log('Role value:', role);
        console.log('Role type:', typeof role);
        
        const validRoles = ['admin', 'student', 'guard', 'security_head'];
        const normalizedRole = role ? role.toString().trim().toLowerCase() : null;
        
        if (!normalizedRole) {
          console.error('❌ Refresh - Role field is missing or empty');
          setUserRole(null);
        } else if (validRoles.includes(normalizedRole)) {
          const actualRole = validRoles.find(r => r === normalizedRole);
          setUserRole(actualRole);
          await AsyncStorage.setItem('userRole', actualRole);
          console.log('✅ Refresh - User role loaded successfully:', actualRole);
        } else {
          console.error('❌ Refresh - Invalid user role:', role);
          setUserRole(null);
        }
      } else {
        console.error('❌ Refresh - User document not found in Firestore');
        console.error('User UID:', currentUser.uid);
        setUserRole(null);
      }
    } catch (error) {
      console.error('❌ Refresh - Error fetching user role:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Check for permission errors
      if (error.code === 'permission-denied') {
        console.error('⚠️ Firestore permission denied. Check your Firestore security rules.');
      }
      
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    currentUser,
    userRole,
    loading,
    logout,
    refreshUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


