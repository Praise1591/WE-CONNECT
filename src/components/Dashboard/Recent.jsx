// components/Dashboard/Recent.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Download, Eye, Star, Clock, User, Heart,
  FileText, Video, ScrollText, Loader2, ChevronRight,
  Calendar, TrendingUp, Award, Users, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  increment,
  where
} from 'firebase/firestore';

function Recent() {
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [trendingMaterials, setTrendingMaterials] = useState([]);
  const [recommendedMaterials, setRecommendedMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [stats, setStats] = useState({
    totalMaterials: 0,
    totalDownloads: 0,
    totalUsers: 0,
    avgRating: 0
  });

  // Load recent materials
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const loadRecentMaterials = async () => {
      try {
        const materialsRef = collection(db, 'materials');
        const q = query(materialsRef, orderBy('createdAt', 'desc'), limit(10));
        const snapshot = await getDocs(q);
        
        const materials = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
        
        setRecentMaterials(materials);
        
        // Load stats
        const allMaterials = await getDocs(materialsRef);
        const totalDownloads = allMaterials.docs.reduce((sum, doc) => sum + (doc.data().downloads || 0), 0);
        const avgRating = allMaterials.docs.reduce((sum, doc) => sum + (doc.data().averageRating || 0), 0) / (allMaterials.size || 1);
        
        // Get total users
        const usersRef = collection(db, 'profiles');
        const usersSnap = await getDocs(usersRef);
        
        setStats({
          totalMaterials: allMaterials.size,
          totalDownloads: totalDownloads,
          totalUsers: usersSnap.size,
          avgRating: avgRating
        });
      } catch (err) {
        console.error("Error loading recent materials:", err);
        toast.error("Failed to load recent materials");
      } finally {
        setLoading(false);
      }
    };
    
    loadRecentMaterials();
  }, [isAuthenticated]);

  // Load trending materials (most downloaded)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadTrendingMaterials = async () => {
      try {
        const materialsRef = collection(db, 'materials');
        const q = query(materialsRef, orderBy('downloads', 'desc'), limit(5));
        const snapshot = await getDocs(q);
        
        const materials = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
        
        setTrendingMaterials(materials);
      } catch (err) {
        console.error("Error loading trending materials:", err);
      } finally {
        setLoadingTrending(false);
      }
    };
    
    loadTrendingMaterials();
  }, [isAuthenticated]);

  // Load recommended materials (based on user's interests)
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    
    const loadRecommendedMaterials = async () => {
      try {
        // Get user's profile to determine interests
        const userProfileRef = doc(db, 'profiles', currentUser.uid);
        const userProfileSnap = await getDoc(userProfileRef);
        const userData = userProfileSnap.exists() ? userProfileSnap.data() : {};
        
        // If user has department/school, try to recommend similar materials
        let materialsQuery;
        
        if (userData.department) {
          materialsQuery = query(
            collection(db, 'materials'),
            where('department', '==', userData.department),
            orderBy('downloads', 'desc'),
            limit(6)
          );
        } else if (userData.school) {
          materialsQuery = query(
            collection(db, 'materials'),
            where('school', '==', userData.school),
            orderBy('downloads', 'desc'),
            limit(6)
          );
        } else {
          // Fallback to popular materials
          materialsQuery = query(
            collection(db, 'materials'),
            orderBy('downloads', 'desc'),
            limit(6)
          );
        }
        
        const snapshot = await getDocs(materialsQuery);
        
        const materials = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
        
        setRecommendedMaterials(materials);
      } catch (err) {
        console.error("Error loading recommended materials:", err);
        // Fallback to popular materials
        try {
          const materialsRef = collection(db, 'materials');
          const q = query(materialsRef, orderBy('downloads', 'desc'), limit(6));
          const snapshot = await getDocs(q);
          const materials = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date()
          }));
          setRecommendedMaterials(materials);
        } catch (fallbackErr) {
          console.error("Fallback also failed:", fallbackErr);
          setRecommendedMaterials([]);
        }
      } finally {
        setLoadingRecommended(false);
      }
    };
    
    loadRecommendedMaterials();
  }, [isAuthenticated, currentUser]);

  // Handle material click with proper navigation
  const handleMaterialClick = async (material) => {
    if (!material?.id) {
      console.error("No material ID found");
      toast.error("Cannot open material");
      return;
    }
    
    try {
      console.log("Opening material:", material.id, material.title);
      
      // Increment view count (silent fail - don't block navigation)
      try {
        const materialRef = doc(db, 'materials', material.id);
        await updateDoc(materialRef, {
          views: increment(1)
        });
      } catch (viewErr) {
        console.warn("Could not update view count:", viewErr.message);
      }
      
      // Navigate to material page using the correct route
      // Make sure this matches your route in App.jsx
      navigate(`/materials/${material.id}`);
      
    } catch (err) {
      console.error("Error opening material:", err);
      toast.error("Could not open material");
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

  const formatRelativeTime = (date) => {
    if (!date) return 'Recently';
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString();
  };

  const MaterialCard = ({ material, onClick }) => {
    const CategoryIcon = getCategoryIcon(material.category);
    const rating = material.averageRating || 0;
    
    return (
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        onClick={() => onClick(material)}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-lg border border-slate-200/70 dark:border-slate-700/60 overflow-hidden cursor-pointer group transition-all"
      >
        <div className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${
              material.category === 'Past Questions' ? 'from-amber-500 to-orange-500' :
              material.category === 'PDF Notes' ? 'from-blue-500 to-cyan-500' :
              material.category === 'Video Tutorials' ? 'from-purple-500 to-pink-500' :
              'from-emerald-500 to-teal-500'
            }`}>
              <CategoryIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 transition">
                {material.title || 'Untitled'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                {material.course || material.category}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Download size={12} />
                {material.downloads || 0}
              </span>
              <span className="flex items-center gap-1">
                <Star size={12} className={rating >= 4 ? "text-amber-500 fill-amber-500" : ""} />
                {rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formatRelativeTime(material.createdAt)}
              </span>
            </div>
            <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600 transition" />
          </div>
        </div>
      </motion.div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Welcome to WeConnect
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Sign in to discover educational materials from top Nigerian universities
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <p className="text-slate-500 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 md:p-8 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2">
                  Welcome back! 👋
                </h1>
                <p className="text-white/80">
                  Discover new materials and continue your learning journey
                </p>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.totalMaterials}</p>
                  <p className="text-xs text-white/70">Materials</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.totalDownloads.toLocaleString()}</p>
                  <p className="text-xs text-white/70">Downloads</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <p className="text-xs text-white/70">Users</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/70 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Materials</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalMaterials}</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/70 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Downloads</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalDownloads.toLocaleString()}</p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Download className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/70 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Active Users</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalUsers}</p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/70 dark:border-slate-700/60">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Average Rating</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.avgRating.toFixed(1)}</p>
              </div>
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Star className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Materials Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recently Added</h2>
            </div>
            <button
              onClick={() => navigate('/materials')}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : recentMaterials.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No materials available yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {recentMaterials.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onClick={handleMaterialClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* Trending Section */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Trending This Week</h2>
          </div>
          
          {loadingTrending ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : trendingMaterials.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
              <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No trending materials yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {trendingMaterials.map((material) => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  onClick={handleMaterialClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recommended Section */}
        {recommendedMaterials.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recommended For You</h2>
            </div>
            
            {loadingRecommended ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {recommendedMaterials.map((material) => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    onClick={handleMaterialClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Recent;