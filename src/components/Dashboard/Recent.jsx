// Recent.jsx
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
} from 'lucide-react';
import p2 from '/Image.jpg';

const teachers = [
  {
    id: 1,
    image: p2,
    name: 'Damian Clarson',
    course: 'Pipeline Technology (PTE411)',
    category: 'Past Question',
    school: 'Babcock University',
  },
  {
    id: 2,
    image: null,
    name: 'Mahmood Bashiru',
    course: 'Anthropology (ANT211)',
    category: 'Note/PDF',
    school: 'Delta State University',
  },
  {
    id: 1,
    image: p2,
    name: 'Damian Clarson',
    course: 'Pipeline Technology (PTE411)',
    category: 'Past Question',
    school: 'Babcock University',
  },
  {
    id: 1,
    image: p2,
    name: 'Damian Clarson',
    course: 'Pipeline Technology (PTE411)',
    category: 'Technical Reviews',
    school: 'Babcock University',
  },
  {
    id: 1,
    image: p2,
    name: 'Damian Clarson',
    course: 'Pipeline Technology (PTE411)',
    category: 'Past Question',
    school: 'Babcock University',
  },
  {
    id: 1,
    image: p2,
    name: 'Damian Clarson',
    course: 'Pipeline Technology (PTE411)',
    category: 'Past Question',
    school: 'Babcock University',
  },
  {
    id: 1,
    image: p2,
    name: 'Damian Clarson',
    course: 'Pipeline Technology (PTE411)',
    category: 'Technical Reviews',
    school: 'Babcock University',
  },
  // ... rest of your items
];

function Recent() {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  // Load favorites from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('favoriteUploads');
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save to localStorage whenever favorites change
  useEffect(() => {
    localStorage.setItem('favoriteUploads', JSON.stringify([...favorites]));
  }, [favorites]);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
    setOpenMenuId(null);
  };

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const getCategoryInfo = (category) => {
    // ... same as before
    switch (category) {
      case 'Past Question': return { icon: ScrollText, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' };
      case 'Note/PDF': return { icon: FileText, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' };
      case 'Video Tutorial': return { icon: Video, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' };
      case 'Technical Reviews': return { icon: BookOpen, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' };
      default: return { icon: FileText, color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
    }
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
        Recent Uploads
      </h2>

      <div className="space-y-4">
        {teachers.map((teacher) => {
          const { icon: CategoryIcon, color: badgeColor } = getCategoryInfo(teacher.category);
          const isFavorited = favorites.has(teacher.id);
          const isMenuOpen = openMenuId === teacher.id;

          return (
            <div
              key={teacher.id}
              className="group flex items-center justify-between p-5 bg-white dark:bg-slate-800/60 rounded-xl hover:shadow-lg transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50"
            >
              {/* Avatar & Details */}
              <div className="flex items-center gap-5 flex-1 min-w-0">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-md">
                  {teacher.image ? (
                    <img src={teacher.image} alt={teacher.name} className="w-full h-full object-cover" />
                  ) : (
                    <PersonStanding size={28} className="text-slate-500 dark:text-slate-400" />
                  )}
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    {teacher.name}
                    {isFavorited && <Heart size={16} className="text-red-500 fill-red-500" />}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{teacher.course}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{teacher.school}</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
                      <CategoryIcon size={14} />
                      {teacher.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* More Button + Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => toggleMenu(teacher.id, e)}
                  className="p-2.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <MoreVertical size={20} className="text-slate-600 dark:text-slate-400" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                    <button
                      onClick={() => toggleFavorite(teacher.id)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
                    >
                      <Heart size={18} className={isFavorited ? 'text-red-500 fill-red-500' : 'text-slate-600'} />
                      <span className="text-sm">{isFavorited ? 'Remove from' : 'Add to'} Favorites</span>
                    </button>
                    {/* Other options... */}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Global backdrop */}
      {openMenuId && <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />}
    </div>
  );
}

export default Recent;