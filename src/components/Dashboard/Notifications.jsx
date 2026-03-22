// Notifications.jsx - Complete Redesign with Modern UI/UX
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, Heart, Download, MessageCircle, UserPlus, Users, X, 
  Trash2, AlertTriangle, Loader2, User, Upload, CheckCircle,
  Clock, Filter, Calendar, Star, Award, Gift, TrendingUp,
  Sparkles, Eye, BookOpen, Link2, MoreHorizontal, CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { db, auth } from '../../firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
  limit,
  startAfter,
  getDocs,
} from 'firebase/firestore';

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [markingAllRead, setMarkingAllRead] = useState(false);

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

  // Real-time listener with pagination
  useEffect(() => {
    if (!currentUser?.uid) return;

    const q = query(
      collection(db, `users/${currentUser.uid}/notifications`),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const createdAt = data.createdAt?.toDate?.() || new Date();
        return {
          id: docSnap.id,
          ...data,
          time: formatDistanceToNow(createdAt, { addSuffix: true }),
          timestamp: createdAt,
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

  // Filter notifications based on type
  const filteredNotifications = useMemo(() => {
    if (filterType === 'all') return notifications;
    return notifications.filter(n => n.type === filterType);
  }, [notifications, filterType]);

  const unreadCount = notifications.filter(n => !n.read).length;

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

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    setMarkingAllRead(true);
    try {
      const batch = writeBatch(db);
      notifications.filter(n => !n.read).forEach((notif) => {
        batch.update(doc(db, `users/${currentUser.uid}/notifications`, notif.id), {
          read: true,
        });
      });
      await batch.commit();
      toast.success("All notifications marked as read");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark as read");
    } finally {
      setMarkingAllRead(false);
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

  const handleNotificationClick = async (notification) => {
    await markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type === 'new_material' && notification.materialId) {
      navigate(`/materials/${notification.materialId}`);
    } else if (notification.type === 'new_follower' && notification.userId) {
      navigate(`/profile/${notification.userId}`);
    } else if (notification.type === 'download' && notification.materialId) {
      navigate(`/materials/${notification.materialId}`);
    } else if (notification.type === 'favorite' && notification.materialId) {
      navigate(`/materials/${notification.materialId}`);
    } else if (notification.type === 'like' && notification.materialId) {
      navigate(`/materials/${notification.materialId}`);
    } else if (notification.type === 'comment' && notification.materialId) {
      navigate(`/materials/${notification.materialId}`);
    } else if (notification.type === 'connection_accepted' && notification.userId) {
      navigate(`/profile/${notification.userId}`);
    } else if (notification.type === 'connection_request' && notification.userId) {
      navigate(`/profile/${notification.userId}`);
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
      case 'new_follower':
        return <UserPlus className="w-5 h-5 text-purple-600" />;
      case 'new_material':
        return <Upload className="w-5 h-5 text-indigo-600" />;
      case 'award':
        return <Award className="w-5 h-5 text-amber-600" />;
      case 'achievement':
        return <Star className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const getIconBackground = (type) => {
    switch (type) {
      case 'favorite':
      case 'like':
        return 'bg-red-100 dark:bg-red-950/50';
      case 'download':
        return 'bg-violet-100 dark:bg-violet-950/50';
      case 'comment':
        return 'bg-blue-100 dark:bg-blue-950/50';
      case 'connection_request':
      case 'new_follower':
        return 'bg-purple-100 dark:bg-purple-950/50';
      case 'connection_accepted':
        return 'bg-emerald-100 dark:bg-emerald-950/50';
      case 'new_material':
        return 'bg-indigo-100 dark:bg-indigo-950/50';
      case 'award':
        return 'bg-amber-100 dark:bg-amber-950/50';
      case 'achievement':
        return 'bg-yellow-100 dark:bg-yellow-950/50';
      default:
        return 'bg-slate-100 dark:bg-slate-800';
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All', icon: Bell },
    { value: 'new_material', label: 'Materials', icon: Upload },
    { value: 'like', label: 'Likes', icon: Heart },
    { value: 'comment', label: 'Comments', icon: MessageCircle },
    { value: 'connection_request', label: 'Connections', icon: UserPlus },
    { value: 'download', label: 'Downloads', icon: Download },
  ];

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center shadow-lg">
            <Bell className="h-12 w-12 text-slate-500 dark:text-slate-400" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">Notifications</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Sign in to see your activity and stay updated with what's happening
          </p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-12 w-12 text-indigo-600" />
          </motion.div>
          <p className="text-slate-500 dark:text-slate-400">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Notifications
                </h1>
              </div>
              <p className="text-slate-600 dark:text-slate-400 ml-1">
                Stay updated with your activity and community interactions
              </p>
            </div>

            <div className="flex items-center gap-3">
              {notifications.length > 0 && (
                <>
                  {unreadCount > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={markAllAsRead}
                      disabled={markingAllRead}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-sm font-medium rounded-xl transition flex items-center gap-2"
                    >
                      {markingAllRead ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCheck className="w-4 h-4" />
                      )}
                      Mark all read
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowConfirmClear(true)}
                    disabled={clearing}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 text-sm font-medium rounded-xl transition flex items-center gap-2"
                  >
                    <Trash2 size={16} />
                    {clearing ? 'Clearing...' : 'Clear all'}
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Filter Bar */}
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => {
                const Icon = option.icon;
                const count = filterType === 'all' 
                  ? notifications.length 
                  : notifications.filter(n => n.type === option.value).length;
                const isActive = filterType === option.value;
                
                return (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFilterType(option.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-white/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{option.label}</span>
                    {count > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}>
                        {count}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Stats Summary */}
        {notifications.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-4 p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-950 rounded-lg flex items-center justify-center">
                <Bell className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{notifications.length}</p>
                <p className="text-xs text-slate-500">Total</p>
              </div>
            </div>
            <div className="w-px h-10 bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-950 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{unreadCount}</p>
                <p className="text-xs text-slate-500">Unread</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 dark:bg-slate-800/70 rounded-2xl p-12 md:p-16 text-center border border-slate-200/60 dark:border-slate-700/50 shadow-sm"
          >
            {filterType !== 'all' ? (
              <>
                <Filter className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                  No {filterType.replace('_', ' ')} notifications
                </h3>
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                  Try a different filter or check back later
                </p>
                <button
                  onClick={() => setFilterType('all')}
                  className="mt-4 px-4 py-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Show all notifications →
                </button>
              </>
            ) : (
              <>
                <Bell className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                  No notifications yet
                </h3>
                <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  When you receive notifications about materials, connections, and activities, they'll appear here
                </p>
              </>
            )}
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notif, idx) => (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: idx * 0.03, type: "spring", stiffness: 500, damping: 30 }}
                  whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                  className={`group relative bg-white dark:bg-slate-800 rounded-2xl shadow-sm border overflow-hidden cursor-pointer transition-all duration-200 ${
                    !notif.read 
                      ? 'border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500/30' 
                      : 'border-slate-200/70 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="p-5 flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-full ${getIconBackground(notif.type)} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
                      {getIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-medium text-base text-slate-900 dark:text-white leading-relaxed">
                            {notif.message}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Clock className="w-3 h-3" />
                              <span>{notif.time}</span>
                            </div>
                            {notif.type && (
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <div className="w-1 h-1 rounded-full bg-slate-400" />
                                <span className="capitalize">{notif.type.replace('_', ' ')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {!notif.read && (
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 to-indigo-500/0 group-hover:from-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-300 pointer-events-none" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Clear All Confirmation Modal */}
        <AnimatePresence>
          {showConfirmClear && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                        Clear all notifications?
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {notifications.length} notifications will be removed
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mb-6">
                    This action cannot be undone. All your notifications will be permanently deleted.
                  </p>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowConfirmClear(false)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleClearAll}
                      disabled={clearing}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {clearing && <Loader2 className="h-4 w-4 animate-spin" />}
                      Clear All
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Notifications;