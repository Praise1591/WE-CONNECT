// Sidebar.jsx — Improved for Mobile: Full Overlay Drawer + Persistent Collapse State
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
} from 'lucide-react';

const menuItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", badge: "New" },
  { id: "materials", icon: BookAIcon, label: "Materials" },
  { id: "upload", icon: Upload, label: "Upload Material" },
  { id: "downloads", icon: DownloadIcon, label: "Downloads" },
  { id: "favorites", icon: HeartIcon, label: "Favourites" },
  { id: "notifications", icon: MessageSquare, label: "Notifications", badge: "12" },
  { id: "connect", icon: Users, label: "Connect", count: "2.4k" },
  { id: "settings", icon: Settings, label: "Settings" },
  { id: "monetary", icon: Banknote, label: "Monetary Value" },
  { id: "about", icon: Info, label: "About" },
];

function Sidebar({ currentPage = "dashboard", onPageChange }) {
  // Persistent collapsed state (for desktop/large screens)
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  // Mobile drawer open state (separate from desktop collapse)
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [userName, setUserName] = useState('Guest');
  const [userDisplayText, setUserDisplayText] = useState('Sign in to continue');
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Save collapsed state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Load user info
  useEffect(() => {
    const updateUserInfo = () => {
      const saved = localStorage.getItem('userProfile');
      if (saved) {
        try {
          const profile = JSON.parse(saved);
          setUserName(profile.name || 'User');
          if (profile.role === 'tutor' && profile.specialization) {
            setUserDisplayText(profile.specialization);
          } else {
            setUserDisplayText(profile.school || 'Your University');
          }
        } catch (e) {
          setUserName('Guest');
          setUserDisplayText('Sign in to continue');
        }
      }
    };

    updateUserInfo();
    window.addEventListener('userLoggedIn', updateUserInfo);
    return () => window.removeEventListener('userLoggedIn', updateUserInfo);
  }, []);

  // Load favorite count
  useEffect(() => {
    const updateFavoriteCount = () => {
      const saved = localStorage.getItem('favoriteUploads');
      if (saved) {
        try {
          const favorites = JSON.parse(saved);
          setFavoriteCount(Array.isArray(favorites) ? favorites.length : 0);
        } catch (e) {
          setFavoriteCount(0);
        }
      }
    };

    updateFavoriteCount();
    window.addEventListener('favoritesUpdated', updateFavoriteCount);
    return () => window.removeEventListener('favoritesUpdated', updateFavoriteCount);
  }, []);

  const toggleDesktopCollapse = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);
  const closeMobile = () => setIsMobileOpen(false);

  // Effective collapsed state: on mobile use drawer logic, on desktop use persistent collapse
  const effectiveCollapsed = window.innerWidth >= 1024 ? isCollapsed : !isMobileOpen;

  return (
    <>
      {/* Hamburger Button - Visible only on mobile (< lg) */}
      <button
        onClick={toggleMobile}
        className="fixed top-4 left-4 z-50 p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg lg:hidden"
      >
        {isMobileOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 flex flex-col h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 transition-all duration-300 ease-in-out
          ${effectiveCollapsed ? 'w-20' : 'w-72'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo/Header */}
        <div className="p-4 md:p-6 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-7 h-7 text-white" />
            </div>
            {!effectiveCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">WE CONNECT</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">I Connect. You Connect.</p>
                <p className="text-center text-xs text-slate-500 dark:text-slate-400">We Connect</p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          <button
            onClick={toggleDesktopCollapse}
            className="hidden lg:block p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronDown className={`w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform ${isCollapsed ? 'rotate-90' : '-rotate-90'}`} />
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            const displayCount = item.id === "favorites" ? favoriteCount : item.count;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onPageChange(item.id);
                  closeMobile(); // Close mobile drawer on item click
                }}
                className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all group ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <Icon className="w-6 h-6 flex-shrink-0" />
                {!effectiveCollapsed && (
                  <>
                    <span className="font-medium flex-1 text-left">{item.label}</span>
                    {item.badge && <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">{item.badge}</span>}
                    {displayCount !== undefined && <span className="px-2 py-0.5 text-xs font-bold bg-red-500/20 text-red-600 dark:text-red-400 rounded-full">{displayCount}</span>}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info - Only when expanded */}
        {!effectiveCollapsed && (
          <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{userName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userDisplayText}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile - closes drawer when clicked */}
      {isMobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
        />
      )}
    </>
  );
}

export default Sidebar;