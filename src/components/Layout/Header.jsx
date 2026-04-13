// src/components/Layout/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, Bell, User, ChevronDown, LogOut, Settings, 
  HelpCircle, Shield, Moon, Sun, Coins, Star,
  Wallet, Gift, Award, Gem
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Header({ sidebarCollapsed, onToggleSidebar, onMobileMenuToggle }) {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const menuRef = useRef(null);
  const notificationRef = useRef(null);

  // Check for dark mode preference
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true' || 
                   window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const getUserInitials = () => {
    const name = userProfile?.name || userProfile?.email || 'User';
    return name.charAt(0).toUpperCase();
  };

  const getUserName = () => {
    if (userProfile?.name && userProfile.name !== 'User') {
      return userProfile.name;
    }
    if (userProfile?.email) {
      return userProfile.email.split('@')[0];
    }
    return 'User';
  };

  const getUserRole = () => {
    const role = userProfile?.role || 'student';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Sample notifications - replace with real data from Firebase
  const notifications = [
    { id: 1, title: "New material uploaded", message: "Your favorite category has new content", time: "5 min ago", read: false },
    { id: 2, title: "Withdrawal processed", message: "Your withdrawal of ₦6,000 has been completed", time: "1 hour ago", read: false },
    { id: 3, title: "New follower", message: "Oluwaseun started following you", time: "3 hours ago", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-12">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          
          {/* Desktop sidebar toggle */}
          <button
            onClick={onToggleSidebar}
            className="hidden lg:block p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          
          {/* Welcome Message */}
          <div className="hidden md:block">
            <h1 className="text-lg font-semibold text-slate-800 dark:text-white">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {getUserName()}
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              {getUserRole()} • {userProfile?.school || 'Ready to learn'}
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Quick Stats - Coin & Diamond Display */}
          <div className="hidden lg:flex items-center gap-2 mr-2">
            {/* Coins Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 rounded-full border border-amber-200 dark:border-amber-800">
              <Coins className="w-4 h-4 text-amber-500" />
              <div>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 leading-tight">Coins</p>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-300 leading-tight">
                  {userProfile?.coins?.toLocaleString() || 0}
                </p>
              </div>
            </div>
            
            {/* Diamonds Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/30 rounded-full border border-purple-200 dark:border-purple-800">
              <Gem className="w-4 h-4 text-purple-500" />
              <div>
                <p className="text-[10px] text-purple-600 dark:text-purple-400 leading-tight">Diamonds</p>
                <p className="text-sm font-bold text-purple-700 dark:text-purple-300 leading-tight">
                  {userProfile?.diamonds?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800 dark:text-white">Notifications</h3>
                  <button className="text-xs text-indigo-600 hover:underline">Mark all read</button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-slate-500">No notifications</div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-3 border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition cursor-pointer ${!notif.read ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}
                      >
                        <p className="text-sm font-medium text-slate-800 dark:text-white">{notif.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{notif.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                  <button className="w-full text-center text-sm text-indigo-600 py-1 hover:underline">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {getUserInitials()}
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                {/* User Info */}
                <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {getUserInitials()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{getUserName()}</p>
                      <p className="text-xs text-slate-500">{userProfile?.email || 'No email'}</p>
                    </div>
                  </div>
                </div>
                
                {/* Balance Stats Row */}
                <div className="p-3 border-b border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3">
                  <div className="text-center p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <p className="text-xs text-amber-600 font-medium">Coins</p>
                    </div>
                    <p className="text-lg font-bold text-amber-700 dark:text-amber-300">
                      {userProfile?.coins?.toLocaleString() || 0}
                    </p>
                    <p className="text-[10px] text-slate-400">= ₦{((userProfile?.coins || 0) * 100).toLocaleString()}</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Gem className="w-4 h-4 text-purple-500" />
                      <p className="text-xs text-purple-600 font-medium">Diamonds</p>
                    </div>
                    <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                      {userProfile?.diamonds?.toLocaleString() || 0}
                    </p>
                    <p className="text-[10px] text-slate-400">= ₦{((userProfile?.diamonds || 0) * 60).toLocaleString()}</p>
                  </div>
                </div>
                
                {/* Menu Items */}
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/monetary');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    <Wallet className="w-4 h-4" />
                    Wallet
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/about');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Help & Support
                  </button>
                  
                  <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Balance Summary - Only visible on mobile */}
      
    </header>
  );
}

export default Header;