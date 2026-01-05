// SettingsPage.jsx — Enhanced, Professional & Beautiful (No Firebase)
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

function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [profilePublic, setProfilePublic] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [profile, setProfile] = useState({
    name: 'Guest',
    email: 'guest@weconnect.ng',
    matricNumber: '',
    school: '',
    faculty: '',
    department: '',
    photo: null, // For preview
  });

  // Load from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
      } catch (e) {
        console.error('Invalid profile data');
      }
    }

    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    const notifs = localStorage.getItem('notifications');
    if (notifs === 'false') setNotificationsEnabled(false);
  }, []);

  // Save theme
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleSaveProfile = () => {
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

  const handleDeleteAccount = () => {
    localStorage.clear();
    toast.success('Account deleted. You will be redirected to login.');
    setTimeout(() => {
      window.location.href = '/login'; // Adjust to your login route
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4">
            Settings
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Customize your WE CONNECT experience
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 text-center">
          <div className="relative inline-block">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl">
              {profile.photo ? (
                <img src={profile.photo} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            <button
              onClick={() => setEditingProfile(true)}
              className="absolute bottom-0 right-0 p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white shadow-lg hover:scale-110 transition-transform"
            >
              <Edit3 size={20} />
            </button>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mt-6">
            {profile.name}
          </h2>
          <p className="text-slate-600 dark:text-slate-400">{profile.email}</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Appearance */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
              <Palette className="w-6 h-6 text-purple-600" />
              Appearance
            </h3>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all"
            >
              <div className="flex items-center gap-4">
                {isDarkMode ? <Moon className="w-6 h-6 text-indigo-600" /> : <Sun className="w-6 h-6 text-yellow-500" />}
                <span className="font-medium">Dark Mode</span>
              </div>
              <div className={`w-12 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-purple-600' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'} mt-0.5`} />
              </div>
            </button>
          </div>

          {/* Notifications */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
              <Bell className="w-6 h-6 text-blue-600" />
              Notifications
            </h3>
            <button
              onClick={() => {
                setNotificationsEnabled(!notificationsEnabled);
                localStorage.setItem('notifications', !notificationsEnabled);
                toast.success(`Notifications ${!notificationsEnabled ? 'enabled' : 'disabled'}`);
              }}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all"
            >
              <span className="font-medium">Push Notifications</span>
              <div className={`w-12 h-6 rounded-full transition-colors ${notificationsEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'} mt-0.5`} />
              </div>
            </button>
          </div>

          {/* Privacy */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-green-600" />
              Privacy
            </h3>
            <button
              onClick={() => setProfilePublic(!profilePublic)}
              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all"
            >
              <span className="font-medium">Public Profile</span>
              <div className={`w-12 h-6 rounded-full transition-colors ${profilePublic ? 'bg-green-600' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${profilePublic ? 'translate-x-6' : 'translate-x-1'} mt-0.5`} />
              </div>
            </button>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-3xl shadow-xl p-6 border border-red-200 dark:border-red-800">
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center gap-3">
              <Trash2 className="w-6 h-6" />
              Danger Zone
            </h3>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-4 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editingProfile && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Edit Profile</h2>
              <button onClick={() => setEditingProfile(false)}><X size={24} /></button>
            </div>

            <div className="text-center">
              <label className="cursor-pointer">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-2xl overflow-hidden">
                  {profile.photo ? (
                    <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    profile.name.charAt(0).toUpperCase()
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                <p className="mt-4 text-blue-600 flex items-center justify-center gap-2">
                  <Upload size={20} /> Change Photo
                </p>
              </label>
            </div>

            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="Full Name"
              className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-xl focus:border-purple-500 outline-none"
            />

            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              placeholder="Email"
              className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-xl focus:border-purple-500 outline-none"
            />

            <input
              type="text"
              value={profile.matricNumber}
              onChange={(e) => setProfile({ ...profile, matricNumber: e.target.value })}
              placeholder="Matric Number"
              className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-xl focus:border-purple-500 outline-none"
            />

            <input
              type="text"
              value={profile.school}
              onChange={(e) => setProfile({ ...profile, school: e.target.value })}
              placeholder="School"
              className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-xl focus:border-purple-500 outline-none"
            />

            <button
              onClick={handleSaveProfile}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
            <Trash2 className="w-16 h-16 text-red-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
              Delete Account?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 bg-gray-200 dark:bg-slate-700 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;