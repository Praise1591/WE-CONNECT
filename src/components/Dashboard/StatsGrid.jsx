// StatsGrid.jsx
import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  DownloadCloud,
  Users,
  Video,
  Coins,
  Diamond,
  Download,
  Heart,
  CloudUpload,
  ArrowUpRight,
  Gem,
} from 'lucide-react';
import CountUp from 'react-countup';

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

  // Platform stats
  const [totalMaterials, setTotalMaterials] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [activeLearners, setActiveLearners] = useState(0);
  const [totalVideos, setTotalVideos] = useState(0);

  // User stats
  const [userDownloads, setUserDownloads] = useState(0);
  const [userFavorites, setUserFavorites] = useState(0);
  const [userUploads, setUserUploads] = useState(0);

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
      (snap) => setProfile(snap.exists() ? snap.data() : { coins: 0, diamonds: 0 }),
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
    }, console.error);
    return unsub;
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsub = onSnapshot(q, (snapshot) => setActiveLearners(snapshot.size), console.error);
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

  // ── Data for cards ─────────────────────────────────────────────────────
  const platformStats = [
    { icon: BookOpen, label: 'Total Materials', value: totalMaterials, color: 'from-indigo-500 to-indigo-600', trend: '+142 this week' },
    { icon: DownloadCloud, label: 'Total Downloads', value: totalDownloads, color: 'from-teal-500 to-teal-600', trend: '+3.8k today' },
    { icon: Users, label: 'Active Learners', value: activeLearners, color: 'from-emerald-500 to-emerald-600', trend: '+67 online' },
    { icon: Video, label: 'Video Lessons', value: totalVideos, color: 'from-purple-500 to-purple-600', trend: '+31 this month' },
  ];

  const userStats = [
    { icon: Coins, label: 'Your Coins', value: profile?.coins ?? 0, color: 'from-amber-500 to-yellow-600', trend: 'Balance' },
    { icon: Gem, label: 'Your Diamonds', value: profile?.diamonds ?? 0, color: 'from-violet-500 to-fuchsia-600', trend: 'Earned' },
    { icon: Download, label: 'My Downloads', value: userDownloads, color: 'from-blue-500 to-cyan-600', trend: 'All time' },
    { icon: Heart, label: 'Favorites', value: userFavorites, color: 'from-rose-500 to-pink-600', trend: 'Saved' },
    { icon: CloudUpload, label: 'My Uploads', value: userUploads, color: 'from-emerald-500 to-teal-600', trend: 'Contributed' },
  ];

  return (
    <div className="space-y-10">
      {/* Personalized Welcome + Balance */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Hey {userName} 👋
          </h1>
          <p className="mt-3 text-indigo-100 text-lg font-light">
            Discover, learn, and grow — your next favorite material is waiting.
          </p>

          {/* Weekly highlight */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="bg-white/15 backdrop-blur-sm px-5 py-3 rounded-2xl flex items-center gap-3">
              <ArrowUpRight className="w-5 h-5" />
              <div>
                <p className="text-xs opacity-80">This week</p>
                <p className="font-semibold">+184 materials</p>
              </div>
            </div>
          </div>

          {/* Live Balance */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white/15 backdrop-blur-sm px-6 py-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Coins className="w-7 h-7 text-amber-300" />
              </div>
              <div>
                <p className="text-xs opacity-80">Coins Balance</p>
                <p className="text-3xl font-bold tracking-tighter">
                  <CountUp end={profile?.coins ?? 0} duration={1.8} separator="," />
                </p>
              </div>
            </div>

            <div className="bg-white/15 backdrop-blur-sm px-6 py-5 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Gem className="w-7 h-7 text-fuchsia-300" />
              </div>
              <div>
                <p className="text-xs opacity-80">Diamonds</p>
                <p className="text-3xl font-bold tracking-tighter">
                  <CountUp end={profile?.diamonds ?? 0} duration={1.8} separator="," />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform Insights */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
            Platform Insights
          </h2>
          <span className="text-xs px-3 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-full font-medium">
            LIVE
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {platformStats.map((stat, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${stat.color} rounded-3xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 group`}
            >
              <div className="flex items-start justify-between">
                <stat.icon className="w-9 h-9 opacity-90" />
                <div className="text-right">
                  <p className="text-3xl md:text-4xl font-bold tracking-tighter">
                    <CountUp end={stat.value} separator="," duration={2.2} />
                  </p>
                  <p className="text-sm mt-1 opacity-90 font-medium">{stat.label}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs opacity-75">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {stat.trend}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Your Activity */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
            Your Activity
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Personal progress</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
          {userStats.map((stat, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${stat.color} rounded-3xl p-6 text-white shadow-lg hover:shadow-2xl transition-all duration-300 group`}
            >
              <div className="flex items-start justify-between">
                <stat.icon className="w-9 h-9 opacity-90" />
                <div className="text-right">
                  <p className="text-3xl md:text-4xl font-bold tracking-tighter">
                    <CountUp end={stat.value} separator="," duration={2.2} />
                  </p>
                  <p className="text-sm mt-1 opacity-90 font-medium">{stat.label}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-xs opacity-75">
                <ArrowUpRight className="w-3.5 h-3.5" />
                {stat.trend}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StatsGrid;