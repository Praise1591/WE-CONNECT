// Header.jsx — Mobile Menu Button Fixed & Working + Proper Firebase Logout with Redirect
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
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Added for redirect after logout
import { getAuth, signOut } from 'firebase/auth'; // Added for proper Firebase sign out
import AuthForm from '../Dashboard/AuthForm';

function Header({ sidebarCollapsed, onToggleSidebar, onMobileMenuToggle }) {
  const navigate = useNavigate(); // Hook for programmatic navigation
  const auth = getAuth(); // Firebase auth instance

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const [user, setUser] = useState({
    name: 'Guest',
    displayText: 'Sign in to continue',
    isLoggedIn: false,
    coins: 0,
    diamonds: 0,
  });

  // Load user
  useEffect(() => {
    const loadUser = () => {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        try {
          const profile = JSON.parse(savedProfile);
          let displayText = profile.school || 'Your University';
          if (profile.role === 'tutor' && profile.specialization) {
            displayText = profile.specialization;
          }
          setUser({
            name: profile.name || 'User',
            displayText,
            isLoggedIn: true,
            coins: profile.coins || 0,
            diamonds: profile.diamonds || 0,
          });
        } catch (e) {
          setUser({ name: 'Guest', displayText: 'Sign in to continue', isLoggedIn: false, coins: 0, diamonds: 0 });
        }
      }
    };
    loadUser();
    window.addEventListener('userLoggedIn', loadUser);
    return () => window.removeEventListener('userLoggedIn', loadUser);
  }, []);

  // Dark mode
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDarkMode(initialDark);
    if (initialDark) document.documentElement.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // Sign-out successful from Firebase
        localStorage.removeItem('userProfile');
        setUser({
          name: 'Guest',
          displayText: 'Sign in to continue',
          isLoggedIn: false,
          coins: 0,
          diamonds: 0,
        });
        setIsProfileOpen(false);
        window.dispatchEvent(new CustomEvent('userLoggedIn'));

        // Redirect to landing/home page
        navigate('/');
      })
      .catch((error) => {
        console.error('Logout error:', error);
        // Optional: show toast/notification here if you want
      });
  };

  return (
    <>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg z-40 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            {/* MOBILE MENU BUTTON - Now visible and working on small screens */}
            <button
              onClick={onMobileMenuToggle}
              className="p-3 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur shadow-md hover:shadow-lg transition-all lg:hidden z-50"
            >
              <Menu size={26} className="text-slate-700 dark:text-slate-300" />
            </button>

            {/* Desktop Sidebar Toggle (hidden on mobile) */}
            <button
              onClick={onToggleSidebar}
              className="hidden lg:block p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <Menu size={24} className="text-slate-700 dark:text-slate-300" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-3">
              <Zap className="w-9 h-9 text-indigo-600" />
              <span className="text-xl font-bold text-slate-800 dark:text-white hidden sm:block">
                WE CONNECT
              </span>
            </div>
          </div>

          {/* Center Search (Desktop Only) */}
          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search materials, courses, users..."
                className="w-full pl-12 pr-6 py-3 bg-slate-100/70 dark:bg-slate-800/70 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Dark Mode */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun size={22} className="text-yellow-500" /> : <Moon size={22} className="text-slate-600" />}
            </button>

            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Bell size={22} className="text-slate-700 dark:text-slate-300" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {/* Profile */}
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.displayText}</p>
              </div>
              <ChevronDown size={18} className={`hidden md:block transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Profile Dropdown */}
      {isProfileOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)} />
          <div className="absolute top-20 right-6 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-40 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700">
              <p className="font-bold text-lg">{user.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user.displayText}</p>
              {user.isLoggedIn && (
                <div className="flex gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-600" />
                    <span className="font-semibold">{user.coins}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gem className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold">{user.diamonds}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-3">
              {user.isLoggedIn ? (
                <>
                  <button className="w-full px-5 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-4">
                    <User size={20} />
                    <span>Profile</span>
                  </button>
                  <button className="w-full px-5 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-4">
                    <Settings size={20} />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-5 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-4"
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => openAuth('login')} className="w-full px-5 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                    Log In
                  </button>
                  <button onClick={() => openAuth('register')} className="w-full px-5 py-3 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 rounded-lg">
                    Create Account
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Auth Modal */}
      {showAuthModal && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-4xl w-full">
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