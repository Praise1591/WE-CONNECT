// src/pages/ProfileSettings.jsx - Advanced Modern Version (Fixed Imports)
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ArrowLeft, Save, Trash2, Camera, AlertTriangle,
  GraduationCap, Briefcase, Award, Loader2, User,
  Mail, Phone, MapPin, Venus, Mars, X, Check,
  Edit2, Upload, Shield, Clock, BookOpen, Users,
  Globe, Linkedin, Twitter, CheckCircle,
  Eye, Copy, Share2, QrCode, Sparkles, TrendingUp,
  Award as AwardIcon, Zap, Calendar, Activity, Star, Download,
  UserPlus, UserMinus, UserCheck, Instagram, Facebook, Youtube,
  EyeOff, Eye as EyeIcon, ToggleLeft, ToggleRight,
  Heart, MessageCircle, Bell, Settings, Palette, CreditCard,
  Fingerprint, Key, Lock, Database, Cpu,
  Sun, Moon, Laptop, Smartphone, Tablet, Watch, Headphones,
  Coffee, Gift, Crown, Diamond, Gem, Medal, Trophy,
  Compass, Navigation, Map, Flag, Anchor, Cloud, Droplet,
  Wind, Thermometer, Umbrella, Leaf, Flower,
  Mountain, SunMedium, MoonStar, StarHalf, Sparkle, BadgeCheck,
  Building2, Hash, Target, Layers, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence, useAnimation, useMotionValue, useSpring, useTransform } from 'framer-motion';
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
  arrayRemove,
  writeBatch
} from 'firebase/firestore';
import {
  updateProfile,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 1, suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = value;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{count.toLocaleString()}{suffix}</span>;
};

// Profile Strength Ring Component
const ProfileStrengthRing = ({ percentage, size = 120 }) => {
  const radius = (size - 20) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
          className="dark:stroke-slate-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{percentage}%</span>
        <span className="text-xs text-slate-500">Complete</span>
      </div>
    </div>
  );
};

// Tilt Card Component
const TiltCard = ({ children, className }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Glassmorphic Card Component
const GlassCard = ({ children, className, gradient = false }) => (
  <div className={`relative overflow-hidden rounded-2xl ${gradient ? 'bg-gradient-to-br from-white/90 to-indigo-50/90 dark:from-slate-800/90 dark:to-indigo-950/40' : 'bg-white/80 dark:bg-slate-800/80'} backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-xl ${className}`}>
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none" />
    {children}
  </div>
);

// Animated Input Component
const AnimatedInput = ({ icon: Icon, label, error, success, required, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-1"
    >
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative group">
        <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-all duration-300 ${isFocused ? 'text-indigo-500 scale-110' : 'text-slate-400 group-hover:text-indigo-400'}`}>
          <Icon size={18} />
        </div>
        <input
          {...props}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false);
            setHasValue(!!e.target.value);
            props.onBlur?.(e);
          }}
          onChange={(e) => {
            setHasValue(!!e.target.value);
            props.onChange?.(e);
          }}
          className={`w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 transition-all duration-200 focus:outline-none ${
            error
              ? 'border-red-500 focus:border-red-500 ring-2 ring-red-500/20'
              : isFocused
                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                : hasValue
                  ? 'border-emerald-500'
                  : 'border-transparent hover:border-indigo-300'
          }`}
        />
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <AlertCircle size={16} className="text-red-500 animate-pulse" />
          </div>
        )}
        {success && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <CheckCircle size={16} className="text-emerald-500" />
          </div>
        )}
      </div>
      {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500">{error}</motion.p>}
    </motion.div>
  );
};

// Animated TextArea Component
const AnimatedTextArea = ({ icon: Icon, label, error, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-1"
    >
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>
      <div className="relative group">
        <div className={`absolute left-3 top-3 transition-all duration-300 ${isFocused ? 'text-indigo-500' : 'text-slate-400'}`}>
          <Icon size={18} />
        </div>
        <textarea
          {...props}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl border-2 transition-all duration-200 focus:outline-none resize-none ${
            error
              ? 'border-red-500 focus:border-red-500'
              : isFocused
                ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                : 'border-transparent hover:border-indigo-300'
          }`}
        />
      </div>
    </motion.div>
  );
};

