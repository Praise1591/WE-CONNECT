// Sidebar.jsx
import React, { useState, useEffect } from "react";
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
} from 'lucide-react';

const menuItems = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    badge: "New",
  },
  {
    id: "materials",
    icon: BookAIcon,
    label: "Materials",
  },
  {
    id: "downloads",
    icon: DownloadIcon,
    label: "Purchases/Downloads",
  },
  {
    id: "favorites",
    icon: HeartIcon,
    label: "Favourites",
  },
  {
    id: "notifications",
    icon: MessageSquare,
    label: "Notifications",
    badge: "12",
  },
  {
    id: "connect",
    icon: Users,
    label: "Connect",
    count: "2.4k",
  },
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
  },
];

function Sidebar({ collapsed = false, onToggle, currentPage = "dashboard", onPageChange }) {
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [userName, setUserName] = useState('Guest');
  const [userSchool, setUserSchool] = useState('Sign in to continue');

  // Sync name and school from sign up / sign in
  useEffect(() => {
    const updateUserInfo = () => {
      const saved = localStorage.getItem('userProfile');
      if (saved) {
        try {
          const profile = JSON.parse(saved);
          setUserName(profile.name || 'Guest');
          setUserSchool(profile.school || 'Sign in to continue');
        } catch (e) {
          setUserName('Guest');
          setUserSchool('Sign in to continue');
        }
      } else {
        setUserName('Guest');
        setUserSchool('Sign in to continue');
      }
    };

    updateUserInfo();

    // Listen for login/signup events
    window.addEventListener('storage', (e) => {
      if (e.key === 'userProfile') updateUserInfo();
    });
    window.addEventListener('userLoggedIn', updateUserInfo);

    return () => {
      window.removeEventListener('storage', updateUserInfo);
      window.removeEventListener('userLoggedIn', updateUserInfo);
    };
  }, []);

  // Favorites count sync
  useEffect(() => {
    const updateFavoriteCount = () => {
      const saved = localStorage.getItem('favoriteUploads');
      if (saved) {
        try {
          const favorites = JSON.parse(saved);
          setFavoriteCount(favorites.length || 0);
        } catch (e) {
          setFavoriteCount(0);
        }
      } else {
        setFavoriteCount(0);
      }
    };

    updateFavoriteCount();

    window.addEventListener('storage', (e) => {
      if (e.key === 'favoriteUploads') updateFavoriteCount();
    });
    window.addEventListener('favoritesUpdated', updateFavoriteCount);

    return () => {
      window.removeEventListener('storage', updateFavoriteCount);
      window.removeEventListener('favoritesUpdated', updateFavoriteCount);
    };
  }, []);

  const toggleExpanded = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleItemClick = (item) => {
    if (item.submenu) {
      toggleExpanded(item.id);
    } else {
      onPageChange(item.id);
    }
  };

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-72"
      } transition-all duration-300 ease-in-out bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 flex flex-col h-full`}
    >
      {/* Logo/Header */}
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>

          {!collapsed && (
            <div className="flex-1">
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                WE CONNECT
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                I Connect. You Connect. We Connect
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const hasSubmenu = !!item.submenu;

          const displayCount =
            item.id === "favorites" ? favoriteCount : item.count;

          const showCountBadge = displayCount !== undefined && displayCount > 0;

          return (
            <div key={item.id}>
              <button
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group
                  ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-purple-500/30"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="font-medium">{item.label}</span>

                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}

                      {showCountBadge && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-red-500/20 text-red-600 dark:text-red-400 rounded-full">
                          {displayCount}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {!collapsed && hasSubmenu && (
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      expandedItems.has(item.id) ? "rotate-180" : ""
                    }`}
                  />
                )}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Dynamic User Name & School */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
              {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                {userName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {userSchool}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;