// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const saved = localStorage.getItem('userProfile');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed?.id === currentUser.id) {
              setProfile(parsed);
            } else {
              setProfile(null);
              localStorage.removeItem('userProfile');
            }
          } catch (e) {
            console.error('Invalid profile in localStorage', e);
            localStorage.removeItem('userProfile');
            setProfile(null);
          }
        }
      } else {
        setProfile(null);
        localStorage.removeItem('userProfile');
      }

      setLoading(false);
    });

    // 2. Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        const saved = localStorage.getItem('userProfile');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed?.id === currentUser.id) {
              setProfile(parsed);
            }
          } catch {}
        }
      } else {
        setProfile(null);
        localStorage.removeItem('userProfile');
      }

      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const value = {
    user,
    profile,
    isAuthenticated: !!user,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}