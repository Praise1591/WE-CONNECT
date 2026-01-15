// SettingsPage.jsx — Enhanced, Professional & Beautiful (with Supabase)
import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  Sun, 
  Bell, 
  Globe, 
  Shield, 
  User, 
  Trash2, 
  ChevronRight,
  Edit3,
  Save,
  X,
  Upload,
  Palette,
  Mail,
  Lock
} from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '@/supabase';

function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [profile, setProfile] = useState({
    name: 'Guest',
    email: 'guest@weconnect.ng',
    matric_number: '',
    school: '',
    faculty: '',
    department: '',
    photo: null, // For preview
  });

  // Load profile from Supabase + local preferences
  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (!error && data) {
          setProfile(data);
        }
      }

      // Load local theme preference
      const theme = localStorage.getItem('theme');
      if (theme === 'dark') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      }

      const notifs = localStorage.getItem('notifications');
      if (notifs === 'false') setNotificationsEnabled(false);
    };

    fetchProfile();
  }, []);

  // Sync dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleSaveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        name: profile.name,
        matric_number: profile.matric_number,
        school: profile.school,
        faculty: profile.faculty,
        department: profile.department,
        // Add other fields you want to allow editing
      })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to update profile');
      return;
    }

    localStorage.setItem('userProfile', JSON.stringify(profile));
    toast.success('Profile updated successfully!');
    setEditingProfile(false);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfile({ ...profile, photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Optional: Delete profile data
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').delete().eq('id', user.id);
      }

      localStorage.removeItem('userProfile');
      toast.success('Account deleted successfully');
      window.location.href = '/';
    } catch (error) {
      toast.error('Failed to delete account');
    }

    setShowDeleteConfirm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-3">
            Settings
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Manage your account, preferences, and security
          </p>
        </div>

        {/* Profile Section */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
              <User className="w-7 h-7 text-purple-600" />
              Profile Information
            </h2>
            {!editingProfile ? (
              <button
                onClick={() => setEditingProfile(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all"
              >
                <Edit3 size={18} />
                Edit
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingProfile(false)}
                  className="px-5 py-2.5 bg-slate-200 dark:bg-slate-700 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Save size={18} />
                  Save
                </button>
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Profile Photo */}
            <div className="flex flex-col items-center md:items-start">
              <div className="relative w-32 h-32 mb-6">
                {profile.photo ? (
                  <img
                    src={profile.photo}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full border-4 border-purple-500 shadow-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                    {profile.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </div>
                )}
                {editingProfile && (
                  <label className="absolute bottom-0 right-0 bg-purple-600 p-2 rounded-full cursor-pointer shadow-lg">
                    <Upload size={18} className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                {editingProfile ? (
                  <input
                    type="text"
                    value={profile.name || ''}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                ) : (
                  <p className="text-lg font-medium text-slate-800 dark:text-white">{profile.name || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Email
                </label>
                <p className="text-lg font-medium text-slate-800 dark:text-white">{profile.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Matric Number
                </label>
                {editingProfile ? (
                  <input
                    type="text"
                    value={profile.matric_number || ''}
                    onChange={(e) => setProfile({ ...profile, matric_number: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                ) : (
                  <p className="text-lg text-slate-600 dark:text-slate-400">{profile.matric_number || 'Not set'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  School / University
                </label>
                {editingProfile ? (
                  <input
                    type="text"
                    value={profile.school || ''}
                    onChange={(e) => setProfile({ ...profile, school: e.target.value })}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                ) : (
                  <p className="text-lg text-slate-600 dark:text-slate-400">{profile.school || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Theme */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
              <Palette className="w-6 h-6 text-purple-600" />
              Appearance
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">Dark Mode</span>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`w-14 h-7 flex items-center rounded-full p-1 transition-all ${
                  isDarkMode ? 'bg-purple-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    isDarkMode ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
              <Bell className="w-6 h-6 text-purple-600" />
              Notifications
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-slate-700 dark:text-slate-300">Enable Notifications</span>
              <button
                onClick={() => {
                  setNotificationsEnabled(!notificationsEnabled);
                  localStorage.setItem('notifications', (!notificationsEnabled).toString());
                }}
                className={`w-14 h-7 flex items-center rounded-full p-1 transition-all ${
                  notificationsEnabled ? 'bg-purple-600' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                    notificationsEnabled ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-3xl p-8">
          <h3 className="text-xl font-bold text-red-700 dark:text-red-400 mb-6 flex items-center gap-3">
            <Shield className="w-6 h-6" />
            Danger Zone
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all"
          >
            <Trash2 size={18} />
            Delete Account
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
              <Trash2 className="w-16 h-16 text-red-600 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                Delete Account?
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                This action is permanent and cannot be undone. All your data will be lost.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 bg-slate-200 dark:bg-slate-700 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all font-medium"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingsPage;