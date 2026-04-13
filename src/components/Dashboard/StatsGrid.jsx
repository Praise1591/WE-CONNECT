// StatsGrid.jsx - Ultra-Modern Design with No Blinking
import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
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
  ExternalLink,
  Globe,
  Layers,
  Shield,
  Compass,
  Map,
  Infinity,
  Diamond,
  Star as StarIcon,
  BadgeCheck,
  CircleDot,
  ChartLine,
  Microscope,
  Atom,
  Database,
  Cpu,
  Cloud,
  Sparkle,
  ZapOff,
  Wind,
  Sun,
  Moon,
  CloudRain,
  CloudSnow,
  CloudLightning
} from 'lucide-react';
import CountUp from 'react-countup';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { db, auth } from '@/firebase';
import {
  collection,
  query,
  onSnapshot,
  where,
  doc,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';

// Animated Number Component
const AnimatedNumber = memo(({ value, suffix = '', prefix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value]);
  
  return (
    <span>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
});

// 3D Card Component
const Card3D = memo(({ children, className, onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);
  
  const springConfig = { damping: 25, stiffness: 300 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);
  
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;
    x.set(mouseX);
    y.set(mouseY);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  return (
    <motion.div
      style={{
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
});

// Floating Particles Background
const FloatingParticles = memo(() => {
  const particles = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    left: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.3 + 0.1,
  })), []);
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-gradient-to-r from-indigo-400 to-purple-400"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.left}%`,
            opacity: particle.opacity,
          }}
          animate={{
            y: ["0vh", "100vh"],
            x: [`${Math.random() * 20 - 10}%`, `${Math.random() * 20 - 10}%`],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
});

