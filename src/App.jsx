// App.jsx - Fixed Sidebar Layout for Large Screens
import React, { useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './contexts/AuthContext';

import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import Material from './components/Dashboard/Material';
import Favorites from './components/Dashboard/Favorites';
import ProfileSettings from './components/Dashboard/ProfileSettings';
import Connect from './components/Dashboard/Connect';
import Notification from './components/Dashboard/Notifications';
import DownloadsPage from './components/Dashboard/DownloadsPage';
import MonetaryValue from './components/Dashboard/MonetaryValue';
import About from './components/Dashboard/About';
import UploadsData from './components/Dashboard/UploadsData';
import AnalyticsDashboard from './components/Dashboard/AnalyticsDashboard';
import PublicProfileViewer from './components/Profile/PublicProfileViewer';
import Landing from './pages/Landing';

// Error Boundary Component
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
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
          <div className="w-full max-w-md text-center rounded-2xl bg-white dark:bg-slate-800 p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              We're sorry — an error occurred. Our team has been notified.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all"
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

// Protected Layout
function ProtectedLayout() {
  const { isAuthenticated, loading, error } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 dark:text-slate-400">Connecting to server...</p>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">This may take a moment</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3">
              Connection Error
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <DashboardLayout><Outlet /></DashboardLayout>;
}

// Dashboard Layout - FIXED for proper sidebar spacing
function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(prev => !prev);
  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar - Fixed on desktop, drawer on mobile */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          bg-white dark:bg-slate-900 shadow-2xl
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:transform-none lg:transition-all lg:duration-300
          ${sidebarCollapsed ? 'w-20' : 'w-64'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
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

      {/* Main content area - properly offset from sidebar */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          onMobileMenuToggle={toggleMobileMenu}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Main App
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <Routes>
            <Route path="/" element={<Landing />} />

            <Route element={<ProtectedLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="materials" element={<Material />} />
              <Route path="materials/:materialId" element={<Material />} />
              <Route path="upload" element={<UploadsData />} />
              <Route path="analytics" element={<AnalyticsDashboard />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="settings" element={<ProfileSettings />} />
              <Route path="connect" element={<Connect />} />
              <Route path="notifications" element={<Notification />} />
              <Route path="downloads" element={<DownloadsPage />} />
              <Route path="monetary" element={<MonetaryValue />} />
              <Route path="about" element={<ErrorBoundary><About /></ErrorBoundary>} />
            </Route>

            {/* Public Profile Route */}
            <Route path="/profile/:userId" element={<PublicProfileViewer />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          <ToastContainer
            position="bottom-right"
            theme="colored"
            toastClassName="!rounded-xl !shadow-lg"
          />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;