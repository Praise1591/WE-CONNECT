// StatsGrid.jsx - Enhanced Version
import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  DownloadCloud,
  Users,
  Video,
  Coins,
  Download,
  Heart,
  CloudUpload,
  ArrowUpRight,
  Gem,
  TrendingUp,
  Sparkles,
  Award,
  Clock,
  Zap,
  Target,
  Calendar,
  Star,
  Flame,
  Gift,
  Crown,
  Trophy,
  Medal,
  Rocket,
  Brain,
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
  UserCheck,
  ThumbsUp,
  MessageCircle,
  Share2,
  Link2,
  ExternalLink
} from 'lucide-react';
import CountUp from 'react-countup';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { db, auth } from '@/firebase';
import {
  collection,
  query,
  onSnapshot,
  where,
  doc,
  orderBy,
  limit
} from 'firebase/firestore';

function StatsGrid() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userName, setUserName] = useState('Scholar');
  const [greeting, setGreeting] = useState('');
  const [showAchievements, setShowAchievements] = useState(false);

  // Platform stats
  const [totalMaterials, setTotalMaterials] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [activeLearners, setActiveLearners] = useState(0);
  const [totalVideos, setTotalVideos] = useState(0);
  const [weeklyGrowth, setWeeklyGrowth] = useState(0);
  const [monthlyActive, setMonthlyActive] = useState(0);
  const [topCategories, setTopCategories] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // User stats
  const [userDownloads, setUserDownloads] = useState(0);
  const [userFavorites, setUserFavorites] = useState(0);
  const [userUploads, setUserUploads] = useState(0);
  const [userStreak, setUserStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [rank, setRank] = useState('Beginner');
  const [nextRankProgress, setNextRankProgress] = useState(0);
  const [userReviews, setUserReviews] = useState(0);
  const [userShares, setUserShares] = useState(0);

  // Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Auth & Profile
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        const displayName = user.displayName || user.email?.split('@')[0] || 'Learner';
        setUserName(displayName.split(' ')[0]);
      } else {
        setUserName('Guest');
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    const profileUnsub = onSnapshot(
      doc(db, 'users', currentUser.uid),
      (snap) => {
        const data = snap.exists() ? snap.data() : { coins: 0, diamonds: 0, streak: 0 };
        setProfile(data);
        setUserStreak(data.streak || 0);
        setAchievements(data.achievements || []);
        
        // Calculate rank based on contributions
        const totalContributions = (data.uploads || 0) + (data.reviews || 0) + (data.shares || 0);
        if (totalContributions >= 100) setRank('Grandmaster');
        else if (totalContributions >= 50) setRank('Master');
        else if (totalContributions >= 25) setRank('Expert');
        else if (totalContributions >= 10) setRank('Advanced');
        else if (totalContributions >= 5) setRank('Intermediate');
        else setRank('Beginner');
        
        setNextRankProgress(Math.min(100, (totalContributions / 100) * 100));
      },
      console.error
    );
    return profileUnsub;
  }, [currentUser]);

  // Platform Stats
  useEffect(() => {
    const q = query(collection(db, 'materials'));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setTotalMaterials(snapshot.size);

      const downloadsSum = items.reduce((sum, item) => sum + (item.downloads || 0), 0);
      setTotalDownloads(downloadsSum);

      const videosCount = items.filter((item) =>
        item.category?.toLowerCase().includes('video')
      ).length;
      setTotalVideos(videosCount);

      // Calculate weekly growth
      const lastWeekItems = items.filter(item => {
        const createdAt = item.createdAt?.toDate?.() || new Date();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdAt > weekAgo;
      });
      setWeeklyGrowth(lastWeekItems.length);

      // Get top categories
      const categoryCount = {};
      items.forEach(item => {
        const cat = item.category || 'Other';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      });
      const topCats = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
      setTopCategories(topCats);
    }, console.error);
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsub = onSnapshot(q, (snapshot) => {
      setActiveLearners(snapshot.size);
      const active = snapshot.docs.filter(doc => {
        const lastActive = doc.data().lastActive?.toDate?.() || new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastActive > thirtyDaysAgo;
      }).length;
      setMonthlyActive(active);
    }, console.error);
    return unsub;
  }, []);

  // User Stats
  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, `users/${currentUser.uid}/downloads`));
    const unsub = onSnapshot(q, (snapshot) => setUserDownloads(snapshot.size), console.error);
    return unsub;
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, `users/${currentUser.uid}/favorites`));
    const unsub = onSnapshot(q, (snapshot) => setUserFavorites(snapshot.size), console.error);
    return unsub;
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'materials'), where('uid', '==', currentUser.uid));
    const unsub = onSnapshot(q, (snapshot) => setUserUploads(snapshot.size), console.error);
    return unsub;
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, `users/${currentUser.uid}/transactions`),
      where('type', '==', 'review'),
      orderBy('timestamp', 'desc'),
      limit(100)
    );
    const unsub = onSnapshot(q, (snapshot) => setUserReviews(snapshot.size), console.error);
    return unsub;
  }, [currentUser]);

  // Recent activities
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, `users/${currentUser.uid}/transactions`),
      orderBy('timestamp', 'desc'),
      limit(5)
    );
    const unsub = onSnapshot(q, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date()
      }));
      setRecentActivities(activities);
    });
    return unsub;
  }, [currentUser]);

  const platformStats = [
    { 
      icon: BookOpen, 
      label: 'Learning Materials', 
      value: totalMaterials, 
      color: 'from-blue-500 to-cyan-500',
      description: 'Resources available',
      gradient: 'blue',
    },
    { 
      icon: DownloadCloud, 
      label: 'Total Downloads', 
      value: totalDownloads, 
      color: 'from-emerald-500 to-teal-500',
      description: 'All time',
      gradient: 'emerald',
    },
    { 
      icon: Users, 
      label: 'Active Community', 
      value: activeLearners, 
      color: 'from-purple-500 to-pink-500',
      description: `${monthlyActive} active this month`,
      gradient: 'purple',
    },
    { 
      icon: Video, 
      label: 'Video Lessons', 
      value: totalVideos, 
      color: 'from-orange-500 to-red-500',
      description: 'Premium content',
      gradient: 'orange',
    },
  ];

  const userStats = [
    { 
      icon: Coins, 
      label: 'Coins', 
      value: profile?.coins ?? 0, 
      color: 'from-amber-500 to-yellow-500',
      description: 'Available to spend',
      suffix: '🪙',
      action: () => navigate('/monetary'),
    },
    { 
      icon: Gem, 
      label: 'Diamonds', 
      value: profile?.diamonds ?? 0, 
      color: 'from-violet-500 to-fuchsia-500',
      description: 'Premium currency',
      suffix: '💎',
      action: () => navigate('/monetary'),
    },
    { 
      icon: Download, 
      label: 'Downloads', 
      value: userDownloads, 
      color: 'from-cyan-500 to-blue-500',
      description: 'Resources saved',
      action: () => navigate('/downloads'),
    },
    { 
      icon: Heart, 
      label: 'Favorites', 
      value: userFavorites, 
      color: 'from-rose-500 to-pink-500',
      description: 'Liked content',
      action: () => navigate('/favorites'),
    },
    { 
      icon: CloudUpload, 
      label: 'Contributions', 
      value: userUploads, 
      color: 'from-indigo-500 to-purple-500',
      description: 'Materials shared',
      action: () => navigate('/upload'),
    },
    { 
      icon: Star, 
      label: 'Reviews', 
      value: userReviews, 
      color: 'from-yellow-500 to-amber-500',
      description: 'Reviews written',
    },
  ];

  const quickActions = [
    { icon: TrendingUp, label: 'Explore Trending', color: 'bg-emerald-500', path: '/materials?tab=trending' },
    { icon: Sparkles, label: 'AI Recommendations', color: 'bg-purple-500', path: '/materials?tab=recommended' },
    { icon: Award, label: 'Daily Challenge', color: 'bg-amber-500', path: '/challenges' },
    { icon: Clock, label: 'Continue Learning', color: 'bg-blue-500', path: '/materials?tab=recent' },
    { icon: Rocket, label: 'Quick Upload', color: 'bg-indigo-500', path: '/upload' },
    { icon: MessageCircle, label: 'Study Groups', color: 'bg-pink-500', path: '/connect' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 },
    },
  };

  const getGradientClass = (gradient) => {
    const gradients = {
      blue: 'from-blue-500/20 to-cyan-500/20',
      emerald: 'from-emerald-500/20 to-teal-500/20',
      purple: 'from-purple-500/20 to-pink-500/20',
      orange: 'from-orange-500/20 to-red-500/20',
      amber: 'from-amber-500/20 to-yellow-500/20',
      violet: 'from-violet-500/20 to-fuchsia-500/20',
      rose: 'from-rose-500/20 to-pink-500/20',
      indigo: 'from-indigo-500/20 to-purple-500/20',
      yellow: 'from-yellow-500/20 to-amber-500/20',
      cyan: 'from-cyan-500/20 to-blue-500/20',
    };
    return gradients[gradient] || 'from-gray-500/20 to-gray-600/20';
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 lg:space-y-10"
    >
      {/* Hero Section - Enhanced */}
      <motion.div variants={itemVariants} className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-3xl animate-pulse" />
        
        <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-2xl border border-white/20 dark:border-slate-800/50">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-white text-sm font-medium"
              >
                <Sparkles className="w-4 h-4" />
                {greeting}, {userName}!
              </motion.div>
              
              <h1 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Ready to learn something <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  amazing today?
                </span>
              </h1>
              
              <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
                Your learning journey continues with {totalMaterials.toLocaleString()}+ resources 
                and a community of {activeLearners.toLocaleString()}+ learners.
              </p>
              
              {/* Achievement badges */}
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-3 mt-4"
              >
                {userStreak > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full shadow-sm">
                    <Flame className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      {userStreak} day streak!
                    </span>
                  </div>
                )}
                
                {achievements.length > 0 && (
                  <button
                    onClick={() => setShowAchievements(!showAchievements)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full shadow-sm hover:shadow-md transition"
                  >
                    <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold text-purple-700 dark:text-purple-400">
                      {achievements.length} achievements
                    </span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                )}
                
                {/* Rank Badge */}
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 rounded-full shadow-sm">
                  <Crown className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <span className="font-semibold text-cyan-700 dark:text-cyan-400">
                    {rank}
                  </span>
                </div>
              </motion.div>
            </div>
            
            {/* Quick Stats Card */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 shadow-xl min-w-[200px]"
            >
              <div className="text-center text-white">
                <p className="text-sm opacity-90">Weekly Growth</p>
                <p className="text-4xl font-bold mt-2">+{weeklyGrowth}</p>
                <p className="text-xs mt-2 opacity-80">new materials added</p>
                <div className="flex items-center justify-center gap-1 mt-3 text-xs">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12% vs last week</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Rank Progress Bar */}
          {nextRankProgress > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progress to next rank</span>
                <span>{Math.round(nextRankProgress)}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${nextRankProgress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Achievements Popup */}
      <AnimatePresence>
        {showAchievements && achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAchievements(false)}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-500" />
                  Your Achievements
                </h3>
                <button onClick={() => setShowAchievements(false)} className="text-slate-400 hover:text-slate-600">
                  ✕
                </button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {achievements.map((ach, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center">
                      <Medal className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 dark:text-white">{ach.title}</p>
                      <p className="text-xs text-slate-500">{ach.description}</p>
                    </div>
                    <div className="text-xs text-amber-500 font-semibold">{ach.date || 'Unlocked'}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions - Enhanced */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-indigo-500" />
            Quick Actions
          </h2>
          <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            View all <ArrowUpRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {quickActions.map((action, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.path)}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700"
            >
              <div className={`absolute inset-0 ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <action.icon className={`w-8 h-8 ${action.color} text-white rounded-xl p-1.5 mb-2`} />
              <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">{action.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Click to start</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Platform Stats Section - Enhanced */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-7 h-7 text-emerald-500" />
              Platform Insights
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time community statistics</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Live data</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {platformStats.map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer`}
              onClick={() => navigate('/materials')}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <div className="bg-white/20 rounded-xl p-2.5 backdrop-blur-sm">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                      <CountUp end={stat.value} separator="," duration={2.2} />
                    </p>
                    <p className="text-xs text-white/80 mt-1 font-medium">{stat.description}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-white/90 font-semibold text-sm">{stat.label}</p>
                  <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white/40 rounded-full w-3/4" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Top Categories */}
        {topCategories.length > 0 && (
          <div className="mt-6 p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-500" />
              Top Categories
            </h3>
            <div className="flex flex-wrap gap-3">
              {topCategories.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                  <span className="text-sm">{cat.name}</span>
                  <span className="text-xs text-slate-500">{cat.count} items</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* User Activity Section - Enhanced */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Activity className="w-7 h-7 text-purple-500" />
              Your Activity
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Track your personal progress</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">All time stats</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {userStats.map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              onClick={stat.action}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-4 shadow-lg hover:shadow-2xl transition-all duration-300 ${stat.action ? 'cursor-pointer' : ''}`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="bg-white/20 rounded-xl p-1.5 backdrop-blur-sm">
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                  {stat.suffix && (
                    <span className="text-lg">{stat.suffix}</span>
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-xl lg:text-2xl font-bold text-white tracking-tight">
                    <CountUp end={stat.value} separator="," duration={2} />
                  </p>
                  <p className="text-xs text-white/80 mt-0.5 font-medium">{stat.label}</p>
                  <p className="text-[9px] text-white/60 mt-0.5">{stat.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity Feed */}
      {recentActivities.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Recent Activity</h2>
          </div>
          <div className="space-y-2">
            {recentActivities.map((activity, idx) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-3 p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/70 dark:border-slate-700/60 hover:shadow-md transition"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm text-slate-700 dark:text-slate-300">{activity.description}</p>
                  <p className="text-xs text-slate-400">
                    {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                {activity.type === 'purchase' && (
                  <div className="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-xs text-green-600">Deposit</div>
                )}
                {activity.type === 'withdrawal' && (
                  <div className="px-2 py-1 bg-red-100 dark:bg-red-900/30 rounded-full text-xs text-red-600">Withdrawal</div>
                )}
                {activity.type === 'upload' && (
                  <div className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs text-blue-600">Upload</div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Motivational Banner - Enhanced */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 shadow-xl">
          <div className="absolute inset-0 opacity-20" 
               style={{
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 60 0 L 0 0 0 60' fill='none' stroke='white' stroke-width='0.5' stroke-opacity='0.1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
               }}
          />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2 justify-center md:justify-start">
                <Target className="w-6 h-6" />
                Learning Streak Challenge!
              </h3>
              <p className="text-indigo-100">Complete 7 days of learning to unlock exclusive rewards</p>
              <div className="flex items-center gap-3 mt-3 justify-center md:justify-start">
                <div className="flex items-center gap-1">
                  <Gift className="w-4 h-4 text-white/80" />
                  <span className="text-xs text-white/80">100 Coins</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-white/50" />
                <div className="flex items-center gap-1">
                  <Trophy className="w-4 h-4 text-white/80" />
                  <span className="text-xs text-white/80">Exclusive Badge</span>
                </div>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/challenges')}
              className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              Start Challenge
              <Rocket className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Learning Tip of the Day */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">💡 Learning Tip</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Take breaks every 45 minutes to maximize retention and avoid burnout!</p>
          </div>
          <button className="text-xs text-blue-600 hover:underline">Share tip</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default StatsGrid;