// Recent.jsx — Modernized UI/UX — same logic preserved
import React, { useState, useEffect } from 'react';
import {
  PersonStanding, MoreVertical, Heart, Download, Share2, Flag,
  FileText, Video, BookOpen, ScrollText, Clock, Eye,
} from 'lucide-react';
import { toast } from 'react-toastify';
import p2 from '/Image.jpg';

// ────────────────────────────────────────────────
// Your original materials array (unchanged)
const materials = [
  // ... (keeping your exact data)
  { id: 1, image: p2, name: 'Damian Clarson', course: 'Pipeline Technology (PTE411)', category: 'Past Questions', school: 'Babcock University', uploaded: '2 hours ago', views: '1.2k', downloads: 342 },
  // ... rest of your items
];

function Recent() {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  // ─── Your original favorite & download logic (unchanged) ───
  useEffect(() => {
    const saved = localStorage.getItem('favoriteUploads');
    if (saved) {
      try { setFavorites(new Set(JSON.parse(saved))); }
      catch (e) { console.error('Invalid favorites data'); }
    }
  }, []);

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
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  const handleDownload = (item) => {
    const existing = JSON.parse(localStorage.getItem('downloadedMaterials') || '[]');
    if (existing.some(dl => dl.id === item.id)) {
      toast.info('Already in your downloads');
      return;
    }
    const newDownload = { ...item, downloadDate: new Date().toISOString() };
    const updated = [...existing, newDownload];
    localStorage.setItem('downloadedMaterials', JSON.stringify(updated));
    window.dispatchEvent(new Event('downloadsUpdated'));
    toast.success('Downloaded successfully! Check your Downloads page.');
  };

  const handleShare = () => toast.info('Link copied to clipboard');
  const handleReport = () => toast.warning('Material reported');

  const getCategoryInfo = (category) => {
    switch (category) {
      case 'Past Questions':   return { icon: ScrollText, color: 'bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-300' };
      case 'PDF Notes':        return { icon: FileText,   color: 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300' };
      case 'Video Tutorials':  return { icon: Video,      color: 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-300' };
      case 'Technical Reviews':return { icon: BookOpen,   color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800/30 dark:text-emerald-300' };
      default:                 return { icon: FileText,   color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
        Recent Materials
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {materials.map((item) => {
          const { icon: CategoryIcon, color: badgeColor } = getCategoryInfo(item.category);
          const isFavorited = favorites.has(item.id);
          const isMenuOpen = openMenuId === item.id;

          return (
            <div
              key={item.id}
              className="group bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-md hover:shadow-2xl border border-slate-200/60 dark:border-slate-700/50 transition-all duration-300 overflow-hidden flex flex-col h-full"
            >
              {/* Hero Image / Placeholder */}
              <div className="relative h-44 sm:h-48 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-10" />
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                    <PersonStanding size={72} className="text-slate-400/70 dark:text-slate-600/70" />
                  </div>
                )}

                {/* Category badge */}
                <div className="absolute top-4 left-4 z-20">
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold ${badgeColor} backdrop-blur-sm shadow-sm`}>
                    <CategoryIcon size={14} />
                    {item.category}
                  </span>
                </div>

                {/* Favorite heart */}
                <button
                  onClick={() => toggleFavorite(item)}
                  className="absolute top-4 right-4 z-20 p-2.5 bg-black/30 backdrop-blur-md rounded-full hover:bg-black/50 transition-all"
                >
                  <Heart
                    size={20}
                    className={`${isFavorited ? 'fill-red-500 text-red-500' : 'text-white'} transition-colors`}
                  />
                </button>
              </div>

              {/* Content */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-white line-clamp-2">
                  {item.course}
                </h3>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                  {item.name} • {item.school}
                </p>

                {/* Meta */}
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} />
                    <span>{item.uploaded}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye size={14} /> {item.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Download size={14} /> {item.downloads}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto pt-5 flex items-center gap-3 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    onClick={() => handleDownload(item)}
                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    <Download size={18} />
                    Download
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(isMenuOpen ? null : item.id);
                    }}
                    className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  >
                    <MoreVertical size={20} className="text-slate-600 dark:text-slate-300" />
                  </button>
                </div>
              </div>

              {/* Dropdown Menu - same logic */}
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                  <div className="absolute bottom-24 right-6 z-50 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 animate-fade-in">
                    <button onClick={handleShare} className="w-full px-5 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/70 flex items-center gap-3 text-sm">
                      <Share2 size={18} /> Share
                    </button>
                    <button onClick={handleReport} className="w-full px-5 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-3 text-sm">
                      <Flag size={18} /> Report
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