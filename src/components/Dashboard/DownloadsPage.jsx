// DownloadsPage.jsx — Modern 2025 redesign (glass + neumorphic + mobile-first)
import React, { useState, useEffect } from 'react';
import {
  Download,
  MoreVertical,
  FileText,
  Video,
  BookOpen,
  ScrollText,
  Trash2,
  Calendar,
  School,
  Eye,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase imports (unchanged)
import { db, auth } from '@/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
} from 'firebase/firestore';

function DownloadsPage() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [viewingIds, setViewingIds] = useState(new Set());

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, `users/${user.uid}/downloads`),
      orderBy('downloadedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setDownloads(items);
      setLoading(false);
    }, (err) => {
      console.error('Downloads error:', err);
      toast.error('Failed to load downloads');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const removeDownload = async (materialId) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/downloads`, materialId));
      toast.success('Removed from downloads', { autoClose: 2000 });
    } catch (err) {
      toast.error('Could not remove');
    }
    setOpenMenuId(null);
  };

  const viewMaterial = async (item) => {
    // ← your original viewMaterial logic (unchanged)
    // ...
  };

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const getCategoryInfo = (category) => {
    const map = {
      'Past Questions': { icon: ScrollText, color: 'from-amber-500/20 to-amber-600/10 text-amber-300' },
      'PDF Notes':       { icon: FileText,   color: 'from-blue-500/20 to-blue-600/10 text-blue-300' },
      'Video Tutorials': { icon: Video,      color: 'from-purple-500/20 to-purple-600/10 text-purple-300' },
      'Technical Reviews': { icon: BookOpen, color: 'from-emerald-500/20 to-emerald-600/10 text-emerald-300' },
    };
    return map[category] || { icon: FileText, color: 'from-gray-500/20 to-gray-600/10 text-gray-300' };
  };

  useEffect(() => {
    const handler = () => setOpenMenuId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-5 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-6">
          <Download className="h-10 w-10 text-indigo-400" />
        </div>
        <h2 className="text-2xl font-bold mb-3">Sign in to see downloads</h2>
        <p className="text-slate-400 max-w-xs">
          Your downloaded materials will appear here once you're logged in.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="h-12 w-12 text-indigo-400" />
        </motion.div>
      </div>
    );
  }

  if (downloads.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-5 text-center">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-600/10 to-purple-600/10 flex items-center justify-center mb-8 backdrop-blur-sm border border-indigo-500/20">
          <Download className="h-12 w-12 text-indigo-400/80" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Your downloads are empty</h2>
        <p className="text-slate-400 max-w-md text-lg leading-relaxed">
          Start downloading notes, past questions, and videos — they'll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 sm:pb-16 px-3 sm:px-5 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <header className="py-6 sm:py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Downloads
          </h1>
          <div className="text-sm font-medium text-slate-400">
            {downloads.length} {downloads.length === 1 ? 'item' : 'items'}
          </div>
        </div>
      </header>

      {/* Cards */}
      <div className="space-y-4 sm:space-y-5">
        <AnimatePresence>
          {downloads.map((item) => {
            const { icon: CategoryIcon, color } = getCategoryInfo(item.category || 'PDF Notes');
            const isMenuOpen = openMenuId === item.id;
            const isViewing = viewingIds.has(item.id);

            const date = item.downloadedAt
              ? new Date(item.downloadedAt.toDate()).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Recent';

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="group relative bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-xl border border-slate-700/40 rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                {/* Card content */}
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
                  {/* Left icon block */}
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${color}`}>
                    <CategoryIcon className="h-8 w-8 sm:h-10 sm:w-10 opacity-90" />
                  </div>

                  {/* Middle content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg sm:text-xl text-white line-clamp-2 mb-1.5 group-hover:text-indigo-300 transition-colors">
                      {item.title || 'Untitled'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-300/90">
                      <div className="flex items-center gap-1.5">
                        <School size={14} />
                        <span className="line-clamp-1">{item.school || item.course || '—'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        <span>{date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => viewMaterial(item)}
                      disabled={isViewing}
                      className="p-3 sm:p-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 transition-colors disabled:opacity-40 touch-manipulation"
                      aria-label="View"
                    >
                      {isViewing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={(e) => toggleMenu(item.id, e)}
                      className="p-3 sm:p-4 rounded-xl bg-slate-700/40 hover:bg-slate-600/60 transition-colors touch-manipulation"
                      aria-label="More"
                    >
                      <MoreVertical className="h-5 w-5 text-slate-300" />
                    </motion.button>
                  </div>
                </div>

                {/* Context menu */}
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-4 top-20 sm:top-24 z-20 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700/70 rounded-xl shadow-2xl overflow-hidden"
                    >
                      <button
                        onClick={() => removeDownload(item.id)}
                        className="w-full px-5 py-4 flex items-center gap-3 text-red-400 hover:bg-red-950/40 transition-colors text-left"
                      >
                        <Trash2 size={18} />
                        <div>
                          <div className="font-medium">Remove from Downloads</div>
                          <div className="text-xs text-slate-400 mt-0.5">Won’t appear in list anymore</div>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default DownloadsPage;