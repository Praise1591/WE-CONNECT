// Header.jsx — Compact mobile design + best practices for simplicity/clarity

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
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import AuthForm from '../Dashboard/AuthForm';

function Header({ sidebarCollapsed, onToggleSidebar, onMobileMenuToggle }) {
  const navigate = useNavigate();

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showSearchInput, setShowSearchInput] = useState(false); // New: toggle search on mobile

  const [user, setUser] = useState({
    name: 'Guest',
    displayText: 'Sign in to continue',
    isLoggedIn: false,
    coins: 0,
    diamonds: 0,
  });

  // ── User profile loading & sync logic ───────────────────────────────────────
  useEffect(() => {
    const loadUser = () => {
      const savedProfile = localStorage.getItem('userProfile');
      if (!savedProfile) {
        setUser({
          name: 'Guest',
          displayText: 'Sign in to continue',
          isLoggedIn: false,
          coins: 0,
          diamonds: 0,
        });
        return;
      }

      try {
        const profile = JSON.parse(savedProfile);

        let displayText = 'Connected';

        if (profile.role === 'student' && profile.school) {
          displayText = profile.school.trim();
        } else if (profile.role === 'tutor' && profile.specialization) {
          displayText = profile.specialization.trim();
        } else if (profile.role === 'lecturer') {
          if (profile.title && profile.school) {
            displayText = `${profile.title.trim()} • ${profile.school.trim()}`;
          } else if (profile.school) {
            displayText = profile.school.trim();
          } else if (profile.department) {
            displayText = profile.department.trim();
          }
        }

        setUser({
          name: (profile.name || 'User').trim(),
          displayText: displayText || 'Your profile',
          isLoggedIn: true,
          coins: Number(profile.coins ?? 0),
          diamonds: Number(profile.diamonds ?? 0),
        });
      } catch (err) {
        console.error('Failed to parse userProfile:', err);
        localStorage.removeItem('userProfile');
        setUser({
          name: 'Guest',
          displayText: 'Sign in to continue',
          isLoggedIn: false,
          coins: 0,
          diamonds: 0,
        });
      }
    };

    loadUser();

    const handleLoginEvent = () => setTimeout(loadUser, 150);
    window.addEventListener('userLoggedIn', handleLoginEvent);

    const handleStorageChange = (e) => {
      if (e.key === 'userProfile') handleLoginEvent();
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('userLoggedIn', handleLoginEvent);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // ── Dark mode ────────────────────────────────────────────────────────────────
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

  // ── Auth modal: Escape key + body scroll lock ───────────────────────────────
  useEffect(() => {
    if (!showAuthModal) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setShowAuthModal(false);
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [showAuthModal]);

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

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
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <header className="
        fixed top-0 left-0 right-0 z-40
        h-11 sm:h-12 lg:h-14
        bg-white/80 dark:bg-slate-900/80
        backdrop-blur-md shadow-sm
        border-b border-slate-200/50 dark:border-slate-700/50
        transition-all duration-300
      ">
        <div className="h-full px-2 sm:px-3 lg:px-4 flex items-center justify-between">
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
            <button
              onClick={onMobileMenuToggle}
              className="p-1.5 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur hover:shadow-sm transition-all lg:hidden"
            >
              <Menu size={20} className="text-slate-700 dark:text-slate-300" />
            </button>

            <button
              onClick={onToggleSidebar}
              className="hidden lg:block p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              <Menu size={18} className="text-slate-700 dark:text-slate-300" />
            </button>

            <div className="flex items-center gap-1 sm:gap-2">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-indigo-600" />
              <span className="text-sm sm:text-base lg:text-lg font-bold text-slate-800 dark:text-white hidden xs:block">
                WE CONNECT
              </span>
            </div>
          </div>

          {/* Search: Icon on mobile, full bar on md+ */}
          <div className="flex-1 mx-2 sm:mx-4 lg:mx-6">
            <div className="relative md:hidden">
              <button onClick={() => setShowSearchInput(!showSearchInput)} className="p-1.5">
                <Search size={20} className="text-slate-700 dark:text-slate-300" />
              </button>
              {showSearchInput && (
                <input
                  type="text"
                  placeholder="Search..."
                  className="absolute top-full left-0 w-full px-3 py-2 bg-white dark:bg-slate-800 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              )}
            </div>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 lg:w-5 lg:h-5" />
              <input
                type="text"
                placeholder="Search materials, courses, users..."
                className="w-full pl-10 pr-4 py-1.5 lg:py-2 bg-slate-100/70 dark:bg-slate-800/70 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm lg:text-base"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-3">
            <button
              onClick={toggleDarkMode}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isDarkMode ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-slate-600" />}
            </button>

            <button className="relative p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Bell size={16} className="text-slate-700 dark:text-slate-300" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-sm">
                {(user.name || '?')[0].toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs lg:text-sm font-semibold text-slate-800 dark:text-white truncate max-w-[140px] lg:max-w-[180px]">
                  {user.name}
                </p>
                <p className="text-2xs lg:text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px] lg:max-w-[180px]">
                  {user.displayText}
                </p>
              </div>
              <ChevronDown size={12} className={`hidden md:block transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Profile Dropdown - compact positioning */}
      {isProfileOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsProfileOpen(false)} />
          <div className="
            absolute top-12 sm:top-13 lg:top-15 right-2 sm:right-3 lg:right-5 
            w-64 sm:w-72 bg-white dark:bg-slate-800 
            rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 
            z-40 overflow-hidden
          ">
            <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-700">
              <p className="font-bold text-sm sm:text-base truncate">{user.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.displayText}</p>
              {user.isLoggedIn && (
                <div className="flex gap-4 sm:gap-6 mt-2 sm:mt-3">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                    <span className="font-semibold text-sm">{user.coins}</span>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Gem className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    <span className="font-semibold text-sm">{user.diamonds}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-2 sm:p-3">
              {user.isLoggedIn ? (
                <>
                  <button className="w-full px-3 sm:px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 sm:gap-3 text-sm">
                    <User size={16} />
                    <span>Profile</span>
                  </button>
                  <button className="w-full px-3 sm:px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2 sm:gap-3 text-sm">
                    <Settings size={16} />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-3 sm:px-4 py-2 text-left hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center gap-2 sm:gap-3 text-sm"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => openAuth('login')} className="w-full px-3 sm:px-4 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm">
                    Log In
                  </button>
                  <button onClick={() => openAuth('register')} className="w-full px-3 sm:px-4 py-2 text-left hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 rounded-lg text-sm">
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