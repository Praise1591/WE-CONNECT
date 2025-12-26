// Recent.jsx — With Notification Triggers
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
    id: 3,
    image: p2,
    name: 'Dr. Aisha Bello',
    course: 'Advanced Law (LAW501)',
    category: 'Video Tutorial',
    school: 'Lagos State University',
  },
  {
    id: 4,
    image: p2,
    name: 'Prof. Tunde Adebayo',
    course: 'Business Strategy (BUS401)',
    category: 'Technical Reviews',
    school: 'Delta State University',
  },
  {
    id: 5,
    image: p2,
    name: 'Chioma Eze',
    course: 'Clinical Medicine (MED601)',
    category: 'Past Question',
    school: 'University of Port Harcourt',
  },
];

function Recent() {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [favorites, setFavorites] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);

  // Load current user
  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      setCurrentUser(JSON.parse(profile));
    }
  }, []);

  // Load favorites from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('favoriteUploads');
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)));
    }
  }, []);

  // Save favorites and trigger notification
  const toggleFavorite = (item) => {
    const newFavorites = new Set(favorites);
    const wasFavorited = newFavorites.has(item.id);
    
    if (wasFavorited) {
      newFavorites.delete(item.id);
    } else {
      newFavorites.add(item.id);
    }

    setFavorites(newFavorites);
    localStorage.setItem('favoriteUploads', JSON.stringify([...newFavorites]));

    // Trigger notification
    if (currentUser) {
      const message = wasFavorited
        ? `You removed "${item.course}" by ${item.name} from favorites`
        : `You added "${item.course}" by ${item.name} to favorites`;

      const notif = {
        id: Date.now(),
        type: 'favorite',
        message,
        time: new Date().toLocaleString(),
        read: false,
      };

      const savedNotifs = localStorage.getItem('appNotifications') || '[]';
      const notifs = JSON.parse(savedNotifs);
      notifs.unshift(notif); // Add to top
      localStorage.setItem('appNotifications', JSON.stringify(notifs));

      // Dispatch event for real-time update in Notification page
      window.dispatchEvent(new Event('newNotification'));
    }

    setOpenMenuId(null);
  };

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const getCategoryInfo = (category) => {
    switch (category) {
      case 'Past Question': 
        return { icon: ScrollText, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' };
      case 'Note/PDF': 
        return { icon: FileText, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' };
      case 'Video Tutorial': 
        return { icon: Video, color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' };
      case 'Technical Reviews': 
        return { icon: BookOpen, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' };
      default: 
        return { icon: FileText, color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
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
                      onClick={() => toggleFavorite(teacher)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 text-left"
                    >
                      <Heart size={18} className={isFavorited ? 'text-red-500 fill-red-500' : 'text-slate-600'} />
                      <span className="text-sm">
                        {isFavorited ? 'Remove from' : 'Add to'} Favorites
                      </span>
                    </button>

                    <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 text-left">
                      <Download size={18} className="text-slate-600" />
                      <span className="text-sm">Download</span>
                    </button>

                    <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-700 text-left">
                      <Share2 size={18} className="text-slate-600" />
                      <span className="text-sm">Share</span>
                    </button>

                    <hr className="my-2 border-slate-200 dark:border-slate-700" />

                    <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/30 text-left text-red-600 dark:text-red-400">
                      <Flag size={18} />
                      <span className="text-sm">Report</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Global backdrop to close menu on outside click */}
      {openMenuId && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setOpenMenuId(null)} 
        />
      )}
    </div>
  );
}

export default Recent;