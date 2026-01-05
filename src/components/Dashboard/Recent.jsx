// Recent.jsx — Synced with Your Beautiful Card Design + Favorites Sync
import React, { useState, useEffect } from 'react';
import {
  PersonStanding,
  MoreVertical,
  Heart,
  Download,
  Share2,
  Flag,
  FileText,
  Video,
  BookOpen,
  ScrollText,
  Calendar,
  Eye,
  Clock
} from 'lucide-react';
import { toast } from 'react-toastify';
import p2 from '/Image.jpg';

const materials = [
  {
    id: 1,
    image: p2,
    name: 'Damian Clarson',
    course: 'Pipeline Technology (PTE411)',
    category: 'Past Questions',
    school: 'Babcock University',
    uploaded: '2 hours ago',
    views: '1.2k',
    downloads: 342,
  },
  {
    id: 2,
    image: null,
    name: 'Mahmood Bashiru',
    course: 'Anthropology (ANT211)',
    category: 'PDF Notes',
    school: 'Delta State University',
    uploaded: '5 hours ago',
    views: '890',
    downloads: 156,
  },
  {
    id: 3,
    image: p2,
    name: 'Dr. Aisha Bello',
    course: 'Advanced Law (LAW501)',
    category: 'Video Tutorials',
    school: 'Lagos State University',
    uploaded: '1 day ago',
    views: '3.4k',
    downloads: 789,
  },
  {
    id: 4,
    image: p2,
    name: 'Prof. Tunde Adebayo',
    course: 'Business Strategy (BUS401)',
    category: 'Technical Reviews',
    school: 'Delta State University',
    uploaded: '2 days ago',
    views: '2.1k',
    downloads: 512,
  },
  {
    id: 5,
    image: null,
    name: 'Chioma Eze',
    course: 'Clinical Medicine (MED601)',
    category: 'Past Questions',
    school: 'University of Port Harcourt',
    uploaded: '3 days ago',
    views: '980',
    downloads: 234,
  },
  {
    id: 6,
    image: p2,
    name: 'Engr. Kola Johnson',
    course: 'Thermodynamics (MEE320)',
    category: 'Video Tutorials',
    school: 'Delta State University',
    uploaded: '4 days ago',
    views: '1.8k',
    downloads: 421,
  },
];

function Recent() {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('favoriteUploads');
    if (saved) {
      try {
        setFavorites(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error('Invalid favorites data');
      }
    }
  }, []);

  // Toggle favorite and sync
  const toggleFavorite = (item) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(item.id)) {
      newFavorites.delete(item.id);
      toast.info('Removed from favorites');
    } else {
      newFavorites.add(item.id);
      toast.success('Added to favorites ❤️');
    }
    setFavorites(newFavorites);
    localStorage.setItem('favoriteUploads', JSON.stringify([...newFavorites]));
    window.dispatchEvent(new Event('favoritesUpdated')); // Sync with Favorites.jsx
  };

  const handleDownload = () => {
    toast.success('Download started!');
  };

  const handleShare = () => {
    toast.info('Link copied to clipboard');
  };

  const handleReport = () => {
    toast.warning('Material reported');
  };

  const getCategoryInfo = (category) => {
    switch (category) {
      case 'Past Questions': return { icon: ScrollText, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' };
      case 'PDF Notes': return { icon: FileText, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' };
      case 'Video Tutorials': return { icon: Video, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' };
      case 'Technical Reviews': return { icon: BookOpen, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' };
      default: return { icon: FileText, color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
          Recent Materials
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((item) => {
          const { icon: CategoryIcon, color: badgeColor } = getCategoryInfo(item.category);
          const isFavorited = favorites.has(item.id);
          const isMenuOpen = openMenuId === item.id;

          return (
            <div
              key={item.id}
              className="group bg-white dark:bg-slate-800 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-200/50 dark:border-slate-700/50"
            >
              {/* Image Header */}
              <div className="relative h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <PersonStanding size={64} className="text-slate-400 dark:text-slate-600" />
                  )}
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-20">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${badgeColor}`}>
                    <CategoryIcon size={16} />
                    {item.category}
                  </span>
                </div>

                {/* Favorite Button */}
                <button
                  onClick={() => toggleFavorite(item)}
                  className="absolute top-4 right-4 z-20 p-2.5 bg-white/80 dark:bg-slate-800/80 rounded-full hover:scale-110 transition-transform shadow-lg"
                >
                  <Heart size={20} className={isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-600 dark:text-slate-400'} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white line-clamp-1">
                    {item.course}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    by {item.name} • {item.school}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Clock size={16} />
                    {item.uploaded}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye size={16} />
                      <span>{item.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download size={16} />
                      <span>{item.downloads}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={handleDownload}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                  >
                    <Download size={18} />
                    Download
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(isMenuOpen ? null : item.id);
                    }}
                    className="p-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                  <div className="absolute bottom-20 right-6 z-50 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2">
                    <button onClick={handleShare} className="w-full px-5 py-3 text-left hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3">
                      <Share2 size={18} />
                      <span className="text-sm">Share</span>
                    </button>
                    <button onClick={handleReport} className="w-full px-5 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-3">
                      <Flag size={18} />
                      <span className="text-sm">Report</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Recent;