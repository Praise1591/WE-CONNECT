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
  Clock,
  Eye,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-toastify';

import { db, auth } from '@/firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';

function Recent() {
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritedIds, setFavoritedIds] = useState(new Set());
  const [openMenuId, setOpenMenuId] = useState(null);

  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      setFavoritedIds(new Set());
      return;
    }

    const q = collection(db, `users/${user.uid}/favorites`);

    const unsubscribe = onSnapshot(q, (snap) => {
      const ids = new Set(snap.docs.map(d => d.id));
      setFavoritedIds(ids);
    }, console.error);

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const q = query(collection(db, 'materials'), orderBy('createdAt', 'desc'), limit(10));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecentMaterials(items);
        setLoading(false);
      },
      (err) => {
        console.error('Recent materials error:', err);
        toast.error("Couldn't load recent materials");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const toggleFavorite = async (material) => {
    if (!user) {
      toast.info("Please sign in to favorite materials");
      return;
    }

    const favRef = doc(db, `users/${user.uid}/favorites`, material.id);

    try {
      const exists = (await getDoc(favRef)).exists();

      if (exists) {
        await deleteDoc(favRef);
        toast.info("Removed from favorites");
      } else {
        await setDoc(favRef, {
          addedAt: serverTimestamp(),
          title: material.title || material.name || 'Untitled',
          course: material.course || '—',
          school: material.school || '—',
          category: material.category || 'Material',
        });
        toast.success("Added to favorites ❤️");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update favorites");
    }
  };

  const handleDownload = async (material) => {
    if (!user) {
      toast.info("Please sign in to download");
      return;
    }

    try {
      // 1. Global counter
      await updateDoc(doc(db, 'materials', material.id), {
        downloads: increment(1),
      });

      // 2. Personal record
      const downloadRef = doc(db, `users/${user.uid}/downloads`, material.id);
      await setDoc(downloadRef, {
        downloadedAt: serverTimestamp(),
        title: material.title || material.name || 'Untitled',
        course: material.course || '—',
        school: material.school || '—',
        category: material.category || 'Material',
        file_path: material.file_path,           // ← ADDED THIS LINE
      }, { merge: true });

      // 3. Signed URL
      const idToken = await user.getIdToken();

      const res = await fetch('/api/generate-storj-download-url', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileKey: material.file_path,
          bucket: 'weconnect',
        }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '(no response body)');
        throw new Error(`Backend responded ${res.status}: ${errText}`);
      }

      const { url } = await res.json();
      window.open(url, '_blank');

      toast.success('Download started');
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Download failed');
    }
  };

  const handleShare = () => toast.info('Link copied to clipboard (implement real share if needed)');
  const handleReport = () => toast.warning('Material reported (implement backend report if needed)');

  const getCategoryInfo = (category) => {
    switch (category) {
      case 'Past Questions':
        return { icon: ScrollText, color: 'bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-300' };
      case 'PDF Notes':
        return { icon: FileText, color: 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300' };
      case 'Video Tutorials':
        return { icon: Video, color: 'bg-purple-100 text-purple-800 dark:bg-purple-800/30 dark:text-purple-300' };
      case 'Technical Reviews':
        return { icon: BookOpen, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800/30 dark:text-emerald-300' };
      default:
        return { icon: FileText, color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
        Recent Materials
      </h2>

      {recentMaterials.length === 0 ? (
        <p className="text-slate-500 dark:text-slate-400 text-center py-10">
          No materials have been uploaded yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {recentMaterials.map((item) => {
            const { icon: CategoryIcon, color: badgeColor } = getCategoryInfo(item.category);
            const isFavorited = favoritedIds.has(item.id);
            const isMenuOpen = openMenuId === item.id;

            const uploadedTime =
              item.createdAt && item.createdAt.toDate
                ? item.createdAt.toDate().toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'recent';

            return (
              <div
                key={item.id}
                className="group bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-md hover:shadow-2xl border border-slate-200/60 dark:border-slate-700/50 transition-all duration-300 overflow-hidden flex flex-col h-full"
              >
                <div className="relative h-44 sm:h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-10" />
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                    <PersonStanding size={72} className="text-slate-400/70 dark:text-slate-600/70" />
                  </div>

                  <div className="absolute top-4 left-4 z-20">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold ${badgeColor} backdrop-blur-sm shadow-sm`}
                    >
                      <CategoryIcon size={14} />
                      {item.category}
                    </span>
                  </div>

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

                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-semibold text-lg text-slate-800 dark:text-white line-clamp-2">
                    {item.title || item.course || 'Untitled Material'}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                    {item.course} • {item.school || '—'}
                  </p>

                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} />
                      <span>{uploadedTime}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye size={14} /> {item.views || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download size={14} /> {item.downloads || 0}
                      </div>
                    </div>
                  </div>

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

                {isMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                    <div className="absolute bottom-24 right-6 z-50 w-52 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 py-2 animate-fade-in">
                      <button
                        onClick={handleShare}
                        className="w-full px-5 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/70 flex items-center gap-3 text-sm"
                      >
                        <Share2 size={18} /> Share
                      </button>
                      <button
                        onClick={handleReport}
                        className="w-full px-5 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center gap-3 text-sm"
                      >
                        <Flag size={18} /> Report
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Recent;