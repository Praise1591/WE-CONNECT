// src/pages/ProfileSettings.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Save, Trash2, Camera, AlertTriangle,
  GraduationCap, Briefcase, Award, Loader2, User,
  Mail, Phone, MapPin, Venus, Mars, X, Check,
  Edit2, Upload, Shield, Clock, BookOpen, Users,
  Globe, Linkedin, Twitter, Github, CheckCircle,
  Eye, Copy, Share2, QrCode, Sparkles, TrendingUp,
  Award as AwardIcon, Zap, Calendar, Activity, Star, Download,
  UserPlus, UserMinus, UserCheck, Instagram, Facebook, Youtube,
  EyeOff, Eye as EyeIcon, ToggleLeft, ToggleRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';

import { auth, db, storage } from '../../firebase';
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import {
  updateProfile,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

function ProfileSettings() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [reauthPassword, setReauthPassword] = useState('');
  const [reauthLoading, setReauthLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [followingList, setFollowingList] = useState([]);
  const [followersList, setFollowersList] = useState([]);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [privacySettings, setPrivacySettings] = useState({
    showProfessionalInfo: true,
    showSocialLinks: true,
    showAchievements: true,
    showContactInfo: true
  });
  
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalDownloads: 0,
    totalFavorites: 0,
    averageRating: 0,
    profileViews: 0
  });

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    bio: '',
    website: '',
    linkedin: '',
    twitter: '',
    instagram: '',
    facebook: '',
    youtube: '',
    github: '',
    matricNumber: '',
    school: '',
    faculty: '',
    department: '',
    graduationYear: '',
    specialization: '',
    yearsExperience: '',
    certifications: '',
    title: '',
    yearsTeaching: '',
    researchInterests: '',
    publications: '',
    achievements: ''
  });

  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [memberSince, setMemberSince] = useState('');
  const [profileViews, setProfileViews] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/');
      return;
    }

    setEmail(user.email || '');
    
    const loadProfile = async () => {
      try {
        const profileRef = doc(db, 'profiles', user.uid);
        
        // Set up real-time listener for profile updates
        const unsubscribe = onSnapshot(profileRef, (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setRole(data.role || 'student');
            setMemberSince(data.createdAt?.toDate?.()?.toLocaleDateString() || '2024');
            setForm(prev => ({
              ...prev,
              name: data.name || user.displayName || '',
              email: user.email || '',
              phone: data.phone || '',
              address: data.address || '',
              gender: data.gender || '',
              bio: data.bio || '',
              website: data.website || '',
              linkedin: data.linkedin || '',
              twitter: data.twitter || '',
              instagram: data.instagram || '',
              facebook: data.facebook || '',
              youtube: data.youtube || '',
              github: data.github || '',
              matricNumber: data.matricNumber || '',
              school: data.school || '',
              faculty: data.faculty || '',
              department: data.department || '',
              graduationYear: data.graduationYear || '',
              specialization: data.specialization || '',
              yearsExperience: data.yearsExperience || '',
              certifications: data.certifications || '',
              title: data.title || '',
              yearsTeaching: data.yearsTeaching || '',
              researchInterests: data.researchInterests || '',
              publications: data.publications || '',
              achievements: data.achievements || '',
            }));
            setPreviewUrl(data.photoURL || user.photoURL || null);
            setProfileViews(data.profileViews || 0);
            setPrivacySettings({
              showProfessionalInfo: data.showProfessionalInfo !== false,
              showSocialLinks: data.showSocialLinks !== false,
              showAchievements: data.showAchievements !== false,
              showContactInfo: data.showContactInfo !== false
            });
            
            // Dispatch custom event for header to update
            window.dispatchEvent(new CustomEvent('profileUpdated', { 
              detail: { 
                photoURL: data.photoURL,
                name: data.name,
                role: data.role
              } 
            }));
          }
        });

        // Load following list
        const followingRef = collection(db, 'users', user.uid, 'following');
        const followingSnap = await getDocs(followingRef);
        const followingIds = followingSnap.docs.map(doc => doc.id);
        setFollowingList(followingIds);
        
        // Load followers list
        const followersRef = collection(db, 'users', user.uid, 'followers');
        const followersSnap = await getDocs(followersRef);
        const followerIds = followersSnap.docs.map(doc => doc.id);
        setFollowersList(followerIds);

        // Load user stats
        const materialsRef = collection(db, 'materials');
        const q = query(materialsRef, where('uid', '==', user.uid));
        const materialsSnap = await getDocs(q);
        
        const uploadedMaterials = materialsSnap.docs;
        const totalDownloads = uploadedMaterials.reduce((sum, doc) => sum + (doc.data().downloads || 0), 0);
        const avgRating = uploadedMaterials.reduce((sum, doc) => sum + (doc.data().averageRating || 0), 0) / (uploadedMaterials.length || 1);
        
        setStats({
          totalUploads: uploadedMaterials.length,
          totalDownloads: totalDownloads,
          totalFavorites: 0,
          averageRating: avgRating,
          profileViews: 0
        });
        
        setLoading(false);
        
        return () => unsubscribe();
      } catch (err) {
        console.error("Load profile error:", err);
        toast.error("Failed to load profile data");
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePrivacyToggle = (setting) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }
    
    setProfilePicFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  };

  const getInitials = (name = form.name) => {
    const userName = name || 'User';
    return userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSave = async () => {
    if (!auth.currentUser) return;
    setSaving(true);
    setSaveSuccess(false);

    try {
      const user = auth.currentUser;
      let photoURL = previewUrl;

      if (profilePicFile) {
        const oldImageRef = ref(storage, `profile_pictures/${user.uid}`);
        try {
          await deleteObject(oldImageRef);
        } catch (err) {
          console.log("No existing profile picture to delete");
        }
        
        const imageRef = ref(storage, `profile_pictures/${user.uid}`);
        await uploadBytes(imageRef, profilePicFile);
        photoURL = await getDownloadURL(imageRef);
      }

      const updates = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        gender: form.gender,
        bio: form.bio.trim(),
        website: form.website.trim(),
        linkedin: form.linkedin.trim(),
        twitter: form.twitter.trim(),
        instagram: form.instagram.trim(),
        facebook: form.facebook.trim(),
        youtube: form.youtube.trim(),
        github: form.github.trim(),
        achievements: form.achievements.trim(),
        photoURL,
        updatedAt: serverTimestamp(),
        // Privacy settings
        showProfessionalInfo: privacySettings.showProfessionalInfo,
        showSocialLinks: privacySettings.showSocialLinks,
        showAchievements: privacySettings.showAchievements,
        showContactInfo: privacySettings.showContactInfo
      };

      if (role === 'student') {
        updates.matricNumber = form.matricNumber.trim();
        updates.school = form.school.trim();
        updates.faculty = form.faculty.trim();
        updates.department = form.department.trim();
        updates.graduationYear = form.graduationYear;
      } else if (role === 'tutor') {
        updates.specialization = form.specialization.trim();
        updates.yearsExperience = Number(form.yearsExperience) || 0;
        updates.certifications = form.certifications.trim();
      } else if (role === 'lecturer') {
        updates.title = form.title.trim();
        updates.school = form.school.trim();
        updates.department = form.department.trim();
        updates.yearsTeaching = Number(form.yearsTeaching) || 0;
        updates.researchInterests = form.researchInterests.trim();
        updates.publications = form.publications.trim();
      }

      await updateDoc(doc(db, 'profiles', user.uid), updates);
      await updateProfile(user, { displayName: form.name.trim(), photoURL });

      // Update localStorage
      const cachedProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      localStorage.setItem('userProfile', JSON.stringify({
        ...cachedProfile,
        name: form.name.trim(),
        photoURL,
      }));

      // Dispatch custom event for header to update immediately
      window.dispatchEvent(new CustomEvent('profileUpdated', { 
        detail: { 
          photoURL: photoURL,
          name: form.name.trim(),
          role: role
        } 
      }));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleUnfollow = async (userId, userName) => {
    if (!auth.currentUser) return;
    
    try {
      const user = auth.currentUser;
      const batch = writeBatch(db);
      
      const followingRef = doc(db, 'users', user.uid, 'following', userId);
      batch.delete(followingRef);
      
      const followerRef = doc(db, 'users', userId, 'followers', user.uid);
      batch.delete(followerRef);
      
      await batch.commit();
      
      setFollowingList(prev => prev.filter(id => id !== userId));
      toast.success(`Unfollowed ${userName}`);
    } catch (err) {
      console.error("Unfollow error:", err);
      toast.error("Failed to unfollow user");
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteConfirm(false);
    const user = auth.currentUser;
    
    if (user.providerData[0].providerId === 'password') {
      setShowReauthModal(true);
      return;
    }
    
    await performAccountDeletion();
  };

  const performAccountDeletion = async () => {
    setDeleting(true);
    
    try {
      const user = auth.currentUser;
      
      const imageRef = ref(storage, `profile_pictures/${user.uid}`);
      try {
        await deleteObject(imageRef);
      } catch (err) {
        console.log("No profile picture to delete");
      }
      
      await deleteDoc(doc(db, 'profiles', user.uid));
      await deleteUser(user);
      
      localStorage.removeItem('userProfile');
      
      toast.success("Account deleted successfully");
      navigate('/');
    } catch (err) {
      console.error("Delete error:", err);
      if (err.code === 'auth/requires-recent-login') {
        toast.error("Please re-login first (security requirement)");
        setShowReauthModal(true);
      } else {
        toast.error("Failed to delete account: " + err.message);
      }
    } finally {
      setDeleting(false);
      setShowReauthModal(false);
    }
  };

  const handleReauthenticate = async () => {
    if (!reauthPassword) {
      toast.error("Please enter your password");
      return;
    }
    
    setReauthLoading(true);
    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, reauthPassword);
      await reauthenticateWithCredential(user, credential);
      setShowReauthModal(false);
      await performAccountDeletion();
    } catch (err) {
      console.error("Reauth error:", err);
      toast.error("Invalid password. Please try again.");
    } finally {
      setReauthLoading(false);
      setReauthPassword('');
    }
  };

  const copyProfileLink = () => {
    const url = `${window.location.origin}/profile/${auth.currentUser?.uid}`;
    navigator.clipboard.writeText(url);
    toast.success("Profile link copied!");
  };

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'social', label: 'Social Links', icon: Globe },
    { id: 'privacy', label: 'Privacy Settings', icon: Shield },
    { id: 'achievements', label: 'Achievements', icon: AwardIcon },
    { id: 'following', label: 'Following', icon: Users },
  ];

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Full Name
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your full name"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="email"
              value={email}
              disabled
              className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+234 801 234 5678"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Gender
          </label>
          <div className="relative">
            {form.gender === 'male' && <Mars className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 w-5 h-5" />}
            {form.gender === 'female' && <Venus className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500 w-5 h-5" />}
            {!form.gender && <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />}
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition appearance-none"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Bio
          </label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={4}
            placeholder="Tell us about yourself..."
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Address
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-4 text-slate-400 w-5 h-5" />
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              rows={2}
              placeholder="Your address"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderProfessionalInfo = () => {
    if (role === 'student') {
      return (
        <div className="space-y-6">
          <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
              <GraduationCap className="w-5 h-5" />
              <span className="font-medium">Student Information</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Matric Number
              </label>
              <input
                name="matricNumber"
                value={form.matricNumber}
                onChange={handleChange}
                placeholder="e.g., 2021/12345"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                School/University
              </label>
              <input
                name="school"
                value={form.school}
                onChange={handleChange}
                placeholder="e.g., University of Lagos"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Faculty
              </label>
              <input
                name="faculty"
                value={form.faculty}
                onChange={handleChange}
                placeholder="e.g., Faculty of Science"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Department
              </label>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g., Computer Science"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Graduation Year
              </label>
              <input
                type="number"
                name="graduationYear"
                value={form.graduationYear}
                onChange={handleChange}
                placeholder="e.g., 2025"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
          </div>
        </div>
      );
    }
    
    if (role === 'tutor') {
      return (
        <div className="space-y-6">
          <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
              <Briefcase className="w-5 h-5" />
              <span className="font-medium">Tutor Information</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Specialization
              </label>
              <input
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                placeholder="e.g., Mathematics, Physics"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                name="yearsExperience"
                value={form.yearsExperience}
                onChange={handleChange}
                placeholder="e.g., 5"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Certifications
              </label>
              <textarea
                name="certifications"
                value={form.certifications}
                onChange={handleChange}
                rows={3}
                placeholder="List your certifications and credentials..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
              />
            </div>
          </div>
        </div>
      );
    }
    
    if (role === 'lecturer') {
      return (
        <div className="space-y-6">
          <div className="bg-pink-50 dark:bg-pink-950/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2 text-pink-700 dark:text-pink-400">
              <Award className="w-5 h-5" />
              <span className="font-medium">Lecturer Information</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Title
              </label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Dr., Prof., Mr."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                School/University
              </label>
              <input
                name="school"
                value={form.school}
                onChange={handleChange}
                placeholder="e.g., University of Ibadan"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Department
              </label>
              <input
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g., Electrical Engineering"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Years of Teaching
              </label>
              <input
                type="number"
                name="yearsTeaching"
                value={form.yearsTeaching}
                onChange={handleChange}
                placeholder="e.g., 10"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Research Interests
              </label>
              <textarea
                name="researchInterests"
                value={form.researchInterests}
                onChange={handleChange}
                rows={3}
                placeholder="List your research interests..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Publications
              </label>
              <textarea
                name="publications"
                value={form.publications}
                onChange={handleChange}
                rows={3}
                placeholder="List your publications..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
              />
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  const renderSocialLinks = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Website
          </label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              name="website"
              value={form.website}
              onChange={handleChange}
              placeholder="https://yourwebsite.com"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            LinkedIn
          </label>
          <div className="relative">
            <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 w-5 h-5" />
            <input
              name="linkedin"
              value={form.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Twitter/X
          </label>
          <div className="relative">
            <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500 w-5 h-5" />
            <input
              name="twitter"
              value={form.twitter}
              onChange={handleChange}
              placeholder="https://twitter.com/username"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Instagram
          </label>
          <div className="relative">
            <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-600 w-5 h-5" />
            <input
              name="instagram"
              value={form.instagram}
              onChange={handleChange}
              placeholder="https://instagram.com/username"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Facebook
          </label>
          <div className="relative">
            <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-700 w-5 h-5" />
            <input
              name="facebook"
              value={form.facebook}
              onChange={handleChange}
              placeholder="https://facebook.com/username"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            YouTube
          </label>
          <div className="relative">
            <Youtube className="absolute left-3 top-1/2 -translate-y-1/2 text-red-600 w-5 h-5" />
            <input
              name="youtube"
              value={form.youtube}
              onChange={handleChange}
              placeholder="https://youtube.com/@username"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            GitHub
          </label>
          <div className="relative">
            <Github className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-700 dark:text-slate-400 w-5 h-5" />
            <input
              name="github"
              value={form.github}
              onChange={handleChange}
              placeholder="https://github.com/username"
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
          <Shield className="w-5 h-5" />
          <span className="font-medium">Privacy Controls</span>
        </div>
        <p className="text-sm text-blue-600 dark:text-blue-300 mt-2">
          Control what information is visible to other users on your public profile
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
          <div>
            <h4 className="font-medium text-slate-800 dark:text-white">Professional Information</h4>
            <p className="text-sm text-slate-500">Show your education, work experience, and qualifications</p>
          </div>
          <button
            onClick={() => handlePrivacyToggle('showProfessionalInfo')}
            className="text-indigo-600 dark:text-indigo-400"
          >
            {privacySettings.showProfessionalInfo ? (
              <ToggleRight size={28} className="text-indigo-600" />
            ) : (
              <ToggleLeft size={28} className="text-slate-400" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
          <div>
            <h4 className="font-medium text-slate-800 dark:text-white">Social Links</h4>
            <p className="text-sm text-slate-500">Show your social media profiles</p>
          </div>
          <button
            onClick={() => handlePrivacyToggle('showSocialLinks')}
            className="text-indigo-600 dark:text-indigo-400"
          >
            {privacySettings.showSocialLinks ? (
              <ToggleRight size={28} className="text-indigo-600" />
            ) : (
              <ToggleLeft size={28} className="text-slate-400" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
          <div>
            <h4 className="font-medium text-slate-800 dark:text-white">Achievements</h4>
            <p className="text-sm text-slate-500">Show your awards, certifications, and accomplishments</p>
          </div>
          <button
            onClick={() => handlePrivacyToggle('showAchievements')}
            className="text-indigo-600 dark:text-indigo-400"
          >
            {privacySettings.showAchievements ? (
              <ToggleRight size={28} className="text-indigo-600" />
            ) : (
              <ToggleLeft size={28} className="text-slate-400" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
          <div>
            <h4 className="font-medium text-slate-800 dark:text-white">Contact Information</h4>
            <p className="text-sm text-slate-500">Show your phone number and address</p>
          </div>
          <button
            onClick={() => handlePrivacyToggle('showContactInfo')}
            className="text-indigo-600 dark:text-indigo-400"
          >
            {privacySettings.showContactInfo ? (
              <ToggleRight size={28} className="text-indigo-600" />
            ) : (
              <ToggleLeft size={28} className="text-slate-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-600">
          <AwardIcon className="w-5 h-5" />
          <span className="font-medium">Your Achievements</span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Achievements & Awards
        </label>
        <textarea
          name="achievements"
          value={form.achievements}
          onChange={handleChange}
          rows={4}
          placeholder="List your achievements, awards, recognitions..."
          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none"
        />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
        <div className="bg-indigo-50 dark:bg-indigo-950/30 rounded-xl p-4 text-center">
          <Upload className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-indigo-600">{stats.totalUploads}</p>
          <p className="text-xs text-slate-500">Materials</p>
        </div>
        <div className="bg-green-50 dark:bg-green-950/30 rounded-xl p-4 text-center">
          <Download className="w-5 h-5 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-600">{stats.totalDownloads}</p>
          <p className="text-xs text-slate-500">Downloads</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-xl p-4 text-center">
          <Star className="w-5 h-5 text-yellow-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-yellow-600">{stats.averageRating.toFixed(1)}</p>
          <p className="text-xs text-slate-500">Rating</p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-4 text-center">
          <Eye className="w-5 h-5 text-purple-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-purple-600">{profileViews}</p>
          <p className="text-xs text-slate-500">Profile Views</p>
        </div>
      </div>
    </div>
  );

  const renderFollowing = () => {
    const [followingDetails, setFollowingDetails] = useState([]);
    const [loadingDetails, setLoadingDetails] = useState(true);

    useEffect(() => {
      const loadFollowingDetails = async () => {
        if (!followingList.length) {
          setFollowingDetails([]);
          setLoadingDetails(false);
          return;
        }

        setLoadingDetails(true);
        try {
          const details = await Promise.all(
            followingList.map(async (userId) => {
              const userRef = doc(db, 'profiles', userId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                const data = userSnap.data();
                return {
                  id: userId,
                  name: data.name || 'User',
                  photoURL: data.photoURL,
                  role: data.role || 'student',
                  bio: data.bio,
                  school: data.school
                };
              }
              return null;
            })
          );
          setFollowingDetails(details.filter(d => d !== null));
        } catch (err) {
          console.error("Error loading following details:", err);
          toast.error("Failed to load following details");
        } finally {
          setLoadingDetails(false);
        }
      };

      loadFollowingDetails();
    }, [followingList]);

    if (loadingDetails) {
      return (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      );
    }

    if (followingDetails.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No following yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Start following users to see their activity and materials
          </p>
          <button
            onClick={() => navigate('/connect')}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Explore Users
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="mb-4 p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                You are following <span className="font-bold">{followingDetails.length}</span> {followingDetails.length === 1 ? 'person' : 'people'}
              </p>
            </div>
            <button
              onClick={() => navigate('/connect')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Find more people
            </button>
          </div>
        </div>

        {followingDetails.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex-shrink-0">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                    {getInitials(user.name)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                    {user.name}
                  </h4>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-xs">
                    {user.role === 'student' && <GraduationCap className="w-3 h-3" />}
                    {user.role === 'tutor' && <Briefcase className="w-3 h-3" />}
                    {user.role === 'lecturer' && <Award className="w-3 h-3" />}
                    <span className="capitalize">{user.role}</span>
                  </span>
                </div>
                {user.school && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {user.school}
                  </p>
                )}
                {user.bio && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-1">
                    {user.bio}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/profile/${user.id}`)}
                  className="px-3 py-1.5 text-sm bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg transition"
                >
                  View Profile
                </button>
                <button
                  onClick={() => handleUnfollow(user.id, user.name)}
                  className="px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-lg transition flex items-center gap-1"
                >
                  <UserMinus className="w-3 h-3" />
                  Unfollow
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personal':
        return renderPersonalInfo();
      case 'professional':
        return renderProfessionalInfo();
      case 'social':
        return renderSocialLinks();
      case 'privacy':
        return renderPrivacySettings();
      case 'achievements':
        return renderAchievements();
      case 'following':
        return renderFollowing();
      default:
        return renderPersonalInfo();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <p className="text-slate-500 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-3 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 rounded-full shadow-sm transition-all hover:shadow-md"
            >
              <ArrowLeft size={22} className="text-slate-700 dark:text-slate-300" />
            </button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Profile Settings
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Manage your personal information and preferences
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowQRCode(true)}
              className="p-3 bg-white/80 dark:bg-slate-800/80 hover:bg-white rounded-full shadow-sm transition"
              title="Share QR Code"
            >
              <QrCode size={20} />
            </button>
            <button
              onClick={copyProfileLink}
              className="p-3 bg-white/80 dark:bg-slate-800/80 hover:bg-white rounded-full shadow-sm transition"
              title="Copy Profile Link"
            >
              <Copy size={20} />
            </button>
            <button
              onClick={() => setShowPreviewModal(true)}
              className="p-3 bg-white/80 dark:bg-slate-800/80 hover:bg-white rounded-full shadow-sm transition"
              title="Preview Profile"
            >
              <Eye size={20} />
            </button>
          </div>
          
          <AnimatePresence>
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full"
              >
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-emerald-700 dark:text-emerald-400">Saved!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              {/* Profile Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/70 dark:border-slate-700/60 p-6 mb-6 text-center">
                <div className="relative group inline-block mx-auto">
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-500 shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                        {getInitials()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition shadow-lg border-2 border-white"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
                  {form.name || 'User'}
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mt-2">
                  {role === 'student' && <GraduationCap className="w-3 h-3 text-indigo-600" />}
                  {role === 'tutor' && <Briefcase className="w-3 h-3 text-purple-600" />}
                  {role === 'lecturer' && <Award className="w-3 h-3 text-pink-600" />}
                  <span className="text-xs font-medium capitalize text-indigo-700 dark:text-indigo-300">
                    {role}
                  </span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>Member since {memberSince}</span>
                  </div>
                </div>
              </div>

              {/* Navigation Sections */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/70 dark:border-slate-700/60 p-4">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 ${
                        activeSection === section.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-medium'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="flex-1 text-left">{section.label}</span>
                      {activeSection === section.id && (
                        <Check size={16} className="text-indigo-600" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Stats Card */}
              <div className="mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">Profile Strength</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Complete</span>
                    <span>{Math.min(100, (Object.values(form).filter(v => v).length * 5))}%</span>
                  </div>
                  <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (Object.values(form).filter(v => v).length * 5))}%` }}
                    ></div>
                  </div>
                </div>
                <p className="text-xs text-white/80 mt-4">
                  Complete your profile to get better visibility
                </p>
              </div>

              {/* Follow Stats */}
              <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/70 dark:border-slate-700/60 p-4">
                <div className="flex justify-between items-center">
                  <div className="text-center flex-1">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{followingList.length}</p>
                    <p className="text-xs text-slate-500">Following</p>
                  </div>
                  <div className="w-px h-8 bg-slate-200 dark:bg-slate-700"></div>
                  <div className="text-center flex-1">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{followersList.length}</p>
                    <p className="text-xs text-slate-500">Followers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/70 dark:border-slate-700/60 p-6 md:p-8">
              <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {sections.find(s => s.id === activeSection)?.label}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Update your {activeSection} information
                </p>
              </div>

              <div className="space-y-8">
                {renderActiveSection()}

                {/* Action Buttons - Only show for non-following sections */}
                {activeSection !== 'following' && activeSection !== 'privacy' && (
                  <div className="pt-6 flex flex-col sm:flex-row gap-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-sm disabled:opacity-60 transition flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Save size={18} />
                      )}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>

                    <button
                      onClick={() => navigate(`/profile/${auth.currentUser?.uid}`)}
                      className="flex-1 py-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <Eye size={18} />
                      View Public Profile
                    </button>
                  </div>
                )}

                {/* Danger Zone - Only show for non-following sections */}
                {activeSection !== 'following' && activeSection !== 'privacy' && (
                  <div className="pt-8 mt-4 border-t border-red-200 dark:border-red-800/50">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
                        Danger Zone
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={deleting}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 font-medium rounded-xl disabled:opacity-50 transition"
                    >
                      <Trash2 size={18} />
                      {deleting ? 'Deleting...' : 'Delete My Account'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* QR Code Modal */}
        <AnimatePresence>
          {showQRCode && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full text-center"
              >
                <h3 className="text-xl font-semibold mb-4">Profile QR Code</h3>
                <div className="flex justify-center mb-4">
                  <QRCodeSVG 
                    value={`${window.location.origin}/profile/${auth.currentUser?.uid}`}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#4f46e5"
                    level="H"
                  />
                </div>
                <p className="text-sm text-slate-500 mb-4">Scan to view profile</p>
                <button
                  onClick={() => setShowQRCode(false)}
                  className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Close
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreviewModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full overflow-hidden"
              >
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center">
                  <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-white mb-3">
                    {previewUrl ? (
                      <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-indigo-400 flex items-center justify-center text-2xl font-bold">
                        {getInitials()}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold">{form.name || 'User'}</h3>
                  <p className="text-white/80 text-sm mt-1 capitalize">{role}</p>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail size={16} className="text-slate-400" />
                      <span>{email}</span>
                    </div>
                    {form.phone && privacySettings.showContactInfo && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone size={16} className="text-slate-400" />
                        <span>{form.phone}</span>
                      </div>
                    )}
                    {form.bio && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">
                        {form.bio}
                      </p>
                    )}
                  </div>
                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={() => {
                        setShowPreviewModal(false);
                        navigate(`/profile/${auth.currentUser?.uid}`);
                      }}
                      className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      View Full Profile
                    </button>
                    <button
                      onClick={() => setShowPreviewModal(false)}
                      className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
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
                    This will permanently delete your account, profile, uploaded materials, coins, 
                    favorites, transactions, and all associated data. This action cannot be undone.
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

        {/* Re-authentication Modal */}
        <AnimatePresence>
          {showReauthModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200/70 dark:border-slate-700/60"
              >
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-950/50 flex items-center justify-center">
                      <Shield className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Confirm Your Password
                    </h3>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    For security reasons, please enter your password to delete your account.
                  </p>

                  <input
                    type="password"
                    value={reauthPassword}
                    onChange={(e) => setReauthPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 mb-6 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                  />

                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setShowReauthModal(false);
                        setReauthPassword('');
                      }}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReauthenticate}
                      disabled={reauthLoading}
                      className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {reauthLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Confirm & Delete
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

export default ProfileSettings;