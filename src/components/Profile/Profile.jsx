// src/components/Profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  School,
  BookOpen,
  Video,
  Upload,
  Download,
  Coins,
  Gem,
  Award,
  Calendar,
  Edit,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    videosUploaded: 0,
    videosDownloaded: 0,
    coinsSpent: 0,
    diamondsEarned: 0,
    totalPoints: 0,
    joinDate: null,
  });

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('Please sign in to view profile');
          navigate('/');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            name,
            email,
            role,
            school,
            department,
            specialization,
            title,
            avatar_url,
            coins,
            diamonds,
            created_at
          `)
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (!data) {
          toast.error('Profile not found');
          return;
        }

        setProfile(data);

        setStats({
          videosUploaded: 18,
          videosDownloaded: 47,
          coinsSpent: 320,
          diamondsEarned: 42,
          totalPoints: (data.coins || 0) + (data.diamonds || 0) * 5,
          joinDate: data.created_at ? new Date(data.created_at) : null,
        });
      } catch (err) {
        console.error('Profile fetch error:', err);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndStats();

    const subscription = supabase
      .channel('profile-changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, (payload) => {
        if (payload.new.id === profile?.id) {
          setProfile((prev) => ({ ...prev, ...payload.new }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      localStorage.removeItem('userProfile');
      window.dispatchEvent(new CustomEvent('userLoggedIn'));
      toast.success('Logged out successfully');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error('Logout failed');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const roleBadgeColor =
    profile.role === 'student' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
    profile.role === 'tutor'   ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
    profile.role === 'lecturer'? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' :
    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 pb-20"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="h-48 sm:h-56 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
        <motion.div
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden"
          variants={itemVariants}
        >
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-bold text-white">
                    {(profile.name || '?')[0].toUpperCase()}
                  </span>
                )}
              </div>
              <button className="absolute bottom-1 right-1 bg-white dark:bg-slate-700 p-2 rounded-full shadow-md hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                <Edit size={16} />
              </button>
            </div>

            <div className="text-center sm:text-left flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                {profile.name || 'User'}
              </h1>

              <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${roleBadgeColor}`}
                >
                  {profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'Member'}
                </span>
                {profile.school && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    <School size={12} className="mr-1" />
                    {profile.school}
                  </span>
                )}
              </div>

              <p className="mt-3 text-slate-600 dark:text-slate-400 flex items-center justify-center sm:justify-start gap-2">
                <Mail size={16} />
                {profile.email || 'No email connected'}
              </p>

              {stats.joinDate && (
                <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm flex items-center justify-center sm:justify-start gap-2">
                  <Calendar size={14} />
                  Joined {format(stats.joinDate, 'MMMM yyyy')}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-200 dark:border-slate-700 divide-x divide-slate-200 dark:divide-slate-700">
            <StatItem icon={Upload} value={stats.videosUploaded} label="Videos Uploaded" color="text-indigo-600" />
            <StatItem icon={Download} value={stats.videosDownloaded} label="Videos Downloaded" color="text-emerald-600" />
            <StatItem icon={Coins} value={stats.coinsSpent} label="Coins Spent" color="text-yellow-600" />
            <StatItem icon={Gem} value={stats.diamondsEarned} label="Diamonds Earned" color="text-purple-600" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8 grid gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200/60 dark:border-slate-700/60 p-6">
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
              <Award size={20} className="text-indigo-600" />
              Achievements & Activity
            </h2>
            <div className="space-y-4">
              <AchievementItem
                title="Content Creator"
                description="Uploaded 10+ educational videos"
                achieved={stats.videosUploaded >= 10}
              />
              <AchievementItem
                title="Knowledge Sharer"
                description="Downloaded 30+ materials"
                achieved={stats.videosDownloaded >= 30}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={() => toast('Edit profile feature coming soon!')}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <Edit size={18} />
              Edit Profile
            </button>

            <button
              onClick={handleLogout}
              className="flex-1 bg-white dark:bg-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800/50 py-3 px-6 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
            >
              <LogOut size={18} />
              Log Out
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatItem({ icon: Icon, value, label, color }) {
  return (
    <div className="p-5 text-center">
      <Icon className={`w-7 h-7 mx-auto mb-2 ${color}`} />
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value.toLocaleString()}</div>
      <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function AchievementItem({ title, description, achieved }) {
  return (
    <div className={`p-4 rounded-lg border ${achieved ? 'border-indigo-200 bg-indigo-50/50 dark:border-indigo-800/40 dark:bg-indigo-950/30' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 opacity-60'}`}>
      <div className="flex items-start gap-3">
        <ShieldCheck className={`w-6 h-6 mt-0.5 ${achieved ? 'text-indigo-600' : 'text-slate-400'}`} />
        <div>
          <h3 className="font-medium text-slate-900 dark:text-white">{title}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;