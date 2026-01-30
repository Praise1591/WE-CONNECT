// App.jsx — FINAL WORKING VERSION with Landing page + Protected Routes
// Supabase Auth integrated | Fixed sidebar (no scroll with content) + responsive collapse

import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useNavigate,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';

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
import AnalyticsDashboard from './components/Dashboard/AnalyticsDashboard';
import Landing from './pages/Landing';

import { supabase } from '@/lib/supabaseClient';

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
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="w-full max-w-md text-center rounded-xl bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400 mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-4 sm:mb-6">
              We're sorry — an error occurred. Our team has been notified.
            </p>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 break-words">
              Error: {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md text-sm sm:text-base"
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

// ── Protected Layout ─────────────────────────────────────────────────────────
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
        <div className="text-base font-medium text-slate-700 dark:text-slate-300 animate-pulse">
          Verifying session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <DashboardLayout><Outlet /></DashboardLayout>;
}

// ── Main App ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <Routes>
            <Route path="/" element={<Landing />} />

            <Route element={<ProtectedLayout />}>
              <Route path="dashboard" element={<Dashboard />} index />
              <Route path="materials" element={<Material />} />
              <Route path="upload" element={<UploadsData />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="connect" element={<Connect />} />
              <Route path="notifications" element={<Notification />} />
              <Route path="downloads" element={<DownloadsPage />} />
              <Route path="monetary" element={<MonetaryValue />} />
              <Route path="about" element={<ErrorBoundary><About /></ErrorBoundary>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <ToastContainer
            position="bottom-right"
            theme="colored"
            toastClassName="!rounded-lg !shadow-lg"
            bodyClassName="!text-sm sm:!text-base"
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

// ── Dashboard Layout ──────────────────────────────────────────────────────────
function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // collapsed by default
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);
  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - fixed on desktop, drawer on mobile */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          w-72 lg:w-auto
          bg-slate-900 text-white shadow-2xl
          transform transition-transform duration-300 ease-in-out
          lg:transition-all lg:duration-300
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'}
          lg:top-0 lg:bottom-0 lg:left-0 lg:z-30
        `}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          isMobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main wrapper - offset by sidebar width on desktop */}
      <div
        className={`
          flex-1 flex flex-col min-h-screen
          lg:ml-${sidebarCollapsed ? '20' : '72'}
          transition-all duration-300 ease-in-out
        `}
      >
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          onMobileMenuToggle={toggleMobileMenu}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <div className="mx-auto w-full max-w-7xl px-2 sm:px-4 lg:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;