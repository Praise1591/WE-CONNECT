// Favorites.jsx
import React, { useState, useEffect } from 'react';
import {
  PersonStanding,
  Heart,
  MoreVertical,
  FileText,
  Video,
  BookOpen,
  ScrollText,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';

import { db, auth } from '@/firebase';
import {
  collection,
  query,
  onSnapshot,
  doc,
  deleteDoc,
} from 'firebase/firestore';

function Favorites() {
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = collection(db, `users/${user.uid}/favorites`);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,           // materialId
        ...d.data(),
      }));
      setFavoriteItems(items);
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error('Failed to load favorites');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const removeFavorite = async (materialId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/favorites`, materialId));
      toast.info('Removed from favorites');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove');
    }
    setOpenMenuId(null);
  };

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const getCategoryInfo = (category) => {
    switch (category) {
      case 'Past Questions': return { icon: ScrollText, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300' };
      case 'PDF Notes':      return { icon: FileText,   color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' };
      case 'Video Tutorials':return { icon: Video,      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' };
      case 'Technical Reviews': return { icon: BookOpen, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' };
      default: return { icon: FileText, color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
    }
  };

  if (!user) {
    return <div className="...">Please sign in to view favorites</div>;
  }

  if (loading) return <div className="...">Loading...</div>;

  if (favoriteItems.length === 0) {
    return (
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-12 text-center border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
        <Heart size={64} className="mx-auto text-slate-300 dark:text-slate-600 mb-6" />
        <h2 className="text-2xl font-medium text-slate-600 dark:text-slate-400 mb-2">
          No favorites yet
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Tap the heart on materials you love to save them here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
        My Favorites
        <Heart className="text-red-500 fill-red-500" size={24} />
        <span className="text-sm text-slate-500 dark:text-slate-400">
          ({favoriteItems.length})
        </span>
      </h2>

      <div className="space-y-4">
        {favoriteItems.map((item) => {
          const { icon: CategoryIcon, color: badgeColor } = getCategoryInfo(item.category || 'PDF Notes');
          const isMenuOpen = openMenuId === item.id;

          return (
            <div
              key={item.id}
              className="group flex items-center justify-between p-5 bg-white dark:bg-slate-800/60 rounded-xl hover:shadow-lg transition-all duration-300 border border-slate-200/50 dark:border-slate-700/50"
            >
              <div className="flex items-center gap-5 flex-1 min-w-0">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center shadow-md">
                  <PersonStanding size={28} className="text-slate-500 dark:text-slate-400" />
                </div>

                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                    {item.title || 'Material'}
                    <Heart size={16} className="text-red-500 fill-red-500" />
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.course || '—'}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">{item.school || '—'}</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
                      <CategoryIcon size={14} />
                      {item.category || 'Material'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={(e) => toggleMenu(item.id, e)}
                  className="p-2.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  <MoreVertical size={20} className="text-slate-600 dark:text-slate-400" />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 z-50">
                    <button
                      onClick={() => removeFavorite(item.id)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/30 text-left text-red-600 dark:text-red-400"
                    >
                      <X size={18} />
                      <span className="text-sm font-medium">Remove from Favorites</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Favorites;