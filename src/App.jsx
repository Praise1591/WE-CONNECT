// App.jsx — FINAL WORKING VERSION with Landing page + Protected Routes
import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom'; // Added Outlet
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Material from './components/Dashboard/Material';
import Favorites from './components/Dashboard/Favorites';
import SettingsPage from './components/Dashboard/SettingsPage';
import Connect from './components/Dashboard/Connect';
import Notification from './components/Dashboard/Notifications';
import DownloadsPage from './components/Dashboard/DownloadsPage';
import MonetaryValue from './components/Dashboard/MonetaryValue';
import About from './components/Dashboard/About';
import UploadsData from './components/Dashboard/UploadsData';
import Landing from './pages/Landing'; // Your new landing page

import { auth } from '@/firebase';

// ── Auth Context ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);           // Firebase user object
  const [profile, setProfile] = useState(null);     // Parsed from localStorage
  const [loading, setLoading] = useState(true);     // Initial auth check

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Load profile from localStorage (set during login/signup)
        const saved = localStorage.getItem('userProfile');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            // Basic validation: ensure it matches current user
            if (parsed?.uid === firebaseUser.uid) {
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
        } else {
          setProfile(null);
        }
      } else {
        setProfile(null);
        localStorage.removeItem('userProfile');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = { user, profile, isAuthenticated: !!user && !!profile, loading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Helper hook
function useAuth() {
  return useContext(AuthContext);
}

// Protected Route component (updated to wrap nested routes)
function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated && window.location.pathname !== '/') {
      navigate('/', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg font-medium text-slate-700 dark:text-slate-300">
          Verifying session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <Outlet /> {/* This renders the child routes (e.g., Dashboard, Materials) */}
    </DashboardLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <Routes>
            {/* Public landing page - shown when not logged in */}
            <Route path="/" element={<Landing />} />

            {/* Protected routes now nested under /dashboard with shared layout */}
            <Route element={<ProtectedLayout />}>
              <Route path="dashboard" element={<Dashboard />} index /> {/* index makes /dashboard default to Dashboard */}
              <Route path="materials" element={<Material />} />
              <Route path="upload" element={<UploadsData />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="connect" element={<Connect />} />
              <Route path="notifications" element={<Notification />} />
              <Route path="downloads" element={<DownloadsPage />} />
              <Route path="monetary" element={<MonetaryValue />} />
              <Route path="about" element={<About />} />
            </Route>

            {/* Catch-all - redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <ToastContainer position="bottom-right" theme="colored" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Shared layout wrapper for all protected pages (updated to include children via Outlet)
function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        isMobileOpen={mobileMenuOpen}
        onMobileClose={toggleMobileMenu}
      />

      {/* Main content area */}
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          onMobileMenuToggle={toggleMobileMenu}
        />
        <main className="p-6">
          <Outlet /> {/* Render nested route content here */}
        </main>
      </div>
    </div>
  );
}

export default App;