// Social Link Card Component
const SocialLinkCard = ({ icon: Icon, label, value, onChange, placeholder, color }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${color} rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      <div className="relative flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${color} text-white shadow-md transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}>
          <Icon size={16} />
        </div>
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none"
        />
      </div>
    </motion.div>
  );
};

// Stats Card Component
const StatsCard = ({ icon: Icon, label, value, color, onClick }) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    onClick={onClick}
    className={`relative overflow-hidden rounded-xl p-4 ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-10`} />
    <div className="relative flex items-center justify-between">
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
          <AnimatedCounter value={value} />
        </p>
      </div>
      <div className={`p-2 rounded-lg bg-gradient-to-br ${color} shadow-lg`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </motion.div>
);

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
  const [profileStrength, setProfileStrength] = useState(0);
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

  // Calculate profile strength
  useEffect(() => {
    let completed = 0;
    const total = 15;
    if (form.name) completed++;
    if (form.phone) completed++;
    if (form.bio) completed++;
    if (form.school) completed++;
    if (form.department) completed++;
    if (form.website || form.linkedin || form.twitter || form.instagram || form.facebook || form.youtube) completed++;
    if (form.achievements) completed++;
    if (role === 'student' && form.matricNumber) completed++;
    if (role === 'student' && form.graduationYear) completed++;
    if (role === 'tutor' && form.specialization) completed++;
    if (role === 'tutor' && form.yearsExperience) completed++;
    if (role === 'lecturer' && form.title) completed++;
    if (role === 'lecturer' && form.yearsTeaching) completed++;
    if (role === 'lecturer' && form.researchInterests) completed++;
    setProfileStrength(Math.round((completed / total) * 100));
  }, [form, role]);

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
            
            window.dispatchEvent(new CustomEvent('profileUpdated', { 
              detail: { photoURL: data.photoURL, name: data.name, role: data.role } 
            }));
          }
        });

        const followingRef = collection(db, 'users', user.uid, 'following');
        const followingSnap = await getDocs(followingRef);
        setFollowingList(followingSnap.docs.map(doc => doc.id));
        
        const followersRef = collection(db, 'users', user.uid, 'followers');
        const followersSnap = await getDocs(followersRef);
        setFollowersList(followersSnap.docs.map(doc => doc.id));

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
    setPrivacySettings(prev => ({ ...prev, [setting]: !prev[setting] }));
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
    setPreviewUrl(URL.createObjectURL(file));
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
        try { await deleteObject(oldImageRef); } catch (err) {}
        const imageRef = ref(storage, `profile_pictures/${user.uid}`);
        await uploadBytes(imageRef, profilePicFile);
        photoURL = await getDownloadURL(imageRef);
        setProfilePicFile(null);
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
        achievements: form.achievements.trim(),
        photoURL: photoURL || null,
        updatedAt: serverTimestamp(),
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
      await updateProfile(user, { displayName: form.name.trim(), photoURL: photoURL || null });

      const cachedProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      localStorage.setItem('userProfile', JSON.stringify({
        ...cachedProfile,
        name: form.name.trim(),
        photoURL: photoURL || null,
        role: role,
      }));

      sessionStorage.setItem('lastProfileUpdate', JSON.stringify({
        photoURL: photoURL || null,
        name: form.name.trim(),
        timestamp: Date.now()
      }));

      window.dispatchEvent(new CustomEvent('profileUpdated', { 
        detail: { photoURL: photoURL || null, name: form.name.trim(), role: role, uid: user.uid }
      }));

      setTimeout(() => {
        user.reload().catch(console.error);
      }, 500);

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
      try { await deleteObject(imageRef); } catch (err) {}
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
      toast.error("Invalid password. Please try again.");
    } finally {
      setReauthLoading(false);
      setReauthPassword('');
    }
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/profile/${auth.currentUser?.uid}`);
    toast.success("Profile link copied!");
  };

  const sections = [
    { id: 'personal', label: 'Personal Info', icon: User, color: 'from-blue-500 to-cyan-500' },
    { id: 'professional', label: 'Professional', icon: Briefcase, color: 'from-purple-500 to-pink-500' },
    { id: 'social', label: 'Social Links', icon: Globe, color: 'from-indigo-500 to-purple-500' },
    { id: 'privacy', label: 'Privacy', icon: Shield, color: 'from-emerald-500 to-teal-500' },
    { id: 'achievements', label: 'Achievements', icon: AwardIcon, color: 'from-amber-500 to-orange-500' },
    
  ];

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnimatedInput icon={User} label="Full Name" name="name" value={form.name} onChange={handleChange} required />
        <AnimatedInput icon={Mail} label="Email Address" value={email} disabled />
        <AnimatedInput icon={Phone} label="Phone Number" name="phone" value={form.phone} onChange={handleChange} placeholder="+234 801 234 5678" />
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
          <div className="flex gap-3">
            {['male', 'female', 'other', 'prefer-not-to-say'].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, gender: g }))}
                className={`px-4 py-2 rounded-lg capitalize transition-all ${
                  form.gender === g
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-indigo-100'
                }`}
              >
                {g === 'prefer-not-to-say' ? 'Prefer not' : g}
              </button>
            ))}
          </div>
        </div>
        <AnimatedTextArea icon={MessageCircle} label="Bio" name="bio" value={form.bio} onChange={handleChange} rows={4} placeholder="Tell us about yourself..." />
        <AnimatedTextArea icon={MapPin} label="Address" name="address" value={form.address} onChange={handleChange} rows={2} placeholder="Your address" />
      </div>
    </div>
  );

  const renderProfessionalInfo = () => {
    if (role === 'student') {
      return (
        <div className="space-y-6">
          <GlassCard gradient className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600">
                <GraduationCap size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold">Student Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatedInput icon={Hash} label="Matric Number" name="matricNumber" value={form.matricNumber} onChange={handleChange} required />
              <AnimatedInput icon={GraduationCap} label="School/University" name="school" value={form.school} onChange={handleChange} required />
              <AnimatedInput icon={Building2} label="Faculty" name="faculty" value={form.faculty} onChange={handleChange} />
              <AnimatedInput icon={BookOpen} label="Department" name="department" value={form.department} onChange={handleChange} required />
              <AnimatedInput icon={Calendar} label="Graduation Year" type="number" name="graduationYear" value={form.graduationYear} onChange={handleChange} />
            </div>
          </GlassCard>
        </div>
      );
    }
    
    if (role === 'tutor') {
      return (
        <div className="space-y-6">
          <GlassCard gradient className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
                <Briefcase size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold">Tutor Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatedInput icon={Target} label="Specialization" name="specialization" value={form.specialization} onChange={handleChange} required />
              <AnimatedInput icon={Star} label="Years of Experience" type="number" name="yearsExperience" value={form.yearsExperience} onChange={handleChange} required />
              <AnimatedTextArea icon={AwardIcon} label="Certifications" name="certifications" value={form.certifications} onChange={handleChange} rows={3} placeholder="List your certifications..." />
            </div>
          </GlassCard>
        </div>
      );
    }
    
    if (role === 'lecturer') {
      return (
        <div className="space-y-6">
          <GlassCard gradient className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600">
                <Award size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold">Lecturer Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatedInput icon={User} label="Title" name="title" value={form.title} onChange={handleChange} required placeholder="Dr., Prof., etc." />
              <AnimatedInput icon={GraduationCap} label="School/University" name="school" value={form.school} onChange={handleChange} required />
              <AnimatedInput icon={BookOpen} label="Department" name="department" value={form.department} onChange={handleChange} required />
              <AnimatedInput icon={Calendar} label="Years of Teaching" type="number" name="yearsTeaching" value={form.yearsTeaching} onChange={handleChange} required />
              <AnimatedTextArea icon={Target} label="Research Interests" name="researchInterests" value={form.researchInterests} onChange={handleChange} rows={3} />
              <AnimatedTextArea icon={BookOpen} label="Publications" name="publications" value={form.publications} onChange={handleChange} rows={3} />
            </div>
          </GlassCard>
        </div>
      );
    }
    return null;
  };

  const renderSocialLinks = () => (
    <div className="space-y-4">
      <GlassCard gradient className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600">
            <Globe size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-semibold">Connect Your Social Media</h3>
        </div>
        <div className="space-y-3">
          <SocialLinkCard icon={Globe} label="Website" value={form.website} onChange={(e) => setForm(prev => ({ ...prev, website: e.target.value }))} placeholder="https://yourwebsite.com" color="from-slate-500 to-gray-600" />
          <SocialLinkCard icon={Linkedin} label="LinkedIn" value={form.linkedin} onChange={(e) => setForm(prev => ({ ...prev, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/username" color="from-blue-600 to-blue-700" />
          <SocialLinkCard icon={Twitter} label="Twitter/X" value={form.twitter} onChange={(e) => setForm(prev => ({ ...prev, twitter: e.target.value }))} placeholder="https://twitter.com/username" color="from-sky-500 to-sky-600" />
          <SocialLinkCard icon={Instagram} label="Instagram" value={form.instagram} onChange={(e) => setForm(prev => ({ ...prev, instagram: e.target.value }))} placeholder="https://instagram.com/username" color="from-pink-500 to-purple-600" />
          <SocialLinkCard icon={Facebook} label="Facebook" value={form.facebook} onChange={(e) => setForm(prev => ({ ...prev, facebook: e.target.value }))} placeholder="https://facebook.com/username" color="from-blue-700 to-blue-800" />
          <SocialLinkCard icon={Youtube} label="YouTube" value={form.youtube} onChange={(e) => setForm(prev => ({ ...prev, youtube: e.target.value }))} placeholder="https://youtube.com/@username" color="from-red-600 to-red-700" />
        </div>
      </GlassCard>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <GlassCard gradient className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600">
            <Shield size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-semibold">Privacy Controls</h3>
        </div>
        <div className="space-y-4">
          {[
            { id: 'showProfessionalInfo', label: 'Professional Information', description: 'Show your education, work experience, and qualifications', icon: Briefcase },
            { id: 'showSocialLinks', label: 'Social Links', description: 'Show your social media profiles', icon: Globe },
            { id: 'showAchievements', label: 'Achievements', description: 'Show your awards, certifications, and accomplishments', icon: AwardIcon },
            { id: 'showContactInfo', label: 'Contact Information', description: 'Show your phone number and address', icon: Phone },
          ].map((setting) => {
            const Icon = setting.icon;
            return (
              <div key={setting.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl hover:shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
                    <Icon size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800 dark:text-white">{setting.label}</h4>
                    <p className="text-sm text-slate-500">{setting.description}</p>
                  </div>
                </div>
                <button onClick={() => handlePrivacyToggle(setting.id)} className="text-indigo-600 dark:text-indigo-400">
                  {privacySettings[setting.id] ? <ToggleRight size={28} className="text-indigo-600" /> : <ToggleLeft size={28} className="text-slate-400" />}
                </button>
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );

  const renderAchievements = () => (
    <div className="space-y-6">
      <GlassCard gradient className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600">
            <AwardIcon size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-semibold">Your Achievements</h3>
        </div>
        <AnimatedTextArea icon={AwardIcon} label="Achievements & Awards" name="achievements" value={form.achievements} onChange={handleChange} rows={4} placeholder="List your achievements, awards, recognitions..." />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <StatsCard icon={Upload} label="Materials" value={stats.totalUploads} color="from-blue-500 to-cyan-500" />
          <StatsCard icon={Download} label="Downloads" value={stats.totalDownloads} color="from-green-500 to-emerald-500" />
          <StatsCard icon={Star} label="Rating" value={parseFloat(stats.averageRating.toFixed(1))} color="from-yellow-500 to-orange-500" />
          <StatsCard icon={Eye} label="Profile Views" value={profileViews} color="from-purple-500 to-pink-500" />
        </div>
      </GlassCard>
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
                return { id: userId, name: data.name || 'User', photoURL: data.photoURL, role: data.role || 'student', bio: data.bio, school: data.school };
              }
              return null;
            })
          );
          setFollowingDetails(details.filter(d => d !== null));
        } catch (err) {
          console.error("Error loading following details:", err);
        } finally {
          setLoadingDetails(false);
        }
      };
      loadFollowingDetails();
    }, [followingList]);

    if (loadingDetails) {
      return <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>;
    }

    if (followingDetails.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No following yet</h3>
          <p className="text-slate-500 mb-4">Start following users to see their activity</p>
          <button onClick={() => navigate('/connect')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">Explore Users</button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-indigo-600">You are following <span className="font-bold">{followingDetails.length}</span> {followingDetails.length === 1 ? 'person' : 'people'}</p>
            <button onClick={() => navigate('/connect')} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Find more people</button>
          </div>
          <div className="space-y-3">
            {followingDetails.map((user, idx) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition"
              >
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${user.id}`)}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.role}{user.school && ` • ${user.school}`}</p>
                  </div>
                </div>
                <button onClick={() => handleUnfollow(user.id, user.name)} className="px-3 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition flex items-center gap-1">
                  <UserMinus size={14} /> Unfollow
                </button>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </div>
    );
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personal': return renderPersonalInfo();
      case 'professional': return renderProfessionalInfo();
      case 'social': return renderSocialLinks();
      case 'privacy': return renderPrivacySettings();
      case 'achievements': return renderAchievements();
      case 'following': return renderFollowing();
      default: return renderPersonalInfo();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <p className="text-slate-500 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white rounded-full shadow-lg transition-all"
            >
              <ArrowLeft size={22} className="text-slate-700 dark:text-slate-300" />
            </motion.button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Profile Settings</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your personal information and preferences</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowQRCode(true)} className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white rounded-full shadow-lg transition" title="Share QR Code"><QrCode size={20} /></motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={copyProfileLink} className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white rounded-full shadow-lg transition" title="Copy Profile Link"><Copy size={20} /></motion.button>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowPreviewModal(true)} className="p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:bg-white rounded-full shadow-lg transition" title="Preview Profile"><Eye size={20} /></motion.button>
          </div>
          
          <AnimatePresence>
            {saveSuccess && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-emerald-700 dark:text-emerald-400">Saved!</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Profile Card */}
              <GlassCard className="p-6 text-center">
                <div className="relative group inline-block mx-auto">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-500 shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                      {previewUrl ? (
                        <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">{getInitials()}</div>
                      )}
                    </div>
                    <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition shadow-lg border-2 border-white">
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </div>
                </div>
                <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{form.name || 'User'}</h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mt-2">
                  {role === 'student' && <GraduationCap className="w-3 h-3 text-indigo-600" />}
                  {role === 'tutor' && <Briefcase className="w-3 h-3 text-purple-600" />}
                  {role === 'lecturer' && <Award className="w-3 h-3 text-pink-600" />}
                  <span className="text-xs font-medium capitalize text-indigo-700 dark:text-indigo-300">{role}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span>Member since {memberSince}</span>
                  </div>
                </div>
              </GlassCard>

              {/* Profile Strength Ring */}
              <GlassCard className="p-6">
                <div className="flex flex-col items-center">
                  <ProfileStrengthRing percentage={profileStrength} />
                  <p className="text-sm text-slate-500 mt-3">Profile Strength</p>
                  <p className="text-xs text-slate-400">Complete your profile to get better visibility</p>
                </div>
              </GlassCard>

              {/* Navigation Sections */}
              <GlassCard className="p-4">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <motion.button
                      key={section.id}
                      whileHover={{ x: 5 }}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 text-indigo-700 dark:text-indigo-300 font-medium'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="flex-1 text-left">{section.label}</span>
                      {activeSection === section.id && <Check size={16} className="text-indigo-600" />}
                    </motion.button>
                  );
                })}
              </GlassCard>

              {/* Follow Stats */}
              <GlassCard className="p-4">
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
              </GlassCard>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <GlassCard className="p-6 md:p-8">
              <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{sections.find(s => s.id === activeSection)?.label}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Update your {activeSection} information</p>
              </div>

              <div className="space-y-8">
                {renderActiveSection()}

                {activeSection !== 'following' && activeSection !== 'privacy' && (
                  <div className="pt-6 flex flex-col sm:flex-row gap-4 border-t border-slate-200 dark:border-slate-700">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSave} disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg disabled:opacity-60 transition flex items-center justify-center gap-2">
                      {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save size={18} />}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => navigate(`/profile/${auth.currentUser?.uid}`)} className="flex-1 py-3 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/30 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium rounded-xl transition flex items-center justify-center gap-2">
                      <Eye size={18} /> View Public Profile
                    </motion.button>
                  </div>
                )}

                {activeSection !== 'following' && activeSection !== 'privacy' && (
                  <div className="pt-8 mt-4 border-t border-red-200 dark:border-red-800/50">
                    <div className="flex items-center gap-2 mb-4">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Danger Zone</h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
                    <button onClick={() => setShowDeleteConfirm(true)} disabled={deleting} className="flex items-center justify-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 font-medium rounded-xl disabled:opacity-50 transition">
                      <Trash2 size={18} /> {deleting ? 'Deleting...' : 'Delete My Account'}
                    </button>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>
        </div>

        {/* QR Code Modal */}
        <AnimatePresence>
          {showQRCode && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowQRCode(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-semibold mb-4">Profile QR Code</h3>
                <div className="flex justify-center mb-4">
                  <QRCodeSVG value={`${window.location.origin}/profile/${auth.currentUser?.uid}`} size={200} bgColor="#ffffff" fgColor="#4f46e5" level="H" />
                </div>
                <p className="text-sm text-slate-500 mb-4">Scan to view profile</p>
                <button onClick={() => setShowQRCode(false)} className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Close</button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreviewModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setShowPreviewModal(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white text-center">
                  <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-white mb-3">
                    {previewUrl ? <img src={previewUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-indigo-400 flex items-center justify-center text-2xl font-bold">{getInitials()}</div>}
                  </div>
                  <h3 className="text-xl font-bold">{form.name || 'User'}</h3>
                  <p className="text-white/80 text-sm mt-1 capitalize">{role}</p>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm"><Mail size={16} className="text-slate-400" /><span>{email}</span></div>
                    {form.phone && privacySettings.showContactInfo && <div className="flex items-center gap-3 text-sm"><Phone size={16} className="text-slate-400" /><span>{form.phone}</span></div>}
                    {form.bio && <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">{form.bio}</p>}
                  </div>
                  <div className="mt-6 flex gap-2">
                    <button onClick={() => { setShowPreviewModal(false); navigate(`/profile/${auth.currentUser?.uid}`); }} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">View Full Profile</button>
                    <button onClick={() => setShowPreviewModal(false)} className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg">Close</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200/70 dark:border-slate-700/60" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center"><AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" /></div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Delete Account?</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mb-6">This will permanently delete your account, profile, uploaded materials, coins, favorites, transactions, and all associated data. This action cannot be undone.</p>
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => setShowDeleteConfirm(false)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition">Cancel</button>
                    <button onClick={handleDeleteAccount} disabled={deleting} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition shadow-sm disabled:opacity-50 flex items-center gap-2">{deleting && <Loader2 className="h-4 w-4 animate-spin" />}Delete Permanently</button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Re-authentication Modal */}
        <AnimatePresence>
          {showReauthModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowReauthModal(false)}>
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200/70 dark:border-slate-700/60" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-950/50 flex items-center justify-center"><Shield className="h-6 w-6 text-yellow-600 dark:text-yellow-400" /></div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Confirm Your Password</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">For security reasons, please enter your password to delete your account.</p>
                  <input type="password" value={reauthPassword} onChange={(e) => setReauthPassword(e.target.value)} placeholder="Enter your password" className="w-full px-4 py-3 mb-6 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition" />
                  <div className="flex gap-3 justify-end">
                    <button onClick={() => { setShowReauthModal(false); setReauthPassword(''); }} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition">Cancel</button>
                    <button onClick={handleReauthenticate} disabled={reauthLoading} className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition shadow-sm disabled:opacity-50 flex items-center gap-2">{reauthLoading && <Loader2 className="h-4 w-4 animate-spin" />}Confirm & Delete</button>
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