// Stat Card Component
const StatCard = memo(({ icon: Icon, label, value, color, gradient, description, onClick, suffix, prefix }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const gradientColors = {
    blue: 'from-blue-500 to-cyan-500',
    emerald: 'from-emerald-500 to-teal-500',
    purple: 'from-purple-500 to-pink-500',
    orange: 'from-orange-500 to-red-500',
    amber: 'from-amber-500 to-yellow-500',
    violet: 'from-violet-500 to-fuchsia-500',
    rose: 'from-rose-500 to-pink-500',
    indigo: 'from-indigo-500 to-purple-500',
    cyan: 'from-cyan-500 to-blue-500',
  };
  
  const bgGradients = {
    blue: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10',
    emerald: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10',
    purple: 'bg-gradient-to-br from-purple-500/10 to-pink-500/10',
    orange: 'bg-gradient-to-br from-orange-500/10 to-red-500/10',
    amber: 'bg-gradient-to-br from-amber-500/10 to-yellow-500/10',
    violet: 'bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10',
    rose: 'bg-gradient-to-br from-rose-500/10 to-pink-500/10',
    indigo: 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10',
    cyan: 'bg-gradient-to-br from-cyan-500/10 to-blue-500/10',
  };
  
  return (
    <Card3D
      className={`relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-slate-200/70 dark:border-slate-700/60 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated gradient background */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradientColors[gradient]} opacity-0 rounded-2xl`}
        animate={{ opacity: isHovered ? 0.15 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Glow effect */}
      <motion.div
        className={`absolute -inset-1 bg-gradient-to-r ${gradientColors[gradient]} rounded-2xl blur-xl`}
        animate={{ opacity: isHovered ? 0.3 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ zIndex: -1 }}
      />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <motion.div
            className={`p-3 rounded-xl bg-gradient-to-br ${gradientColors[gradient]} shadow-lg`}
            animate={{ rotate: isHovered ? [0, -10, 10, -5, 0] : 0 }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
          <motion.div
            animate={{ x: isHovered ? 5 : 0 }}
            className="text-slate-400 dark:text-slate-500"
          >
            <ArrowUpRight className="w-4 h-4" />
          </motion.div>
        </div>
        
        <div>
          <p className="text-3xl lg:text-4xl font-bold text-slate-800 dark:text-white tracking-tight">
            {suffix || prefix ? (
              <AnimatedNumber value={value} suffix={suffix} prefix={prefix} />
            ) : (
              <CountUp end={value} separator="," duration={2} />
            )}
          </p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-2">{label}</p>
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
          )}
        </div>
        
        {/* Progress bar */}
        <motion.div
          className="mt-4 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0.5 }}
        >
          <motion.div
            className={`h-full bg-gradient-to-r ${gradientColors[gradient]} rounded-full`}
            initial={{ width: "0%" }}
            animate={{ width: `${Math.min(100, value / 1000 * 100)}%` }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </motion.div>
      </div>
    </Card3D>
  );
});

// Main Component
function StatsGrid() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userName, setUserName] = useState('Scholar');
  const [greeting, setGreeting] = useState('');
  const [showAchievements, setShowAchievements] = useState(false);
  const [statsData, setStatsData] = useState({
    totalMaterials: 0,
    totalDownloads: 0,
    activeLearners: 0,
    totalVideos: 0,
    weeklyGrowth: 0,
    monthlyActive: 0,
    userDownloads: 0,
    userFavorites: 0,
    userUploads: 0,
    userStreak: 0,
    userReviews: 0,
    coins: 0,
    diamonds: 0,
  });
  const [topCategories, setTopCategories] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [rank, setRank] = useState('Beginner');
  const [nextRankProgress, setNextRankProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Set greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        const displayName = user.displayName || user.email?.split('@')[0] || 'Learner';
        setUserName(displayName.split(' ')[0]);
      } else {
        setUserName('Guest');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Profile listener
  useEffect(() => {
    if (!currentUser) return;
    
    const unsubscribe = onSnapshot(
      doc(db, 'users', currentUser.uid),
      (snap) => {
        const data = snap.exists() ? snap.data() : { coins: 0, diamonds: 0, streak: 0, achievements: [] };
        setProfile(data);
        setStatsData(prev => ({
          ...prev,
          coins: data.coins || 0,
          diamonds: data.diamonds || 0,
          userStreak: data.streak || 0,
        }));
        setAchievements(data.achievements || []);
        
        const totalContributions = (data.uploads || 0) + (data.reviews || 0) + (data.shares || 0);
        if (totalContributions >= 100) setRank('Grandmaster');
        else if (totalContributions >= 50) setRank('Master');
        else if (totalContributions >= 25) setRank('Expert');
        else if (totalContributions >= 10) setRank('Advanced');
        else if (totalContributions >= 5) setRank('Intermediate');
        else setRank('Beginner');
        
        setNextRankProgress(Math.min(100, (totalContributions / 100) * 100));
      },
      (error) => console.error("Profile error:", error)
    );
    return () => unsubscribe();
  }, [currentUser]);

  // Materials listener
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'materials'),
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        
        const downloadsSum = items.reduce((sum, item) => sum + (item.downloads || 0), 0);
        const videosCount = items.filter((item) =>
          item.category?.toLowerCase().includes('video')
        ).length;
        
        const lastWeekItems = items.filter(item => {
          const createdAt = item.createdAt?.toDate?.() || new Date();
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return createdAt > weekAgo;
        });
        
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
        setStatsData(prev => ({
          ...prev,
          totalMaterials: snapshot.size,
          totalDownloads: downloadsSum,
          totalVideos: videosCount,
          weeklyGrowth: lastWeekItems.length,
        }));
      },
      (error) => console.error("Materials error:", error)
    );
    return () => unsubscribe();
  }, []);

  // Users listener
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const active = snapshot.docs.filter(doc => {
          const lastActive = doc.data().lastActive?.toDate?.() || new Date();
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return lastActive > thirtyDaysAgo;
        }).length;
        
        setStatsData(prev => ({
          ...prev,
          activeLearners: snapshot.size,
          monthlyActive: active,
        }));
      },
      (error) => console.error("Users error:", error)
    );
    return () => unsubscribe();
  }, []);

  // User downloads listener
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = onSnapshot(
      collection(db, `users/${currentUser.uid}/downloads`),
      (snapshot) => setStatsData(prev => ({ ...prev, userDownloads: snapshot.size })),
      (error) => console.error("Downloads error:", error)
    );
    return () => unsubscribe();
  }, [currentUser]);

  // User favorites listener
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = onSnapshot(
      collection(db, `users/${currentUser.uid}/favorites`),
      (snapshot) => setStatsData(prev => ({ ...prev, userFavorites: snapshot.size })),
      (error) => console.error("Favorites error:", error)
    );
    return () => unsubscribe();
  }, [currentUser]);

  // User uploads listener
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = onSnapshot(
      query(collection(db, 'materials'), where('uid', '==', currentUser.uid)),
      (snapshot) => setStatsData(prev => ({ ...prev, userUploads: snapshot.size })),
      (error) => console.error("Uploads error:", error)
    );
    return () => unsubscribe();
  }, [currentUser]);

  // User reviews listener
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = onSnapshot(
      query(
        collection(db, `users/${currentUser.uid}/transactions`),
        where('type', '==', 'review')
      ),
      (snapshot) => setStatsData(prev => ({ ...prev, userReviews: snapshot.size })),
      (error) => console.error("Reviews error:", error)
    );
    return () => unsubscribe();
  }, [currentUser]);

  // Recent activities listener
  useEffect(() => {
    if (!currentUser) return;
    const unsubscribe = onSnapshot(
      query(
        collection(db, `users/${currentUser.uid}/transactions`),
        orderBy('timestamp', 'desc'),
        limit(5)
      ),
      (snapshot) => {
        const activities = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date()
        }));
        setRecentActivities(activities);
      }
    );
    return () => unsubscribe();
  }, [currentUser]);

  const platformStats = [
    { icon: BookOpen, label: 'Learning Materials', value: statsData.totalMaterials, color: 'from-blue-500 to-cyan-500', gradient: 'blue', description: 'Resources available' },
    { icon: DownloadCloud, label: 'Total Downloads', value: statsData.totalDownloads, color: 'from-emerald-500 to-teal-500', gradient: 'emerald', description: 'All time' },
    { icon: Users, label: 'Active Community', value: statsData.activeLearners, color: 'from-purple-500 to-pink-500', gradient: 'purple', description: `${statsData.monthlyActive} active this month` },
    { icon: Video, label: 'Video Lessons', value: statsData.totalVideos, color: 'from-orange-500 to-red-500', gradient: 'orange', description: 'Premium content' },
  ];

  const userStats = [
    { icon: Coins, label: 'Coins', value: statsData.coins, color: 'from-amber-500 to-yellow-500', gradient: 'amber', description: 'Available to spend', suffix: ' 🪙', action: () => navigate('/monetary') },
    { icon: Gem, label: 'Diamonds', value: statsData.diamonds, color: 'from-violet-500 to-fuchsia-500', gradient: 'violet', description: 'Premium currency', suffix: ' 💎', action: () => navigate('/monetary') },
    { icon: Download, label: 'Downloads', value: statsData.userDownloads, color: 'from-cyan-500 to-blue-500', gradient: 'cyan', description: 'Resources saved', action: () => navigate('/downloads') },
    { icon: Heart, label: 'Favorites', value: statsData.userFavorites, color: 'from-rose-500 to-pink-500', gradient: 'rose', description: 'Liked content', action: () => navigate('/favorites') },
    { icon: CloudUpload, label: 'Contributions', value: statsData.userUploads, color: 'from-indigo-500 to-purple-500', gradient: 'indigo', description: 'Materials shared', action: () => navigate('/upload') },
    { icon: Star, label: 'Reviews', value: statsData.userReviews, color: 'from-yellow-500 to-amber-500', gradient: 'amber', description: 'Reviews written' },
  ];

  const quickActions = [
    { icon: TrendingUp, label: 'Explore Trending', color: 'bg-emerald-500', path: '/materials?tab=trending' },
    { icon: Sparkles, label: 'AI Recommendations', color: 'bg-purple-500', path: '/materials?tab=recommended' },
    { icon: Award, label: 'Daily Challenge', color: 'bg-amber-500', path: '/challenges' },
    { icon: Clock, label: 'Continue Learning', color: 'bg-blue-500', path: '/materials?tab=recent' },
    { icon: Rocket, label: 'Quick Upload', color: 'bg-indigo-500', path: '/upload' },
    { icon: MessageCircle, label: 'Study Groups', color: 'bg-pink-500', path: '/connect' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Hero Section - 3D Effect */}
      <div className="relative overflow-hidden rounded-3xl">
        <FloatingParticles />
        
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 lg:p-10 shadow-2xl">
          {/* Animated grid background */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium"
              >
                <Sparkles className="w-4 h-4" />
                {greeting}, {userName}! ✨
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl lg:text-5xl font-bold text-white"
              >
                Ready to learn something{' '}
                <span className="bg-gradient-to-r from-yellow-300 to-amber-300 bg-clip-text text-transparent">
                  amazing today?
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-indigo-100 text-lg max-w-2xl"
              >
                Your learning journey continues with {statsData.totalMaterials.toLocaleString()}+ resources
                and a community of {statsData.activeLearners.toLocaleString()}+ learners.
              </motion.p>
              
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap items-center gap-3"
              >
                {statsData.userStreak > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 backdrop-blur-sm rounded-full">
                    <Flame className="w-5 h-5 text-amber-300" />
                    <span className="font-semibold text-amber-100">
                      {statsData.userStreak} day streak!
                    </span>
                  </div>
                )}
                
                {achievements.length > 0 && (
                  <button
                    onClick={() => setShowAchievements(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 backdrop-blur-sm rounded-full hover:bg-purple-500/30 transition"
                  >
                    <Trophy className="w-5 h-5 text-purple-300" />
                    <span className="font-semibold text-purple-100">
                      {achievements.length} achievements
                    </span>
                  </button>
                )}
                
                <div className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 backdrop-blur-sm rounded-full">
                  <Crown className="w-5 h-5 text-cyan-300" />
                  <span className="font-semibold text-cyan-100">{rank}</span>
                </div>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
              whileHover={{ scale: 1.05 }}
              className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 min-w-[200px]"
            >
              <div className="text-center text-white">
                <p className="text-sm opacity-90">Weekly Growth</p>
                <p className="text-4xl font-bold mt-2">+{statsData.weeklyGrowth}</p>
                <p className="text-xs mt-2 opacity-80">new materials added</p>
                <div className="flex items-center justify-center gap-1 mt-3 text-xs">
                  <TrendingUp className="w-3 h-3" />
                  <span>+12% vs last week</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Rank Progress */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-6 pt-4 border-t border-white/20"
          >
            <div className="flex justify-between text-xs text-white/80 mb-2">
              <span>Progress to next rank</span>
              <span>{Math.round(nextRankProgress)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${nextRankProgress}%` }}
                transition={{ duration: 1, delay: 1 }}
                className="bg-gradient-to-r from-yellow-300 to-amber-300 h-2 rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl lg:text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-indigo-500" />
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {quickActions.map((action, idx) => (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
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
      </div>

      {/* Platform Stats */}
      <div>
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
            <StatCard key={i} {...stat} onClick={() => navigate('/materials')} />
          ))}
        </div>

        {/* Top Categories */}
        {topCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-200/70 dark:border-slate-700/60"
          >
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-500" />
              Top Categories
            </h3>
            <div className="flex flex-wrap gap-3">
              {topCategories.map((cat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-full cursor-pointer"
                  onClick={() => navigate(`/materials?category=${encodeURIComponent(cat.name)}`)}
                >
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
                  <span className="text-sm">{cat.name}</span>
                  <span className="text-xs text-slate-500">{cat.count} items</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* User Activity */}
      <div>
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
            <StatCard key={i} {...stat} />
          ))}
        </div>
      </div>

      {/* Recent Activity Feed */}
      {recentActivities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
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
                whileHover={{ x: 5 }}
                className="flex items-center gap-3 p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/70 dark:border-slate-700/60 hover:shadow-md transition"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <div className="flex-1">
                  <p className="text-sm text-slate-700 dark:text-slate-300">{activity.description}</p>
                  <p className="text-xs text-slate-400">
                    {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  activity.type === 'purchase' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                  activity.type === 'withdrawal' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                }`}>
                  {activity.type === 'purchase' ? 'Deposit' : activity.type === 'withdrawal' ? 'Withdrawal' : 'Upload'}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Motivational Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.01 }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 shadow-xl">
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>
          
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

      {/* Learning Tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">💡 Learning Tip</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Take breaks every 45 minutes to maximize retention and avoid burnout!</p>
          </div>
        </div>
      </motion.div>

      {/* Achievements Modal */}
      <AnimatePresence>
        {showAchievements && achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAchievements(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 25 }}
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
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full flex items-center justify-center">
                      <Medal className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 dark:text-white">{ach.title}</p>
                      <p className="text-xs text-slate-500">{ach.description}</p>
                    </div>
                    <div className="text-xs text-amber-500 font-semibold">{ach.date || 'Unlocked'}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default StatsGrid;