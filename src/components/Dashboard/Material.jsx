// Material.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import Schools from './Schools';
import {
  Download, Heart, FileText, Video, BookOpen, ScrollText,
  PersonStanding, Loader2, Eye, X, Star
} from 'lucide-react';

// ── react-pdf imports ───────────────────────────────────────────────────────
import { Document, Page, pdfjs } from 'react-pdf';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// ── Firebase ────────────────────────────────────────────────────────────────
import { db, storage, auth } from '@/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
  runTransaction,
  getDocs,
  increment,
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

import { createNotification } from '@/utils/notifications';

// ── Helper: Record transaction ──
const addTransaction = async (userId, type, amountNGN, description, status = 'completed', metadata = {}) => {
  if (!userId) return;
  try {
    const txRef = doc(collection(db, `users/${userId}/transactions`));
    await setDoc(txRef, {
      type, amountNGN, description, status,
      createdAt: serverTimestamp(),
      ...metadata,
    });
  } catch (err) {
    console.error("Transaction record failed:", err);
  }
};

function Material() {
  const [filters, setFilters] = useState({ category: [], school: [], department: [] });
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [favoritedIds, setFavoritedIds] = useState(new Set());

  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // Preview & Reviews
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  // PDF page navigation
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Confirmation modal state for coin-spending downloads
  const [confirmDownload, setConfirmDownload] = useState(null);

  // ── Auth & Real-time Listeners ─────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setCurrentUser);
    return unsubscribe;
  }, []);

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

  useEffect(() => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => {
      setProfile(snap.exists() ? snap.data() : { coins: 0, diamonds: 0 });
    }, console.error);
    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    const q = query(collection(db, 'materials'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setMaterials(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      console.error(err);
      toast.error('Failed to load materials');
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Reviews listener
  useEffect(() => {
    if (!previewMaterial?.id) {
      setReviews([]);
      setAverageRating(0);
      setReviewCount(0);
      setUserRating(0);
      setUserComment("");
      return;
    }

    const reviewsCol = collection(db, `materials/${previewMaterial.id}/reviews`);
    const q = query(reviewsCol, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setReviews(list);

      if (list.length > 0) {
        const sum = list.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
        setAverageRating((sum / list.length).toFixed(1));
        setReviewCount(list.length);
      } else {
        setAverageRating(0);
        setReviewCount(0);
      }

      const myReview = list.find(r => r.userId === currentUser?.uid);
      setUserRating(myReview ? Number(myReview.rating) : 0);
      setUserComment(myReview?.comment || "");
    }, console.error);

    return unsubscribe;
  }, [previewMaterial?.id, currentUser?.uid]);

  const handleFiltersChange = ({ field, values }) => {
    setFilters(prev => ({ ...prev, [field]: values }));
  };

  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const catMatch = filters.category.length === 0 || filters.category.includes(m.category);
      const schMatch = filters.school.length === 0 || filters.school.includes(m.school);
      const depMatch = filters.department.length === 0 || filters.department.includes(m.department || 'General');
      return catMatch && schMatch && depMatch;
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

  // ── Core Handlers ──────────────────────────────────────────────────────────

  const toggleFavorite = async (material) => {
    if (!currentUser) return toast.info("Please sign in to save");
    const favRef = doc(db, `users/${currentUser.uid}/favorites`, material.id);
    try {
      const exists = (await getDoc(favRef)).exists();
      if (exists) {
        await deleteDoc(favRef);
        toast.info("Removed from favorites");
      } else {
        await setDoc(favRef, {
          addedAt: serverTimestamp(),
          title: material.title || 'Untitled',
          course: material.course || '—',
          school: material.school || '—',
          category: material.category || 'Material',
        });
        toast.success("Added to favorites ❤️");
        await createNotification(currentUser.uid, {
          type: "favorite",
          message: `You favorited "${material.title || 'Material'}"`,
          targetId: material.id,
          targetType: "material",
          targetTitle: material.title || 'Untitled',
          actorId: currentUser.uid,
          actorName: currentUser.displayName || "You",
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update favorites");
    }
  };

  const deductCoinsAndRecord = async (material, price) => { 
    try {
      await runTransaction(db, async (t) => {
        const buyerRef = doc(db, 'users', currentUser.uid);
        const snap = await t.get(buyerRef);
        if (!snap.exists()) throw new Error("User not found");
        const coins = snap.data().coins || 0;
        if (coins < price) throw new Error("Insufficient coins");
        t.update(buyerRef, { coins: coins - price });
      });

      setProfile(p => ({ ...p, coins: Math.max(0, (p?.coins || 0) - price) }));

      await addTransaction(currentUser.uid, 'spend', price * 100, `Spent ${price} coin${price !== 1 ? 's' : ''} on "${material.title || 'Material'}"`, 'completed', { materialId: material.id, coinsSpent: price });

      const dlRef = doc(db, `users/${currentUser.uid}/downloads`, material.id);
      await setDoc(dlRef, {
        downloadedAt: serverTimestamp(),
        title: material.title || 'Untitled',
        course: material.course || '—',
        school: material.school || '—',
        category: material.category,
        file_path: material.file_path,
        coinsSpent: price,
        amountNGN: price * 100,
        isOwnerDownload: false,
      }, { merge: true });

      await createNotification(currentUser.uid, {
        type: "download",
        message: `Downloaded "${material.title || 'Material'}" (${price} coin${price !== 1 ? 's' : ''})`,
        targetId: material.id,
        targetType: "material",
        coinsSpent: price,
        actorId: currentUser.uid,
        actorName: currentUser.displayName || "You",
      });
      return true;
    } catch (err) {
      const msg = err.message.includes("Insufficient") ? `Need ${price} coin${price !== 1 ? 's' : ''}` : "Payment failed";
      toast.error(msg);
      return false;
    }
  };

  const incrementDownloadStats = async (material, price, isOwner) => { 
    if (isOwner) return;
    const diamonds = Math.floor(price * 0.6);
    if (diamonds <= 0) return;
    const matRef = doc(db, 'materials', material.id);
    const ownerRef = material.ownerUid ? doc(db, 'users', material.ownerUid) : null;
    try {
      await runTransaction(db, async (t) => {
        const snap = await t.get(matRef);
        if (!snap.exists()) return;
        t.update(matRef, { downloads: increment(1), diamonds_earned: increment(diamonds) });
        if (ownerRef) t.update(ownerRef, { diamonds: increment(diamonds) });
      });
    } catch (err) { console.warn(err); }
  };

  const forceDownload = (url, filename) => {
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.style.display = 'none';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const getFileUrl = async (material, isPreview = false) => {
    if (!currentUser) return toast.info("Please sign in") || null;

    try {
      let url = await getDownloadURL(ref(storage, material.file_path));
      if (isPreview) url += '?alt=media';
      return url;
    } catch (err) {
      console.error("Storage error:", err);
      toast.error(isPreview ? "Preview unavailable" : "Could not access file");
      return null;
    }
  };

  const handleDownload = (material) => {
    const isOwner = currentUser?.uid === material.ownerUid;

    if (isOwner) {
      setDownloadingId(material.id);
      getFileUrl(material, false).then(url => {
        if (url) {
          const ext = material.file_path.split('.').pop()?.toLowerCase() || 'pdf';
          const safe = (material.title || `material-${material.id}`).replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
          forceDownload(url, `${safe}.${ext}`);
          toast.success("Downloaded!");
        }
      });
      return;
    }

    setConfirmDownload(material);
  };

  const openPreview = async (material) => {
    if (!currentUser) return toast.info("Sign in to preview");
    if (!material?.file_path) return toast.error("No file attached");

    setPreviewMaterial(material);
    setPreviewUrl(null);
    setPreviewError(null);
    setNumPages(null);
    setCurrentPage(1);
    setPreviewLoading(true);

    const url = await getFileUrl(material, true);
    if (url) {
      setPreviewUrl(url);
    } else {
      setPreviewError("Could not load preview — file may be missing");
    }

    setPreviewLoading(false);
  };

  const handleSubmitReview = async () => {
    if (!currentUser) return toast.info("Please sign in");
    if (userRating < 1) return toast.warn("Please select a rating");

    setSubmittingReview(true);

    try {
      const matId = previewMaterial.id;
      const reviewRef = doc(collection(db, `materials/${matId}/reviews`));
      const matRef = doc(db, 'materials', matId);

      await runTransaction(db, async (t) => {
        const matSnap = await t.get(matRef);
        if (!matSnap.exists()) throw new Error("Material not found");

        const reviewsSnap = await getDocs(collection(db, `materials/${matId}/reviews`));
        let total = 0;
        let count = reviewsSnap.size;

        const old = reviewsSnap.docs.find(d => d.data().userId === currentUser.uid);
        if (old) {
          total -= Number(old.data().rating || 0);
          count--;
          t.delete(old.ref);
        }

        total += userRating;
        count++;

        const newAvg = count > 0 ? total / count : 0;

        t.set(reviewRef, {
          userId: currentUser.uid,
          userName: currentUser.displayName || currentUser.email?.split('@')[0] || "Anonymous",
          rating: userRating,
          comment: userComment.trim() || null,
          createdAt: serverTimestamp(),
        });

        t.update(matRef, { averageRating: newAvg, reviewCount: count });
      });

      toast.success("Thank you! Your review has been published.");
      setUserComment("");
    } catch (err) {
      console.error("Review submission failed:", err);
      let userMessage = "Failed to submit review";
      if (err.code === 'permission-denied') {
        userMessage = "Permission denied — check Firestore security rules";
      } else if (err.message.includes("Material not found")) {
        userMessage = "Material no longer exists";
      }
      toast.error(userMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

  const getCategoryInfo = (cat) => {
    const map = {
      'Past Questions':    { icon: ScrollText,  color: 'from-amber-500 to-orange-600' },
      'PDF Notes':         { icon: FileText,    color: 'from-blue-500 to-cyan-600' },
      'Video Tutorials':   { icon: Video,       color: 'from-purple-500 to-pink-600' },
      'Technical Reviews': { icon: BookOpen,    color: 'from-emerald-500 to-teal-600' },
    };
    return map[cat] ?? { icon: FileText, color: 'from-slate-500 to-slate-700' };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-indigo-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading premium materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 pb-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 space-y-12">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
            <span className="text-xs tracking-[3px] font-mono uppercase text-violet-600 dark:text-violet-400">ACADEMIC HUB</span>
            <div className="h-px w-12 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
          </div>
          <h1 className="text-5xl font-bold tracking-tighter text-slate-900 dark:text-white">
            Premium Educational Materials
          </h1>
          <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Curated past questions, notes, videos & technical reviews from top Nigerian universities
          </p>
        </div>

        {/* Filters */}
        <div className="sticky top-4 z-20 -mx-6 px-6 py-5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-700 rounded-3xl shadow-sm">
          <Schools onFiltersChange={handleFiltersChange} />
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between text-sm">
          <p className="font-medium text-slate-700 dark:text-slate-300">
            {filteredMaterials.length} materials • {hasActiveFilters && "Filtered"}
          </p>
        </div>

        {/* Materials Grid */}
        {filteredMaterials.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-16 text-center border border-slate-200 dark:border-slate-700">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-6">
              <Eye className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-200">No matches found</h3>
            <p className="mt-3 text-slate-500 dark:text-slate-400">Try broadening your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredMaterials.map((material) => {
              const { icon: CatIcon, color } = getCategoryInfo(material.category);
              const isFavorited = favoritedIds.has(material.id);
              const isDownloading = downloadingId === material.id;
              const price = getMaterialPriceInCoins(material.category);
              const isOwner = currentUser?.uid === material.ownerUid;
              const canAfford = isOwner || (profile?.coins ?? 0) >= price;

              return (
                <div
                  key={material.id}
                  className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative"
                >
                  <div className="p-7 flex-1 flex flex-col">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center ring-1 ring-slate-200 dark:ring-slate-700">
                        <PersonStanding size={24} className="text-slate-500 dark:text-slate-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-xl leading-tight text-slate-900 dark:text-white line-clamp-2 group-hover:text-violet-600 transition-colors">
                          {material.title || 'Untitled Material'}
                        </h3>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-1">{material.course || '—'}</p>
                      </div>
                    </div>

                    {/* Average Rating */}
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="flex">
                        {[1,2,3,4,5].map(n => (
                          <Star
                            key={n}
                            size={18}
                            className={n <= (material.averageRating || 0) ? "text-amber-500 fill-amber-500" : "text-slate-200 dark:text-slate-700"}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-lg text-amber-600 dark:text-amber-400">
                        {material.averageRating ? Number(material.averageRating).toFixed(1) : "—"}
                      </span>
                      <span className="text-xs text-slate-500">({material.reviewCount || 0})</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-700 px-7 py-5 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{material.school || '—'}</span>
                    </div>
                    <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl text-xs font-medium bg-gradient-to-r ${color} text-white shadow-inner`}>
                      <CatIcon size={14} /> {material.category}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 border-t border-slate-200 dark:border-slate-700 divide-x divide-slate-200 dark:divide-slate-700">
                    <button
                      onClick={() => toggleFavorite(material)}
                      className="py-5 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                    >
                      <Heart size={19} className={isFavorited ? "fill-red-500 text-red-500" : ""} />
                      <span className="text-xs font-medium">Save</span>
                    </button>

                    <button
                      onClick={() => openPreview(material)}
                      className="py-5 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
                    >
                      <Eye size={19} />
                      <span className="text-xs font-medium">Preview</span>
                    </button>

                    <button
                      onClick={() => handleDownload(material)}
                      disabled={isDownloading || (!isOwner && !canAfford)}
                      className={`py-5 flex items-center justify-center gap-2 font-semibold transition-all ${isDownloading ? 'text-violet-600' : 'text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-950/50'}`}
                    >
                      {isDownloading ? <Loader2 size={19} className="animate-spin" /> : <Download size={19} />}
                      <span className="text-xs">
                        {isOwner ? 'Free' : `${price} coin${price !== 1 ? 's' : ''}`}
                      </span>
                    </button>
                  </div>

                  {!isOwner && (
                    <div className="absolute top-5 right-5 bg-white dark:bg-slate-800 shadow px-3 py-1 rounded-2xl text-xs font-medium text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                      {price} coins
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmDownload && (
          <div 
            className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setConfirmDownload(null)}
          >
            <div 
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">
                Confirm Download
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                This material costs{' '}
                <span className="font-bold text-violet-600 dark:text-violet-400">
                  {getMaterialPriceInCoins(confirmDownload.category)} coin
                  {getMaterialPriceInCoins(confirmDownload.category) !== 1 ? 's' : ''}
                </span>
                .<br /><br />
                Are you sure you want to spend coins and download it?
              </p>
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setConfirmDownload(null)}
                  className="px-6 py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setDownloadingId(confirmDownload.id);
                    getFileUrl(confirmDownload, false).then(url => {
                      if (url) {
                        const ext = confirmDownload.file_path.split('.').pop()?.toLowerCase() || 'pdf';
                        const safe = (confirmDownload.title || `material-${confirmDownload.id}`).replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
                        forceDownload(url, `${safe}.${ext}`);
                        toast.success(`Downloaded (${getMaterialPriceInCoins(confirmDownload.category)} coin${getMaterialPriceInCoins(confirmDownload.category) !== 1 ? 's' : ''} deducted)`);
                        incrementDownloadStats(confirmDownload, getMaterialPriceInCoins(confirmDownload.category), currentUser.uid === confirmDownload.ownerUid);
                      }
                    });
                    setConfirmDownload(null);
                  }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold shadow-md transition flex items-center gap-2"
                >
                  <Download size={18} />
                  Yes, Download
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Improved Preview Modal with Download Protection ─────────────────────────────── */}
        {previewMaterial && (
          <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden max-h-[96vh] flex flex-col">
              
              {/* Header */}
              <div className="px-8 py-6 border-b dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-900">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-white pr-8 line-clamp-1">
                    {previewMaterial.title || previewMaterial.name}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">{previewMaterial.course} • {previewMaterial.school}</p>
                </div>
                <button
                  onClick={() => { 
                    setPreviewMaterial(null); 
                    setPreviewUrl(null); 
                    setNumPages(null);
                    setCurrentPage(1);
                  }}
                  className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={26} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-slate-950 flex flex-col lg:flex-row gap-8 md:gap-10">
                
                {/* Preview Area with protection */}
                <div className="flex-1 flex flex-col relative">
                  {previewLoading ? (
                    <div className="flex-1 flex items-center justify-center rounded-3xl bg-white dark:bg-slate-800 min-h-[400px]">
                      <Loader2 className="h-14 w-14 animate-spin text-violet-600" />
                    </div>
                  ) : previewError ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center rounded-3xl bg-white dark:bg-slate-800 min-h-[400px] p-8">
                      <Eye size={72} className="text-slate-300 mb-6" />
                      <p className="text-xl font-medium text-slate-800 dark:text-slate-200">{previewError}</p>
                      <p className="mt-3 text-slate-500 dark:text-slate-400">
                        The file may be missing, corrupted, or restricted.
                      </p>
                    </div>
                  ) : previewUrl ? (
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full bg-black/5 dark:bg-black/20">
                      {previewMaterial.category?.toLowerCase().includes('video') ? (
                        <>
                          <video
                            src={previewUrl}
                            controls
                            autoPlay
                            muted
                            playsInline
                            className="w-full max-h-[65vh] object-contain"
                            onContextMenu={(e) => e.preventDefault()}
                            onDragStart={(e) => e.preventDefault()}
                            onError={() => setPreviewError("Failed to load video — file may be unavailable")}
                          />
                          <div 
                            className="absolute inset-0 z-10"
                            onContextMenu={(e) => e.preventDefault()}
                            onDragStart={(e) => e.preventDefault()}
                          />
                        </>
                      ) : (
                        <div className="flex flex-col h-full">
                          <div className="flex-1 overflow-auto p-4 flex items-start justify-center bg-slate-50 dark:bg-slate-950">
                            <div className="relative">
                              <Document
                                file={previewUrl}
                                onLoadSuccess={({ numPages }) => {
                                  setNumPages(numPages);
                                  setCurrentPage(1);
                                }}
                                onLoadError={(err) => {
                                  console.error("PDF load error:", err);
                                  setPreviewError("Could not load PDF preview");
                                }}
                                loading={
                                  <div className="flex-1 flex items-center justify-center min-h-[400px]">
                                    <Loader2 className="h-12 w-12 animate-spin text-violet-600" />
                                  </div>
                                }
                                error={
                                  <div className="flex-1 flex items-center justify-center min-h-[400px] text-red-600">
                                    Failed to load document
                                  </div>
                                }
                              >
                                <Page
                                  pageNumber={currentPage}
                                  width={Math.min(780, window.innerWidth - 140)}
                                  renderAnnotationLayer={false}
                                  renderTextLayer={true}
                                  className="shadow-lg mx-auto"
                                  onContextMenu={(e) => e.preventDefault()}
                                />
                              </Document>

                              {/* Overlay for right-click protection (non-blocking for normal interaction) */}
                              <div 
                                className="absolute inset-0 z-10"
                                onContextMenu={(e) => e.preventDefault()}
                                onDragStart={(e) => e.preventDefault()}
                              />
                            </div>
                          </div>

                          {numPages && numPages > 1 && (
                            <div className="flex items-center justify-center gap-8 py-4 bg-slate-100 dark:bg-slate-900 border-t dark:border-slate-700">
                              <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage <= 1}
                                className="px-6 py-2.5 rounded-xl bg-violet-100 hover:bg-violet-200 dark:bg-violet-950 dark:hover:bg-violet-900 text-violet-700 dark:text-violet-300 disabled:opacity-40 transition disabled:cursor-not-allowed font-medium"
                              >
                                Previous
                              </button>
                              
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                Page {currentPage} of {numPages}
                              </span>
                              
                              <button
                                onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                                disabled={currentPage >= numPages}
                                className="px-6 py-2.5 rounded-xl bg-violet-100 hover:bg-violet-200 dark:bg-violet-950 dark:hover:bg-violet-900 text-violet-700 dark:text-violet-300 disabled:opacity-40 transition disabled:cursor-not-allowed font-medium"
                              >
                                Next
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Visual indication – non-interactive */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/65 text-white text-sm px-5 py-2.5 rounded-full z-20 backdrop-blur-sm pointer-events-none border border-white/20 shadow-lg">
                        Preview Mode – Download Disabled
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Rating & Reviews Section */}
                <div className="lg:w-5/12 flex flex-col">
                  <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow border border-slate-100 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-semibold">Rate this material</h3>
                      {reviewCount > 0 && (
                        <div className="flex items-center gap-2 text-3xl font-bold text-amber-500">
                          ★ {averageRating}
                          <span className="text-base font-normal text-slate-400">/ 5</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center gap-3 mb-8" onMouseLeave={() => setHoveredStar(0)}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setUserRating(star)}
                          onMouseEnter={() => setHoveredStar(star)}
                          className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star
                            size={52}
                            className={`transition-all duration-200 ${
                              star <= (hoveredStar || userRating)
                                ? "text-amber-500 fill-amber-500 drop-shadow"
                                : "text-slate-200 dark:text-slate-700"
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      placeholder="Share your honest feedback... (optional)"
                      className="w-full h-32 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-transparent resize-y focus:outline-none focus:border-violet-500 text-base"
                    />

                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || userRating === 0}
                      className="mt-6 w-full py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold rounded-2xl shadow-lg disabled:opacity-50 flex items-center justify-center gap-3 transition-all"
                    >
                      {submittingReview && <Loader2 className="animate-spin h-5 w-5" />}
                      Submit Review
                    </button>
                  </div>

                  <div className="mt-8 flex-1">
                    <h4 className="font-semibold text-lg mb-5 flex items-center gap-3">
                      Community Reviews <span className="text-xs bg-slate-200 dark:bg-slate-700 px-3 py-1 rounded-full">({reviewCount})</span>
                    </h4>

                    {reviews.length > 0 ? (
                      <div className="space-y-7 overflow-y-auto max-h-[420px] pr-2 custom-scroll">
                        {reviews.map((review) => (
                          <div key={review.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 font-bold flex items-center justify-center rounded-full">
                                {review.userName?.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{review.userName}</p>
                                <div className="flex gap-0.5 mt-1">
                                  {[1,2,3,4,5].map((n) => (
                                    <Star
                                      key={n}
                                      size={16}
                                      className={n <= review.rating ? "text-amber-500 fill-amber-500" : "text-slate-200 dark:text-slate-700"}
                                    />
                                  ))}
                                </div>
                              </div>
                              <span className="text-xs text-slate-500 whitespace-nowrap">
                                {review.createdAt?.toDate?.()?.toLocaleDateString() || '—'}
                              </span>
                            </div>
                            {review.comment && (
                              <p className="mt-5 text-slate-700 dark:text-slate-300 leading-relaxed text-[15px]">
                                {review.comment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-700">
                        <p className="text-slate-500">No reviews yet. Be the first to rate!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="px-8 py-5 bg-slate-50 dark:bg-slate-900 border-t dark:border-slate-700 text-center text-sm text-slate-500 flex items-center justify-center gap-3">
                Preview is completely free • Full download costs {getMaterialPriceInCoins(previewMaterial.category)} coin
                {getMaterialPriceInCoins(previewMaterial.category) !== 1 ? 's' : ''} 
                {previewMaterial.ownerUid === currentUser?.uid && " (Free for you as owner)"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Material;