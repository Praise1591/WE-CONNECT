// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user?.email || "No user");
      setCurrentUser(user);
      setLoading(true);
      
      if (user) {
        try {
          // First check localStorage for cached profile
          const cachedProfile = localStorage.getItem('userProfile');
          if (cachedProfile) {
            const parsedProfile = JSON.parse(cachedProfile);
            if (parsedProfile.id === user.uid) {
              setUserProfile(parsedProfile);
            }
          }
          
          // Then fetch from Firestore to ensure latest data
          const profileRef = doc(db, 'profiles', user.uid);
          const profileDoc = await getDoc(profileRef);
          
          if (profileDoc.exists()) {
            const profileData = profileDoc.data();
            const userProfileData = {
              id: user.uid,
              email: user.email,
              name: profileData.name || user.displayName || 'User',
              role: profileData.role || 'student',
              photoURL: user.photoURL || profileData.photoURL,
              coins: profileData.coins || 0,
              diamonds: profileData.diamonds || 0,
              school: profileData.school,
              department: profileData.department,
              ...profileData
            };
            setUserProfile(userProfileData);
            localStorage.setItem('userProfile', JSON.stringify(userProfileData));
          } else {
            // Create a basic profile if it doesn't exist
            const basicProfile = {
              id: user.uid,
              email: user.email,
              name: user.displayName || user.email?.split('@')[0] || 'User',
              role: 'student',
              photoURL: user.photoURL,
              coins: 0,
              diamonds: 0,
            };
            setUserProfile(basicProfile);
            localStorage.setItem('userProfile', JSON.stringify(basicProfile));
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          const fallbackProfile = {
            id: user.uid,
            email: user.email,
            name: user.displayName || user.email?.split('@')[0] || 'User',
            role: 'student',
            coins: 0,
            diamonds: 0,
          };
          setUserProfile(fallbackProfile);
          localStorage.setItem('userProfile', JSON.stringify(fallbackProfile));
        }
      } else {
        setUserProfile(null);
        localStorage.removeItem('userProfile');
      }
      
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error("Auth state error:", err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      localStorage.removeItem('userProfile');
      console.log("User signed out successfully");
      return true;
    } catch (err) {
      console.error("Sign out error:", err);
      setError(err.message);
      return false;
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    isAuthenticated: !!currentUser,  // ADD THIS LINE - Important!
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}