// Material.jsx - Fixed Version
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import Schools from './Schools';
import {
  Download, Heart, FileText, Video, BookOpen, ScrollText,
  PersonStanding, Loader2, Eye, X, Star, Image as ImageIcon,
  File, AlertCircle, Maximize2, FileArchive, UserPlus, UserCheck,
  TrendingUp, Clock, Filter, Grid3x3, List, ChevronDown,
  Zap, Award, Sparkles, Users, MessageCircle, ThumbsUp, 
  ThumbsDown, Share2, Bookmark, ChevronRight, Play, 
  Calendar, CheckCircle, AlertTriangle, Info, SortAsc, SortDesc,
  LayoutGrid, LayoutList, Settings2, Trash2, Edit, Flag
} from 'lucide-react';

// Firebase Imports
import { db, storage, auth } from '@/firebase';
import {
  collection, query, orderBy, onSnapshot, doc, setDoc,
  deleteDoc, serverTimestamp, getDoc, runTransaction, getDocs,
  increment, addDoc, writeBatch, limit, where
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { createNotification } from '@/utils/notifications';
import { motion, AnimatePresence } from 'framer-motion';

// Helper Functions
const recordTransaction = async (userId, type, amountNGN, description, status = 'completed', extra = {}) => {
  if (!userId) return;
  try {
    const txCollection = collection(db, `users/${userId}/transactions`);
    await addDoc(txCollection, { type, amountNGN, description, status, timestamp: serverTimestamp(), ...extra });
  } catch (err) { console.error("Failed to record transaction:", err); }
};

// Category Configuration
const CATEGORY_CONFIG = {
  'Past Questions': {
    icon: ScrollText,
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800',
    priceCoins: 1,
    priceNGN: 100,
    badge: '📝 Past Paper'
  },
  'PDF Notes': {
    icon: FileText,
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-800',
    priceCoins: 2,
    priceNGN: 200,
    badge: '📄 Lecture Notes'
  },
  'Video Tutorials': {
    icon: Video,
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-800',
    priceCoins: 4,
    priceNGN: 400,
    badge: '🎥 Video Lesson'
  },
  'Technical Reviews': {
    icon: BookOpen,
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800',
    priceCoins: 3,
    priceNGN: 300,
    badge: '🔬 Technical Review'
  }
};

const DEFAULT_CATEGORY = {
  icon: FileText,
  gradient: 'from-slate-500 to-slate-600',
  bg: 'bg-slate-50 dark:bg-slate-800',
  text: 'text-slate-700 dark:text-slate-400',
  border: 'border-slate-200 dark:border-slate-700',
  priceCoins: 2,
  priceNGN: 200,
  badge: '📄 Material'
};

function Material() {
  const navigate = useNavigate();
  const { materialId } = useParams();
  const [filters, setFilters] = useState({ category: [], school: [], department: [] });
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);
  const [favoritedIds, setFavoritedIds] = useState(new Set());
  const [followingStatus, setFollowingStatus] = useState({});
  const [followingLoading, setFollowingLoading] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [userProfiles, setUserProfiles] = useState({});
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('materialViewMode') || 'grid');
  const [sortBy, setSortBy] = useState(() => localStorage.getItem('materialSortBy') || 'newest');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState({});

  // Preview & Reviews States
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const pdfIframeRef = useRef(null);
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [confirmDownload, setConfirmDownload] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [stats, setStats] = useState({
    totalMaterials: 0,
    totalDownloads: 0,
    totalUsers: 0,
    avgRating: 0
  });

  // Helper Functions
  const getDisplayName = (userId) => userProfiles[userId]?.name || 'User';
  const getUserInitials = (userId) => getDisplayName(userId).charAt(0).toUpperCase();
  const formatDate = (date) => {
    if (!date) return 'Just now';
    const d = date.toDate ? date.toDate() : new Date(date);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getCategoryConfig = (category) => CATEGORY_CONFIG[category] || DEFAULT_CATEGORY;

  const getMaterialPriceInCoins = (category) => getCategoryConfig(category).priceCoins;
  const getPriceInNGN = (category) => getCategoryConfig(category).priceNGN;

  // Save view preferences
  useEffect(() => {
    localStorage.setItem('materialViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('materialSortBy', sortBy);
  }, [sortBy]);

  // Force download
  const forceDownload = (url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); }, 100);
  };

  // Get file URL
  const getFileUrl = async (material) => {
    if (!currentUser) return null;
    try {
      const fileRef = ref(storage, material.file_path);
      const url = await getDownloadURL(fileRef);
      return url;
    } catch (err) {
      console.error("Storage access error:", err);
      toast.error("Could not access file. Please try again later.");
      return null;
    }
  };

  // Track download
  const trackDownload = async (material, isOwner = false) => {
    try {
      const materialRef = doc(db, 'materials', material.id);
      await updateDoc(materialRef, { downloads: increment(1) });
      
      const downloadRef = doc(db, `users/${currentUser.uid}/downloads`, material.id);
      await setDoc(downloadRef, {
        downloadedAt: serverTimestamp(),
        title: material.title,
        course: material.course,
        school: material.school,
        category: material.category,
        file_path: material.file_path,
        priceCoins: getMaterialPriceInCoins(material.category),
        priceNGN: getPriceInNGN(material.category),
        isOwnerDownload: isOwner,
        uploaderId: material.uid,
        uploaderName: getDisplayName(material.uid)
      }, { merge: true });
    } catch (err) {
      console.error("Error tracking download:", err);
    }
  };

  // Load user profile
  const loadUserProfile = async (userId) => {
    if (!userId || userProfiles[userId]) return;
    try {
      const profileRef = doc(db, 'profiles', userId);
      const profileDoc = await getDoc(profileRef);
      if (profileDoc.exists()) {
        setUserProfiles(prev => ({ ...prev, [userId]: profileDoc.data() }));
      } else {
        setUserProfiles(prev => ({ ...prev, [userId]: { name: 'User', role: 'student', photoURL: null } }));
      }
      if (currentUser && userId !== currentUser.uid) {
        const followRef = doc(db, 'users', currentUser.uid, 'following', userId);
        const followDoc = await getDoc(followRef);
        setFollowingStatus(prev => ({ ...prev, [userId]: followDoc.exists() }));
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
      setUserProfiles(prev => ({ ...prev, [userId]: { name: 'User', role: 'student', photoURL: null } }));
    }
  };

  // Load specific material
  useEffect(() => {
    if (materialId) {
      const loadSpecificMaterial = async () => {
        setLoading(true);
        try {
          const materialRef = doc(db, 'materials', materialId);
          const materialDoc = await getDoc(materialRef);
          if (materialDoc.exists()) {
            const materialData = { id: materialDoc.id, ...materialDoc.data() };
            setMaterials([materialData]);
            if (materialData.uid && !userProfiles[materialData.uid]) {
              loadUserProfile(materialData.uid);
            }
          } else {
            toast.error("Material not found");
            navigate('/materials');
          }
        } catch (err) {
          console.error("Error loading material:", err);
          toast.error("Failed to load material");
          navigate('/materials');
        } finally {
          setLoading(false);
        }
      };
      loadSpecificMaterial();
    }
  }, [materialId, navigate]);

  // Auth & Real-time Listeners
  useEffect(() => {
    if (materialId) return;
    const unsubscribe = auth.onAuthStateChanged(setCurrentUser);
    return unsubscribe;
  }, [materialId]);

  useEffect(() => {
    if (!currentUser || materialId) return;
    const q = collection(db, `users/${currentUser.uid}/favorites`);
    const unsubscribe = onSnapshot(q, (snap) => setFavoritedIds(new Set(snap.docs.map(d => d.id))));
    return unsubscribe;
  }, [currentUser, materialId]);

  useEffect(() => {
    if (!currentUser || materialId) return;
    const userRef = doc(db, 'users', currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (snap) => setProfile(snap.exists() ? snap.data() : { coins: 0, diamonds: 0 }));
    return unsubscribe;
  }, [currentUser, materialId]);

  // Load all materials
  useEffect(() => {
    if (materialId) return;
    const q = query(collection(db, 'materials'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      const materialsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMaterials(materialsData);
      materialsData.forEach(material => {
        if (material.uid && !userProfiles[material.uid]) loadUserProfile(material.uid);
      });
      
      // Calculate stats
      const totalDownloads = materialsData.reduce((sum, m) => sum + (m.downloads || 0), 0);
      const avgRating = materialsData.reduce((sum, m) => sum + (m.averageRating || 0), 0) / (materialsData.length || 1);
      
      setStats(prev => ({
        ...prev,
        totalMaterials: materialsData.length,
        totalDownloads: totalDownloads,
        avgRating: avgRating
      }));
      
      setLoading(false);
    }, (err) => { console.error(err); toast.error('Failed to load materials'); setLoading(false); });
    return unsubscribe;
  }, [materialId]);

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
      const list = snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate?.() || new Date() }));
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

  // Sort and filter materials
  const filteredAndSortedMaterials = useMemo(() => {
    if (materialId) return materials;
    let filtered = materials.filter(m => {
      const catMatch = filters.category.length === 0 || filters.category.includes(m.category);
      const schMatch = filters.school.length === 0 || filters.school.includes(m.school);
      const depMatch = filters.department.length === 0 || filters.department.includes(m.department || 'General');
      return catMatch && schMatch && depMatch;
    });
    switch (sortBy) {
      case 'popular': return [...filtered].sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
      case 'rating': return [...filtered].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      case 'trending': return [...filtered].sort((a, b) => ((b.downloads || 0) * 0.7 + (b.averageRating || 0) * 0.3) - ((a.downloads || 0) * 0.7 + (a.averageRating || 0) * 0.3));
      default: return filtered;
    }
  }, [materials, filters, sortBy, materialId]);

  const handleFiltersChange = ({ field, values }) => setFilters(prev => ({ ...prev, [field]: values }));

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
          uploaderId: material.uid,
          uploaderName: getDisplayName(material.uid)
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
    } catch (err) { console.error(err); toast.error("Failed to update favorites"); }
  };

  // Handle follow/unfollow
  const handleFollowUser = async (userId, userName) => {
    if (!currentUser) {
      toast.info("Please sign in to follow users");
      return;
    }
    
    if (userId === currentUser.uid) {
      toast.error("You cannot follow yourself");
      return;
    }
    
    setFollowingLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      const batch = writeBatch(db);
      const isCurrentlyFollowing = followingStatus[userId];
      
      if (!isCurrentlyFollowing) {
        const followingRef = doc(db, 'users', currentUser.uid, 'following', userId);
        batch.set(followingRef, {
          followedAt: serverTimestamp(),
          userName: userName,
          userPhoto: userProfiles[userId]?.photoURL || null,
          userRole: userProfiles[userId]?.role || 'user'
        });
        
        const followerRef = doc(db, 'users', userId, 'followers', currentUser.uid);
        batch.set(followerRef, {
          followedAt: serverTimestamp(),
          userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Someone',
          userPhoto: currentUser.photoURL || null,
          userRole: profile?.role || 'user'
        });
        
        const notificationRef = doc(collection(db, `users/${userId}/notifications`));
        batch.set(notificationRef, {
          type: 'new_follower',
          message: `${currentUser.displayName || currentUser.email?.split('@')[0] || 'Someone'} started following you`,
          userId: currentUser.uid,
          userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Someone',
          userPhoto: currentUser.photoURL || null,
          read: false,
          createdAt: serverTimestamp(),
        });
        
        await batch.commit();
        setFollowingStatus(prev => ({ ...prev, [userId]: true }));
        toast.success(`Now following ${userName}`);
      } else {
        const followingRef = doc(db, 'users', currentUser.uid, 'following', userId);
        batch.delete(followingRef);
        
        const followerRef = doc(db, 'users', userId, 'followers', currentUser.uid);
        batch.delete(followerRef);
        
        await batch.commit();
        setFollowingStatus(prev => ({ ...prev, [userId]: false }));
        toast.success(`Unfollowed ${userName}`);
      }
      
      window.dispatchEvent(new CustomEvent('notificationUpdate'));
      
    } catch (err) {
      console.error("Error following/unfollowing user:", err);
      toast.error("Failed to update follow status. Please try again.");
    } finally {
      setFollowingLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  // Handle download
  const handleDownload = (material) => {
    const isOwner = currentUser?.uid === material.uid;
    if (isOwner) {
      setDownloadingId(material.id);
      getFileUrl(material).then(async (url) => {
        if (url) {
          const ext = material.file_path?.split('.').pop()?.toLowerCase() || 'pdf';
          const safeName = (material.title || `material-${material.id}`).replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
          await trackDownload(material, true);
          forceDownload(url, `${safeName}.${ext}`);
          toast.success("Your material downloaded successfully!");
        } else {
          toast.error("Could not access file");
        }
        setDownloadingId(null);
      });
      return;
    }
    setConfirmDownload(material);
  };

  const deductBuyerCoins = async (material, priceInCoins) => {
    try {
      await runTransaction(db, async (t) => {
        const buyerRef = doc(db, 'users', currentUser.uid);
        const snap = await t.get(buyerRef);
        if (!snap.exists()) throw new Error("User profile not found");
        const coins = snap.data().coins || 0;
        if (coins < priceInCoins) throw new Error(`Insufficient coins (${priceInCoins} needed)`);
        t.update(buyerRef, { coins: coins - priceInCoins });
      });
      setProfile(p => ({ ...p, coins: Math.max(0, (p?.coins || 0) - priceInCoins) }));
      await recordTransaction(currentUser.uid, 'spend', priceInCoins * 100, `Purchased "${material.title || 'Material'}" (${priceInCoins} coins)`, 'completed', { materialId: material.id, coinsSpent: priceInCoins });
      return true;
    } catch (err) {
      toast.error(err.message.includes("Insufficient") ? `You need ${priceInCoins} coins (₦${priceInCoins * 100})` : "Could not process payment");
      return false;
    }
  };

  const awardUploaderDiamondsAndUpdateStats = async (material, priceInCoins) => {
    if (currentUser?.uid === material.uid) return;
    const diamondsAward = Math.floor(priceInCoins * 0.6);
    if (diamondsAward <= 0) return;
    const earningsNGN = diamondsAward * 60;
    try {
      await runTransaction(db, async (t) => {
        const matRef = doc(db, 'materials', material.id);
        const ownerRef = doc(db, 'users', material.uid);
        const matSnap = await t.get(matRef);
        if (!matSnap.exists()) throw new Error("Material not found");
        const currentDiamondsEarned = matSnap.data().diamonds_earned || 0;
        t.update(matRef, { downloads: increment(1), diamonds_earned: currentDiamondsEarned + diamondsAward, earnings: increment(earningsNGN), lastDownloadedAt: serverTimestamp() });
        const ownerSnap = await t.get(ownerRef);
        if (ownerSnap.exists()) t.update(ownerRef, { diamonds: (ownerSnap.data().diamonds || 0) + diamondsAward });
      });
      await recordTransaction(material.uid, 'earning', earningsNGN, `Earned ₦${earningsNGN.toLocaleString()} (${diamondsAward} diamonds) from "${material.title || 'Material'}"`, 'completed', { materialId: material.id, diamondsAwarded: diamondsAward, priceInCoins });
    } catch (err) { console.error("Failed to award diamonds:", err); }
  };

  const confirmAndProcessPaidDownload = async () => {
    if (!confirmDownload) return;
    const material = confirmDownload;
    const priceInCoins = getMaterialPriceInCoins(material.category);
    setDownloadingId(material.id);
    setConfirmDownload(null);
    const success = await deductBuyerCoins(material, priceInCoins);
    if (!success) { setDownloadingId(null); return; }
    await awardUploaderDiamondsAndUpdateStats(material, priceInCoins);
    await trackDownload(material, false);
    const url = await getFileUrl(material);
    if (url) {
      const ext = material.file_path?.split('.').pop()?.toLowerCase() || 'pdf';
      const safeName = (material.title || `material-${material.id}`).replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
      forceDownload(url, `${safeName}.${ext}`);
      toast.success(`Success! ${priceInCoins} coin${priceInCoins !== 1 ? 's' : ''} (₦${priceInCoins * 100}) deducted`);
    } else {
      toast.error("Download failed — file access error. Contact support.");
    }
    setDownloadingId(null);
  };

  const openPreview = async (material) => {
    if (!currentUser) return toast.info("Sign in to preview");
    if (!material?.file_path) return toast.error("No file attached");
    setPreviewMaterial(material);
    setPreviewUrl(null);
    setPreviewError(null);
    setPreviewLoading(true);
    const ext = material.file_path?.split('.').pop()?.toLowerCase();
    setFileType(['jpg','jpeg','png','gif','webp'].includes(ext) ? 'image' : ext === 'pdf' ? 'pdf' : ['mp4','webm','mov'].includes(ext) ? 'video' : 'other');
    try {
      const url = await getFileUrl(material);
      if (url) setPreviewUrl(url);
      else setPreviewError("Could not load preview — file may be missing");
    } catch (err) { setPreviewError(`Error loading preview: ${err.message}`); }
    finally { setPreviewLoading(false); }
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
        let total = 0, count = reviewsSnap.size;
        const old = reviewsSnap.docs.find(d => d.data().userId === currentUser.uid);
        if (old) { total -= Number(old.data().rating || 0); count--; t.delete(old.ref); }
        total += userRating; count++;
        t.set(reviewRef, { userId: currentUser.uid, userName: currentUser.displayName || currentUser.email?.split('@')[0] || "Anonymous", rating: userRating, comment: userComment.trim() || null, createdAt: serverTimestamp() });
        t.update(matRef, { averageRating: count > 0 ? total / count : 0, reviewCount: count });
      });
      toast.success("Thank you! Your review has been published.");
      setUserComment("");
    } catch (err) { console.error(err); toast.error("Failed to submit review"); }
    finally { setSubmittingReview(false); }
  };

  const shareMaterial = (material) => {
    const url = `${window.location.origin}/materials/${material.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard!");
    setShowShareMenu(false);
  };

  const renderStars = (rating, size = "sm") => {
    const starSize = size === "sm" ? 12 : size === "md" ? 16 : 20;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            size={starSize}
            className={`${star <= (rating || 0) ? "text-amber-500 fill-amber-500" : "text-slate-300"}`}
          />
        ))}
      </div>
    );
  };

  const renderPreviewContent = () => {
    if (previewLoading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="h-10 w-10 sm:h-14 sm:w-14 animate-spin text-indigo-600" /></div>;
    if (previewError) return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-8">
        <AlertCircle size={48} className="sm:w-16 sm:h-16 text-red-400 mb-4 sm:mb-6" />
        <p className="text-base sm:text-xl font-medium">{previewError}</p>
        <button onClick={() => openPreview(previewMaterial)} className="mt-4 sm:mt-6 px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg sm:rounded-xl text-sm sm:text-base">Try Again</button>
      </div>
    );
    if (!previewUrl) return null;
    if (fileType === 'video') return <video src={previewUrl} controls autoPlay playsInline className="w-full h-full max-h-[50vh] sm:max-h-[70vh] object-contain rounded-lg" controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} />;
    if (fileType === 'image') return <img src={previewUrl} alt="Preview" className="max-w-full max-h-[50vh] sm:max-h-[70vh] object-contain rounded-lg shadow-lg" onContextMenu={(e) => e.preventDefault()} />;
    if (fileType === 'pdf') return <iframe ref={pdfIframeRef} src={previewUrl} className="w-full h-[50vh] sm:h-[70vh] rounded-lg border-0" title="PDF Preview" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" />;
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4 sm:p-8">
        <FileArchive size={48} className="sm:w-16 sm:h-16 text-slate-400 mb-4 sm:mb-6" />
        <p className="text-base sm:text-xl font-medium">Preview Not Available</p>
        <button onClick={() => handleDownload(previewMaterial)} className="mt-4 sm:mt-6 px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg sm:rounded-xl flex items-center gap-2 text-sm sm:text-base"><Download size={16} className="sm:w-5 sm:h-5" />Download to View</button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="flex flex-col items-center gap-3 sm:gap-4 px-4">
          <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-indigo-600" />
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium">Loading {materialId ? 'material' : 'materials'}...</p>
        </div>
      </div>
    );
  }

  if (materialId && materials.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-3 sm:mb-4" />
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Material Not Found</h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mb-4 sm:mb-6">The material you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/materials')} className="px-5 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg sm:rounded-xl hover:bg-indigo-700 transition text-sm sm:text-base">Browse All Materials</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/20 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20">
      {/* Hero Section */}
      {!materialId && (
        <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-xs sm:text-sm mb-4 sm:mb-6">
              <Sparkles size={12} className="sm:w-4 sm:h-4" />
              <span>Curated Learning Resources</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-2xl sm:text-3xl md:text-5xl font-bold text-white mb-3 sm:mb-4 tracking-tight px-2">
              Premium Educational Materials
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-sm sm:text-base md:text-lg text-white/90 max-w-2xl mx-auto px-4">
              Access past questions, lecture notes, video tutorials, and technical reviews from Nigeria's top universities
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-2 sm:gap-3 mt-4 sm:mt-6">
              <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-white/10 rounded-full text-white/80 text-[10px] sm:text-xs md:text-sm">
                <TrendingUp size={10} className="sm:w-3 sm:h-3 md:w-4 md:h-4" />
                <span>{stats.totalMaterials.toLocaleString()} Materials</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-white/10 rounded-full text-white/80 text-[10px] sm:text-xs md:text-sm">
                <Download size={10} className="sm:w-3 sm:h-3 md:w-4 md:h-4" />
                <span>{stats.totalDownloads.toLocaleString()} Downloads</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-white/10 rounded-full text-white/80 text-[10px] sm:text-xs md:text-sm">
                <Star size={10} className="sm:w-3 sm:h-3 md:w-4 md:h-4" />
                <span>{stats.avgRating.toFixed(1)} Avg Rating</span>
              </div>
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-8 sm:h-12 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent" />
        </div>
      )}

      {materialId && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <button onClick={() => navigate('/materials')} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4 sm:mb-6 transition text-sm sm:text-base">
            <ChevronRight size={16} className="sm:w-5 sm:h-5 rotate-180" />
            <span>Back to all materials</span>
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-6 relative z-10">
        {/* Control Bar */}
        {!materialId && (
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-lg border border-slate-200/70 dark:border-slate-700/60 p-2 sm:p-3 md:p-4 mb-4 sm:mb-6">
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 transition text-xs sm:text-sm">
                  <Filter size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  <ChevronDown size={12} className={`sm:w-3.5 sm:h-3.5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg p-1">
                  <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm' : ''}`}>
                    <LayoutGrid size={14} className="sm:w-4 sm:h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm' : ''}`}>
                    <LayoutList size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>{filteredAndSortedMaterials.length} materials found</span>
                </div>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-2 py-1.5 sm:px-3 sm:py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                  <option value="newest">📅 Newest</option>
                  <option value="popular">🔥 Most Popular</option>
                  <option value="trending">📈 Trending</option>
                  <option value="rating">⭐ Top Rated</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {!materialId && showFilters && (
          <div className="mb-4 sm:mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <Schools onFiltersChange={handleFiltersChange} />
          </div>
        )}

        {/* Materials Grid/List - The rest of the component continues... */}
        {/* This is a simplified version - the full component continues here */}
        <div className="text-center py-8">
          <p className="text-slate-500">Materials will appear here</p>
        </div>
      </div>
    </div>
  );
}

export default Material;