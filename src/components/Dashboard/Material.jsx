import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import Schools from './Schools';
import { 
  Download, Heart, FileText, Video, BookOpen, ScrollText, 
  PersonStanding, Loader2, Eye, X 
} from 'lucide-react';

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
  runTransaction,
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

  // Wallet + Auth
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // ── Preview state ──────────────────────────────────────────────────────────
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  // Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setCurrentUser);
    return unsubscribe;
  }, []);

  // Favorites listener
  useEffect(() => {
    if (!currentUser) {
      setFavoritedIds(new Set());
      return;
    }
    const q = collection(db, `users/${currentUser.uid}/favorites`);
    const unsubscribe = onSnapshot(q, (snap) => {
      setFavoritedIds(new Set(snap.docs.map(d => d.id)));
    }, console.error);
    return unsubscribe;
  }, [currentUser]);

  // Profile (coins/diamonds) listener
  useEffect(() => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      setProfile(snap.exists() ? snap.data() : { coins: 0, diamonds: 0 });
    }, (err) => {
      console.error("Profile listener error:", err);
      setProfile({ coins: 0, diamonds: 0 });
    });
    return unsubscribe;
  }, [currentUser]);

  // Materials listener
  useEffect(() => {
    const q = query(collection(db, 'materials'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setMaterials(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Materials listener error:", err);
      toast.error('Failed to load materials');
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleFiltersChange = ({ field, values }) => {
    setFilters(prev => ({ ...prev, [field]: values }));
  };

  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const matchCat = filters.category.length === 0 || filters.category.includes(m.category);
      const matchSch = filters.school.length === 0 || filters.school.includes(m.school);
      const matchDep = filters.department.length === 0 || filters.department.includes(m.department || 'General');
      return matchCat && matchSch && matchDep;
    });
  }, [materials, filters]);

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

  const getMaterialPriceInCoins = (cat) => {
    const map = {
      'Past Questions': 1,
      'PDF Notes': 2,
      'Video Tutorials': 4,
      'Technical Reviews': 3,
    };
    return map[cat] ?? 2;
  };

  const toggleFavorite = async (material) => {
    if (!currentUser) {
      toast.info("Please sign in to favorite materials");
      return;
    }
    const favRef = doc(db, `users/${currentUser.uid}/favorites`, material.id);
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
      console.error("Favorite toggle failed:", err);
      toast.error("Failed to update favorites");
    }
  };

  const handleDownload = async (material) => {
    if (!currentUser) {
      toast.info("Please sign in to download");
      return;
    }

    const price = getMaterialPriceInCoins(material.category);
    const isOwner = currentUser?.uid === material.ownerUid;

    if (!isOwner && (profile?.coins ?? 0) < price) {
      toast.error(`Not enough coins! This costs ${price} coin${price !== 1 ? 's' : ''}.`);
      return;
    }

    const titleForToast = material.title || material.name || 'file';
    const loadingToast = toast.loading(`Preparing "${titleForToast}"...`);
    setDownloadingId(material.id);

    try {
      const materialRef = doc(db, 'materials', material.id);
      const buyerRef = doc(db, 'users', currentUser.uid);
      const ownerRef = material.ownerUid && !isOwner ? doc(db, 'users', material.ownerUid) : null;

      const diamondsToCredit = Math.floor(price * 0.6);

      await runTransaction(db, async (t) => {
        const materialSnap = await t.get(materialRef);
        if (!materialSnap.exists()) throw new Error("Material no longer exists");

        let buyerCoins = 0;
        if (!isOwner) {
          const buyerSnap = await t.get(buyerRef);
          if (!buyerSnap.exists()) throw new Error("Profile not found");
          buyerCoins = buyerSnap.data().coins || 0;
          if (buyerCoins < price) throw new Error("Insufficient coins");
        }

        if (ownerRef) await t.get(ownerRef);

        t.update(materialRef, { downloads: increment(1) });
        if (diamondsToCredit > 0) {
          t.update(materialRef, { diamonds_earned: increment(diamondsToCredit) });
        }
        if (!isOwner) {
          t.update(buyerRef, { coins: buyerCoins - price });
        }
        if (ownerRef && diamondsToCredit > 0) {
          t.update(ownerRef, { diamonds: increment(diamondsToCredit) });
        }
      });

      const downloadHistoryRef = doc(db, `users/${currentUser.uid}/downloads`, material.id);
      await setDoc(downloadHistoryRef, {
        downloadedAt: serverTimestamp(),
        title: material.title || material.name || 'Untitled',
        course: material.course || '—',
        school: material.school || '—',
        category: material.category || 'Material',
        file_path: material.file_path,
        coinsSpent: isOwner ? 0 : price,
        amountNGN: isOwner ? 0 : price * 100,
        isOwnerDownload: isOwner,
      }, { merge: true });

      if (!isOwner && profile) {
        setProfile(prev => ({ ...prev, coins: Math.max(0, (prev?.coins || 0) - price) }));
      }

      const idToken = await currentUser.getIdToken(true);
      const res = await fetch('/api/generate-storj-download-url', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileKey: material.file_path, bucket: BUCKET_NAME }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(`Download URL failed: ${res.status} - ${errText}`);
      }

      const { url: signedUrl } = await res.json();
      window.open(signedUrl, '_blank');

      toast.update(loadingToast, {
        render: isOwner ? "Free download started!" : `Success! ${price} coin${price !== 1 ? 's' : ''} deducted`,
        type: 'success',
        isLoading: false,
        autoClose: 4500,
      });
    } catch (err) {
      console.error("Download process failed:", err);
      let msg = "Could not complete download";
      if (err.message.includes("Insufficient coins")) msg = `Not enough coins (${price} required)`;
      if (err.message.includes("no longer exists")) msg = "This material was removed";
      toast.update(loadingToast, { render: msg, type: 'error', isLoading: false, autoClose: 7000 });
    } finally {
      setDownloadingId(null);
    }
  };

  const openPreview = async (material) => {
    if (!currentUser) {
      toast.info("Please sign in to preview");
      return;
    }

    if (!material?.file_path) {
      toast.error("This material has no file attached");
      return;
    }

    setPreviewMaterial(material);
    setPreviewUrl(null);
    setPreviewError(null);
    setPreviewLoading(true);

    try {
      console.log("[Preview requested]", {
        materialId: material.id,
        category: material.category,
        filePath: material.file_path,
        userId: currentUser.uid,
      });

      const idToken = await currentUser.getIdToken(true);
      const res = await fetch('/api/generate-storj-preview-url', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileKey: material.file_path,
          bucket: BUCKET_NAME,
          isPreview: true,
          category: material.category,
        }),
      });

      if (!res.ok) {
        let data;
        let errText = '';
        try {
          data = await res.json();
          errText = data.error || data.message || '';
        } catch {
          errText = await res.text().catch(() => '');
        }

        console.error("[Preview failed]", {
          status: res.status,
          responseText: errText,
          responseData: data,
          materialId: material.id,
          fileKey: material.file_path,
        });

        let friendlyMsg = "Could not load preview";

        if (res.status === 404 || errText.toLowerCase().includes('not found') || errText.includes('NoSuchKey')) {
          friendlyMsg = "This file appears to be missing from storage or inaccessible for preview.";
        } else if (res.status === 403 || errText.includes('AccessDenied') || errText.includes('forbidden')) {
          friendlyMsg = "Access denied — preview permission issue (Storj credentials or bucket settings).";
        } else if (res.status === 500 || errText.includes('InternalError') || errText.includes('Internal Server')) {
          friendlyMsg = "Preview service internal error — file storage may be temporarily unstable.";
        } else if (errText.includes('timeout') || res.status === 503 || errText.includes('503')) {
          friendlyMsg = "Preview request timed out — storage service is responding slowly.";
        } else if (errText) {
          friendlyMsg = `Preview failed: ${errText}`;
        } else {
          friendlyMsg = `Preview request failed (${res.status}) — no error details received.`;
        }

        setPreviewError(friendlyMsg);
        toast.error(friendlyMsg, { autoClose: 7500 });
        throw new Error(`Preview endpoint failed (${res.status}): ${errText || 'no details'}`);
      }

      const data = await res.json();
      if (!data.url) {
        throw new Error("No preview URL returned from server");
      }

      setPreviewUrl(data.url);
      console.log("[Preview success] URL:", data.url.substring(0, 120) + (data.url.length > 120 ? '...' : ''));
    } catch (err) {
      console.error("openPreview failed:", err);
      // Fallback in case something throws outside the fetch block
      setPreviewError("Unexpected error while preparing preview — please try downloading the full file.");
      toast.error("Unexpected preview error — download is available as fallback.", { autoClose: 6500 });
    } finally {
      setPreviewLoading(false);
    }
  };

  const getCategoryInfo = (category) => {
    const map = {
      'Past Questions':    { icon: ScrollText,  color: 'from-amber-500 to-orange-600' },
      'PDF Notes':         { icon: FileText,    color: 'from-blue-500 to-cyan-600' },
      'Video Tutorials':   { icon: Video,       color: 'from-purple-500 to-pink-600' },
      'Technical Reviews': { icon: BookOpen,    color: 'from-emerald-500 to-teal-600' },
    };
    return map[category] ?? { icon: FileText, color: 'from-slate-500 to-slate-700' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
          <p className="text-slate-500 dark:text-slate-400">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 md:space-y-8">

        <div className="text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Educational Materials
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <span className="font-medium">
              {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 's' : ''}
            </span>
            {hasActiveFilters && (
              <span className="text-sm text-violet-600 dark:text-violet-400 font-medium">(filtered)</span>
            )}
          </p>
        </div>

        <div className="sticky top-0 z-10 -mx-4 px-4 py-4 bg-gradient-to-b from-slate-50/90 to-slate-50/70 dark:from-slate-950/90 dark:to-slate-950/70 backdrop-blur-sm md:static md:bg-transparent md:backdrop-blur-none md:py-0 md:-mx-0">
          <Schools onFiltersChange={handleFiltersChange} />
        </div>

        {filteredMaterials.length === 0 ? (
          <div className="bg-white/70 dark:bg-slate-800/70 rounded-2xl p-10 md:p-16 text-center border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
            <Eye className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-4 opacity-70" />
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">
              No materials found
            </h3>
            <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Try adjusting your filters or check back later for new content.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMaterials.map((material) => {
              const { icon: CategoryIcon, color } = getCategoryInfo(material.category);
              const isFavorited = favoritedIds.has(material.id);
              const isDownloading = downloadingId === material.id;
              const price = getMaterialPriceInCoins(material.category);
              const isOwner = currentUser?.uid === material.ownerUid;
              const canAfford = isOwner || (profile?.coins ?? 0) >= price;

              return (
                <div
                  key={material.id}
                  className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200/70 dark:border-slate-700/60 overflow-hidden hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 flex flex-col h-full relative"
                >
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center flex-shrink-0 ring-1 ring-slate-200 dark:ring-slate-700">
                        <PersonStanding size={20} className="text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base leading-tight text-slate-900 dark:text-white line-clamp-2">
                          {material.title || material.name || 'Untitled Material'}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 line-clamp-1">
                          {material.course || '—'}
                        </p>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 truncate max-w-[55%]">
                        {material.school || '—'}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${color} text-white shadow-sm`}>
                        <CategoryIcon size={13} />
                        {material.category}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-slate-700/70 grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-700/70">
                    <button
                      onClick={() => toggleFavorite(material)}
                      className="py-4 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 active:bg-slate-100 transition-colors min-h-[52px]"
                    >
                      <Heart size={18} className={isFavorited ? 'fill-red-500 text-red-500' : ''} />
                      <span className="text-sm font-medium">{isFavorited ? 'Saved' : 'Save'}</span>
                    </button>

                    <button
                      onClick={() => openPreview(material)}
                      className="py-4 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 active:bg-slate-100 transition-colors min-h-[52px]"
                    >
                      <Eye size={18} />
                      <span className="text-sm font-medium">Preview</span>
                    </button>

                    <button
                      onClick={() => handleDownload(material)}
                      disabled={isDownloading || !canAfford}
                      className={`py-4 flex items-center justify-center gap-2 font-medium transition-colors min-h-[52px] ${
                        !canAfford
                          ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed'
                          : isDownloading
                          ? 'text-violet-600'
                          : 'text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/30 active:bg-violet-100'
                      }`}
                    >
                      {isDownloading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Download size={18} />
                      )}
                      <span>
                        {isDownloading
                          ? 'Preparing…'
                          : isOwner
                          ? 'Free'
                          : `${price} coin${price !== 1 ? 's' : ''}`}
                      </span>
                    </button>
                  </div>

                  {!isOwner && (
                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/80 px-2.5 py-1 rounded-full text-xs font-medium text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800/40 shadow-sm">
                      {price} coin{price !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Preview Modal ──────────────────────────────────────────────────────── */}
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
                  
                  <div className="space-y-4 max-w-lg">
                    <p className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                      {previewError}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400">
                      Previews can fail if the file is missing from storage, if permissions are restricted, or due to temporary issues with our file host (Storj).
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      The full file is still available for download if you have sufficient coins.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    <button
                      onClick={() => {
                        setPreviewMaterial(null);
                        setPreviewUrl(null);
                        setPreviewError(null);
                      }}
                      className="px-8 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg font-medium transition-colors min-w-[140px]"
                    >
                      Close
                    </button>

                    <button
                      onClick={() => openPreview(previewMaterial)}
                      disabled={previewLoading}
                      className="px-8 py-3 bg-violet-100 hover:bg-violet-200 dark:bg-violet-900/40 dark:hover:bg-violet-800/60 text-violet-700 dark:text-violet-300 rounded-lg font-medium transition-colors flex items-center gap-2 min-w-[160px] justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {previewLoading && <Loader2 size={18} className="animate-spin" />}
                      Retry Preview
                    </button>

                    <button
                      onClick={() => {
                        handleDownload(previewMaterial);
                        setPreviewMaterial(null);
                        setPreviewUrl(null);
                        setPreviewError(null);
                      }}
                      className="px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium shadow-md transition-all flex items-center gap-2 min-w-[180px] justify-center"
                    >
                      <Download size={18} />
                      Download Full File
                    </button>
                  </div>
                </div>
              ) : previewUrl ? (
                previewMaterial.category?.toLowerCase().includes('video') ? (
                  <video
                    src={previewUrl}
                    controls
                    autoPlay
                    className="w-full max-h-[75vh] rounded-lg shadow-md mx-auto"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <iframe
                    src={previewUrl}
                    className="w-full h-[70vh] md:h-[80vh] rounded-lg border border-slate-200 dark:border-slate-700"
                    title="Material Preview"
                    allowFullScreen
                    sandbox="allow-scripts allow-same-origin allow-popups"
                  />
                )
              ) : (
                <div className="h-96 flex items-center justify-center text-slate-500 dark:text-slate-400">
                  Preparing preview...
                </div>
              )}
            </div>

            <div className="p-4 border-t dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-900/30">
              This is a limited preview. Full {previewMaterial.category?.includes('Video') ? 'video' : 'document'} available for {getMaterialPriceInCoins(previewMaterial.category)} coin
              {getMaterialPriceInCoins(previewMaterial.category) !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Material;