// Header.jsx — Complete with fixed logout functionality
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Coins,
  Gem,
  Search,
  Settings,
  Zap,
  X,
  Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth, signOut } from '../../firebase'; // Import signOut correctly
import AuthForm from '../Dashboard/AuthForm';
import { motion, AnimatePresence } from 'framer-motion';

function Header({ sidebarCollapsed, onToggleSidebar, onMobileMenuToggle }) {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuth();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(shouldBeDark);
    document.documentElement.classList.toggle('dark', shouldBeDark);
  }, []);

  const toggleDarkMode = () => {
    const newDark = !isDarkMode;
    setIsDarkMode(newDark);
    document.documentElement.classList.toggle('dark', newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    try {
      if (!signOut) {
        console.error('signOut is not available');
        toast.error('Logout function not available');
        return;
      }
      await signOut(auth);
      localStorage.removeItem('userProfile');
      setIsProfileOpen(false);
      navigate('/', { replace: true });
      // Dispatch logout event
      window.dispatchEvent(new CustomEvent('userLoggedOut'));
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const getUserDisplayName = () => {
    if (!isAuthenticated) return 'Guest';
    return profile?.name || user?.displayName || 'User';
  };

  const getUserDisplayText = () => {
    if (!isAuthenticated) return 'Sign in to continue';
    if (profile?.role === 'student' && profile?.school) return profile.school;
    if (profile?.role === 'tutor' && profile?.specialization) return profile.specialization;
    if (profile?.role === 'lecturer') {
      if (profile?.title && profile?.school) return `${profile.title} • ${profile.school}`;
      if (profile?.school) return profile.school;
      if (profile?.department) return profile.department;
    }
    return 'Member';
  };

  const getInitials = () => {
    const name = getUserDisplayName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleViewProfile = () => {
    if (isAuthenticated && user?.uid) {
      navigate(`/profile/${user.uid}`);
      setIsProfileOpen(false);
    }
  };

  const handleSettings = () => {
    navigate('/settings');
    setIsProfileOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 h-14 lg:h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg border-b border-slate-200/50 dark:border-slate-700/50 transition-all duration-300">
        <div className="h-full px-3 sm:px-4 lg:px-6 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-2 lg:gap-3">
            <button
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              <Menu size={20} className="text-slate-700 dark:text-slate-300" />
            </button>

            <button
              onClick={onToggleSidebar}
              className="hidden lg:block p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <Menu size={20} className="text-slate-700 dark:text-slate-300" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Zap size={18} className="text-white" />
              </div>
              <span className="text-base lg:text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hidden sm:block">
                WE CONNECT
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl mx-2 sm:mx-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 lg:w-5 lg:h-5" />
              <input
                type="text"
                placeholder="Search materials, courses, users..."
                className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm lg:text-base"
              />
            </div>
            <button 
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Search size={20} className="text-slate-700 dark:text-slate-300" />
            </button>
            {showSearchInput && (
              <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-xl md:hidden">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {isDarkMode ? (
                <Sun size={18} className="text-yellow-500" />
              ) : (
                <Moon size={18} className="text-slate-600" />
              )}
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <Bell size={18} className="text-slate-700 dark:text-slate-300" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md flex-shrink-0">
                  {profile?.photoURL || user?.photoURL ? (
                    <img 
                      src={profile?.photoURL || user?.photoURL} 
                      alt={getUserDisplayName()} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                      {getInitials()}
                    </div>
                  )}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white truncate max-w-[120px] lg:max-w-[160px]">
                    {getUserDisplayName()}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px] lg:max-w-[160px]">
                    {getUserDisplayText()}
                  </p>
                </div>
                <ChevronDown 
                  size={14} 
                  className={`hidden md:block transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isProfileOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 z-40 overflow-hidden"
                    >
                      {/* User Info */}
                      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                            {profile?.photoURL || user?.photoURL ? (
                              <img 
                                src={profile?.photoURL || user?.photoURL} 
                                alt={getUserDisplayName()} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                                {getInitials()}
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-slate-900 dark:text-white">
                              {getUserDisplayName()}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {getUserDisplayText()}
                            </p>
                          </div>
                        </div>
                        {isAuthenticated && (
                          <div className="flex gap-4 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2">
                              <Coins size={16} className="text-yellow-600" />
                              <span className="font-semibold text-sm">{profile?.coins || 0}</span>
                              <span className="text-xs text-slate-500">coins</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Gem size={16} className="text-purple-600" />
                              <span className="font-semibold text-sm">{profile?.diamonds || 0}</span>
                              <span className="text-xs text-slate-500">diamonds</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        {isAuthenticated ? (
                          <>
                            <button
                              onClick={handleViewProfile}
                              className="w-full px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl flex items-center gap-3 transition-all text-sm"
                            >
                              <Eye size={16} />
                              <span>View Public Profile</span>
                            </button>
                            <button
                              onClick={handleSettings}
                              className="w-full px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl flex items-center gap-3 transition-all text-sm"
                            >
                              <Settings size={16} />
                              <span>Profile Settings</span>
                            </button>
                            <button
                              onClick={handleLogout}
                              className="w-full px-4 py-2.5 text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3 transition-all text-sm"
                            >
                              <LogOut size={16} />
                              <span>Logout</span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => openAuth('login')}
                              className="w-full px-4 py-2.5 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-sm font-medium"
                            >
                              Log In
                            </button>
                            <button
                              onClick={() => openAuth('register')}
                              className="w-full px-4 py-2.5 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-sm font-medium"
                            >
                              Create Account
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {showSearchInput && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setShowSearchInput(false)}>
          <div className="bg-white dark:bg-slate-900 p-4" onClick={e => e.stopPropagation()}>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search..."
                className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <button onClick={() => setShowSearchInput(false)} className="p-3">
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && ReactDOM.createPortal(
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowAuthModal(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <AuthForm
              initialMode={authMode}
              onClose={() => setShowAuthModal(false)}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default Header;