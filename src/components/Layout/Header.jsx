// Header.jsx
import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import AuthForm from '../Dashboard/AuthForm';

function Header({ sidebarCollapsed, onToggleSidebar }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const user = {
    name: 'Alex Johnson',
    school: 'Rivers State University',
    isLoggedIn: false,
  };

  // Sync dark mode with localStorage and Settings page
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);

    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');

    // Notify Settings page and any other component
    window.dispatchEvent(new Event('themeChanged'));
  };

  // Listen for theme changes from Settings page
  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = savedTheme === 'dark' || (savedTheme === null && prefersDark);
      setIsDarkMode(isDark);
    };

    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setIsProfileOpen(false);
  };

  const goToSettings = () => {
    window.location.href = '/settings';
  };

  const diamonds = 12;
  const coins = 20;

  return (
    <>
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="hidden md:block">
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                Dashboard
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {user.isLoggedIn ? `Welcome back, ${user.name.split(' ')[0]}!` : 'Welcome to WE CONNECT'}
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Diamonds */}
            <button className="hidden lg:flex items-center gap-3 py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-medium shadow-lg">
              <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
                <div className="w-5 h-5 bg-white rounded rotate-45" />
              </div>
              <span>Diamonds</span>
              <span className="ml-2 px-3 py-1 bg-white/30 rounded-full text-sm font-bold">
                {diamonds}
              </span>
            </button>

            {/* Coins */}
            <button className="hidden lg:flex items-center gap-3 py-3 px-6 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-medium shadow-lg">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full" />
              </div>
              <span>Coins</span>
              <span className="ml-2 px-3 py-1 bg-white/30 rounded-full text-sm font-bold">
                {coins}
              </span>
            </button>

            {/* Dark Mode - Now synced with Settings */}
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <button className="relative p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Settings */}
            

            {/* Profile Button */}
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700 py-2"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {user.isLoggedIn 
                  ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
                  : <User className="w-6 h-6" />
                }
              </div>

              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-slate-800 dark:text-white">
                  {user.isLoggedIn ? user.name : 'Guest'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {user.isLoggedIn ? user.school : 'Sign in to continue'}
                </p>
              </div>

              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown - Fixed positioning */}
      {isProfileOpen && (
        <div className="fixed inset-0 z-[9999]">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsProfileOpen(false)}
          />

          <div className="absolute right-8 top-20 w-72 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 py-4">
            {user.isLoggedIn ? (
              <>
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white">{user.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{user.school}</p>
                    </div>
                  </div>
                </div>

                <div className="py-2">
                  <button className="w-full px-6 py-3 flex items-center gap-4 hover:bg-slate-100 dark:hover:bg-slate-700 text-left transition-colors">
                    <BookOpen className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <span className="font-medium">My Courses</span>
                  </button>

                  <button className="w-full px-6 py-3 flex items-center gap-4 hover:bg-slate-100 dark:hover:bg-slate-700 text-left transition-colors">
                    <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    <span className="font-medium">Settings</span>
                  </button>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 pt-2">
                  <button className="w-full px-6 py-3 flex items-center gap-4 hover:bg-red-50 dark:hover:bg-red-900/30 text-left text-red-600 dark:text-red-400 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="py-2">
                <button
                  onClick={() => openAuth('login')}
                  className="w-full px-6 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 font-medium transition-colors"
                >
                  Log In
                </button>
                <button
                  onClick={() => openAuth('register')}
                  className="w-full px-6 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 font-medium text-purple-600 dark:text-purple-400 transition-colors"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="relative max-w-md w-full">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-12 right-0 text-white hover:text-slate-300 text-3xl font-light"
            >
              ×
            </button>
            <AuthForm initialMode={authMode} />
          </div>
        </div>
      )}
    </>
  );
}

export default Header;