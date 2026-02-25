// ProfileSettings.jsx — Modern profile & account settings (Firebase + consistent WE CONNECT design)
import React, { useState, useEffect } from 'react';
import { 
  User, Lock, Settings, Camera, ArrowLeft, Save, 
  Mail, Phone, Home, Award, Briefcase, GraduationCap, 
  ShieldCheck, Trash2 
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Firebase imports
import { auth, db, storage } from '../../firebase';
import {
  doc,
  getDoc,
  setDoc,          // ← added
  updateDoc,
  serverTimestamp   // ← added (optional but recommended)
} from 'firebase/firestore';
import {
  updateProfile,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
  { id: 'preferences', label: 'Preferences', icon: Settings },
];

function ProfileSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Profile form
  const [formData, setFormData] = useState({
    name: '', bio: '', gender: '', phone: '', address: '',
    matricNumber: '', school: '', faculty: '', department: '',
    specialization: '', yearsExperience: '', title: '', yearsTeaching: '',
  });

  // Security form
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [emailVerified, setEmailVerified] = useState(false);

  // Preferences (defaults)
  const defaultPreferences = {
    emailNotifications: true,
    newResourceAlerts: true,
    showOnlineStatus: true,
  };

  const [preferences, setPreferences] = useState(defaultPreferences);

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/auth');
      return;
    }

    let isMounted = true;

    const initializeProfile = async () => {
      try {
        const uid = auth.currentUser.uid;
        const profileRef = doc(db, 'profiles', uid);
        const snap = await getDoc(profileRef);

        let profileData;

        if (snap.exists()) {
          profileData = snap.data();
        } else {
          // ── CREATE DEFAULT PROFILE IF MISSING ──
          const defaultProfile = {
            uid,
            name: auth.currentUser.displayName || 'New User',
            email: auth.currentUser.email || '',
            photoURL: auth.currentUser.photoURL || null,
            role: 'student',                    // ← change default role if needed
            bio: '',
            gender: '',
            phone: '',
            address: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            settings: defaultPreferences,
            // Add other role-specific defaults if you want
          };

          await setDoc(profileRef, defaultProfile);
          toast.success('Welcome! Your profile has been created 🎉');
          profileData = defaultProfile;
        }

        if (!isMounted) return;

        setUserProfile(profileData);
        setPreviewUrl(profileData.photoURL || null);
        setEmailVerified(auth.currentUser.emailVerified);

        setFormData({
          name: profileData.name || '',
          bio: profileData.bio || '',
          gender: profileData.gender || '',
          phone: profileData.phone || '',
          address: profileData.address || '',
          matricNumber: profileData.matricNumber || '',
          school: profileData.school || '',
          faculty: profileData.faculty || '',
          department: profileData.department || '',
          specialization: profileData.specialization || '',
          yearsExperience: profileData.yearsExperience || '',
          title: profileData.title || '',
          yearsTeaching: profileData.yearsTeaching || '',
        });

        if (profileData.settings) {
          setPreferences(profileData.settings);
        }

        setLoading(false);

      } catch (err) {
        console.error('Profile init error:', err);
        toast.error('Could not load or create profile');
        setLoading(false);
      }
    };

    initializeProfile();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      toast.error('Please select a valid image file');
    }
  };

  const handleSaveProfile = async () => {
    if (!userProfile) return;
    setSaving(true);

    try {
      let photoURL = userProfile.photoURL;

      if (profileImage) {
        const imageRef = ref(storage, `profile_pictures/${auth.currentUser.uid}`);
        await uploadBytes(imageRef, profileImage);
        photoURL = await getDownloadURL(imageRef);
      }

      const updates = {
        name: formData.name.trim() || userProfile.name,
        bio: formData.bio.trim() || null,
        gender: formData.gender || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        photoURL,
        updatedAt: serverTimestamp(),
      };

      if (userProfile.role === 'student') {
        updates.matricNumber = formData.matricNumber.trim() || null;
        updates.school = formData.school.trim() || null;
        updates.faculty = formData.faculty.trim() || null;
        updates.department = formData.department.trim() || null;
      } else if (userProfile.role === 'tutor') {
        updates.specialization = formData.specialization.trim() || null;
        updates.yearsExperience = Number(formData.yearsExperience) || 0;
      } else if (userProfile.role === 'lecturer') {
        updates.title = formData.title.trim() || null;
        updates.school = formData.school.trim() || null;
        updates.department = formData.department.trim() || null;
        updates.yearsTeaching = Number(formData.yearsTeaching) || 0;
      }

      const profileRef = doc(db, 'profiles', auth.currentUser.uid);
      await updateDoc(profileRef, updates);

      if (photoURL !== userProfile.photoURL || formData.name !== userProfile.name) {
        await updateProfile(auth.currentUser, {
          displayName: formData.name,
          photoURL,
        });
      }

      // Update localStorage (essentials only)
      const basicProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      basicProfile.name = formData.name;
      basicProfile.photoURL = photoURL;
      localStorage.setItem('userProfile', JSON.stringify(basicProfile));

      setUserProfile(prev => ({ ...prev, ...updates }));
      setProfileImage(null);

      toast.success('Profile updated successfully ✨');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setSaving(true);
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, passwordData.oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordData.newPassword);

      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully');
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/wrong-password') {
        toast.error('Old password is incorrect');
      } else {
        toast.error('Failed to update password');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSendVerification = async () => {
    try {
      await sendEmailVerification(auth.currentUser);
      toast.success('Verification email sent! Check your inbox.');
    } catch (error) {
      toast.error('Failed to send verification email');
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const profileRef = doc(db, 'profiles', auth.currentUser.uid);
      await updateDoc(profileRef, { settings: preferences });
      toast.success('Preferences saved');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('⚠️ This action is permanent. Delete your account?')) return;

    try {
      await auth.currentUser.delete();
      localStorage.removeItem('userProfile');
      toast.success('Account deleted');
      navigate('/auth');
    } catch (error) {
      toast.error('Failed to delete account. Please contact support.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 pb-20">
        <div className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50" />

        <div className="max-w-6xl mx-auto px-6 pt-10 animate-pulse flex gap-10">
          <div className="w-72 flex-shrink-0">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              ))}
              <div className="mt-8 h-10 bg-red-200/30 dark:bg-red-900/30 rounded-2xl" />
            </div>
          </div>

          <div className="flex-1 space-y-10">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-10">
              <div className="flex flex-col md:flex-row gap-10">
                <div className="w-40 h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
                <div className="flex-1 space-y-4 pt-4 md:pt-0">
                  <div className="h-10 w-3/5 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-6 w-2/5 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-5 w-4/5 bg-slate-200 dark:bg-slate-800 rounded mt-6" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-10 space-y-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center flex-col gap-5">
        <p className="text-slate-600 dark:text-slate-400 text-lg font-medium">
          Something went wrong loading your profile...
        </p>
      </div>
    );
  }

  const roleColor = {
    student: 'indigo',
    tutor: 'purple',
    lecturer: 'pink',
  }[userProfile?.role] || 'slate';

  const RoleIcon = {
    student: GraduationCap,
    tutor: Briefcase,
    lecturer: Award,
  }[userProfile?.role] || User;

  // ────────────────────────────────────────────────
  //  Main render (same as before)
  // ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 pb-20">
      {/* Top Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">
              Settings
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {auth.currentUser?.email}
            </div>
            <div className="w-9 h-9 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-700">
              <img
                src={previewUrl || 'https://via.placeholder.com/150?text=User'}
                alt="You"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-10 flex gap-10">
        {/* Sidebar */}
        <div className="w-72 flex-shrink-0">
          <div className="sticky top-24">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-left transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-semibold">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-12 px-6">
              <button
                onClick={handleDeleteAccount}
                className="flex w-full items-center gap-3 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 transition-colors font-medium"
              >
                <Trash2 className="w-5 h-5" />
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Main Content – same as your original from here */}
        <div className="flex-1 max-w-3xl">
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
              {/* Avatar & Role section – unchanged */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-10">
                <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                  <div className="relative group">
                    <div className="w-40 h-40 rounded-3xl overflow-hidden border-[6px] border-white dark:border-slate-800 shadow-2xl">
                      <img
                        src={previewUrl || 'https://via.placeholder.com/400?text=Avatar'}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <label className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 shadow-xl p-4 rounded-2xl cursor-pointer hover:scale-110 active:scale-95 transition-all border border-slate-200 dark:border-slate-700">
                      <Camera className="w-6 h-6 text-indigo-600" />
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                    <div className="absolute -top-2 -right-2 bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-2xl shadow">
                      {userProfile?.role?.toUpperCase() || 'USER'}
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                      <RoleIcon className={`w-9 h-9 text-${roleColor}-600`} />
                      <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                        {userProfile?.name || 'User'}
                      </h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                      @{userProfile?.role || 'user'} • WE CONNECT
                    </p>
                    {userProfile?.bio && (
                      <p className="mt-4 max-w-md mx-auto md:mx-0 text-slate-600 dark:text-slate-300 leading-relaxed">
                        {userProfile.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Form – unchanged from your last version */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-10 space-y-9">
                {/* ... full form content remains exactly the same ... */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400 block mb-2">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-900 outline-none transition-all" />
                  </div>
                  {/* ... rest of the form fields, conditional role sections, save button ... */}
                </div>

                {/* Student / Tutor / Lecturer conditional fields – keep as-is */}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="w-full py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-2xl shadow-xl flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                  {!saving && <Save className="w-5 h-5" />}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Security tab – unchanged */}
          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
              {/* ... password change + email verification ... */}
            </motion.div>
          )}

          {/* Preferences tab – unchanged */}
          {activeTab === 'preferences' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-10">
              {/* ... notification toggles + save button ... */}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;