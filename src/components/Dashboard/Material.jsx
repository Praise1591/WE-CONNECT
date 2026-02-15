import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import Schools from './Schools';
import { Download, Heart, FileText, Video, BookOpen, ScrollText, PersonStanding, Loader2 } from 'lucide-react';

// ── Firebase ────────────────────────────────────────────────────────────────
import { db, auth } from '@/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';

const BUCKET_NAME = 'weconnect';

function Material() {
  const [filters, setFilters] = useState({
    category: [],
    school: [],
    department: [],
  });

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [favoritedIds, setFavoritedIds] = useState(new Set());

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
    const q = query(collection(db, 'materials'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMaterials(data);
        setLoading(false);
      },
      (err) => {
        console.error('Materials listener error:', err);
        toast.error('Failed to load educational materials');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleFiltersChange = ({ field, values }) => {
    setFilters((prev) => ({
      ...prev,
      [field]: values,
    }));
  };

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      const matchCategory = filters.category.length === 0 || filters.category.includes(material.category);
      const matchSchool = filters.school.length === 0 || filters.school.includes(material.school);
      const matchDepartment =
        filters.department.length === 0 || filters.department.includes(material.department || 'General');
      return matchCategory && matchSchool && matchDepartment;
    });
  }, [materials, filters]);

  const hasActiveFilters = Object.values(filters).some((arr) => arr.length > 0);

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

    const loadingToast = toast.loading(`Preparing "${material.title || material.name || 'file'}"...`);
    setDownloadingId(material.id);

    try {
      // 1. Increment global download count
      await updateDoc(doc(db, 'materials', material.id), {
        downloads: increment(1),
      });

      // 2. Record in user's personal downloads subcollection
      const downloadRef = doc(db, `users/${user.uid}/downloads`, material.id);
      await setDoc(downloadRef, {
        downloadedAt: serverTimestamp(),
        title: material.title || material.name || 'Untitled',
        course: material.course || '—',
        school: material.school || '—',
        category: material.category || 'Material',
        file_path: material.file_path,           // ← ADDED THIS LINE
      }, { merge: true });

      // 3. Get signed URL
      const idToken = await user.getIdToken();

      const res = await fetch('/api/generate-storj-download-url', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileKey: material.file_path,
          bucket: BUCKET_NAME,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Failed to get signed URL: ${errText}`);
      }

      const { url: signedUrl } = await res.json();

      window.open(signedUrl, '_blank');

      toast.update(loadingToast, {
        render: 'Download ready!',
        type: 'success',
        isLoading: false,
        autoClose: 4000,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast.update(loadingToast, {
        render: 'Could not prepare download',
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const getCategoryInfo = (category) => {
    switch (category) {
      case 'Past Questions':
        return { icon: ScrollText, color: 'bg-gradient-to-r from-amber-500 to-orange-600 text-white' };
      case 'PDF Notes':
        return { icon: FileText, color: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white' };
      case 'Video Tutorials':
        return { icon: Video, color: 'bg-gradient-to-r from-purple-500 to-pink-600 text-white' };
      case 'Technical Reviews':
        return { icon: BookOpen, color: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white' };
      default:
        return { icon: FileText, color: 'bg-slate-500 text-white' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <div className="text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Educational Materials
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400">
            {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 's' : ''} available
            {hasActiveFilters && (
              <span className="ml-2 text-sm font-medium text-purple-600 dark:text-purple-400">(filtered)</span>
            )}
          </p>
        </div>

        <Schools onFiltersChange={handleFiltersChange} />

        {filteredMaterials.length === 0 ? (
          <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-12 text-center border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
            <p className="text-xl font-medium text-slate-500 dark:text-slate-400">
              No materials match your filters.
            </p>
            <p className="text-slate-400 dark:text-slate-500 mt-3">Try adjusting your selection above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredMaterials.map((material) => {
              const { icon: CategoryIcon, color: badgeColor } = getCategoryInfo(material.category);
              const isFavorited = favoritedIds.has(material.id);
              const isDownloading = downloadingId === material.id;

              return (
                <div
                  key={material.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200/50 dark:border-slate-700/50 overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
                >
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center flex-shrink-0">
                        <PersonStanding size={20} className="text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm text-slate-800 dark:text-white truncate">
                          {material.title || material.name || 'Untitled'}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate mt-1">
                          {material.course || '—'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {material.school || '—'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}
                      >
                        <CategoryIcon size={12} />
                        {material.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => toggleFavorite(material)}
                      className="flex-1 py-3 flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                    >
                      <Heart size={16} className={isFavorited ? 'fill-red-500 text-red-500' : ''} />
                      <span className="text-sm font-medium">Favorite</span>
                    </button>

                    <button
                      onClick={() => handleDownload(material)}
                      disabled={isDownloading}
                      className="flex-1 py-3 flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 disabled:opacity-60"
                    >
                      {isDownloading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Download size={16} />
                      )}
                      <span className="text-sm font-medium">
                        {isDownloading ? 'Preparing...' : 'Download'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Material;