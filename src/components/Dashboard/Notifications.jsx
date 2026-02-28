// Notification.jsx
import React, { useState, useEffect } from 'react';
import { Bell, Heart, Download, MessageCircle, UserPlus, Users, X, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast'; // or react-toastify
import { db, auth } from '@/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (!user) {
        setNotifications([]);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  // Real-time listener
  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, `users/${currentUser.uid}/notifications`),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          time: data.createdAt?.toDate
            ? data.createdAt.toDate().toLocaleString([], {
                dateStyle: 'medium',
                timeStyle: 'short',
              })
            : 'Just now',
        };
      });
      setNotifications(notifs);
      setLoading(false);
    }, (err) => {
      console.error("Notifications error:", err);
      toast.error("Couldn't load notifications");
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser?.uid]);

  const markAsRead = async (id) => {
    if (!currentUser?.uid || !id) return;
    try {
      await updateDoc(doc(db, `users/${currentUser.uid}/notifications`, id), {
        read: true,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    setShowConfirmClear(false);
    setClearing(true);
    try {
      const batch = writeBatch(db);
      notifications.forEach((notif) => {
        batch.delete(doc(db, `users/${currentUser.uid}/notifications`, notif.id));
      });
      await batch.commit();
      toast.success("Notifications cleared");
    } catch (err) {
      console.error(err);
      toast.error("Failed to clear notifications");
    } finally {
      setClearing(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'favorite':
        return <Heart className="w-5 h-5 text-red-500 fill-red-500/70" />;
      case 'download':
        return <Download className="w-5 h-5 text-violet-600" />;
      case 'like':
        return <Heart className="w-5 h-5 text-red-500 fill-red-500/70" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-blue-600" />;
      case 'connection_request':
        return <UserPlus className="w-5 h-5 text-purple-600" />;
      case 'connection_accepted':
        return <Users className="w-5 h-5 text-emerald-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-5 text-center">
        <div className="max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center ring-1 ring-slate-200 dark:ring-slate-700">
            <Bell className="h-10 w-10 text-slate-500 dark:text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Notifications</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Sign in to see your favorites, downloads and activity
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
          <p className="text-slate-500 dark:text-slate-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 text-slate-900 dark:text-white pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 md:space-y-8">

        {/* Header with Clear All at top-right */}
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Notifications
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300 flex items-center gap-2 flex-wrap">
              <span className="font-medium">
                {notifications.length} item{notifications.length !== 1 ? 's' : ''}
              </span>
              {notifications.some(n => !n.read) && (
                <span className="text-sm text-violet-600 dark:text-violet-400 font-medium">
                  ({notifications.filter(n => !n.read).length} unread)
                </span>
              )}
            </p>
          </div>

          {notifications.length > 0 && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowConfirmClear(true)}
              disabled={clearing}
              className="px-5 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-sm font-medium rounded-xl transition disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              <Trash2 size={16} />
              {clearing ? 'Clearing...' : 'Clear All'}
            </motion.button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white/70 dark:bg-slate-800/70 rounded-2xl p-10 md:p-16 text-center border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
            <Bell className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 opacity-70 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
              No notifications yet
            </h3>
            <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your favorites, downloads and other activity will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className={`group bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/70 dark:border-slate-700/60 overflow-hidden hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 cursor-pointer ${
                    !notif.read ? 'ring-2 ring-violet-500/40' : ''
                  }`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                      {getIcon(notif.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-base leading-tight text-slate-900 dark:text-white">
                        {notif.message}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {notif.time}
                      </p>
                    </div>

                    {!notif.read && (
                      <div className="w-3 h-3 mt-2 rounded-full bg-violet-600 flex-shrink-0 shadow-sm" />
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Modern Confirm Modal */}
        <AnimatePresence>
          {showConfirmClear && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200/70 dark:border-slate-700/60"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Clear all notifications?
                    </h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mb-6">
                    This action cannot be undone. All your notifications will be permanently removed.
                  </p>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowConfirmClear(false)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearAll}
                      disabled={clearing}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {clearing && <Loader2 className="h-4 w-4 animate-spin" />}
                      Clear All
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Notification;