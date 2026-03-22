// StatsGrid.jsx
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
} from 'lucide-react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';

import { db, auth } from '@/firebase';
import {
  collection,
  query,
  onSnapshot,
  where,
  doc,
} from 'firebase/firestore';

function StatsGrid() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userName, setUserName] = useState('Scholar');
  const [greeting, setGreeting] = useState('');

  // Platform stats
  const [totalMaterials, setTotalMaterials] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [activeLearners, setActiveLearners] = useState(0);
  const [totalVideos, setTotalVideos] = useState(0);
  const [weeklyGrowth, setWeeklyGrowth] = useState(0);
  const [monthlyActive, setMonthlyActive] = useState(0);

  // User stats
  const [userDownloads, setUserDownloads] = useState(0);
  const [userFavorites, setUserFavorites] = useState(0);
  const [userUploads, setUserUploads] = useState(0);
  const [userStreak, setUserStreak] = useState(0);
  const [achievements, setAchievements] = useState([]);

  // Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // ── Auth & Profile ─────────────────────────────────────────────────────
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        setUserName(user.displayName ? user.displayName.split(' ')[0] : 'Learner');
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
      },
      console.error
    );
    return profileUnsub;
  }, [currentUser]);

  // ── Live Platform Stats ────────────────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'materials'));
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => d.data());
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
    }, console.error);
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsub = onSnapshot(q, (snapshot) => {
      setActiveLearners(snapshot.size);
      // Calculate monthly active
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

  // ── Live User Stats ────────────────────────────────────────────────────
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
    const q = query(collection(db, 'materials'), where('ownerUid', '==', currentUser.uid));
    const unsub = onSnapshot(q, (snapshot) => setUserUploads(snapshot.size), console.error);
    return unsub;
  }, [currentUser]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
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

  const platformStats = [
    { 
      icon: BookOpen, 
      label: 'Learning Materials', 
      value: totalMaterials, 
      color: 'from-blue-500 to-cyan-500',
      description: 'Resources available',
    },
    { 
      icon: DownloadCloud, 
      label: 'Total Downloads', 
      value: totalDownloads, 
      color: 'from-emerald-500 to-teal-500',
      description: 'All time',
    },
    { 
      icon: Users, 
      label: 'Active Community', 
      value: activeLearners, 
      color: 'from-purple-500 to-pink-500',
      description: `${monthlyActive} active this month`,
    },
    { 
      icon: Video, 
      label: 'Video Lessons', 
      value: totalVideos, 
      color: 'from-orange-500 to-red-500',
      description: 'Premium content',
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
    },
    { 
      icon: Gem, 
      label: 'Diamonds', 
      value: profile?.diamonds ?? 0, 
      color: 'from-violet-500 to-fuchsia-500',
      description: 'Premium currency',
      suffix: '💎',
    },
    { 
      icon: Download, 
      label: 'Downloads', 
      value: userDownloads, 
      color: 'from-cyan-500 to-blue-500',
      description: 'Resources saved',
    },
    { 
      icon: Heart, 
      label: 'Favorites', 
      value: userFavorites, 
      color: 'from-rose-500 to-pink-500',
      description: 'Liked content',
    },
    { 
      icon: CloudUpload, 
      label: 'Contributions', 
      value: userUploads, 
      color: 'from-indigo-500 to-purple-500',
      description: 'Materials shared',
    },
  ];

  // Quick actions
  const quickActions = [
    { icon: TrendingUp, label: 'Explore Trending', color: 'bg-emerald-500' },
    { icon: Sparkles, label: 'AI Recommendations', color: 'bg-purple-500' },
    { icon: Award, label: 'Daily Challenge', color: 'bg-amber-500' },
    { icon: Clock, label: 'Continue Learning', color: 'bg-blue-500' },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8 lg:space-y-10"
    >
      {/* Hero Section - Personalized Greeting */}
      <motion.div variants={itemVariants} className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 rounded-3xl blur-3xl" />
        
        <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 lg:p-8 shadow-2xl border border-white/20 dark:border-slate-800/50">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl" />
          
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
                Your learning journey continues with {totalMaterials}+ resources and a community of {activeLearners}+ learners.
              </p>
              
              {/* Achievement badge */}
              {userStreak > 0 && (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-3 mt-4"
                >
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                    <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span className="font-semibold text-amber-700 dark:text-amber-400">
                      {userStreak} day streak!
                    </span>
                  </div>
                  {achievements.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <span className="font-semibold text-purple-700 dark:text-purple-400">
                        {achievements.length} achievements
                      </span>
                    </div>
                  )}
                </motion.div>
              )}
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
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-indigo-500" />
            Quick Actions
          </h2>
          <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            View all
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <motion.button
              key={idx}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-5 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700"
            >
              <div className={`absolute inset-0 ${action.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <action.icon className={`w-8 h-8 ${action.color} text-white rounded-xl p-1.5 mb-3`} />
              <p className="font-semibold text-slate-700 dark:text-slate-300">{action.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Click to start</p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Platform Stats Section */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-7 h-7 text-emerald-500" />
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
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-6 shadow-lg hover:shadow-2xl transition-all duration-300`}
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
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* User Activity Section */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Award className="w-7 h-7 text-purple-500" />
              Your Activity
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Track your personal progress</p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">All time stats</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {userStats.map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-5 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="bg-white/20 rounded-xl p-2 backdrop-blur-sm">
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  {stat.suffix && (
                    <span className="text-xl">{stat.suffix}</span>
                  )}
                </div>
                <div className="mt-3">
                  <p className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                    <CountUp end={stat.value} separator="," duration={2} />
                  </p>
                  <p className="text-xs text-white/80 mt-1 font-medium">{stat.label}</p>
                  <p className="text-[10px] text-white/60 mt-1">{stat.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Motivational Banner */}
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
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Start Challenge →
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default StatsGrid;