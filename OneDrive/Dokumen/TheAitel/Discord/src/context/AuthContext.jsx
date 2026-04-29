import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        const isAdminEmail = firebaseUser.email === 'ramsiva97465@gmail.com';

        if (!userDoc.exists()) {
          // Check if there's a pre-authorized document with this email as ID
          const emailDocRef = doc(db, 'users', firebaseUser.email.toLowerCase());
          const emailDoc = await getDoc(emailDocRef);
          
          let role = isAdminEmail ? 'admin' : 'unassigned';
          let status = 'active';
          let displayName = firebaseUser.displayName || '';

          if (emailDoc.exists()) {
            const preAuthData = emailDoc.data();
            role = preAuthData.role || role;
            status = preAuthData.status || status;
            displayName = preAuthData.displayName || displayName;
            
            // Delete the temporary email-based doc
            const { deleteDoc } = await import('firebase/firestore');
            await deleteDoc(emailDocRef);
          }

          const newUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName,
            photoURL: firebaseUser.photoURL || '',
            authProvider: firebaseUser.providerData[0]?.providerId || 'password',
            role,
            status,
            createdAt: serverTimestamp(),
          };
          await setDoc(userDocRef, newUser);
          setUser({ ...newUser, createdAt: new Date() });
        } else {
          const existingData = userDoc.data();
          // Ensure admin email always has admin role and active status
          if (isAdminEmail && (existingData.role !== 'admin' || existingData.status !== 'active')) {
            await setDoc(userDocRef, { role: 'admin', status: 'active' }, { merge: true });
            setUser({ ...existingData, role: 'admin', status: 'active' });
          } else {
            setUser(existingData);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  
  const signup = async (email, password, displayName) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(res.user, { displayName });
    return res;
  };

  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
