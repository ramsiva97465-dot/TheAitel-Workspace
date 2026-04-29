import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';

/**
 * Fetches all registered users from Firestore.
 */
export const fetchAllUsers = async () => {
  try {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching users: ", error);
    throw error;
  }
};

/**
 * Updates a user's role in Firestore.
 */
export const updateUserRole = async (userId, newRole) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { role: newRole });
  } catch (error) {
    console.error("Error updating user role: ", error);
    throw error;
  }
};

/**
 * Updates a user's status in Firestore.
 */
export const updateUserStatus = async (userId, newStatus) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, { status: newStatus });
  } catch (error) {
    console.error("Error updating user status: ", error);
    throw error;
  }
};

/**
 * Deletes a user document from Firestore.
 */
export const deleteUser = async (userId) => {
  try {
    const { deleteDoc } = await import('firebase/firestore');
    const userDocRef = doc(db, 'users', userId);
    await deleteDoc(userDocRef);
  } catch (error) {
    console.error("Error deleting user: ", error);
    throw error;
  }
};

/**
 * Pre-authorizes a user by creating a document with their email.
 */
export const preCreateUser = async (userData) => {
  try {
    const { setDoc } = await import('firebase/firestore');
    // Use email as a temporary ID for pre-authorization
    const userDocRef = doc(db, 'users', userData.email.toLowerCase());
    await setDoc(userDocRef, {
      ...userData,
      email: userData.email.toLowerCase(),
      status: 'active',
      createdAt: new Date(),
      isPreAuthorized: true
    });
  } catch (error) {
    console.error("Error pre-creating user: ", error);
    throw error;
  }
};
