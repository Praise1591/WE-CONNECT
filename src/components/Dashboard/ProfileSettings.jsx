// src/pages/ProfileEdit.jsx
import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Save, Trash2, Camera, AlertTriangle,
  GraduationCap, Briefcase, Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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
        if (err.code === 'permission-denied') {
          toast.error("Permission denied – cannot access profile");
        } else {
          toast.error("Failed to load profile data");
        }
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

      // 1. Upload new profile picture if selected
      if (profilePicFile) {
        const imageRef = ref(storage, `profile_pictures/${user.uid}`);
        await uploadBytes(imageRef, profilePicFile);
        photoURL = await getDownloadURL(imageRef);
      }

      // 2. Prepare updates (same fields as signup)
      const updates = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        gender: form.gender,
        photoURL,
        updatedAt: serverTimestamp(),
      };

      // Role-specific fields
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

      // 3. Save to Firestore
      await updateDoc(doc(db, 'profiles', user.uid), updates);

      // 4. Update Firebase Auth (displayName + photoURL)
      await updateProfile(user, {
        displayName: form.name.trim(),
        photoURL,
      });

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
    if (!window.confirm("Are you sure you want to permanently delete your account?\n\nThis action cannot be undone.")) {
      return;
    }

    setDeleting(true);

    try {
      const user = auth.currentUser;

      // Delete Firestore profile
      await deleteDoc(doc(db, 'profiles', user.uid));

      // Delete Firebase Auth user
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold">Edit Your Profile</h1>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative group">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-indigo-500/50 shadow-xl">
                <img
                  src={previewUrl || 'https://via.placeholder.com/160?text=Profile'}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <label className="absolute bottom-0 right-0 bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-full cursor-pointer hover:scale-110 transition shadow-lg border-2 border-white/40">
                <Camera className="w-6 h-6" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            <p className="mt-3 text-sm text-indigo-300">Click camera to change photo</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-indigo-200 mb-1.5">Full Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 outline-none text-white placeholder:text-white/50"
              />
            </div>

            <div>
              <label className="block text-sm text-indigo-200 mb-1.5">Phone Number</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 outline-none text-white placeholder:text-white/50"
              />
            </div>

            <div>
              <label className="block text-sm text-indigo-200 mb-1.5">Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 outline-none text-white"
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-indigo-200 mb-1.5">Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 outline-none text-white placeholder:text-white/50 resize-none"
              />
            </div>

            {/* Role-specific fields – mirror AuthForm */}
            {role === 'student' && (
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-indigo-200 mb-1.5">Matric Number</label>
                  <input name="matricNumber" value={form.matricNumber} onChange={handleChange} className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl ..." />
                </div>
                <div>
                  <label className="block text-sm text-indigo-200 mb-1.5">School</label>
                  <input name="school" value={form.school} onChange={handleChange} className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl ..." />
                </div>
                <div>
                  <label className="block text-sm text-indigo-200 mb-1.5">Faculty</label>
                  <input name="faculty" value={form.faculty} onChange={handleChange} className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl ..." />
                </div>
                <div>
                  <label className="block text-sm text-indigo-200 mb-1.5">Department</label>
                  <input name="department" value={form.department} onChange={handleChange} className="w-full px-4 py-3.5 bg-white/10 border border-white/20 rounded-xl ..." />
                </div>
              </div>
            )}

            {role === 'tutor' && (
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-indigo-200 mb-1.5">Specialization</label>
                  <input name="specialization" value={form.specialization} onChange={handleChange} className="..." />
                </div>
                <div>
                  <label className="block text-sm text-indigo-200 mb-1.5">Years of Experience</label>
                  <input type="number" name="yearsExperience" value={form.yearsExperience} onChange={handleChange} className="..." />
                </div>
              </div>
            )}

            {role === 'lecturer' && (
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-indigo-200 mb-1.5">Title (Dr., Prof., etc.)</label>
                  <input name="title" value={form.title} onChange={handleChange} className="..." />
                </div>
                <div>
                  <label className="block text-sm text-indigo-200 mb-1.5">School / Institution</label>
                  <input name="school" value={form.school} onChange={handleChange} className="..." />
                </div>
                <div>
                  <label className="block text-sm text-indigo-200 mb-1.5">Department</label>
                  <input name="department" value={form.department} onChange={handleChange} className="..." />
                </div>
                <div>
                  <label className="block text-sm text-indigo-200 mb-1.5">Years of Teaching</label>
                  <input type="number" name="yearsTeaching" value={form.yearsTeaching} onChange={handleChange} className="..." />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg disabled:opacity-60 transition"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>

              <button
                onClick={() => navigate(-1)}
                className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition"
              >
                Cancel
              </button>
            </div>

            {/* Delete Account */}
            <div className="pt-12 mt-8 border-t border-white/10">
              <h3 className="text-lg font-semibold text-red-300 mb-4">Danger Zone</h3>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="w-full flex items-center justify-center gap-3 py-4 bg-red-900/60 hover:bg-red-800/70 border border-red-700/50 text-red-200 font-medium rounded-xl disabled:opacity-50 transition"
              >
                <Trash2 size={20} />
                {deleting ? 'Deleting...' : 'Delete My Account'}
              </button>
              <p className="text-xs text-slate-400 mt-2 text-center">
                This will permanently erase your account and all associated data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileEdit;