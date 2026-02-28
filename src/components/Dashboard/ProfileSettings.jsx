// src/pages/ProfileEdit.jsx
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Save, Trash2, Camera, AlertTriangle,
  GraduationCap, Briefcase, Award, Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import { auth, db, storage } from '../../firebase';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  updateProfile,
  deleteUser
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function ProfileEdit() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    gender: '',
    matricNumber: '',
    school: '',
    faculty: '',
    department: '',
    specialization: '',
    yearsExperience: '',
    title: '',
    yearsTeaching: '',
  });

  const [role, setRole] = useState('student');

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/auth');
      return;
    }

    const loadProfile = async () => {
      try {
        const profileRef = doc(db, 'profiles', user.uid);
        const snap = await getDoc(profileRef);

        if (snap.exists()) {
          const data = snap.data();
          setRole(data.role || 'student');
          setForm({
            name: data.name || user.displayName || '',
            phone: data.phone || '',
            address: data.address || '',
            gender: data.gender || '',
            matricNumber: data.matricNumber || '',
            school: data.school || '',
            faculty: data.faculty || '',
            department: data.department || '',
            specialization: data.specialization || '',
            yearsExperience: data.yearsExperience || '',
            title: data.title || '',
            yearsTeaching: data.yearsTeaching || '',
          });
          setPreviewUrl(data.photoURL || user.photoURL || null);
        } else {
          toast.info("No profile found – starting fresh");
        }
      } catch (err) {
        console.error("Load profile error:", err);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }
    setProfilePicFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);

    try {
      const user = auth.currentUser;
      let photoURL = previewUrl;

      if (profilePicFile) {
        const imageRef = ref(storage, `profile_pictures/${user.uid}`);
        await uploadBytes(imageRef, profilePicFile);
        photoURL = await getDownloadURL(imageRef);
      }

      const updates = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        gender: form.gender,
        photoURL,
        updatedAt: serverTimestamp(),
      };

      if (role === 'student') {
        updates.matricNumber = form.matricNumber.trim();
        updates.school = form.school.trim();
        updates.faculty = form.faculty.trim();
        updates.department = form.department.trim();
      } else if (role === 'tutor') {
        updates.specialization = form.specialization.trim();
        updates.yearsExperience = Number(form.yearsExperience) || 0;
      } else if (role === 'lecturer') {
        updates.title = form.title.trim();
        updates.school = form.school.trim();
        updates.department = form.department.trim();
        updates.yearsTeaching = Number(form.yearsTeaching) || 0;
      }

      await updateDoc(doc(db, 'profiles', user.uid), updates);
      await updateProfile(user, { displayName: form.name.trim(), photoURL });

      toast.success("Profile updated successfully");
      navigate('/dashboard');
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    setDeleting(true);

    try {
      const user = auth.currentUser;

      await deleteDoc(doc(db, 'profiles', user.uid));
      await deleteUser(user);

      toast.success("Account deleted");
      navigate('/auth');
    } catch (err) {
      console.error("Delete error:", err);
      if (err.code === 'auth/requires-recent-login') {
        toast.error("Please re-login first (security requirement)");
      } else {
        toast.error("Failed to delete account");
      }
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
          <p className="text-slate-500 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-8">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 rounded-full shadow-sm transition"
          >
            <ArrowLeft size={24} className="text-slate-700 dark:text-slate-300" />
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Edit Profile
          </h1>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/70 dark:border-slate-700/60 p-6 md:p-8">

          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative group">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                <img
                  src={previewUrl || 'https://via.placeholder.com/160?text=Profile'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="absolute bottom-0 right-0 bg-violet-600 p-3 rounded-full cursor-pointer hover:bg-violet-700 transition shadow-lg border-2 border-white">
                <Camera className="w-6 h-6 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Click camera to change photo
            </p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Phone Number</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition text-slate-900 dark:text-white"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none transition resize-none"
              />
            </div>

            {/* Role-specific fields */}
            {role === 'student' && (
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Matric Number</label>
                  <input name="matricNumber" value={form.matricNumber} onChange={handleChange} className="..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">School</label>
                  <input name="school" value={form.school} onChange={handleChange} className="..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Faculty</label>
                  <input name="faculty" value={form.faculty} onChange={handleChange} className="..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Department</label>
                  <input name="department" value={form.department} onChange={handleChange} className="..." />
                </div>
              </div>
            )}

            {/* tutor and lecturer fields – same pattern */}
            {/* ... add them similarly ... */}

            {/* Action buttons */}
            <div className="pt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-4 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl shadow-sm disabled:opacity-60 transition flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="h-5 w-5 animate-spin" />}
                Save Changes
              </button>

              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium rounded-xl transition"
              >
                Cancel
              </button>
            </div>

            {/* Danger Zone */}
            <div className="pt-12 mt-8 border-t border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4">Danger Zone</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleting}
                className="w-full flex items-center justify-center gap-3 py-4 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 font-medium rounded-xl disabled:opacity-50 transition shadow-sm"
              >
                <Trash2 size={20} />
                {deleting ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>

        {/* Modern Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200/70 dark:border-slate-700/60"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Delete Account?
                    </h3>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 mb-6">
                    This will permanently delete your account, profile, uploaded materials, coins, favorites, transactions, and all associated data. This action cannot be undone.
                  </p>

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleting}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
                      Delete Permanently
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default ProfileEdit;