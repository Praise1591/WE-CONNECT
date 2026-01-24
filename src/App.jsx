// App.jsx — FINAL WORKING VERSION with Landing page + Protected Routes
// Improved responsiveness for mobile, tablet & desktop

import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
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
import Landing from './pages/Landing';

import { auth } from '@/firebase';

// ── Error Boundary Component ─────────────────────────────────────────────────
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught in About:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="max-w-md sm:max-w-lg text-center rounded-xl bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-xl sm:shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4 sm:mb-6 text-sm sm:text-base">
              We're sorry — an error occurred. Our team has been notified.
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 sm:mb-8">
              Error: {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 sm:px-8 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md text-sm sm:text-base"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ── Auth Context ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const saved = localStorage.getItem('userProfile');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
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

function useAuth() {
  return useContext(AuthContext);
}

// Protected Layout
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300">
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
      <Outlet />
    </DashboardLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <Routes>
            {/* Public landing page */}
            <Route path="/" element={<Landing />} />

            {/* Protected routes with shared layout */}
            <Route element={<ProtectedLayout />}>
              <Route path="dashboard" element={<Dashboard />} index />
              <Route path="materials" element={<Material />} />
              <Route path="upload" element={<UploadsData />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="connect" element={<Connect />} />
              <Route path="notifications" element={<Notification />} />
              <Route path="downloads" element={<DownloadsPage />} />
              <Route path="monetary" element={<MonetaryValue />} />
              <Route path="about" element={<ErrorBoundary><About /></ErrorBoundary>} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <ToastContainer 
            position="bottom-right" 
            theme="colored" 
            toastClassName="!rounded-lg !shadow-lg sm:!text-base"
            bodyClassName="!text-sm sm:!text-base"
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Shared layout for protected pages
function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - assumed to handle mobile drawer internally */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebar}
        isMobileOpen={mobileMenuOpen}
        onMobileClose={toggleMobileMenu}
      />

      {/* Main content */}
      <div 
        className={`
          flex-1 transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}
        `}
      >
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          onMobileMenuToggle={toggleMobileMenu}
        />
        <main className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default App;