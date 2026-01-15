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
  ChevronRight
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const menuItems = [
  { id: "dashboard",    path: "/dashboard",   icon: LayoutDashboard, label: "Dashboard",    badge: "New" },
  { id: "materials",    path: "/materials",   icon: BookAIcon,       label: "Materials" },
  { id: "upload",       path: "/upload",      icon: Upload,          label: "Upload Material" },
  { id: "downloads",    path: "/downloads",   icon: DownloadIcon,    label: "Downloads" },
  { id: "favorites",    path: "/favorites",   icon: HeartIcon,       label: "Favourites" },
  { id: "notifications",path: "/notifications",icon: MessageSquare, label: "Notifications", badge: "12" },
  { id: "connect",      path: "/connect",     icon: Users,           label: "Connect",      count: "2.4k" },
  { id: "monetary",     path: "/monetary",    icon: Banknote,        label: "Wallet",       count: "50 coins" },
  { id: "settings",     path: "/settings",    icon: Settings,        label: "Settings" },
  { id: "about",        path: "/about",       icon: Info,            label: "About Us" },
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
        let displayText = parsed.school || 'Your University';
        if (parsed.role === 'tutor' && parsed.specialization) {
          displayText = parsed.specialization;
        }
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

  // Helper to improve active state detection (especially for dashboard root)
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
        className={`fixed top-0 left-0 h-screen bg-white dark:bg-slate-900 transition-all duration-300 z-40 hidden lg:block ${collapsed ? 'w-16' : 'w-64'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 flex items-center gap-2">
            <Zap className="w-8 h-8 text-indigo-600" />
            {!collapsed && <span className="text-xl font-bold text-slate-800 dark:text-white">WE CONNECT</span>}
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map(item => (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={() => isMobileOpen && onMobileClose()}
                className={({ isActive }) => 
                  `w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    isActive || isRouteActive(item.path)
                      ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' 
                      : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                  }`
                }
              >
                <item.icon size={20} className="min-w-[20px]" />
                {!collapsed && (
                  <>
                    <span className="text-sm font-medium text-slate-800 dark:text-white flex-1 text-left">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {item.count && (
                      <span className="text-xs text-slate-500">
                        {item.count}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{userName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userDisplayText}</p>
                </div>
              )}
              {!collapsed && <ChevronDown size={16} className="text-slate-500" />}
            </div>
          </div>
        </div>

        {/* Collapse Toggle */}
        <button 
          onClick={onToggleCollapse}
          className="absolute top-1/2 -right-3 p-1 bg-white dark:bg-slate-800 rounded-full shadow-md hover:shadow-lg transition-all hidden lg:block"
          style={{ transform: 'translateY(-50%)' }}
        >
          {collapsed ? <ChevronRight size={16} className="text-slate-600 dark:text-slate-400" /> : <ChevronLeft size={16} className="text-slate-600 dark:text-slate-400" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onMobileClose} />
          <div className="fixed top-0 left-0 h-screen w-64 bg-white dark:bg-slate-900 z-50 shadow-2xl">
            <div className="flex flex-col h-full">
              <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <Zap className="w-8 h-8 text-indigo-600" />
                  <span className="text-xl font-bold text-slate-800 dark:text-white">WE CONNECT</span>
                </div>
                <button onClick={onMobileClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <CloseIcon size={20} />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map(item => (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    onClick={onMobileClose}
                    className={({ isActive }) => 
                      `w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        isActive || isRouteActive(item.path)
                          ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' 
                          : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
                      }`
                    }
                  >
                    <item.icon size={20} className="min-w-[20px]" />
                    <span className="text-sm font-medium text-slate-800 dark:text-white flex-1 text-left">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                        {item.badge}
                      </span>
                    )}
                    {item.count && (
                      <span className="text-xs text-slate-500">
                        {item.count}
                      </span>
                    )}
                  </NavLink>
                ))}
              </nav>

              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{userName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userDisplayText}</p>
                  </div>
                  <ChevronDown size={16} className="text-slate-500" />
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