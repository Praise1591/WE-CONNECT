// components/Dashboard/Recent.jsx - Enhanced Version
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen, Download, Eye, Star, Clock, User, Heart,
  FileText, Video, ScrollText, Loader2, ChevronRight,
  Calendar, TrendingUp, Award, Users, Sparkles, Flame,
  Tag, Filter, Search, Grid3x3, List, ArrowUpDown,
  ThumbsUp, MessageCircle, Share2, Bookmark, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  where,
  startAfter,
  endBefore,
  limit as firestoreLimit
} from 'firebase/firestore';

function Recent() {
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [trendingMaterials, setTrendingMaterials] = useState([]);
  const [recommendedMaterials, setRecommendedMaterials] = useState([]);
  const [popularMaterials, setPopularMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalMaterials: 0,
    totalDownloads: 0,
    totalUsers: 0,
    avgRating: 0,
    totalViews: 0
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
        const q = query(materialsRef, orderBy('createdAt', 'desc'), limit(12));
        const snapshot = await getDocs(q);
        
        const materials = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
        
        setRecentMaterials(materials);
        
        // Get unique categories
        const uniqueCategories = [...new Set(materials.map(m => m.category).filter(Boolean))];
        setCategories(uniqueCategories);
        
        // Load stats
        const allMaterials = await getDocs(materialsRef);
        const totalDownloads = allMaterials.docs.reduce((sum, doc) => sum + (doc.data().downloads || 0), 0);
        const totalViews = allMaterials.docs.reduce((sum, doc) => sum + (doc.data().views || 0), 0);
        const avgRating = allMaterials.docs.reduce((sum, doc) => sum + (doc.data().averageRating || 0), 0) / (allMaterials.size || 1);
        
        const usersRef = collection(db, 'profiles');
        const usersSnap = await getDocs(usersRef);
        
        setStats({
          totalMaterials: allMaterials.size,
          totalDownloads: totalDownloads,
          totalUsers: usersSnap.size,
          avgRating: avgRating,
          totalViews: totalViews
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
        const q = query(materialsRef, orderBy('downloads', 'desc'), limit(8));
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

  // Load popular materials (most viewed)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadPopularMaterials = async () => {
      try {
        const materialsRef = collection(db, 'materials');
        const q = query(materialsRef, orderBy('views', 'desc'), limit(8));
        const snapshot = await getDocs(q);
        
        const materials = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
        
        setPopularMaterials(materials);
      } catch (err) {
        console.error("Error loading popular materials:", err);
      } finally {
        setLoadingPopular(false);
      }
    };
    
    loadPopularMaterials();
  }, [isAuthenticated]);

  // Load recommended materials (based on user's interests)
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    
    const loadRecommendedMaterials = async () => {
      try {
        const userProfileRef = doc(db, 'profiles', currentUser.uid);
        const userProfileSnap = await getDoc(userProfileRef);
        const userData = userProfileSnap.exists() ? userProfileSnap.data() : {};
        
        let materialsQuery;
        
        if (userData.department) {
          materialsQuery = query(
            collection(db, 'materials'),
            where('department', '==', userData.department),
            orderBy('downloads', 'desc'),
            limit(8)
          );
        } else if (userData.school) {
          materialsQuery = query(
            collection(db, 'materials'),
            where('school', '==', userData.school),
            orderBy('downloads', 'desc'),
            limit(8)
          );
        } else {
          materialsQuery = query(
            collection(db, 'materials'),
            orderBy('downloads', 'desc'),
            limit(8)
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
        try {
          const materialsRef = collection(db, 'materials');
          const q = query(materialsRef, orderBy('downloads', 'desc'), limit(8));
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

  const handleMaterialClick = async (material) => {
    if (!material?.id) {
      console.error("No material ID found");
      toast.error("Cannot open material");
      return;
    }
    
    try {
      const materialRef = doc(db, 'materials', material.id);
      await updateDoc(materialRef, {
        views: increment(1)
      });
      
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

  const getCategoryColor = (category) => {
    const colors = {
      'Past Questions': 'from-amber-500 to-orange-500',
      'PDF Notes': 'from-blue-500 to-cyan-500',
      'Video Tutorials': 'from-purple-500 to-pink-500',
      'Technical Reviews': 'from-emerald-500 to-teal-500',
    };
    return colors[category] || 'from-indigo-500 to-purple-500';
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

  const filterMaterials = (materials) => {
    let filtered = [...materials];
    if (filterCategory !== 'all') {
      filtered = filtered.filter(m => m.category === filterCategory);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(m => 
        m.title?.toLowerCase().includes(term) ||
        m.course?.toLowerCase().includes(term) ||
        m.department?.toLowerCase().includes(term)
      );
    }
    return filtered;
  };

  const MaterialCard = ({ material, onClick, index }) => {
    const CategoryIcon = getCategoryIcon(material.category);
    const rating = material.averageRating || 0;
    const color = getCategoryColor(material.category);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -4 }}
        onClick={() => onClick(material)}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-xl border border-slate-200/70 dark:border-slate-700/60 overflow-hidden cursor-pointer group transition-all duration-300"
      >
        <div className="relative">
          <div className={`h-2 bg-gradient-to-r ${color}`} />
          <div className="p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${color} shadow-md`}>
                <CategoryIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 transition">
                  {material.title || 'Untitled'}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                    {material.category || 'General'}
                  </span>
                  {material.course && (
                    <span className="text-xs text-slate-500">{material.course}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
              <span className="flex items-center gap-1">
                <User size={12} />
                {material.authorName || 'Anonymous'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatRelativeTime(material.createdAt)}
              </span>
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-xs">
                  <Download size={12} />
                  {material.downloads || 0}
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <Eye size={12} />
                  {material.views || 0}
                </span>
                <span className="flex items-center gap-1 text-xs">
                  <Star size={12} className={rating >= 4 ? "text-amber-500 fill-amber-500" : "text-amber-500"} />
                  {rating.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Heart size={14} className="text-slate-400 group-hover:text-red-500 transition" />
                <span className="text-xs">{material.favorites || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const MaterialList = ({ material, onClick, index }) => {
    const CategoryIcon = getCategoryIcon(material.category);
    const rating = material.averageRating || 0;
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.03 }}
        whileHover={{ scale: 1.01 }}
        onClick={() => onClick(material)}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-md border border-slate-200/70 dark:border-slate-700/60 p-4 cursor-pointer transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500">
            <CategoryIcon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 transition">
              {material.title || 'Untitled'}
            </h3>
            <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
              <span>{material.category}</span>
              <span>{material.course}</span>
              <span>{formatRelativeTime(material.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Download size={14} /> {material.downloads || 0}
            </span>
            <span className="flex items-center gap-1">
              <Star size={14} className={rating >= 4 ? "text-amber-500 fill-amber-500" : ""} />
              {rating.toFixed(1)}
            </span>
            <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600 transition" />
          </div>
        </div>
      </motion.div>
    );
  };

  const SectionHeader = ({ icon, title, subtitle, viewAllLink }) => (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <button
        onClick={() => navigate(viewAllLink)}
        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 self-start"
      >
        View All <ChevronRight size={14} />
      </button>
    </div>
  );

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
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const filteredRecent = filterMaterials(recentMaterials);
  const filteredTrending = filterMaterials(trendingMaterials);
  const filteredRecommended = filterMaterials(recommendedMaterials);
  const filteredPopular = filterMaterials(popularMaterials);

  return (
    <div className="space-y-12">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/70 dark:border-slate-700/60">
          <p className="text-xs text-slate-500">Total Materials</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalMaterials.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/70 dark:border-slate-700/60">
          <p className="text-xs text-slate-500">Total Downloads</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalDownloads.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/70 dark:border-slate-700/60">
          <p className="text-xs text-slate-500">Total Views</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalViews.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/70 dark:border-slate-700/60">
          <p className="text-xs text-slate-500">Active Users</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats.totalUsers.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200/70 dark:border-slate-700/60">
          <p className="text-xs text-slate-500">Avg Rating</p>
          <p className="text-2xl font-bold text-amber-500">{stats.avgRating.toFixed(1)} ★</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search materials by title, course, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 px-3 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600'}`}
            >
              <Grid3x3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 px-3 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600'}`}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Trending Section */}
      <div>
        <SectionHeader 
          icon={<Flame className="w-6 h-6 text-orange-500" />}
          title="Trending This Week"
          subtitle="Most downloaded materials"
          viewAllLink="/materials?tab=trending"
        />
        {loadingTrending ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
        ) : filteredTrending.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl">
            <TrendingUp className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No trending materials found</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            : "space-y-3"
          }>
            {filteredTrending.map((material, idx) => (
              viewMode === 'grid' 
                ? <MaterialCard key={material.id} material={material} onClick={handleMaterialClick} index={idx} />
                : <MaterialList key={material.id} material={material} onClick={handleMaterialClick} index={idx} />
            ))}
          </div>
        )}
      </div>

      {/* Most Popular Section */}
      <div>
        <SectionHeader 
          icon={<Eye className="w-6 h-6 text-blue-500" />}
          title="Most Popular"
          subtitle="Most viewed materials"
          viewAllLink="/materials?tab=popular"
        />
        {loadingPopular ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
        ) : filteredPopular.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl">
            <Eye className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No popular materials found</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            : "space-y-3"
          }>
            {filteredPopular.map((material, idx) => (
              viewMode === 'grid' 
                ? <MaterialCard key={material.id} material={material} onClick={handleMaterialClick} index={idx} />
                : <MaterialList key={material.id} material={material} onClick={handleMaterialClick} index={idx} />
            ))}
          </div>
        )}
      </div>

      {/* Recommended Section */}
      {filteredRecommended.length > 0 && (
        <div>
          <SectionHeader 
            icon={<Sparkles className="w-6 h-6 text-purple-500" />}
            title="Recommended For You"
            subtitle="Based on your interests"
            viewAllLink="/materials?tab=recommended"
          />
          {loadingRecommended ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              : "space-y-3"
            }>
              {filteredRecommended.map((material, idx) => (
                viewMode === 'grid' 
                  ? <MaterialCard key={material.id} material={material} onClick={handleMaterialClick} index={idx} />
                  : <MaterialList key={material.id} material={material} onClick={handleMaterialClick} index={idx} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recently Added Section */}
      <div>
        <SectionHeader 
          icon={<Clock className="w-6 h-6 text-green-500" />}
          title="Recently Added"
          subtitle="Latest uploads"
          viewAllLink="/materials?tab=recent"
        />
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>
        ) : filteredRecent.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No materials available yet</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            : "space-y-3"
          }>
            {filteredRecent.map((material, idx) => (
              viewMode === 'grid' 
                ? <MaterialCard key={material.id} material={material} onClick={handleMaterialClick} index={idx} />
                : <MaterialList key={material.id} material={material} onClick={handleMaterialClick} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Recent;