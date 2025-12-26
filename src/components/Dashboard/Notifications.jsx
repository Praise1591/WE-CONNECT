// Notification.jsx
import React, { useState, useEffect } from 'react';
import { Bell, Heart, MessageCircle, UserPlus, Users, X } from 'lucide-react';

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Load current user
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      setCurrentUser(JSON.parse(profile));
    }

    // Load all notifications from localStorage
    const loadNotifications = () => {
      const saved = localStorage.getItem('appNotifications');
      if (saved) {
        try {
          const notifs = JSON.parse(saved);
          // Sort by newest first
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
    setNotifications([]);
    localStorage.removeItem('appNotifications');
  };

  const getIcon = (type) => {
    switch (type) {
      case 'like':
        return <Heart className="w-5 h-5 text-red-500 fill-red-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'connection_request':
        return <UserPlus className="w-5 h-5 text-purple-500" />;
      case 'connection_accepted':
        return <Users className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
          <Bell className="w-20 h-20 text-purple-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-slate-800 mb-4">Notifications</h2>
          <p className="text-slate-600">Please log in to view your notifications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                Notifications
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Stay updated with your community activity
              </p>
            </div>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="px-6 py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-all"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-24 h-24 text-slate-300 dark:text-slate-700 mx-auto mb-6" />
            <h3 className="text-xl font-medium text-slate-600 dark:text-slate-400 mb-2">
              No notifications yet
            </h3>
            <p className="text-slate-500 dark:text-slate-500">
              When someone likes your post, comments, or sends a connection request, you'll see it here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 flex items-start gap-4 transition-all ${
                  !notif.read ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
                }`}
                onClick={() => markAsRead(notif.id)}
              >
                <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1">
                  <p className="text-slate-800 dark:text-white font-medium">
                    {notif.message}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {notif.time}
                  </p>
                </div>

                {!notif.read && (
                  <div className="w-3 h-3 bg-purple-600 rounded-full" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Notification;