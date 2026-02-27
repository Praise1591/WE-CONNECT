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
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';

import { db, storage, auth } from '@/firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
  runTransaction,
  increment,
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

function Recent() {
  const [recentMaterials, setRecentMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritedIds, setFavoritedIds] = useState(new Set());
  const [openMenuId, setOpenMenuId] = useState(null);

  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  // ── Auth & Profile ─────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setCurrentUser);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setFavoritedIds(new Set());
      setProfile(null);
      return;
    }

    // Favorites
    const favUnsub = onSnapshot(collection(db, `users/${currentUser.uid}/favorites`), (snap) => {
      setFavoritedIds(new Set(snap.docs.map((d) => d.id)));
    }, console.error);

    // Profile (coins, diamonds)
    const profileUnsub = onSnapshot(doc(db, 'users', currentUser.uid), (snap) => {
      setProfile(snap.exists() ? snap.data() : { coins: 0, diamonds: 0 });
    }, console.error);

    return () => {
      favUnsub();
      profileUnsub();
    };
  }, [currentUser]);

  // ── Recent Materials ────────────────────────────────────────────────────
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

    return unsubscribe;
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────

  const getMaterialPriceInCoins = (cat) => {
    const map = {
      'Past Questions': 1,
      'PDF Notes': 2,
      'Video Tutorials': 4,
      'Technical Reviews': 3,
    };
    return map[cat] ?? 2;
  };

  const getCategoryInfo = (category) => {
    const map = {
      'Past Questions': { icon: ScrollText, color: 'from-amber-500 to-orange-600' },
      'PDF Notes': { icon: FileText, color: 'from-blue-500 to-cyan-600' },
      'Video Tutorials': { icon: Video, color: 'from-purple-500 to-pink-600' },
      'Technical Reviews': { icon: BookOpen, color: 'from-emerald-500 to-teal-600' },
    };
    return map[category] ?? { icon: FileText, color: 'from-slate-500 to-slate-700' };
  };

  const addTransaction = async (userId, type, amountNGN, description, status = 'completed', metadata = {}) => {
    if (!userId) return;
    try {
      const txRef = doc(collection(db, `users/${userId}/transactions`));
      await setDoc(txRef, {
        type,
        amountNGN,
        description,
        status,
        createdAt: serverTimestamp(),
        ...metadata,
      });
    } catch (err) {
      console.error('Transaction record failed:', err);
    }
  };

  const deductCoinsAndRecord = async (material, price) => {
    if (!currentUser) return false;

    try {
      await runTransaction(db, async (t) => {
        const buyerRef = doc(db, 'users', currentUser.uid);
        const buyerSnap = await t.get(buyerRef);
        if (!buyerSnap.exists()) throw new Error('Profile not found');
        const buyerCoins = buyerSnap.data().coins || 0;
        if (buyerCoins < price) throw new Error('Insufficient coins');

        t.update(buyerRef, { coins: buyerCoins - price });
      });

      setProfile((prev) => ({ ...prev, coins: Math.max(0, (prev?.coins || 0) - price) }));

      await addTransaction(
        currentUser.uid,
        'spend',
        price * 100,
        `Spent ${price} coin${price !== 1 ? 's' : ''} on "${material.title || 'Material'}"`,
        'completed',
        {
          materialId: material.id,
          category: material.category,
          coinsSpent: price,
        }
      );

      const dlRef = doc(db, `users/${currentUser.uid}/downloads`, material.id);
      await setDoc(
        dlRef,
        {
          downloadedAt: serverTimestamp(),
          title: material.title || material.name || 'Untitled',
          course: material.course || '—',
          school: material.school || '—',
          category: material.category || 'Material',
          file_path: material.file_path,
          coinsSpent: price,
          amountNGN: price * 100,
          isOwnerDownload: false,
        },
        { merge: true }
      );

      return true;
    } catch (err) {
      console.error('Coin deduction failed:', err);
      const msg = err.message?.includes('Insufficient')
        ? `Not enough coins (${price} required)`
        : 'Failed to process payment';
      toast.error(msg);
      return false;
    }
  };

  const incrementDownloadStats = async (material, price, isOwner) => {
    if (isOwner) return;
    const diamondsToCredit = Math.floor(price * 0.6);
    if (diamondsToCredit <= 0) return;

    const matRef = doc(db, 'materials', material.id);
    const ownerRef = material.ownerUid ? doc(db, 'users', material.ownerUid) : null;

    try {
      await runTransaction(db, async (t) => {
        const matSnap = await t.get(matRef);
        if (!matSnap.exists()) return;

        t.update(matRef, {
          downloads: increment(1),
          diamonds_earned: increment(diamondsToCredit),
        });

        if (ownerRef) {
          t.update(ownerRef, { diamonds: increment(diamondsToCredit) });
        }
      });
    } catch (err) {
      console.warn('Stats update failed (non-critical):', err);
    }
  };

  const forceDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileUrl = async (material, isPreview = false) => {
    if (!currentUser) {
      toast.info('Please sign in');
      return null;
    }

    const price = getMaterialPriceInCoins(material.category);
    const isOwner = currentUser?.uid === material.ownerUid;

    if (isPreview) {
      try {
        const storageRef = ref(storage, material.file_path);
        return await getDownloadURL(storageRef);
      } catch (err) {
        console.error('Preview URL error:', err);
        toast.error('Could not load preview');
        return null;
      }
    }

    if (!isOwner && (profile?.coins ?? 0) < price) {
      toast.error(`Not enough coins! Requires ${price} coin${price !== 1 ? 's' : ''}.`);
      return null;
    }

    let deductionSuccess = true;
    if (!isOwner) {
      deductionSuccess = await deductCoinsAndRecord(material, price);
    }

    if (!deductionSuccess) return null;

    incrementDownloadStats(material, price, isOwner);

    try {
      const storageRef = ref(storage, material.file_path);
      const url = await getDownloadURL(storageRef);

      if (!isPreview) {
        const ext = material.file_path.split('.').pop()?.toLowerCase() || 'pdf';
        const safeTitle = (material.title || `material-${material.id}`)
          .replace(/[^a-z0-9]/gi, '_')
          .replace(/_+/g, '_')
          .replace(/^_|_$/g, '');
        const filename = `${safeTitle}.${ext}`;

        forceDownload(url, filename);

        toast.success(isOwner ? 'File downloaded!' : `File downloaded (${price} coin${price !== 1 ? 's' : ''} deducted)`);
      }

      return url;
    } catch (err) {
      console.error('File access error:', err);
      toast.error('Could not access file');
      return null;
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownload = (material) => {
    setDownloadingId(material.id);
    getFileUrl(material, false);
  };

  const openPreview = async (material) => {
    if (!currentUser) {
      toast.info('Please sign in to preview');
      return;
    }
    if (!material?.file_path) {
      toast.error('No file attached');
      return;
    }

    setPreviewMaterial(material);
    setPreviewUrl(null);
    setPreviewError(null);
    setPreviewLoading(true);

    const url = await getFileUrl(material, true);

    if (url) {
      setPreviewUrl(url);
    } else {
      setPreviewError('Could not load preview — file may be missing or restricted.');
    }

    setPreviewLoading(false);
  };

  const toggleFavorite = async (material) => {
    if (!currentUser) {
      toast.info('Please sign in to favorite materials');
      return;
    }

    const favRef = doc(db, `users/${currentUser.uid}/favorites`, material.id);

    try {
      const exists = (await getDoc(favRef)).exists();
      if (exists) {
        await deleteDoc(favRef);
        toast.info('Removed from favorites');
      } else {
        await setDoc(favRef, {
          addedAt: serverTimestamp(),
          title: material.title || material.name || 'Untitled',
          course: material.course || '—',
          school: material.school || '—',
          category: material.category || 'Material',
        });
        toast.success('Added to favorites ❤️');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update favorites');
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────

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
            const { icon: CategoryIcon, color } = getCategoryInfo(item.category);
            const isFavorited = favoritedIds.has(item.id);
            const isMenuOpen = openMenuId === item.id;
            const isDownloading = downloadingId === item.id;
            const price = getMaterialPriceInCoins(item.category);
            const isOwner = currentUser?.uid === item.ownerUid;
            const canAfford = isOwner || (profile?.coins ?? 0) >= price;

            const uploadedTime =
              item.createdAt?.toDate?.()
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
                className="group bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-md hover:shadow-2xl border border-slate-200/60 dark:border-slate-700/50 transition-all duration-300 overflow-hidden flex flex-col h-full relative"
              >
                <div className="relative h-44 sm:h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent z-10" />
                  <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center">
                    <PersonStanding size={72} className="text-slate-400/70 dark:text-slate-600/70" />
                  </div>

                  <div className="absolute top-4 left-4 z-20">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r ${color} text-white backdrop-blur-sm shadow-sm`}
                    >
                      <CategoryIcon size={14} />
                      {item.category}
                    </span>
                  </div>

                  {!isOwner && (
                    <div className="absolute top-4 right-20 z-20 bg-white/90 dark:bg-slate-900/80 px-2.5 py-1 rounded-full text-xs font-medium text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/40 shadow-sm">
                      {price} coin{price !== 1 ? 's' : ''}
                    </div>
                  )}

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
                      onClick={() => openPreview(item)}
                      className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                      <Eye size={18} />
                      Preview
                    </button>

                    <button
                      onClick={() => handleDownload(item)}
                      disabled={isDownloading || !canAfford}
                      className={`flex-1 py-3 font-medium rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 ${
                        isDownloading
                          ? 'bg-violet-700 text-white cursor-wait'
                          : canAfford
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white'
                          : 'bg-slate-300 dark:bg-slate-600 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Preparing…
                        </>
                      ) : (
                        <>
                          <Download size={18} />
                          {isOwner ? 'Free' : `${price} coin${price !== 1 ? 's' : ''}`}
                        </>
                      )}
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
                        onClick={() => toast.info('Link copied (implement real share)')}
                        className="w-full px-5 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/70 flex items-center gap-3 text-sm"
                      >
                        <Share2 size={18} /> Share
                      </button>
                      <button
                        onClick={() => toast.warning('Reported (implement backend report)')}
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

      {/* ── Preview Modal ────────────────────────────────────────────────────── */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-5xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold truncate pr-4">
                Preview: {previewMaterial.title || previewMaterial.name || 'Material'}
              </h2>
              <button
                onClick={() => {
                  setPreviewMaterial(null);
                  setPreviewUrl(null);
                  setPreviewError(null);
                }}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 flex-shrink-0"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-slate-50 dark:bg-slate-950">
              {previewLoading ? (
                <div className="h-96 flex items-center justify-center">
                  <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
                </div>
              ) : previewError ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-6 py-12 px-6">
                  <Eye size={80} className="text-slate-400 dark:text-slate-500 opacity-60 mb-4" />
                  <p className="text-xl font-semibold text-slate-800 dark:text-slate-200">{previewError}</p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Preview is free, but the file might be unavailable, deleted, or restricted.
                  </p>
                  <button
                    onClick={() => {
                      setPreviewMaterial(null);
                      setPreviewUrl(null);
                      setPreviewError(null);
                    }}
                    className="px-10 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg font-medium"
                  >
                    Close
                  </button>
                </div>
              ) : previewUrl ? (
                previewMaterial.category?.toLowerCase().includes('video') ? (
                  <video
                    src={previewUrl}
                    controls
                    autoPlay
                    className="w-full max-h-[75vh] rounded-lg shadow-md mx-auto"
                  />
                ) : (
                  <iframe
                    src={previewUrl}
                    className="w-full h-[70vh] md:h-[80vh] rounded-lg border border-slate-200 dark:border-slate-700"
                    title="Material Preview"
                    allowFullScreen
                  />
                )
              ) : null}
            </div>

            <div className="p-4 border-t dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-900/30">
              Free preview — full file costs {getMaterialPriceInCoins(previewMaterial.category)} coin
              {getMaterialPriceInCoins(previewMaterial.category) !== 1 ? 's' : ''} (free if you are the owner)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recent;