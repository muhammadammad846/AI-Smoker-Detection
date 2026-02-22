import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const createChallan = async (challanData) => {
  try {
    const docRef = await addDoc(collection(db, 'challans'), {
      ...challanData,
      createdAt: new Date().toISOString(),
      status: 'pending',
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getChallans = async (filters = {}) => {
  try {
    let q = collection(db, 'challans');
    
    if (filters.studentId) {
      q = query(q, where('studentId', '==', filters.studentId));
    }
    
    const querySnapshot = await getDocs(q);
    const challans = [];
    querySnapshot.forEach((doc) => {
      challans.push({ id: doc.id, ...doc.data() });
    });
    
    return challans;
  } catch (error) {
    throw error;
  }
};

export const updateChallan = async (challanId, updates) => {
  try {
    await updateDoc(doc(db, 'challans', challanId), {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    throw error;
  }
};

export const deleteChallan = async (challanId) => {
  try {
    await deleteDoc(doc(db, 'challans', challanId));
  } catch (error) {
    throw error;
  }
};

export const getChallanById = async (challanId) => {
  try {
    const docSnap = await getDoc(doc(db, 'challans', challanId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    throw error;
  }
};












