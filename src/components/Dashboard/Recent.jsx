// Recent.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Eye, 
  Download, 
  Heart, 
  ChevronRight, 
  User, 
  Tag, 
  Calendar,
  Bookmark,
  Share2,
  TrendingUp,
  Star,
  Filter,
  Search,
  X
} from 'lucide-react';
import { db, auth } from '@/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  orderBy, 
  limit, 
  where,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

function Recent() {
  const [recentItems, setRecentItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('latest'); // latest, popular, trending

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All', icon: Tag },
    { id: 'video', name: 'Videos', icon: TrendingUp },
    { id: 'document', name: 'Documents', icon: Bookmark },
    { id: 'tutorial', name: 'Tutorials', icon: Star },
    { id: 'course', name: 'Courses', icon: Calendar },
  ];

  // Get current user
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return unsub;
  }, []);

  // Fetch user favorites
  useEffect(() => {
    if (!currentUser) return;
    
    const favoritesRef = collection(db, `users/${currentUser.uid}/favorites`);
    const unsub = onSnapshot(favoritesRef, (snapshot) => {
      const favs = snapshot.docs.map(doc => doc.id);
      setFavorites(favs);
    }, console.error);
    
    return unsub;
  }, [currentUser]);

  // Fetch recent materials
  useEffect(() => {
    const q = query(
      collection(db, 'materials'),
      orderBy('createdAt', 'desc'),
      limit(12)
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      setRecentItems(items);
      setFilteredItems(items);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching recent items:", error);
      setLoading(false);
    });
    
    return unsub;
  }, []);

  // Filter and sort items
  useEffect(() => {
    let result = [...recentItems];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(item => 
        item.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(item => 
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sort items
    switch(sortBy) {
      case 'popular':
        result.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
        break;
      case 'trending':
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'latest':
      default:
        result.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }
    
    setFilteredItems(result);
  }, [recentItems, selectedCategory, searchTerm, sortBy]);

  // Toggle favorite
  const toggleFavorite = async (e, materialId) => {
    e.stopPropagation();
    if (!currentUser) {
      alert('Please login to save favorites');
      return;
    }
    
    try {
      const favoriteRef = doc(db, `users/${currentUser.uid}/favorites`, materialId);
      if (favorites.includes(materialId)) {
        await updateDoc(favoriteRef, {
          removedAt: new Date()
        });
        // The onSnapshot will automatically update favorites state
      } else {
        await updateDoc(favoriteRef, {
          materialId: materialId,
          addedAt: new Date()
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  // Handle material click
  const handleMaterialClick = async (item) => {
    // Update view count
    try {
      const materialRef = doc(db, 'materials', item.id);
      await updateDoc(materialRef, {
        views: (item.views || 0) + 1
      });
    } catch (error) {
      console.error("Error updating views:", error);
    }
    
    // Navigate to material detail (implement based on your routing)
    console.log("Open material:", item.id);
  };

  // Share material
  const shareMaterial = (e, item) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: window.location.href + '/material/' + item.id
      });
    } else {
      navigator.clipboard.writeText(window.location.href + '/material/' + item.id);
      alert('Link copied to clipboard!');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  };

  // Format date
  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="mt-8 lg:mt-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded-lg mt-2 animate-pulse" />
          </div>
          <div className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg animate-pulse">
              <div className="h-48 bg-slate-200 dark:bg-slate-700" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                <div className="flex justify-between pt-3">
                  <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mt-8 lg:mt-10"
    >
      {/* Header with filters */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Clock className="w-7 h-7 text-indigo-500" />
              What's New
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Latest materials added by the community • {filteredItems.length} items
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            {/* Filter button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>
        
        {/* Filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-4 shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="flex flex-wrap items-center gap-4">
                  {/* Category filters */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Categories:</span>
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          selectedCategory === cat.id
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        <cat.icon className="w-3 h-3 inline mr-1" />
                        {cat.name}
                      </button>
                    ))}
                  </div>
                  
                  {/* Sort options */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="latest">Latest</option>
                      <option value="popular">Most Downloaded</option>
                      <option value="trending">Most Viewed</option>
                    </select>
                  </div>
                  
                  {/* Clear filters */}
                  {(selectedCategory !== 'all' || searchTerm || sortBy !== 'latest') && (
                    <button
                      onClick={() => {
                        setSelectedCategory('all');
                        setSearchTerm('');
                        setSortBy('latest');
                      }}
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Clear all
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* View all button */}
        <div className="flex justify-end">
          <motion.button
            whileHover={{ x: 5 }}
            className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium group"
          >
            View all
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>

      {/* Materials grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              onClick={() => handleMaterialClick(item)}
              className="group cursor-pointer"
            >
              <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-800 shadow-lg hover:shadow-2xl transition-all duration-300">
                {/* Thumbnail/Image placeholder */}
                <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 overflow-hidden">
                  {item.thumbnail ? (
                    <img 
                      src={item.thumbnail} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-6xl opacity-30">
                        {item.category === 'video' ? '🎥' : 
                         item.category === 'document' ? '📄' : 
                         item.category === 'tutorial' ? '📚' : '📘'}
                      </div>
                    </div>
                  )}
                  
                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-xs font-medium">
                      {item.category || 'General'}
                    </span>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    {/* Favorite button */}
                    <button
                      onClick={(e) => toggleFavorite(e, item.id)}
                      className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                    >
                      <Heart 
                        className={`w-4 h-4 transition-colors ${
                          favorites.includes(item.id) 
                            ? 'fill-red-500 text-red-500' 
                            : 'text-slate-600 hover:text-red-500'
                        }`} 
                      />
                    </button>
                    
                    {/* Share button */}
                    <button
                      onClick={(e) => shareMaterial(e, item)}
                      className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
                    >
                      <Share2 className="w-4 h-4 text-slate-600 hover:text-indigo-500" />
                    </button>
                  </div>
                  
                  {/* Author info */}
                  {item.authorName && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                      <User className="w-3 h-3 text-white" />
                      <span className="text-white text-xs">{item.authorName}</span>
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2 line-clamp-2">
                    {item.title || 'Untitled Material'}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">
                    {item.description || 'No description available'}
                  </p>
                  
                  {/* Stats and metadata */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{item.views || 0} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-3.5 h-3.5" />
                          <span>{item.downloads || 0} downloads</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                    
                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {item.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full text-xs text-slate-600 dark:text-slate-400"
                          >
                            #{tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="text-xs text-slate-400">+{item.tags.length - 3}</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Action button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMaterialClick(item);
                    }}
                    className="w-full mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    View Details
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="text-6xl mb-4">📭</div>
          <p className="text-slate-500 dark:text-slate-400 text-lg">No materials found</p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
            Try adjusting your filters or search term
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchTerm('');
              setSortBy('latest');
            }}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Clear Filters
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default Recent;