// Header.jsx — Fixed Logout + Profile Sync
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  Menu,
  Sun,
  Moon,
  Bell,
  Settings,
  ChevronDown,
  LogOut,
  User,
  BookOpen,
  Coins,
  Gem
} from 'lucide-react';
import AuthForm from '../Dashboard/AuthForm';

function Header({ sidebarCollapsed, onToggleSidebar }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const [user, setUser] = useState({
    name: 'Guest',
    displayText: 'Sign in to continue',
    isLoggedIn: false,
    role: null,
    coins: 0,
    diamonds: 0,
  });

  // Load user from localStorage
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
            role: profile.role || null,
            coins: profile.coins || 0,
            diamonds: profile.diamonds || 0,
          });
        } catch (e) {
          setUser({ name: 'Guest', displayText: 'Sign in to continue', isLoggedIn: false, coins: 0, diamonds: 0 });
        }
      } else {
        setUser({ name: 'Guest', displayText: 'Sign in to continue', isLoggedIn: false, coins: 0, diamonds: 0 });
      }
    };

    loadUser();
    window.addEventListener('userLoggedIn', loadUser);

    return () => window.removeEventListener('userLoggedIn', loadUser);
  }, []);

  // Dark Mode
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

  // Fixed Logout Function
  const handleLogout = () => {
    localStorage.removeItem('userProfile');
    setUser({
      name: 'Guest',
      displayText: 'Sign in to continue',
      isLoggedIn: false,
      coins: 0,
      diamonds: 0,
    });
    setIsProfileOpen(false);
    window.dispatchEvent(new CustomEvent('userLoggedIn')); // Trigger update in Sidebar/Header
    // Optional: redirect to home
    // window.location.href = '/';
  };

  return (
    <>
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        {/* Left - Menu Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden"
        >
          <Menu size={24} className="text-slate-700 dark:text-slate-300" />
        </button>

        {/* Center - Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen size={24} className="text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white hidden sm:block">
            WE CONNECT
          </h1>
        </div>

        {/* Right - Coins, Diamonds, Actions */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Coins & Diamonds */}
          {user.isLoggedIn && (
            <div className="hidden sm:flex items-center gap-4 bg-slate-100/70 dark:bg-slate-700/70 rounded-2xl px-4 py-2">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-slate-800 dark:text-white">{user.coins}</span>
              </div>
              <div className="w-px h-6 bg-slate-300 dark:bg-slate-600" />
              <div className="flex items-center gap-2">
                <Gem className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-slate-800 dark:text-white">{user.diamonds}</span>
              </div>
            </div>
          )}

          {/* Mobile Coins/Diamonds */}
          {user.isLoggedIn && (
            <div className="flex sm:hidden items-center gap-2 bg-slate-100/70 dark:bg-slate-700/70 rounded-xl px-3 py-1.5">
              <Coins className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-bold">{user.coins}</span>
              <Gem className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-bold">{user.diamonds}</span>
            </div>
          )}

          {/* Dark Mode */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} className="text-slate-600" />}
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
            <Bell size={20} className="text-slate-700 dark:text-slate-300" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-800 dark:text-white">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.displayText}</p>
              </div>
              <ChevronDown size={16} className={`text-slate-600 dark:text-slate-400 transition-transform hidden md:block ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 z-50">
                  {user.isLoggedIn ? (
                    <>
                      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <p className="font-semibold">{user.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.displayText}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1">
                            <Coins className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium">{user.coins}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Gem className="w-4 h-4 text-purple-600" />
                            <span className="text-sm font-medium">{user.diamonds}</span>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <button className="w-full px-6 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3">
                          <User className="w-5 h-5" />
                          Profile
                        </button>
                        <button className="w-full px-6 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3">
                          <Settings className="w-5 h-5" />
                          Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full px-6 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-3"
                        >
                          <LogOut className="w-5 h-5" />
                          Logout
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="py-2">
                      <button onClick={() => openAuth('login')} className="w-full px-6 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700">
                        Log In
                      </button>
                      <button onClick={() => openAuth('register')} className="w-full px-6 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 text-purple-600 dark:text-purple-400">
                        Create Account
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      {showAuthModal && ReactDOM.createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="relative max-w-md w-full">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-slate-300 text-3xl font-light"
            >
              ×
            </button>
            <AuthForm initialMode={authMode} 
            onClose={() => setShowAuthModal(false)}   // ← This is what makes X work now
            />
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default Header;