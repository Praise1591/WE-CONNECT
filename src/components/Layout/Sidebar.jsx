// src/components/Layout/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Heart, 
  Upload, 
  TrendingUp, 
  Users, 
  Bell, 
  Download, 
  Coins, 
  Info, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  UserPlus,
  Award,
  MessageCircle,
  Star,
  Shield,
  Gem,
  UserCircle,
  Globe,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function Sidebar({ collapsed, onToggleCollapse, isMobileOpen, onMobileClose }) {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [forceUpdate, setForceUpdate] = useState(false);
  const [localPhotoURL, setLocalPhotoURL] = useState(null);
  const [localName, setLocalName] = useState(null);
  const [localRole, setLocalRole] = useState(null);

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      if (event.detail) {
        if (event.detail.photoURL !== undefined) {
          setLocalPhotoURL(event.detail.photoURL);
        }
        if (event.detail.name !== undefined) {
          setLocalName(event.detail.name);
        }
        if (event.detail.role !== undefined) {
          setLocalRole(event.detail.role);
        }
        setForceUpdate(prev => !prev);
      }
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    const handleStorageChange = (e) => {
      if (e.key === 'userProfile' || e.key === 'lastProfileUpdate') {
        setForceUpdate(prev => !prev);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Update local state when userProfile changes
  useEffect(() => {
    if (userProfile) {
      setLocalPhotoURL(userProfile.photoURL);
      setLocalName(userProfile.name);
      setLocalRole(userProfile.role);
    }
  }, [userProfile]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const getUserInitials = () => {
    const name = localName || userProfile?.name || userProfile?.email || 'User';
    return name.charAt(0).toUpperCase();
  };

  const getUserName = () => {
    if (localName && localName !== 'User') {
      return localName;
    }
    if (userProfile?.name && userProfile.name !== 'User') {
      return userProfile.name;
    }
    if (userProfile?.email) {
      return userProfile.email.split('@')[0];
    }
    return 'User';
  };

  const getUserRole = () => {
    const role = localRole || userProfile?.role || 'student';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  const getUserPhoto = () => {
    return localPhotoURL || userProfile?.photoURL || null;
  };

  const navItems = [
    { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/materials', icon: <BookOpen size={20} />, label: 'Materials' },
    { path: '/favorites', icon: <Heart size={20} />, label: 'Favorites' },
    { path: '/upload', icon: <Upload size={20} />, label: 'Upload' },
    { path: '/analytics', icon: <TrendingUp size={20} />, label: 'Analytics' },
    { path: '/connect', icon: <Users size={20} />, label: 'Connect' },
    { path: '/notifications', icon: <Bell size={20} />, label: 'Notifications' },
    { path: '/downloads', icon: <Download size={20} />, label: 'Downloads' },
    { path: '/monetary', icon: <Coins size={20} />, label: 'Wallet' },
    { path: `/profile/${userProfile?.id}`, icon: <UserCircle size={20} />, label: 'My Profile' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
    { path: '/about', icon: <Info size={20} />, label: 'About' },
  ];

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Logo Area */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              WE CONNECT
            </span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
            <UserPlus className="w-4 h-4 text-white" />
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* User Profile Section */}
      <div className={`p-4 border-b border-slate-200 dark:border-slate-700 ${collapsed ? 'text-center' : ''}`}>
        <div className={`flex ${collapsed ? 'flex-col items-center' : 'items-center gap-3'}`}>
          {/* Avatar */}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg overflow-hidden">
              {getUserPhoto() ? (
                <img src={getUserPhoto()} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                getUserInitials()
              )}
            </div>
            {!collapsed && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
            )}
          </div>
          
          {/* User Info - Only show when not collapsed */}
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                {getUserName()}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Award className="w-3 h-3 text-indigo-500" />
                <p className="text-xs text-slate-500 truncate">
                  {getUserRole()}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Coin and Diamond Balances */}
        <div className={`mt-3 ${collapsed ? 'flex flex-col items-center gap-2' : 'grid grid-cols-2 gap-2'}`}>
          <div className={`flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 ${collapsed ? 'justify-center' : ''}`}>
            <Coins className="w-4 h-4 text-amber-500" />
            {!collapsed ? (
              <div className="flex-1">
                <p className="text-xs text-amber-600 dark:text-amber-400">Coins</p>
                <p className="text-sm font-bold text-amber-700 dark:text-amber-300">
                  {userProfile?.coins?.toLocaleString() || 0}
                </p>
              </div>
            ) : (
              <span className="text-xs font-bold text-amber-600">
                {userProfile?.coins?.toLocaleString() || 0}
              </span>
            )}
          </div>
          
          <div className={`flex items-center gap-2 p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 ${collapsed ? 'justify-center' : ''}`}>
            <Gem className="w-4 h-4 text-purple-500" />
            {!collapsed ? (
              <div className="flex-1">
                <p className="text-xs text-purple-600 dark:text-purple-400">Diamonds</p>
                <p className="text-sm font-bold text-purple-700 dark:text-purple-300">
                  {userProfile?.diamonds?.toLocaleString() || 0}
                </p>
              </div>
            ) : (
              <span className="text-xs font-bold text-purple-600">
                {userProfile?.diamonds?.toLocaleString() || 0}
              </span>
            )}
          </div>
        </div>
        
        {/* Withdrawable amount hint */}
        {!collapsed && (
          <div className="mt-2 text-center">
            <p className="text-xs text-slate-400">
              Withdrawable: ₦{((userProfile?.diamonds || 0) * 60).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={() => {
                  if (isMobileOpen && onMobileClose) {
                    onMobileClose();
                  }
                }}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.label : ''}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer - Logout Button */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={handleLogout}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl 
            text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 
            transition-all duration-200
            ${collapsed ? 'justify-center' : ''}
          `}
          title={collapsed ? 'Logout' : ''}
        >
          <LogOut size={20} />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;