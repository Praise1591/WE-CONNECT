// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase'; // ← your firebase.js file
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Fetch or create profile
        try {
          const profileRef = doc(db, 'users', firebaseUser.uid); // or 'profiles'
          const profileSnap = await getDoc(profileRef);

          if (profileSnap.exists()) {
            setProfile(profileSnap.data());
          } else {
            // Auto-create minimal profile on first sign-in
            const defaultProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              createdAt: new Date().toISOString(),
              // Add any other fields your app needs
            };
            await setDoc(profileRef, defaultProfile);
            setProfile(defaultProfile);
          }
        } catch (err) {
          console.error("Profile init error:", err);
          // You can show a toast here if desired
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    profile,
    loading,
    signInWithEmail: (email, password) => 
      signInWithEmailAndPassword(auth, email, password),
    signUpWithEmail: (email, password) => 
      createUserWithEmailAndPassword(auth, email, password),
    signInWithGoogle: () => {
      const provider = new GoogleAuthProvider();
      return signInWithPopup(auth, provider);
    },
    logout: () => signOut(auth),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};