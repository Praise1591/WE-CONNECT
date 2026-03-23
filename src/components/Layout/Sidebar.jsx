// src/components/Layout/Sidebar.jsx
import React from 'react';
import {
  LayoutDashboard,
  BookAIcon,
  HeartIcon,
  MessageSquare,
  Users,
  Settings,
  Zap,
  Banknote,
  Info,
  Upload,
  X as CloseIcon,
  ChevronLeft,
  ChevronRight,
  ChartBarIcon,
  Coins,
  Gem,
  User
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
  { id: "dashboard", path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "materials", path: "/materials", icon: BookAIcon, label: "Materials" },
  { id: "upload", path: "/upload", icon: Upload, label: "Upload Material" },
  { id: "analytics", path: "/analytics", icon: ChartBarIcon, label: "Analytics", badge: "Live" },
  { id: "favorites", path: "/favorites", icon: HeartIcon, label: "Favourites" },
  { id: "notifications", path: "/notifications", icon: MessageSquare, label: "Notifications" },
  { id: "connect", path: "/connect", icon: Users, label: "Connect" },
  { id: "monetary", path: "/monetary", icon: Banknote, label: "Wallet" },
  { id: "settings", path: "/settings", icon: Settings, label: "Settings" },
  { id: "about", path: "/about", icon: Info, label: "About Us" },
];

function Sidebar({ collapsed, onToggleCollapse, isMobileOpen, onMobileClose }) {
  const { user, profile, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  const isRouteActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname.startsWith(path);
  };

  const handleProfileClick = () => {
    if (isAuthenticated && user?.uid) {
      navigate(`/profile/${user.uid}`);
      if (isMobileOpen) onMobileClose();
    }
  };

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div 
      className={`fixed top-0 left-0 h-screen bg-white dark:bg-slate-900 transition-all duration-300 z-40 hidden lg:block shadow-2xl ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className={`p-5 flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Zap size={22} className="text-white" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              WE CONNECT
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                  isActive || isRouteActive(item.path)
                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 text-indigo-700 dark:text-indigo-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
            >
              <item.icon size={20} className="min-w-[20px] flex-shrink-0" />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1">
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
              {collapsed && item.badge && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </NavLink>
          ))}

          {/* My Profile Link */}
          {isAuthenticated && (
            <button
              onClick={handleProfileClick}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                location.pathname.includes('/profile/')
                  ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 text-indigo-700 dark:text-indigo-300'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <User size={20} className="min-w-[20px] flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">My Profile</span>}
            </button>
          )}
        </nav>

        {/* User Profile Section */}
        <div className={`p-4 border-t border-slate-100 dark:border-slate-800 ${collapsed ? 'px-2' : ''}`}>
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md flex-shrink-0">
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
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                  {getUserDisplayName()}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {getUserDisplayText()}
                </p>
                {isAuthenticated && (
                  <div className="flex gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <Coins size={12} className="text-yellow-600" />
                      <span className="text-xs font-medium">{profile?.coins || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Gem size={12} className="text-purple-600" />
                      <span className="text-xs font-medium">{profile?.diamonds || 0}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Collapse Button */}
        <button
          onClick={onToggleCollapse}
          className="absolute top-1/2 -right-3.5 w-7 h-7 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <AnimatePresence>
      {isMobileOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onMobileClose}
          />
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed top-0 left-0 h-screen w-72 bg-white dark:bg-slate-900 z-50 shadow-2xl lg:hidden"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="p-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Zap size={22} className="text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    WE CONNECT
                  </span>
                </div>
                <button 
                  onClick={onMobileClose}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <CloseIcon size={24} className="text-slate-600 dark:text-slate-400" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={onMobileClose}
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive || isRouteActive(item.path)
                          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 text-indigo-700 dark:text-indigo-300'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <item.icon size={22} className="min-w-[22px]" />
                    <span className="text-base font-medium flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
                
                {/* My Profile Link - Mobile */}
                {isAuthenticated && (
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  >
                    <User size={22} className="min-w-[22px]" />
                    <span className="text-base font-medium flex-1">My Profile</span>
                  </button>
                )}
              </nav>

              {/* Mobile User Profile */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
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
                    <p className="text-base font-bold text-slate-900 dark:text-white">
                      {getUserDisplayName()}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {getUserDisplayText()}
                    </p>
                    {isAuthenticated && (
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <Coins size={14} className="text-yellow-600" />
                          <span className="font-semibold text-sm">{profile?.coins || 0}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Gem size={14} className="text-purple-600" />
                          <span className="font-semibold text-sm">{profile?.diamonds || 0}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}

export default Sidebar;