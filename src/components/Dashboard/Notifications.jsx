// Notification.jsx — Modern 2025 redesign (glassmorphism + mobile-first)
import React, { useState, useEffect } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, Users, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    // Load current user
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      setCurrentUser(JSON.parse(profile));
    }

    // Load notifications
    const loadNotifications = () => {
      const saved = localStorage.getItem('appNotifications');
      if (saved) {
        try {
          const notifs = JSON.parse(saved);
          // Sort newest first
          setNotifications(notifs.sort((a, b) => new Date(b.time) - new Date(a.time)));
        } catch (e) {
          setNotifications([]);
        }
      }
    };

    loadNotifications();

    // Listen for new notifications
    window.addEventListener('newNotification', loadNotifications);

    return () => {
      window.removeEventListener('newNotification', loadNotifications);
    };
  }, []);

  const markAsRead = (id) => {
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('appNotifications', JSON.stringify(updated));
  };

  const clearAll = () => {
    if (!window.confirm("Clear all notifications?")) return;

    setClearing(true);
    setTimeout(() => {
      setNotifications([]);
      localStorage.removeItem('appNotifications');
      toast.success("Notifications cleared");
      setClearing(false);
    }, 300);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-400 fill-red-500/80" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-400" />;
      case 'connection_request':
        return <UserPlus className="w-5 h-5 text-purple-400" />;
      case 'connection_accepted':
        return <Users className="w-5 h-5 text-emerald-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center p-5 text-center">
        <div className="max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center backdrop-blur-sm border border-indigo-500/30">
            <Bell className="h-10 w-10 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Notifications</h2>
          <p className="text-slate-400">
            Sign in to see likes, comments, connection requests, and more.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">

        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bell className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                Notifications
              </h1>
              <p className="text-sm sm:text-base text-slate-400 mt-0.5">
                Your activity updates
              </p>
            </div>
          </div>

          {notifications.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={clearAll}
              disabled={clearing}
              className="px-5 py-2.5 bg-red-900/60 hover:bg-red-800/70 border border-red-700/50 text-red-200 text-sm font-medium rounded-xl transition disabled:opacity-50 flex items-center gap-2"
            >
              <Trash2 size={16} />
              {clearing ? 'Clearing...' : 'Clear All'}
            </motion.button>
          )}
        </header>

        {/* Notifications List */}
        <AnimatePresence>
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-600/10 to-purple-600/10 flex items-center justify-center mb-8 backdrop-blur-sm border border-indigo-500/20">
                <Bell className="h-12 w-12 text-indigo-400/70" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Quiet for now</h2>
              <p className="text-slate-400 max-w-md">
                Likes, comments, new connections and more will appear here.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xl hover:shadow-2xl transition-all duration-300 ${
                    !notif.read ? 'ring-2 ring-purple-500/40' : ''
                  }`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 flex-shrink-0">
                      {getIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-base sm:text-lg font-medium text-white leading-snug">
                        {notif.message}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
                        {notif.time}
                      </p>
                    </div>

                    {/* Unread pill */}
                    {!notif.read && (
                      <div className="w-3 h-3 mt-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/30 flex-shrink-0" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Notification;