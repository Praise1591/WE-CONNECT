// Sidebar.jsx
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  BookAIcon,
  DownloadIcon,
  HeartIcon,
  MessageSquare,
  Users,
  Settings,
  ChevronDown,
  Zap,
  Banknote,
  Info,
  Upload,
  Menu as MenuIcon,
  X as CloseIcon,
  ChevronLeft,
  ChevronRight,
  ChartBarIcon
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const menuItems = [
  { id: "dashboard",     path: "/dashboard",    icon: LayoutDashboard, label: "Dashboard",    badge: "New" },
  { id: "materials",     path: "/materials",    icon: BookAIcon,       label: "Materials" },
  { id: "upload",        path: "/upload",       icon: Upload,          label: "Upload Material" },
  { id: "analytics",     path: "/analytics",    icon: ChartBarIcon,    label: "Analytics",    badge: "Live" },
  { id: "downloads",     path: "/downloads",    icon: DownloadIcon,    label: "Downloads" },
  { id: "favorites",     path: "/favorites",    icon: HeartIcon,       label: "Favourites" },
  { id: "notifications", path: "/notifications",icon: MessageSquare,  label: "Notifications", badge: "12" },
  { id: "connect",       path: "/connect",      icon: Users,           label: "Connect",      count: "2.4k" },
  { id: "monetary",      path: "/monetary",     icon: Banknote,        label: "Wallet",       count: "50 coins" },
  { id: "settings",      path: "/settings",     icon: Settings,        label: "Settings" },
  { id: "about",         path: "/about",        icon: Info,            label: "About Us" },
];

function Sidebar({ collapsed, onToggleCollapse, isMobileOpen, onMobileClose }) {
  const [userName, setUserName] = useState('Guest');
  const [userDisplayText, setUserDisplayText] = useState('Sign in to continue');
  const location = useLocation();

  const loadUser = () => {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      try {
        const parsed = JSON.parse(profile);
        let displayText = parsed.school || parsed.specialization || 'Your University / Field';
        setUserName(parsed.name || 'User');
        setUserDisplayText(displayText);
      } catch (e) {
        // Silent fail
      }
    } else {
      setUserName('Guest');
      setUserDisplayText('Sign in to continue');
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener('userLoggedIn', loadUser);
    return () => window.removeEventListener('userLoggedIn', loadUser);
  }, []);

  // Better active route detection (handles /dashboard and subroutes)
  const isRouteActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-slate-900 transition-all duration-300 z-40 hidden lg:block shadow-sm ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Brand */}
          <div className="p-4 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800">
            <Zap className="w-8 h-8 text-indigo-600 flex-shrink-0" />
            {!collapsed && (
              <span className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                WE CONNECT
              </span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {menuItems.map(item => (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    isActive || isRouteActive(item.path)
                      ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
              >
                <item.icon size={20} className="min-w-[20px] flex-shrink-0" />
                {!collapsed && (
                  <div className="flex items-center justify-between flex-1">
                    <span className="text-sm">{item.label}</span>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-500/90 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                      {item.count && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {item.count}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm flex-shrink-0">
                {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              {!collapsed && (
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {userDisplayText}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Collapse Button (desktop only) */}
        <button
          onClick={onToggleCollapse}
          className="absolute top-1/2 -right-3.5 w-7 h-7 bg-white dark:bg-slate-800 rounded-full shadow-md flex items-center justify-center border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors hidden lg:flex"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay + Panel */}
      {isMobileOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" 
            onClick={onMobileClose} 
          />
          <div className="fixed top-0 left-0 h-screen w-72 bg-white dark:bg-slate-900 z-50 shadow-2xl transform transition-transform duration-300 lg:hidden">
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <Zap className="w-8 h-8 text-indigo-600" />
                  <span className="text-xl font-bold text-slate-800 dark:text-white">WE CONNECT</span>
                </div>
                <button 
                  onClick={onMobileClose}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <CloseIcon size={24} />
                </button>
              </div>

              {/* Mobile Menu */}
              <nav className="flex-1 px-2 py-1 space-y-1 overflow-y-auto">
                {menuItems.map(item => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={onMobileClose}
                    className={({ isActive }) => 
                      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        isActive || isRouteActive(item.path)
                          ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <item.icon size={22} className="min-w-[22px]" />
                    <span className="text-base font-medium flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="px-2.5 py-1 text-xs font-medium bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {item.count && (
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {item.count}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>

              {/* Mobile User Profile */}
              <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                    {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-base font-medium text-slate-800 dark:text-white truncate">
                      {userName}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {userDisplayText}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Sidebar;