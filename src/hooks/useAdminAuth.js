// hooks/useAdminAuth.js
import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

const ADMIN_EMAIL = 'weconnect159@gmail.com';

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setError(null);
    try {
      // Use Firebase Auth for admin login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (user.email === ADMIN_EMAIL) {
        localStorage.setItem('adminAuthenticated', 'true');
        localStorage.setItem('adminEmail', user.email);
        setIsAdmin(true);
        return true;
      } else {
        await signOut(auth);
        throw new Error('Not authorized as admin');
      }
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminEmail');
    setIsAdmin(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const adminAuth = localStorage.getItem('adminAuthenticated');
      if (adminAuth === 'true') {
        // Check if Firebase user is still logged in
        const user = auth.currentUser;
        if (user && user.email === ADMIN_EMAIL) {
          setIsAdmin(true);
        } else {
          // Clean up inconsistent state
          localStorage.removeItem('adminAuthenticated');
          setIsAdmin(false);
        }
      }
      setLoading(false);
    };
    
    // Subscribe to auth state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    
    checkAuth();
    return () => unsubscribe();
  }, []);

  return { isAdmin, loading, error, login, logout };
};