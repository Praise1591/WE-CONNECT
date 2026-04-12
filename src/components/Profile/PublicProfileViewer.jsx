// components/Profile/PublicProfileViewer.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User, Mail, MapPin, Calendar, BookOpen, Upload, Download,
  Heart, Users, Eye, Award, GraduationCap, Briefcase,
  Twitter, Linkedin, Github, Globe, Share2, MessageSquare,
  Star, Clock, FileText, Video, ScrollText, Zap,
  AlertCircle, Loader2, ExternalLink, Copy, Phone,
  UserPlus, UserCheck, Search, X, ChevronRight,
  Activity, TrendingUp, ChevronDown, ChevronUp, UserMinus,
  Instagram, Facebook, Youtube, Building2, FileCheck,
  BadgeCheck, Shield, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  updateDoc,
  increment,
  writeBatch,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

function PublicProfileViewer() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  
  // Profile States
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [showAllMaterials, setShowAllMaterials] = useState(false);
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalDownloads: 0,
    averageRating: 0,
    followers: 0,
    following: 0,
    profileViews: 0
  });
  const [isFollowing, setIsFollowing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [followingInProgress, setFollowingInProgress] = useState(false);
  const [activeTab, setActiveTab] = useState('materials');
  const [unfollowingId, setUnfollowingId] = useState(null);
  
  // Privacy settings from profile
  const [privacySettings, setPrivacySettings] = useState({
    showProfessionalInfo: true,
    showSocialLinks: true,
    showAchievements: true,
    showContactInfo: true
  });

  // Load all schools for filter
  const [allSchools, setAllSchools] = useState([]);
  
  // Search States
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchFilters, setSearchFilters] = useState({ role: 'all', school: '' });

  useEffect(() => {
    const loadSchools = async () => {
      try {
        const schoolsRef = collection(db, 'schools');
        const schoolsSnap = await getDocs(schoolsRef);
        const schools = schoolsSnap.docs.map(doc => doc.data().name);
        setAllSchools(schools);
      } catch (err) {
        console.error("Error loading schools:", err);
      }
    };
    loadSchools();
  }, []);

  // Main load function
  useEffect(() => {
    if (!userId) return;
    
    const loadAllData = async () => {
      setLoading(true);
      try {
        // 1. Load profile from 'profiles' collection
        const profileRef = doc(db, 'profiles', userId);
        const profileDoc = await getDoc(profileRef);
        
        if (!profileDoc.exists()) {
          setError("User not found");
          setLoading(false);
          return;
        }
        
        const profileData = profileDoc.data();
        setProfile({
          id: userId,
          ...profileData,
          joinedDate: profileData.createdAt?.toDate?.() || new Date(),
          lastActive: profileData.lastActive?.toDate?.() || new Date()
        });
        
        // Load privacy settings
        setPrivacySettings({
          showProfessionalInfo: profileData.showProfessionalInfo !== false,
          showSocialLinks: profileData.showSocialLinks !== false,
          showAchievements: profileData.showAchievements !== false,
          showContactInfo: profileData.showContactInfo !== false
        });
        
        // 2. Load materials stats
        const materialsRef = collection(db, 'materials');
        const materialsQuery = query(materialsRef, where('uid', '==', userId));
        const materialsSnap = await getDocs(materialsQuery);
        const uploadedMaterials = materialsSnap.docs;
        const totalUploads = uploadedMaterials.length;
        const totalDownloads = uploadedMaterials.reduce((sum, doc) => sum + (doc.data().downloads || 0), 0);
        const avgRating = uploadedMaterials.reduce((sum, doc) => sum + (doc.data().averageRating || 0), 0) / (totalUploads || 1);
        
        // 3. Get followers count
        const followersRef = collection(db, 'users', userId, 'followers');
        let followersCount = 0;
        let followersListData = [];
        try {
          const followersSnap = await getDocs(followersRef);
          followersCount = followersSnap.size;
          
          for (const docSnap of followersSnap.docs) {
            const userProfile = await getDoc(doc(db, 'profiles', docSnap.id));
            if (userProfile.exists()) {
              followersListData.push({ id: docSnap.id, ...userProfile.data() });
            }
          }
          setFollowersList(followersListData);
        } catch (err) {
          console.error("Error loading followers:", err);
        }
        
        // 4. Get following count
        const followingRef = collection(db, 'users', userId, 'following');
        let followingCount = 0;
        let followingListData = [];
        try {
          const followingSnap = await getDocs(followingRef);
          followingCount = followingSnap.size;
          
          for (const docSnap of followingSnap.docs) {
            const userProfile = await getDoc(doc(db, 'profiles', docSnap.id));
            if (userProfile.exists()) {
              followingListData.push({ 
                id: docSnap.id, 
                ...userProfile.data(),
                followedAt: docSnap.data().followedAt?.toDate?.() || new Date()
              });
            }
          }
          setFollowingList(followingListData);
        } catch (err) {
          console.error("Error loading following:", err);
        }
        
        // 5. Get recent materials
        const recentMaterials = uploadedMaterials
          .sort((a, b) => {
            const dateA = a.data().createdAt?.toDate?.() || new Date(0);
            const dateB = b.data().createdAt?.toDate?.() || new Date(0);
            return dateB - dateA;
          })
          .slice(0, 6)
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date()
          }));
        
        // 6. Check if current user follows this profile
        let isFollowingStatus = false;
        if (currentUser && currentUser.uid !== userId) {
          try {
            const followRef = doc(db, 'users', currentUser.uid, 'following', userId);
            const followDoc = await getDoc(followRef);
            isFollowingStatus = followDoc.exists();
          } catch (err) {
            console.error("Error checking follow status:", err);
          }
        }
        
        setStats({
          totalUploads,
          totalDownloads,
          averageRating: avgRating,
          followers: followersCount,
          following: followingCount,
          profileViews: profileData.profileViews || 0
        });
        
        setMaterials(recentMaterials);
        setAllMaterials(recentMaterials);
        setIsFollowing(isFollowingStatus);
        
        // 7. Increment profile views (only if not the owner)
        if (currentUser?.uid !== userId) {
          try {
            await updateDoc(profileRef, {
              profileViews: increment(1),
              lastActive: serverTimestamp()
            });
          } catch (err) {
            console.warn("Could not increment profile views:", err.message);
          }
        }
        
        // 8. Load recent activity
        setLoadingActivity(true);
        const activityQuery = query(
          materialsRef,
          where('uid', '==', userId),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const activitySnap = await getDocs(activityQuery);
        const activities = activitySnap.docs.map(doc => ({
          id: doc.id,
          type: 'upload',
          title: doc.data().title,
          category: doc.data().category,
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          action: `uploaded a new ${doc.data().category || 'material'}`
        }));
        setRecentActivity(activities);
        setLoadingActivity(false);
        
      } catch (err) {
        console.error("Error loading profile:", err);
        setError("Failed to load profile: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadAllData();
  }, [userId, currentUser]);

  // Real-time listener for followers/following updates
  useEffect(() => {
    if (!userId || !profile) return;
    
    const followersUnsub = onSnapshot(
      collection(db, 'users', userId, 'followers'),
      async () => {
        try {
          const followersRef = collection(db, 'users', userId, 'followers');
          const followersSnap = await getDocs(followersRef);
          setStats(prev => ({ ...prev, followers: followersSnap.size }));
          
          const followersListData = [];
          for (const docSnap of followersSnap.docs) {
            const userProfile = await getDoc(doc(db, 'profiles', docSnap.id));
            if (userProfile.exists()) {
              followersListData.push({ id: docSnap.id, ...userProfile.data() });
            }
          }
          setFollowersList(followersListData);
        } catch (err) {
          console.error("Error in followers listener:", err);
        }
      },
      (error) => {
        console.error("Followers listener error:", error);
      }
    );
    
    const followingUnsub = onSnapshot(
      collection(db, 'users', userId, 'following'),
      async () => {
        try {
          const followingRef = collection(db, 'users', userId, 'following');
          const followingSnap = await getDocs(followingRef);
          setStats(prev => ({ ...prev, following: followingSnap.size }));
          
          const followingListData = [];
          for (const docSnap of followingSnap.docs) {
            const userProfile = await getDoc(doc(db, 'profiles', docSnap.id));
            if (userProfile.exists()) {
              followingListData.push({ 
                id: docSnap.id, 
                ...userProfile.data(),
                followedAt: docSnap.data().followedAt?.toDate?.() || new Date()
              });
            }
          }
          setFollowingList(followingListData);
        } catch (err) {
          console.error("Error in following listener:", err);
        }
      },
      (error) => {
        console.error("Following listener error:", error);
      }
    );
    
    return () => {
      followersUnsub();
      followingUnsub();
    };
  }, [userId, profile]);

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error("Please sign in to follow users");
      return;
    }
    
    if (currentUser.uid === userId) {
      toast.error("You cannot follow yourself");
      return;
    }
    
    setFollowingInProgress(true);
    try {
      const batch = writeBatch(db);
      
      const followingRef = doc(db, 'users', currentUser.uid, 'following', userId);
      batch.set(followingRef, {
        followedAt: serverTimestamp(),
        userName: profile?.name,
        userPhoto: profile?.photoURL
      });
      
      const followerRef = doc(db, 'users', userId, 'followers', currentUser.uid);
      batch.set(followerRef, {
        followedAt: serverTimestamp(),
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Someone',
        userPhoto: currentUser.photoURL
      });
      
      const notificationRef = doc(collection(db, `users/${userId}/notifications`));
      batch.set(notificationRef, {
        type: 'new_follower',
        message: `${currentUser.displayName || currentUser.email?.split('@')[0] || 'Someone'} started following you`,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Someone',
        read: false,
        createdAt: serverTimestamp()
      });
      
      await batch.commit();
      
      setIsFollowing(true);
      setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
      toast.success(`Now following ${profile?.name}`);
    } catch (err) {
      console.error("Error following user:", err);
      toast.error("Failed to follow user: " + err.message);
    } finally {
      setFollowingInProgress(false);
    }
  };

  const handleUnfollow = async () => {
    setFollowingInProgress(true);
    try {
      const batch = writeBatch(db);
      
      const followingRef = doc(db, 'users', currentUser.uid, 'following', userId);
      batch.delete(followingRef);
      
      const followerRef = doc(db, 'users', userId, 'followers', currentUser.uid);
      batch.delete(followerRef);
      
      await batch.commit();
      
      setIsFollowing(false);
      setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      toast.success(`Unfollowed ${profile?.name}`);
    } catch (err) {
      console.error("Error unfollowing user:", err);
      toast.error("Failed to unfollow user: " + err.message);
    } finally {
      setFollowingInProgress(false);
    }
  };

  const handleUnfollowFromList = async (targetUserId, targetName) => {
    if (!currentUser) return;
    
    setUnfollowingId(targetUserId);
    try {
      const batch = writeBatch(db);
      
      const followingRef = doc(db, 'users', currentUser.uid, 'following', targetUserId);
      batch.delete(followingRef);
      
      const followerRef = doc(db, 'users', targetUserId, 'followers', currentUser.uid);
      batch.delete(followerRef);
      
      await batch.commit();
      
      setFollowingList(prev => prev.filter(user => user.id !== targetUserId));
      setStats(prev => ({ ...prev, following: prev.following - 1 }));
      toast.success(`Unfollowed ${targetName}`);
    } catch (err) {
      console.error("Error unfollowing user:", err);
      toast.error("Failed to unfollow user");
    } finally {
      setUnfollowingId(null);
    }
  };

  const handleSearchUsers = async () => {
    if (!searchTerm.trim() && searchFilters.role === 'all' && !searchFilters.school) {
      toast.error("Please enter a search term or select filters");
      return;
    }
    
    setSearching(true);
    try {
      const usersRef = collection(db, 'profiles');
      let constraints = [];
      
      if (searchFilters.role !== 'all') {
        constraints.push(where('role', '==', searchFilters.role));
      }
      
      if (searchFilters.school) {
        constraints.push(where('school', '==', searchFilters.school));
      }
      
      let q = query(usersRef, ...constraints, limit(20));
      const snapshot = await getDocs(q);
      const results = [];
      const searchLower = searchTerm.toLowerCase().trim();
      
      snapshot.forEach((docSnap) => {
        const userData = docSnap.data();
        const userIdDoc = docSnap.id;
        
        if (userIdDoc === currentUser?.uid) return;
        
        const matches = !searchTerm || 
          userData.name?.toLowerCase().includes(searchLower) ||
          userData.email?.toLowerCase().includes(searchLower) ||
          userData.school?.toLowerCase().includes(searchLower);
        
        if (matches) {
          results.push({ id: userIdDoc, ...userData });
        }
      });
      
      setSearchResults(results);
      
      if (results.length === 0) {
        toast.error(`No users found`);
      } else {
        toast.success(`Found ${results.length} user${results.length !== 1 ? 's' : ''}`);
      }
    } catch (err) {
      console.error("Error searching users:", err);
      toast.error("Failed to search users");
    } finally {
      setSearching(false);
    }
  };

  const getRoleIcon = () => {
    switch (profile?.role) {
      case 'student': return GraduationCap;
      case 'tutor': return Briefcase;
      case 'lecturer': return Award;
      default: return User;
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Past Questions': ScrollText,
      'PDF Notes': FileText,
      'Video Tutorials': Video,
      'Technical Reviews': BookOpen,
    };
    return icons[category] || FileText;
  };

  const handleCopyProfileLink = () => {
    const url = `${window.location.origin}/profile/${userId}`;
    navigator.clipboard.writeText(url);
    toast.success("Profile link copied!");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile?.name}'s Profile`,
        text: `Check out ${profile?.name}'s profile on WeConnect`,
        url: `${window.location.origin}/profile/${userId}`,
      });
    } else {
      handleCopyProfileLink();
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Recently';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRelativeTime = (date) => {
    if (!date) return 'Just now';
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return formatDate(date);
  };

  const getInitials = (name) => {
    const userName = name || 'User';
    return userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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

  if (error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Profile Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error || "The user profile you're looking for doesn't exist or may have been deleted."}
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const RoleIcon = getRoleIcon();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 pb-12">
      {/* Cover Image Section */}
      <div className="relative h-48 md:h-64 lg:h-72 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/60 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
                    {profile.photoURL ? (
                      <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold">
                        {getInitials(profile.name)}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-indigo-600 rounded-full p-1 border-2 border-white">
                    <RoleIcon className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="text-white">
                  <h1 className="text-xl md:text-2xl font-bold">{profile.name}</h1>
                  <p className="text-white/90 text-xs md:text-sm mt-0.5">
                    {profile.role === 'student' && profile.school && `${profile.school} • Student`}
                    {profile.role === 'tutor' && profile.specialization && `${profile.specialization} • Tutor`}
                    {profile.role === 'lecturer' && profile.title && `${profile.title} • Lecturer`}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-white/70">
                    <span className="flex items-center gap-1"><Calendar size={10} />Joined {formatDate(profile.joinedDate)}</span>
                    <span className="flex items-center gap-1"><Eye size={10} />{stats.profileViews} views</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {isAuthenticated && (
                  <button
                    onClick={() => setShowSearchModal(true)}
                    className="px-3 py-1.5 text-sm bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-lg font-medium transition flex items-center gap-1"
                  >
                    <Search size={14} />
                    Find Users
                  </button>
                )}
                
                {isAuthenticated && currentUser?.uid !== userId && (
                  <button
                    onClick={isFollowing ? handleUnfollow : handleFollow}
                    disabled={followingInProgress}
                    className={`px-3 py-1.5 text-sm backdrop-blur-sm rounded-lg font-medium transition flex items-center gap-1 ${
                      followingInProgress ? 'opacity-50 cursor-not-allowed' : ''
                    } bg-white/20 hover:bg-white/30 text-white`}
                  >
                    {followingInProgress ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : isFollowing ? (
                      <UserCheck size={14} />
                    ) : (
                      <UserPlus size={14} />
                    )}
                    {followingInProgress ? 'Processing...' : (isFollowing ? 'Following' : 'Follow')}
                  </button>
                )}
                
                <button
                  onClick={handleShare}
                  className="px-3 py-1.5 text-sm bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-lg font-medium transition flex items-center gap-1"
                >
                  <Share2 size={14} />
                  Share
                </button>
                
                {currentUser?.uid === userId && (
                  <button
                    onClick={() => navigate('/settings')}
                    className="px-3 py-1.5 text-sm bg-white text-indigo-600 hover:bg-indigo-50 rounded-lg font-medium transition flex items-center gap-1"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 md:-mt-16 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon: Upload, label: 'Materials', value: stats.totalUploads, color: 'from-blue-500 to-cyan-500' },
            { icon: Download, label: 'Downloads', value: stats.totalDownloads, color: 'from-green-500 to-emerald-500' },
            { icon: Star, label: 'Rating', value: stats.averageRating.toFixed(1), suffix: '/5', color: 'from-yellow-500 to-orange-500' },
            { icon: Users, label: 'Followers', value: stats.followers, color: 'from-purple-500 to-pink-500', onClick: () => setShowFollowersModal(true) },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={stat.onClick}
              className={`bg-white dark:bg-slate-800 rounded-xl shadow-md p-3 border border-slate-200/70 dark:border-slate-700/60 ${stat.onClick ? 'cursor-pointer hover:shadow-lg transition' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-1.5 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                {stat.suffix && <span className="text-xs text-slate-400">{stat.suffix}</span>}
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-4 py-2 text-sm font-medium transition-all relative whitespace-nowrap ${
              activeTab === 'materials'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Materials
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 text-sm font-medium transition-all relative whitespace-nowrap ${
              activeTab === 'about'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            className={`px-4 py-2 text-sm font-medium transition-all relative whitespace-nowrap ${
              activeTab === 'followers'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Followers
            {stats.followers > 0 && (
              <span className="ml-1.5 text-xs bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
                {stats.followers}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`px-4 py-2 text-sm font-medium transition-all relative whitespace-nowrap ${
              activeTab === 'following'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Following
            {stats.following > 0 && (
              <span className="ml-1.5 text-xs bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">
                {stats.following}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 text-sm font-medium transition-all relative whitespace-nowrap ${
              activeTab === 'activity'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
            }`}
          >
            Activity
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - About (only visible on materials/activity tabs) */}
          {(activeTab === 'materials' || activeTab === 'activity') && (
            <div className="lg:col-span-1 space-y-4">
              {/* Bio Card */}
              {profile.bio && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 border border-slate-200/70 dark:border-slate-700/60">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <User size={16} className="text-indigo-600" />
                    Bio
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{profile.bio}</p>
                </div>
              )}

              {/* Contact Info - Only if user allows */}
              {privacySettings.showContactInfo && (profile.phone || profile.address) && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 border border-slate-200/70 dark:border-slate-700/60">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Mail size={16} className="text-indigo-600" />
                    Contact
                  </h3>
                  <div className="space-y-2">
                    {profile.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Phone size={14} />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile.address && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <MapPin size={14} />
                        <span className="truncate">{profile.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Professional Info - Only if user allows */}
              {privacySettings.showProfessionalInfo && (
                <>
                  {profile.role === 'student' && (profile.school || profile.department) && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 border border-slate-200/70 dark:border-slate-700/60">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <GraduationCap size={16} className="text-indigo-600" />
                        Education
                      </h3>
                      <div className="space-y-2">
                        {profile.school && <div><p className="text-xs text-slate-500">School</p><p className="text-sm font-medium">{profile.school}</p></div>}
                        {profile.faculty && <div><p className="text-xs text-slate-500">Faculty</p><p className="text-sm font-medium">{profile.faculty}</p></div>}
                        {profile.department && <div><p className="text-xs text-slate-500">Department</p><p className="text-sm font-medium">{profile.department}</p></div>}
                        {profile.matricNumber && <div><p className="text-xs text-slate-500">Matric No.</p><p className="text-sm font-medium">{profile.matricNumber}</p></div>}
                        {profile.graduationYear && <div><p className="text-xs text-slate-500">Grad Year</p><p className="text-sm font-medium">{profile.graduationYear}</p></div>}
                      </div>
                    </div>
                  )}

                  {profile.role === 'tutor' && (profile.specialization || profile.yearsExperience) && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 border border-slate-200/70 dark:border-slate-700/60">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <Briefcase size={16} className="text-indigo-600" />
                        Tutoring
                      </h3>
                      <div className="space-y-2">
                        {profile.specialization && <div><p className="text-xs text-slate-500">Specialization</p><p className="text-sm font-medium">{profile.specialization}</p></div>}
                        {profile.yearsExperience > 0 && <div><p className="text-xs text-slate-500">Experience</p><p className="text-sm font-medium">{profile.yearsExperience} years</p></div>}
                        {profile.certifications && <div><p className="text-xs text-slate-500">Certifications</p><p className="text-sm font-medium">{profile.certifications}</p></div>}
                      </div>
                    </div>
                  )}

                  {profile.role === 'lecturer' && (profile.title || profile.school || profile.department) && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 border border-slate-200/70 dark:border-slate-700/60">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <Award size={16} className="text-indigo-600" />
                        Academic Position
                      </h3>
                      <div className="space-y-2">
                        {profile.title && <div><p className="text-xs text-slate-500">Title</p><p className="text-sm font-medium">{profile.title}</p></div>}
                        {profile.school && <div><p className="text-xs text-slate-500">Institution</p><p className="text-sm font-medium">{profile.school}</p></div>}
                        {profile.department && <div><p className="text-xs text-slate-500">Department</p><p className="text-sm font-medium">{profile.department}</p></div>}
                        {profile.yearsTeaching > 0 && <div><p className="text-xs text-slate-500">Teaching Experience</p><p className="text-sm font-medium">{profile.yearsTeaching} years</p></div>}
                        {profile.researchInterests && <div><p className="text-xs text-slate-500">Research Interests</p><p className="text-sm font-medium">{profile.researchInterests}</p></div>}
                        {profile.publications && <div><p className="text-xs text-slate-500">Publications</p><p className="text-sm font-medium">{profile.publications}</p></div>}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Achievements - Only if user allows */}
              {privacySettings.showAchievements && profile.achievements && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 border border-slate-200/70 dark:border-slate-700/60">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Award size={16} className="text-indigo-600" />
                    Achievements
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm whitespace-pre-wrap">{profile.achievements}</p>
                </div>
              )}

              {/* Social Links - Only if user allows */}
              {privacySettings.showSocialLinks && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 border border-slate-200/70 dark:border-slate-700/60">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Globe size={16} className="text-indigo-600" />
                    Connect
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.website && (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition group">
                        <Globe size={16} className="text-slate-600 group-hover:text-indigo-600" />
                      </a>
                    )}
                    {profile.linkedin && (
                      <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition group">
                        <Linkedin size={16} className="text-blue-600" />
                      </a>
                    )}
                    {profile.twitter && (
                      <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition group">
                        <Twitter size={16} className="text-sky-500" />
                      </a>
                    )}
                    {profile.instagram && (
                      <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition group">
                        <Instagram size={16} className="text-pink-600" />
                      </a>
                    )}
                    {profile.facebook && (
                      <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition group">
                        <Facebook size={16} className="text-blue-700" />
                      </a>
                    )}
                    {profile.youtube && (
                      <a href={profile.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition group">
                        <Youtube size={16} className="text-red-600" />
                      </a>
                    )}
                    {profile.github && (
                      <a href={profile.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition group">
                        <Github size={16} className="text-slate-700 dark:text-slate-400" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Right Column - Tab Content */}
          <div className={`${activeTab === 'about' ? 'lg:col-span-3' : 'lg:col-span-2'} space-y-4`}>
            {/* Materials Tab */}
            {activeTab === 'materials' && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200/70 dark:border-slate-700/60 overflow-hidden">
                <div className="p-4">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <BookOpen size={16} className="text-indigo-600" />
                    Uploaded Materials
                  </h3>
                  
                  <div className="space-y-3">
                    {materials.length === 0 ? (
                      <div className="text-center py-8">
                        <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No materials uploaded yet</p>
                      </div>
                    ) : (
                      materials.map((material) => {
                        const CategoryIcon = getCategoryIcon(material.category);
                        return (
                          <div
                            key={material.id}
                            className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3 hover:shadow-md transition cursor-pointer"
                            onClick={() => navigate(`/materials/${material.id}`)}
                          >
                            <div className="flex items-start gap-2">
                              <div className={`p-1.5 rounded-lg bg-gradient-to-r ${
                                material.category === 'Past Questions' ? 'from-amber-500 to-orange-500' :
                                material.category === 'PDF Notes' ? 'from-blue-500 to-cyan-500' :
                                material.category === 'Video Tutorials' ? 'from-purple-500 to-pink-500' :
                                'from-emerald-500 to-teal-500'
                              }`}>
                                <CategoryIcon className="w-3 h-3 text-white" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-slate-900 dark:text-white">{material.title}</h4>
                                <p className="text-xs text-slate-500 mt-0.5">{material.course || material.category}</p>
                                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                  <span className="flex items-center gap-0.5"><Download size={10} />{material.downloads || 0}</span>
                                  <span className="flex items-center gap-0.5"><Star size={10} />{material.averageRating?.toFixed(1) || 0}</span>
                                  <span>{formatRelativeTime(material.createdAt)}</span>
                                </div>
                              </div>
                              <ExternalLink size={12} className="text-slate-400 flex-shrink-0" />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* About Tab - Full Profile Info */}
            {activeTab === 'about' && (
              <div className="space-y-4">
                {/* Bio Card */}
                {profile.bio && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 border border-slate-200/70 dark:border-slate-700/60">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <User size={18} className="text-indigo-600" />
                      About Me
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {/* Contact Info - Only if user allows */}
                {privacySettings.showContactInfo && (profile.phone || profile.address || profile.email) && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 border border-slate-200/70 dark:border-slate-700/60">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Mail size={18} className="text-indigo-600" />
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {profile.email && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Mail size={14} />
                          <span>{profile.email}</span>
                        </div>
                      )}
                      {profile.phone && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Phone size={14} />
                          <span>{profile.phone}</span>
                        </div>
                      )}
                      {profile.address && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 md:col-span-2">
                          <MapPin size={14} />
                          <span>{profile.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Professional Info - Only if user allows */}
                {privacySettings.showProfessionalInfo && (
                  <>
                    {profile.role === 'student' && (profile.school || profile.department || profile.matricNumber) && (
                      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 border border-slate-200/70 dark:border-slate-700/60">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                          <GraduationCap size={18} className="text-indigo-600" />
                          Education
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {profile.school && (
                            <div><p className="text-xs text-slate-500">School/University</p><p className="text-sm font-medium">{profile.school}</p></div>
                          )}
                          {profile.faculty && (
                            <div><p className="text-xs text-slate-500">Faculty</p><p className="text-sm font-medium">{profile.faculty}</p></div>
                          )}
                          {profile.department && (
                            <div><p className="text-xs text-slate-500">Department</p><p className="text-sm font-medium">{profile.department}</p></div>
                          )}
                          {profile.matricNumber && (
                            <div><p className="text-xs text-slate-500">Matric Number</p><p className="text-sm font-medium">{profile.matricNumber}</p></div>
                          )}
                          {profile.graduationYear && (
                            <div><p className="text-xs text-slate-500">Graduation Year</p><p className="text-sm font-medium">{profile.graduationYear}</p></div>
                          )}
                        </div>
                      </div>
                    )}

                    {profile.role === 'tutor' && (profile.specialization || profile.yearsExperience || profile.certifications) && (
                      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 border border-slate-200/70 dark:border-slate-700/60">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                          <Briefcase size={18} className="text-indigo-600" />
                          Tutoring Expertise
                        </h3>
                        <div className="space-y-3">
                          {profile.specialization && (
                            <div><p className="text-xs text-slate-500">Specialization</p><p className="text-sm font-medium">{profile.specialization}</p></div>
                          )}
                          {profile.yearsExperience > 0 && (
                            <div><p className="text-xs text-slate-500">Years of Experience</p><p className="text-sm font-medium">{profile.yearsExperience} years</p></div>
                          )}
                          {profile.certifications && (
                            <div><p className="text-xs text-slate-500">Certifications</p><p className="text-sm whitespace-pre-wrap">{profile.certifications}</p></div>
                          )}
                        </div>
                      </div>
                    )}

                    {profile.role === 'lecturer' && (profile.title || profile.school || profile.department || profile.researchInterests) && (
                      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 border border-slate-200/70 dark:border-slate-700/60">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                          <Award size={18} className="text-indigo-600" />
                          Academic Position
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {profile.title && (
                            <div><p className="text-xs text-slate-500">Title</p><p className="text-sm font-medium">{profile.title}</p></div>
                          )}
                          {profile.school && (
                            <div><p className="text-xs text-slate-500">Institution</p><p className="text-sm font-medium">{profile.school}</p></div>
                          )}
                          {profile.department && (
                            <div><p className="text-xs text-slate-500">Department</p><p className="text-sm font-medium">{profile.department}</p></div>
                          )}
                          {profile.yearsTeaching > 0 && (
                            <div><p className="text-xs text-slate-500">Teaching Experience</p><p className="text-sm font-medium">{profile.yearsTeaching} years</p></div>
                          )}
                          {profile.researchInterests && (
                            <div className="md:col-span-2"><p className="text-xs text-slate-500">Research Interests</p><p className="text-sm">{profile.researchInterests}</p></div>
                          )}
                          {profile.publications && (
                            <div className="md:col-span-2"><p className="text-xs text-slate-500">Publications</p><p className="text-sm whitespace-pre-wrap">{profile.publications}</p></div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Achievements - Only if user allows */}
                {privacySettings.showAchievements && profile.achievements && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 border border-slate-200/70 dark:border-slate-700/60">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Award size={18} className="text-indigo-600" />
                      Achievements & Awards
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{profile.achievements}</p>
                  </div>
                )}

                {/* Social Links - Only if user allows */}
                {privacySettings.showSocialLinks && (profile.website || profile.linkedin || profile.twitter || profile.instagram || profile.facebook || profile.youtube || profile.github) && (
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-5 border border-slate-200/70 dark:border-slate-700/60">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Globe size={18} className="text-indigo-600" />
                      Social Links
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {profile.website && (
                        <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition">
                          <Globe size={16} className="text-slate-600" />
                          <span className="text-sm">Website</span>
                        </a>
                      )}
                      {profile.linkedin && (
                        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition">
                          <Linkedin size={16} className="text-blue-600" />
                          <span className="text-sm">LinkedIn</span>
                        </a>
                      )}
                      {profile.twitter && (
                        <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition">
                          <Twitter size={16} className="text-sky-500" />
                          <span className="text-sm">Twitter</span>
                        </a>
                      )}
                      {profile.instagram && (
                        <a href={profile.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition">
                          <Instagram size={16} className="text-pink-600" />
                          <span className="text-sm">Instagram</span>
                        </a>
                      )}
                      {profile.facebook && (
                        <a href={profile.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition">
                          <Facebook size={16} className="text-blue-700" />
                          <span className="text-sm">Facebook</span>
                        </a>
                      )}
                      {profile.youtube && (
                        <a href={profile.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition">
                          <Youtube size={16} className="text-red-600" />
                          <span className="text-sm">YouTube</span>
                        </a>
                      )}
                      {profile.github && (
                        <a href={profile.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition">
                          <Github size={16} className="text-slate-700 dark:text-slate-400" />
                          <span className="text-sm">GitHub</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Followers Tab */}
            {activeTab === 'followers' && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200/70 dark:border-slate-700/60 overflow-hidden">
                <div className="p-4">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Users size={16} className="text-indigo-600" />
                    Followers ({followersList.length})
                  </h3>
                  
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {followersList.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No followers yet</p>
                      </div>
                    ) : (
                      followersList.map((follower) => (
                        <div
                          key={follower.id}
                          className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition cursor-pointer"
                          onClick={() => navigate(`/profile/${follower.id}`)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                              {getInitials(follower.name)}
                            </div>
                            <div>
                              <p className="font-medium text-sm text-slate-900 dark:text-white">{follower.name}</p>
                              <p className="text-xs text-slate-500">
                                {follower.role === 'student' ? 'Student' : 
                                 follower.role === 'tutor' ? 'Tutor' : 'Lecturer'}
                                {follower.school && ` • ${follower.school}`}
                              </p>
                            </div>
                          </div>
                          <ChevronRight size={14} className="text-slate-400" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Following Tab */}
            {activeTab === 'following' && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200/70 dark:border-slate-700/60 overflow-hidden">
                <div className="p-4">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <UserPlus size={16} className="text-indigo-600" />
                    Following ({followingList.length})
                  </h3>
                  
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {followingList.length === 0 ? (
                      <div className="text-center py-8">
                        <UserPlus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Not following anyone yet</p>
                      </div>
                    ) : (
                      followingList.map((followed) => (
                        <div
                          key={followed.id}
                          className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition"
                        >
                          <div 
                            className="flex items-center gap-2 flex-1 cursor-pointer"
                            onClick={() => navigate(`/profile/${followed.id}`)}
                          >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                              {getInitials(followed.name)}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm text-slate-900 dark:text-white">{followed.name}</p>
                              <p className="text-xs text-slate-500">
                                {followed.role === 'student' ? 'Student' : 
                                 followed.role === 'tutor' ? 'Tutor' : 'Lecturer'}
                                {followed.school && ` • ${followed.school}`}
                              </p>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Followed {formatRelativeTime(followed.followedAt)}
                              </p>
                            </div>
                          </div>
                          {currentUser?.uid === userId && (
                            <button
                              onClick={() => handleUnfollowFromList(followed.id, followed.name)}
                              disabled={unfollowingId === followed.id}
                              className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition disabled:opacity-50 flex items-center gap-1"
                            >
                              {unfollowingId === followed.id ? (
                                <Loader2 size={12} className="animate-spin" />
                              ) : (
                                <UserMinus size={12} />
                              )}
                              Unfollow
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200/70 dark:border-slate-700/60 overflow-hidden">
                <div className="p-4">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Activity size={16} className="text-indigo-600" />
                    Recent Activity
                  </h3>
                  
                  <div className="space-y-2 max-h-[500px] overflow-y-auto">
                    {loadingActivity ? (
                      <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-indigo-600" /></div>
                    ) : recentActivity.length === 0 ? (
                      <div className="text-center py-8">
                        <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">No recent activity</p>
                      </div>
                    ) : (
                      recentActivity.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                          onClick={() => navigate(`/materials/${activity.id}`)}
                        >
                          <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                            <Upload size={10} className="text-indigo-600" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-slate-700 dark:text-slate-300">
                              <span className="font-medium">{profile.name}</span> {activity.action}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">{formatRelativeTime(activity.createdAt)}</p>
                          </div>
                          <ChevronRight size={12} className="text-slate-400" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {showSearchModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl">
              <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
                <h3 className="text-lg font-semibold">Find Users</h3>
                <button onClick={() => setShowSearchModal(false)} className="p-1.5 hover:bg-slate-200 rounded-lg"><X size={18} /></button>
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-3">
                  <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name, email, school..." className="flex-1 px-3 py-2 text-sm bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()} />
                  <button onClick={handleSearchUsers} disabled={searching} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{searching ? <Loader2 size={16} className="animate-spin" /> : 'Search'}</button>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <select value={searchFilters.role} onChange={(e) => setSearchFilters(prev => ({ ...prev, role: e.target.value }))} className="px-2 py-1.5 text-sm bg-slate-100 rounded-lg">
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="tutor">Tutors</option>
                    <option value="lecturer">Lecturers</option>
                  </select>
                  <select value={searchFilters.school} onChange={(e) => setSearchFilters(prev => ({ ...prev, school: e.target.value }))} className="px-2 py-1.5 text-sm bg-slate-100 rounded-lg">
                    <option value="">All Schools</option>
                    {allSchools.map(school => (<option key={school} value={school}>{school}</option>))}
                  </select>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {searching ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-indigo-600" /></div>
                  : searchResults.length > 0 ? searchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition cursor-pointer" onClick={() => { setShowSearchModal(false); navigate(`/profile/${user.id}`); }}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">{getInitials(user.name)}</div>
                        <div><p className="font-medium text-sm">{user.name}</p><p className="text-xs text-slate-500">{user.role === 'student' ? 'Student' : user.role === 'tutor' ? 'Tutor' : 'Lecturer'}{user.school && ` • ${user.school}`}</p></div>
                      </div>
                      <ChevronRight size={14} className="text-slate-400" />
                    </div>
                  )) : searchTerm && !searching ? <div className="text-center py-8"><Users className="w-8 h-8 text-slate-300 mx-auto mb-2" /><p className="text-sm text-slate-500">No users found</p></div>
                  : <div className="text-center py-8"><Search className="w-8 h-8 text-slate-300 mx-auto mb-2" /><p className="text-sm text-slate-500">Search for users by name, email, or school</p></div>}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Followers Modal */}
      <AnimatePresence>
        {showFollowersModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl">
              <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
                <h3 className="text-lg font-semibold">Followers ({followersList.length})</h3>
                <button onClick={() => setShowFollowersModal(false)} className="p-1.5 hover:bg-slate-200 rounded-lg"><X size={18} /></button>
              </div>
              <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {followersList.length === 0 ? <div className="text-center py-8"><Users className="w-8 h-8 text-slate-300 mx-auto mb-2" /><p className="text-sm text-slate-500">No followers yet</p></div>
                : followersList.map((follower) => (
                  <div key={follower.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition cursor-pointer" onClick={() => { setShowFollowersModal(false); navigate(`/profile/${follower.id}`); }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">{getInitials(follower.name)}</div>
                      <div><p className="font-medium text-sm">{follower.name}</p><p className="text-xs text-slate-500">{follower.role === 'student' ? 'Student' : follower.role === 'tutor' ? 'Tutor' : 'Lecturer'}</p></div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Following Modal */}
      <AnimatePresence>
        {showFollowingModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl">
              <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
                <h3 className="text-lg font-semibold">Following ({followingList.length})</h3>
                <button onClick={() => setShowFollowingModal(false)} className="p-1.5 hover:bg-slate-200 rounded-lg"><X size={18} /></button>
              </div>
              <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                {followingList.length === 0 ? <div className="text-center py-8"><UserPlus className="w-8 h-8 text-slate-300 mx-auto mb-2" /><p className="text-sm text-slate-500">Not following anyone yet</p></div>
                : followingList.map((followed) => (
                  <div key={followed.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition cursor-pointer" onClick={() => { setShowFollowingModal(false); navigate(`/profile/${followed.id}`); }}>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">{getInitials(followed.name)}</div>
                      <div><p className="font-medium text-sm">{followed.name}</p><p className="text-xs text-slate-500">{followed.role === 'student' ? 'Student' : followed.role === 'tutor' ? 'Tutor' : 'Lecturer'}</p></div>
                    </div>
                    <ChevronRight size={14} className="text-slate-400" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PublicProfileViewer;