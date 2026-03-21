// components/Profile/PublicProfileViewer.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  User, Mail, MapPin, Calendar, BookOpen, Upload, Download,
  Heart, Users, Eye, Award, GraduationCap, Briefcase,
  Twitter, Linkedin, Github, Globe, Share2, MessageSquare,
  Star, Clock, FileText, Video, ScrollText, Zap, Shield,
  AlertCircle, Loader2, ExternalLink, Copy, Phone,
  CheckCircle, UserPlus, UserCheck, Search, X, ChevronRight, ChevronLeft
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
  onSnapshot
} from 'firebase/firestore';

function PublicProfileViewer() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [allMaterials, setAllMaterials] = useState([]);
  const [showAllMaterials, setShowAllMaterials] = useState(false);
  const [stats, setStats] = useState({
    totalUploads: 0,
    totalDownloads: 0,
    totalFavorites: 0,
    averageRating: 0,
    totalReviews: 0,
    followers: 0,
    following: 0,
  });
  const [activeTab, setActiveTab] = useState('materials');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  
  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (userId) {
      loadProfile();
      loadUserMaterials();
      loadUserStats();
      checkFollowStatus();
      loadFollowers();
      loadFollowing();
      
      // Real-time listeners for followers/following updates
      if (userId) {
        const followersUnsub = onSnapshot(collection(db, 'users', userId, 'followers'), () => {
          loadUserStats();
          loadFollowers();
        });
        
        const followingUnsub = onSnapshot(collection(db, 'users', userId, 'following'), () => {
          loadUserStats();
          loadFollowing();
        });
        
        return () => {
          followersUnsub();
          followingUnsub();
        };
      }
    }
  }, [userId, currentUser]);

  const loadProfile = async () => {
    try {
      const profileRef = doc(db, 'profiles', userId);
      const profileDoc = await getDoc(profileRef);
      
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        setProfile({
          id: userId,
          ...profileData,
          joinedDate: profileData.createdAt?.toDate?.() || new Date(),
          profileViews: profileData.profileViews || 0
        });
        
        // Increment profile views if not the current user
        if (currentUser?.uid !== userId) {
          await updateDoc(profileRef, {
            profileViews: increment(1)
          });
        }
      } else {
        setError("User not found");
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const loadUserMaterials = async () => {
    try {
      const materialsRef = collection(db, 'materials');
      const q = query(
        materialsRef,
        where('uid', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const materialsSnap = await getDocs(q);
      
      const materialsData = materialsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      
      setAllMaterials(materialsData);
      setMaterials(materialsData.slice(0, 6));
    } catch (err) {
      console.error("Error loading materials:", err);
    }
  };

  const loadUserStats = async () => {
    try {
      // Get materials stats
      const materialsRef = collection(db, 'materials');
      const q = query(materialsRef, where('uid', '==', userId));
      const materialsSnap = await getDocs(q);
      
      const uploadedMaterials = materialsSnap.docs;
      const totalDownloads = uploadedMaterials.reduce((sum, doc) => sum + (doc.data().downloads || 0), 0);
      const avgRating = uploadedMaterials.reduce((sum, doc) => sum + (doc.data().averageRating || 0), 0) / (uploadedMaterials.length || 1);
      
      // Get followers count
      const followersRef = collection(db, 'users', userId, 'followers');
      const followersSnap = await getDocs(followersRef);
      
      // Get following count
      const followingRef = collection(db, 'users', userId, 'following');
      const followingSnap = await getDocs(followingRef);
      
      setStats({
        totalUploads: uploadedMaterials.length,
        totalDownloads: totalDownloads,
        totalFavorites: 0,
        averageRating: avgRating,
        totalReviews: uploadedMaterials.reduce((sum, doc) => sum + (doc.data().reviewCount || 0), 0),
        followers: followersSnap.size,
        following: followingSnap.size,
      });
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  const checkFollowStatus = async () => {
    if (!currentUser || currentUser.uid === userId) return;
    
    try {
      const followRef = doc(db, 'users', currentUser.uid, 'following', userId);
      const followDoc = await getDoc(followRef);
      setIsFollowing(followDoc.exists());
    } catch (err) {
      console.error("Error checking follow status:", err);
    }
  };

  const loadFollowers = async () => {
    try {
      const followersRef = collection(db, 'users', userId, 'followers');
      const followersSnap = await getDocs(followersRef);
      const followers = [];
      for (const docSnap of followersSnap.docs) {
        const userProfile = await getDoc(doc(db, 'profiles', docSnap.id));
        if (userProfile.exists()) {
          followers.push({ id: docSnap.id, ...userProfile.data() });
        }
      }
      setFollowersList(followers);
    } catch (err) {
      console.error("Error loading followers:", err);
    }
  };

  const loadFollowing = async () => {
    try {
      const followingRef = collection(db, 'users', userId, 'following');
      const followingSnap = await getDocs(followingRef);
      const following = [];
      for (const docSnap of followingSnap.docs) {
        const userProfile = await getDoc(doc(db, 'profiles', docSnap.id));
        if (userProfile.exists()) {
          following.push({ id: docSnap.id, ...userProfile.data() });
        }
      }
      setFollowingList(following);
    } catch (err) {
      console.error("Error loading following:", err);
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      toast.error("Please sign in to follow users");
      return;
    }
    
    if (currentUser.uid === userId) {
      toast.error("You cannot follow yourself");
      return;
    }
    
    try {
      const batch = writeBatch(db);
      
      // Add to current user's following
      const followingRef = doc(db, 'users', currentUser.uid, 'following', userId);
      batch.set(followingRef, {
        followedAt: new Date(),
        userName: profile?.name
      });
      
      // Add to target user's followers
      const followerRef = doc(db, 'users', userId, 'followers', currentUser.uid);
      batch.set(followerRef, {
        followedAt: new Date(),
        userName: currentUser.displayName || profile?.name
      });
      
      // Create notification for the user being followed
      const notificationRef = doc(collection(db, `users/${userId}/notifications`));
      batch.set(notificationRef, {
        type: 'new_follower',
        message: `${currentUser.displayName || 'Someone'} started following you`,
        userId: currentUser.uid,
        userName: currentUser.displayName || 'Someone',
        read: false,
        createdAt: new Date(),
      });
      
      await batch.commit();
      
      setIsFollowing(true);
      setStats(prev => ({ ...prev, followers: prev.followers + 1 }));
      toast.success(`Now following ${profile?.name}`);
      
      // Trigger notification update
      window.dispatchEvent(new CustomEvent('notificationUpdate'));
    } catch (err) {
      console.error("Error following user:", err);
      toast.error("Failed to follow user");
    }
  };

  const handleUnfollow = async () => {
    try {
      const batch = writeBatch(db);
      
      // Remove from current user's following
      const followingRef = doc(db, 'users', currentUser.uid, 'following', userId);
      batch.delete(followingRef);
      
      // Remove from target user's followers
      const followerRef = doc(db, 'users', userId, 'followers', currentUser.uid);
      batch.delete(followerRef);
      
      await batch.commit();
      
      setIsFollowing(false);
      setStats(prev => ({ ...prev, followers: prev.followers - 1 }));
      toast.success(`Unfollowed ${profile?.name}`);
    } catch (err) {
      console.error("Error unfollowing user:", err);
      toast.error("Failed to unfollow user");
    }
  };

  const searchUsers = async () => {
    if (!searchTerm.trim()) return;
    
    setSearching(true);
    try {
      const usersRef = collection(db, 'profiles');
      const snapshot = await getDocs(usersRef);
      const results = [];
      
      snapshot.forEach((docSnap) => {
        const userData = docSnap.data();
        if (docSnap.id !== currentUser?.uid && 
            (userData.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             userData.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             userData.school?.toLowerCase().includes(searchTerm.toLowerCase()))) {
          results.push({ id: docSnap.id, ...userData });
        }
      });
      
      setSearchResults(results.slice(0, 10));
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
    toast.success("Profile link copied to clipboard!");
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
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Profile Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            The user profile you're looking for doesn't exist or may have been deleted.
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
      <div className="relative h-64 md:h-80 lg:h-96 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 bg-gradient-to-t from-black/60 to-transparent">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
                    {profile.photoURL ? (
                      <img src={profile.photoURL} alt={profile.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">
                        {profile.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-indigo-600 rounded-full p-1.5 border-2 border-white">
                    <RoleIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div className="text-white">
                  <h1 className="text-2xl md:text-3xl font-bold">{profile.name}</h1>
                  <p className="text-white/90 text-sm mt-1">
                    {profile.role === 'student' && profile.school && `${profile.school} • Student`}
                    {profile.role === 'tutor' && profile.specialization && `${profile.specialization} • Tutor`}
                    {profile.role === 'lecturer' && profile.title && `${profile.title} • Lecturer`}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                {/* Search Users Button */}
                {isAuthenticated && (
                  <button
                    onClick={() => setShowSearchModal(true)}
                    className="px-4 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl font-medium transition flex items-center gap-2"
                  >
                    <Search size={18} />
                    Find Users
                  </button>
                )}
                
                {isAuthenticated && currentUser?.uid !== userId && (
                  <button
                    onClick={isFollowing ? handleUnfollow : handleFollow}
                    className="px-6 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl font-medium transition flex items-center gap-2"
                  >
                    {isFollowing ? <UserCheck size={18} /> : <UserPlus size={18} />}
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
                
                <button
                  onClick={handleShare}
                  className="px-6 py-2.5 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl font-medium transition flex items-center gap-2"
                >
                  <Share2 size={18} />
                  Share
                </button>
                
                {currentUser?.uid === userId && (
                  <button
                    onClick={() => navigate('/settings')}
                    className="px-6 py-2.5 bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl font-medium transition flex items-center gap-2"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-20 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
              className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 border border-slate-200/70 dark:border-slate-700/60 ${stat.onClick ? 'cursor-pointer hover:shadow-xl transition' : ''}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                {stat.suffix && (
                  <span className="text-xs text-slate-400">{stat.suffix}</span>
                )}
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - About */}
          <div className="lg:col-span-1 space-y-6">
            {/* About Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200/70 dark:border-slate-700/60">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <User size={20} className="text-indigo-600" />
                About
              </h3>
              <div className="space-y-3">
                {profile.bio && (
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {profile.bio}
                  </p>
                )}
                <div className="pt-3 space-y-2">
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
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <MapPin size={14} />
                      <span>{profile.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar size={14} />
                    <span>Joined {formatDate(profile.joinedDate)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Role-specific Info */}
            {profile.role === 'student' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200/70 dark:border-slate-700/60">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <GraduationCap size={20} className="text-indigo-600" />
                  Education
                </h3>
                <div className="space-y-3">
                  {profile.school && (
                    <div>
                      <p className="text-xs text-slate-500">School</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{profile.school}</p>
                    </div>
                  )}
                  {profile.faculty && (
                    <div>
                      <p className="text-xs text-slate-500">Faculty</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{profile.faculty}</p>
                    </div>
                  )}
                  {profile.department && (
                    <div>
                      <p className="text-xs text-slate-500">Department</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{profile.department}</p>
                    </div>
                  )}
                  {profile.matricNumber && (
                    <div>
                      <p className="text-xs text-slate-500">Matric Number</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{profile.matricNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {profile.role === 'tutor' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200/70 dark:border-slate-700/60">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Briefcase size={20} className="text-indigo-600" />
                  Tutoring
                </h3>
                <div className="space-y-3">
                  {profile.specialization && (
                    <div>
                      <p className="text-xs text-slate-500">Specialization</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{profile.specialization}</p>
                    </div>
                  )}
                  {profile.yearsExperience && (
                    <div>
                      <p className="text-xs text-slate-500">Experience</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{profile.yearsExperience} years</p>
                    </div>
                  )}
                  {profile.certifications && (
                    <div>
                      <p className="text-xs text-slate-500">Certifications</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{profile.certifications}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {profile.role === 'lecturer' && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200/70 dark:border-slate-700/60">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Award size={20} className="text-indigo-600" />
                  Academic
                </h3>
                <div className="space-y-3">
                  {profile.title && (
                    <div>
                      <p className="text-xs text-slate-500">Title</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{profile.title}</p>
                    </div>
                  )}
                  {profile.school && (
                    <div>
                      <p className="text-xs text-slate-500">Institution</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{profile.school}</p>
                    </div>
                  )}
                  {profile.department && (
                    <div>
                      <p className="text-xs text-slate-500">Department</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{profile.department}</p>
                    </div>
                  )}
                  {profile.yearsTeaching && (
                    <div>
                      <p className="text-xs text-slate-500">Teaching Experience</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{profile.yearsTeaching} years</p>
                    </div>
                  )}
                  {profile.researchInterests && (
                    <div>
                      <p className="text-xs text-slate-500">Research Interests</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{profile.researchInterests}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Achievements */}
            {profile.achievements && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200/70 dark:border-slate-700/60">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Award size={20} className="text-indigo-600" />
                  Achievements
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {profile.achievements}
                </p>
              </div>
            )}

            {/* Social Links */}
            {(profile.website || profile.linkedin || profile.twitter || profile.github) && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200/70 dark:border-slate-700/60">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Globe size={20} className="text-indigo-600" />
                  Connect
                </h3>
                <div className="flex flex-wrap gap-3">
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition">
                      <Globe size={18} />
                    </a>
                  )}
                  {profile.linkedin && (
                    <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition">
                      <Linkedin size={18} className="text-blue-600" />
                    </a>
                  )}
                  {profile.twitter && (
                    <a href={profile.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition">
                      <Twitter size={18} className="text-sky-500" />
                    </a>
                  )}
                  {profile.github && (
                    <a href={profile.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 transition">
                      <Github size={18} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Materials & Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200/70 dark:border-slate-700/60 overflow-hidden">
              <div className="flex border-b border-slate-200 dark:border-slate-700">
                {['materials', 'followers', 'following'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                      activeTab === tab
                        ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {tab === 'followers' && stats.followers > 0 && (
                      <span className="ml-2 text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                        {stats.followers}
                      </span>
                    )}
                    {tab === 'following' && stats.following > 0 && (
                      <span className="ml-2 text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                        {stats.following}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {/* Materials Tab */}
                {activeTab === 'materials' && (
                  <div className="space-y-4">
                    {materials.length === 0 ? (
                      <div className="text-center py-12">
                        <Upload className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No materials uploaded yet</p>
                      </div>
                    ) : (
                      <>
                        {materials.map((material, idx) => {
                          const CategoryIcon = getCategoryIcon(material.category);
                          return (
                            <motion.div
                              key={material.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 hover:shadow-md transition cursor-pointer"
                              onClick={() => navigate(`/materials/${material.id}`)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg bg-gradient-to-r ${
                                  material.category === 'Past Questions' ? 'from-amber-500 to-orange-500' :
                                  material.category === 'PDF Notes' ? 'from-blue-500 to-cyan-500' :
                                  material.category === 'Video Tutorials' ? 'from-purple-500 to-pink-500' :
                                  'from-emerald-500 to-teal-500'
                                }`}>
                                  <CategoryIcon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-slate-900 dark:text-white">
                                    {material.title}
                                  </h4>
                                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {material.course || material.category}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <Download size={12} />
                                      {material.downloads || 0} downloads
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Star size={12} />
                                      {material.averageRating?.toFixed(1) || 0}/5
                                    </span>
                                    <span>
                                      {formatDate(material.createdAt)}
                                    </span>
                                  </div>
                                </div>
                                <button className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition">
                                  <ExternalLink size={16} />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                        {allMaterials.length > 6 && (
                          <button
                            onClick={() => setShowAllMaterials(!showAllMaterials)}
                            className="w-full py-3 text-indigo-600 dark:text-indigo-400 font-medium hover:underline flex items-center justify-center gap-2"
                          >
                            {showAllMaterials ? 'Show Less ↑' : `View all ${allMaterials.length} materials →`}
                          </button>
                        )}
                        {showAllMaterials && allMaterials.slice(6).map((material, idx) => {
                          const CategoryIcon = getCategoryIcon(material.category);
                          return (
                            <motion.div
                              key={material.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 hover:shadow-md transition cursor-pointer"
                              onClick={() => navigate(`/materials/${material.id}`)}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg bg-gradient-to-r ${
                                  material.category === 'Past Questions' ? 'from-amber-500 to-orange-500' :
                                  material.category === 'PDF Notes' ? 'from-blue-500 to-cyan-500' :
                                  material.category === 'Video Tutorials' ? 'from-purple-500 to-pink-500' :
                                  'from-emerald-500 to-teal-500'
                                }`}>
                                  <CategoryIcon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-slate-900 dark:text-white">
                                    {material.title}
                                  </h4>
                                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                    {material.course || material.category}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                      <Download size={12} />
                                      {material.downloads || 0} downloads
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Star size={12} />
                                      {material.averageRating?.toFixed(1) || 0}/5
                                    </span>
                                    <span>
                                      {formatDate(material.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}

                {/* Followers Tab */}
                {activeTab === 'followers' && (
                  <div className="space-y-3">
                    {followersList.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No followers yet</p>
                      </div>
                    ) : (
                      followersList.map((follower) => (
                        <div
                          key={follower.id}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition cursor-pointer"
                          onClick={() => navigate(`/profile/${follower.id}`)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {follower.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {follower.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {follower.role === 'student' ? 'Student' : 
                                 follower.role === 'tutor' ? 'Tutor' : 'Lecturer'}
                              </p>
                            </div>
                          </div>
                          <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            View
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Following Tab */}
                {activeTab === 'following' && (
                  <div className="space-y-3">
                    {followingList.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">Not following anyone yet</p>
                      </div>
                    ) : (
                      followingList.map((followed) => (
                        <div
                          key={followed.id}
                          className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition cursor-pointer"
                          onClick={() => navigate(`/profile/${followed.id}`)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {followed.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 dark:text-white">
                                {followed.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {followed.role === 'student' ? 'Student' : 
                                 followed.role === 'tutor' ? 'Tutor' : 'Lecturer'}
                              </p>
                            </div>
                          </div>
                          <button className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                            View
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Badges/Recognition */}
            {stats.totalUploads > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200/70 dark:border-slate-700/60">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Zap size={20} className="text-indigo-600" />
                  Achievements
                </h3>
                <div className="flex flex-wrap gap-3">
                  {stats.totalUploads >= 1 && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <Upload size={14} className="text-blue-600" />
                      <span className="text-xs font-medium">First Upload</span>
                    </div>
                  )}
                  {stats.totalUploads >= 10 && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                      <Award size={14} className="text-purple-600" />
                      <span className="text-xs font-medium">10+ Materials</span>
                    </div>
                  )}
                  {stats.totalDownloads >= 100 && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <Download size={14} className="text-green-600" />
                      <span className="text-xs font-medium">100+ Downloads</span>
                    </div>
                  )}
                  {stats.followers >= 10 && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-pink-100 dark:bg-pink-900/30 rounded-full">
                      <Users size={14} className="text-pink-600" />
                      <span className="text-xs font-medium">Popular</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Users Modal */}
      <AnimatePresence>
        {showSearchModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Find Users</h3>
                <button 
                  onClick={() => setShowSearchModal(false)} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name, email, or school..."
                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
                  />
                  <button
                    onClick={searchUsers}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium"
                  >
                    Search
                  </button>
                </div>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {searching ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition cursor-pointer group"
                        onClick={() => {
                          setShowSearchModal(false);
                          navigate(`/profile/${user.id}`);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                              {user.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {user.school || 'No school'} • {user.role === 'student' ? 'Student' : user.role === 'tutor' ? 'Tutor' : 'Lecturer'}
                            </p>
                          </div>
                        </div>
                        <button className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-1">
                          View <ChevronRight size={14} />
                        </button>
                      </div>
                    ))
                  ) : searchTerm && !searching ? (
                    <div className="text-center py-12">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No users found</p>
                      <p className="text-xs text-slate-400 mt-1">Try a different search term</p>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">Search for users by name, email, or school</p>
                    </div>
                  )}
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
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Followers ({followersList.length})
                </h3>
                <button 
                  onClick={() => setShowFollowersModal(false)} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                {followersList.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No followers yet</p>
                  </div>
                ) : (
                  followersList.map((follower) => (
                    <div
                      key={follower.id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition cursor-pointer group"
                      onClick={() => {
                        setShowFollowersModal(false);
                        navigate(`/profile/${follower.id}`);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {follower.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                            {follower.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {follower.role === 'student' ? 'Student' : 
                             follower.role === 'tutor' ? 'Tutor' : 'Lecturer'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-indigo-600 transition" />
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Following Modal */}
      <AnimatePresence>
        {showFollowingModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Following ({followingList.length})
                </h3>
                <button 
                  onClick={() => setShowFollowingModal(false)} 
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                {followingList.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">Not following anyone yet</p>
                  </div>
                ) : (
                  followingList.map((followed) => (
                    <div
                      key={followed.id}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition cursor-pointer group"
                      onClick={() => {
                        setShowFollowingModal(false);
                        navigate(`/profile/${followed.id}`);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {followed.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
                            {followed.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {followed.role === 'student' ? 'Student' : 
                             followed.role === 'tutor' ? 'Tutor' : 'Lecturer'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-slate-400 group-hover:text-indigo-600 transition" />
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Menu */}
      <AnimatePresence>
        {showShareMenu && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Share Profile</h3>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={`${window.location.origin}/profile/${userId}`}
                  readOnly
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
                />
                <button
                  onClick={handleCopyProfileLink}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  <Copy size={18} />
                </button>
              </div>
              <button
                onClick={() => setShowShareMenu(false)}
                className="w-full py-2 bg-slate-200 dark:bg-slate-700 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition font-medium"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PublicProfileViewer;