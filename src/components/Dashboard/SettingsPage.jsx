// SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Moon, Sun, Bell, Shield, User, Trash2, ChevronRight,
  Edit3, Save, X, Upload, Palette, Mail, Lock,
  GraduationCap, Briefcase, Award, AlertTriangle, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState(''); // ← NEW
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const [profile, setProfile] = useState({
    id: '',
    name: '',
    email: '',
    role: 'student',
    matric_number: '',
    school: '',
    faculty: '',
    department: '',
    specialization: '',
    years_experience: '',
    title: '',
    years_teaching: '',
    phone: '',
    address: '',
    gender: '',
    avatar_url: '',
    coins: 0,
    diamonds: 0,
  });

  const navigate = useNavigate();

  // Load profile & preferences
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('Please log in');
          navigate('/login');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfile(data);
        } else {
          const fallback = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || 'User',
            role: user.user_metadata?.role || 'student',
          };
          setProfile(fallback);
        }

        const savedTheme = localStorage.getItem('theme') || 'light';
        setIsDarkMode(savedTheme === 'dark');
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');

        const notifPref = localStorage.getItem('notifications');
        setNotificationsEnabled(notifPref !== 'false');
      } catch (err) {
        console.error(err);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [navigate]);

  // Sync dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const handleSaveProfile = async () => {
    // ... (unchanged - keeping your existing logic)
  };

  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    setDeleteConfirmText(''); // reset
    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('delete_account', {
        method: 'POST',
      });

      if (error) throw error;

      localStorage.clear();
      toast.success('Account permanently deleted');
      navigate('/', { replace: true });
    } catch (err) {
      console.error(err);
      toast.error('Deletion failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
          <p className="text-slate-500 dark:text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-8">

        {/* Header */}
        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/70 dark:border-slate-700/60 p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Profile Information</h2>
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-1.5 text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium"
            >
              {editing ? (
                <>
                  <X size={18} /> Cancel
                </>
              ) : (
                <>
                  <Edit3 size={18} /> Edit
                </>
              )}
            </button>
          </div>

          {/* Form fields – add your full list here */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Full Name</label>
              {editing ? (
                <input
                  name="name"
                  value={profile.name || ''}
                  onChange={handleInputChange}
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition"
                />
              ) : (
                <p className="text-lg text-slate-900 dark:text-white">{profile.name || '—'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Email</label>
              <p className="text-lg text-slate-900 dark:text-white">{profile.email || '—'}</p>
            </div>

            {/* Add more fields like phone, address, gender, school, etc. */}
          </div>

          {editing && (
            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-medium transition shadow-sm disabled:opacity-60 flex items-center gap-2"
              >
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-white/70 dark:bg-slate-800/70 rounded-2xl border border-red-200/50 dark:border-red-800/40 p-6 md:p-8">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-4">Danger Zone</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 rounded-xl font-medium transition flex items-center gap-2 shadow-sm"
          >
            <Trash2 size={18} />
            Delete Account
          </button>
        </div>

        {/* Modern Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl 
                           rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden 
                           border border-slate-200/60 dark:border-slate-700/50
                           ring-1 ring-black/5 dark:ring-white/5"
              >
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-slate-200/70 dark:border-slate-700/60">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/60 
                                   flex items-center justify-center ring-1 ring-red-200/70 dark:ring-red-800/40">
                      <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                        Delete Account
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        This action is permanent and irreversible
                      </p>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                  <div className="space-y-3">
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                      Deleting your account will permanently remove:
                    </p>
                    <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 ml-5 list-disc marker:text-red-500">
                      <li>Your profile and all personal information</li>
                      <li>Uploaded materials, notes, and documents</li>
                      <li>Coins, diamonds, favorites, and progress</li>
                      <li>All associated activity and history</li>
                    </ul>
                  </div>

                  <div className="bg-red-50/70 dark:bg-red-950/30 border border-red-200/70 dark:border-red-800/40 
                                 rounded-xl p-4 text-sm text-red-800/90 dark:text-red-300/90">
                    This cannot be undone. We cannot recover your data after deletion.
                  </div>

                  {/* Confirmation input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Type <span className="font-mono font-semibold text-red-600 dark:text-red-400">DELETE</span> to confirm
                    </label>
                    <input
                      type="text"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value.trim())}
                      placeholder="Type DELETE here"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-800 
                                 border border-slate-300 dark:border-slate-600 
                                 rounded-lg font-mono text-slate-900 dark:text-slate-100
                                 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none
                                 placeholder:text-slate-400 dark:placeholder:text-slate-600
                                 transition-all"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-5 bg-slate-50/70 dark:bg-slate-950/40 
                               border-t border-slate-200/80 dark:border-slate-800/60
                               flex items-center justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                    className="px-5 py-2.5 text-slate-700 dark:text-slate-300 
                             hover:bg-slate-200/70 dark:hover:bg-slate-700/60 
                             rounded-lg font-medium transition min-w-[100px]"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading || deleteConfirmText !== 'DELETE'}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 active:bg-red-800 
                             text-white font-medium rounded-lg transition shadow-sm
                             disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center gap-2 min-w-[160px] justify-center"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {!loading ? 'Delete Permanently' : 'Deleting...'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default SettingsPage;