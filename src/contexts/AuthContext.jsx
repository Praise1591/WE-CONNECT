// contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../firebase';  // Make sure this path is correct
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId;
    
    console.log("Setting up auth listener...");
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth state changed:", firebaseUser?.uid || "No user");
      
      if (!isMounted) return;
      
      if (firebaseUser) {
        try {
          // Try to get profile from 'profiles' collection
          const profileRef = doc(db, 'profiles', firebaseUser.uid);
          const profileDoc = await getDoc(profileRef);
          
          if (profileDoc.exists()) {
            const profileData = profileDoc.data();
            console.log("Profile found:", profileData);
            setProfile({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: profileData.name || firebaseUser.displayName || 'User',
              role: profileData.role || 'student',
              photoURL: firebaseUser.photoURL || profileData.photoURL || null,
              coins: profileData.coins || 0,
              diamonds: profileData.diamonds || 0,
              school: profileData.school || '',
              department: profileData.department || '',
              specialization: profileData.specialization || '',
              title: profileData.title || '',
            });
            
            // Update localStorage for backup
            localStorage.setItem('userProfile', JSON.stringify({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: profileData.name || firebaseUser.displayName || 'User',
              role: profileData.role || 'student',
              photoURL: firebaseUser.photoURL || profileData.photoURL,
              coins: profileData.coins || 0,
              diamonds: profileData.diamonds || 0,
              school: profileData.school,
              department: profileData.department,
            }));
          } else {
            // Create default profile if it doesn't exist
            console.log("Creating default profile for user:", firebaseUser.uid);
            const defaultProfile = {
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email,
              role: 'student',
              photoURL: firebaseUser.photoURL || null,
              createdAt: serverTimestamp(),
              coins: 0,
              diamonds: 0,
            };
            
            await setDoc(profileRef, defaultProfile);
            
            setProfile({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: defaultProfile.name,
              role: defaultProfile.role,
              photoURL: defaultProfile.photoURL,
              coins: 0,
              diamonds: 0,
            });
            
            localStorage.setItem('userProfile', JSON.stringify({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: defaultProfile.name,
              role: defaultProfile.role,
              photoURL: defaultProfile.photoURL,
              coins: 0,
              diamonds: 0,
            }));
          }
          setUser(firebaseUser);
          setError(null);
        } catch (err) {
          console.error("Error fetching profile:", err);
          setError(err.message);
          // Still set basic user info even if profile fetch fails
          setUser(firebaseUser);
          setProfile({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'User',
            role: 'student',
            photoURL: firebaseUser.photoURL || null,
            coins: 0,
            diamonds: 0,
          });
        }
      } else {
        setUser(null);
        setProfile(null);
        // Clear localStorage when logged out
        localStorage.removeItem('userProfile');
      }
      
      if (isMounted) {
        setLoading(false);
      }
    }, (error) => {
      console.error("Auth state error:", error);
      setError(error.message);
      if (isMounted) {
        setLoading(false);
      }
    });

    // Timeout fallback to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (isMounted && loading) {
        console.warn("Auth loading timeout - checking localStorage for cached user");
        const cachedProfile = localStorage.getItem('userProfile');
        if (cachedProfile) {
          try {
            const cached = JSON.parse(cachedProfile);
            console.log("Using cached profile during timeout");
            setProfile(cached);
            setUser({ uid: cached.id, email: cached.email });
            setLoading(false);
          } catch (e) {
            console.error("Error parsing cached profile:", e);
            setLoading(false);
          }
        } else {
          console.warn("No cached profile, setting loading to false");
          setLoading(false);
        }
      }
    }, 8000);

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}