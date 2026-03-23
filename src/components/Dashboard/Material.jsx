// Material.jsx - Complete with Fixed Follow Functionality
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
  Calendar, CheckCircle, AlertTriangle, Info
} from 'lucide-react';

// ── Firebase Imports ──
import { db, storage, auth } from '@/firebase';
import {
  collection, query, orderBy, onSnapshot, doc, setDoc,
  deleteDoc, serverTimestamp, getDoc, runTransaction, getDocs,
  increment, addDoc, writeBatch, limit, where
} from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { createNotification } from '@/utils/notifications';
import { motion, AnimatePresence } from 'framer-motion';

// ── Helper Functions ──
const recordTransaction = async (userId, type, amountNGN, description, status = 'completed', extra = {}) => {
  if (!userId) return;
  try {
    const txCollection = collection(db, `users/${userId}/transactions`);
    await addDoc(txCollection, { type, amountNGN, description, status, timestamp: serverTimestamp(), ...extra });
  } catch (err) { console.error("Failed to record transaction:", err); }
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
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
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

  // Helper Functions
  const getDisplayName = (userId) => userProfiles[userId]?.name || 'User';
  const getUserInitials = (userId) => getDisplayName(userId).charAt(0).toUpperCase();
  const formatDate = (date) => {
    if (!date) return 'Just now';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Get material price in coins based on category
  const getMaterialPriceInCoins = (category) => {
    const map = {
      'Past Questions': 1,      // ₦100
      'PDF Notes': 2,           // ₦200
      'Video Tutorials': 4,     // ₦400
      'Technical Reviews': 3,   // ₦300
    };
    return map[category] ?? 2;
  };

  // Get NGN price from coins
  const getPriceInNGN = (category) => {
    const priceMap = {
      'Past Questions': 100,
      'PDF Notes': 200,
      'Video Tutorials': 400,
      'Technical Reviews': 300,
    };
    return priceMap[category] ?? 200;
  };

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
    if (!userId) return;
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

  // FIXED: Handle follow/unfollow with proper error handling
  const handleFollowUser = async (userId, userName) => {
    if (!currentUser) {
      toast.info("Please sign in to follow users");
      return;
    }
    
    if (userId === currentUser.uid) {
      toast.error("You cannot follow yourself");
      return;
    }
    
    // Set loading state
    setFollowingLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      const batch = writeBatch(db);
      const isCurrentlyFollowing = followingStatus[userId];
      
      if (!isCurrentlyFollowing) {
        // Add to current user's following
        const followingRef = doc(db, 'users', currentUser.uid, 'following', userId);
        batch.set(followingRef, {
          followedAt: serverTimestamp(),
          userName: userName,
          userPhoto: userProfiles[userId]?.photoURL || null,
          userRole: userProfiles[userId]?.role || 'user'
        });
        
        // Add to target user's followers
        const followerRef = doc(db, 'users', userId, 'followers', currentUser.uid);
        batch.set(followerRef, {
          followedAt: serverTimestamp(),
          userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Someone',
          userPhoto: currentUser.photoURL || null,
          userRole: profile?.role || 'user'
        });
        
        // Create notification for the user being followed
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
        // Remove from current user's following
        const followingRef = doc(db, 'users', currentUser.uid, 'following', userId);
        batch.delete(followingRef);
        
        // Remove from target user's followers
        const followerRef = doc(db, 'users', userId, 'followers', currentUser.uid);
        batch.delete(followerRef);
        
        await batch.commit();
        setFollowingStatus(prev => ({ ...prev, [userId]: false }));
        toast.success(`Unfollowed ${userName}`);
      }
      
      // Trigger notification update
      window.dispatchEvent(new CustomEvent('notificationUpdate'));
      
    } catch (err) {
      console.error("Error following/unfollowing user:", err);
      // Provide user-friendly error message
      if (err.code === 'permission-denied') {
        toast.error("You don't have permission to follow/unfollow users.");
      } else if (err.code === 'not-found') {
        toast.error("User not found.");
      } else if (err.message?.includes('network')) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Failed to update follow status. Please try again.");
      }
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

  const getCategoryInfo = (cat) => {
    const map = {
      'Past Questions': { icon: ScrollText, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700', border: 'border-amber-200', price: '1 coin (₦100)' },
      'PDF Notes': { icon: FileText, color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700', border: 'border-blue-200', price: '2 coins (₦200)' },
      'Video Tutorials': { icon: Video, color: 'from-purple-500 to-pink-600', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700', border: 'border-purple-200', price: '4 coins (₦400)' },
      'Technical Reviews': { icon: BookOpen, color: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700', border: 'border-emerald-200', price: '3 coins (₦300)' },
    };
    return map[cat] ?? { icon: FileText, color: 'from-slate-500 to-slate-700', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700', border: 'border-slate-200', price: '2 coins (₦200)' };
  };

  const renderPreviewContent = () => {
    if (previewLoading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="h-14 w-14 animate-spin text-indigo-600" /></div>;
    if (previewError) return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <AlertCircle size={72} className="text-red-400 mb-6" />
        <p className="text-xl font-medium">{previewError}</p>
        <button onClick={() => openPreview(previewMaterial)} className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">Try Again</button>
      </div>
    );
    if (!previewUrl) return null;
    if (fileType === 'video') return <video src={previewUrl} controls autoPlay playsInline className="w-full h-full max-h-[70vh] object-contain rounded-lg" controlsList="nodownload" onContextMenu={(e) => e.preventDefault()} />;
    if (fileType === 'image') return <img src={previewUrl} alt="Preview" className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg" onContextMenu={(e) => e.preventDefault()} />;
    if (fileType === 'pdf') return <iframe ref={pdfIframeRef} src={previewUrl} className="w-full h-[70vh] rounded-lg border-0" title="PDF Preview" sandbox="allow-same-origin allow-scripts allow-popups allow-forms" />;
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <FileArchive size={72} className="text-slate-400 mb-6" />
        <p className="text-xl font-medium">Preview Not Available</p>
        <button onClick={() => handleDownload(previewMaterial)} className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl flex items-center gap-2"><Download size={18} />Download to View</button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">Loading {materialId ? 'material' : 'materials'}...</p>
        </div>
      </div>
    );
  }

  if (materialId && materials.length === 0 && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Material Not Found</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">The material you're looking for doesn't exist or has been removed.</p>
          <button onClick={() => navigate('/materials')} className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">Browse All Materials</button>
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
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm mb-6">
              <Sparkles size={16} />
              <span>Curated Learning Resources</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              Premium Educational Materials
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-base md:text-lg text-white/90 max-w-2xl mx-auto">
              Access past questions, lecture notes, video tutorials, and technical reviews from Nigeria's top universities
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-3 mt-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/80 text-xs md:text-sm"><TrendingUp size={14} /><span>1,000+ Materials</span></div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/80 text-xs md:text-sm"><Users size={14} /><span>50,000+ Students</span></div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-white/80 text-xs md:text-sm"><Award size={14} /><span>Top Universities</span></div>
            </motion.div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent" />
        </div>
      )}

      {materialId && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button onClick={() => navigate('/materials')} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6 transition">
            <ChevronRight size={20} className="rotate-180" />
            <span>Back to all materials</span>
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        {/* Control Bar */}
        {!materialId && (
          <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-lg border border-slate-200/70 dark:border-slate-700/60 p-3 sm:p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 transition text-sm">
                  <Filter size={16} />
                  <span className="hidden sm:inline">Filters</span>
                  <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg p-1">
                  <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-md transition ${viewMode === 'grid' ? 'bg-white dark:bg-slate-600 shadow-sm' : ''}`}><Grid3x3 size={16} /></button>
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm' : ''}`}><List size={16} /></button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400"><Clock size={14} /><span>{filteredAndSortedMaterials.length} materials</span></div>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-2 py-1.5 sm:px-3 sm:py-2 bg-slate-100 dark:bg-slate-700 border-0 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500">
                  <option value="newest">Newest</option>
                  <option value="popular">Popular</option>
                  <option value="trending">Trending</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {!materialId && showFilters && (
          <div className="mb-6">
            <Schools onFiltersChange={handleFiltersChange} />
          </div>
        )}

        {/* Materials Grid/List */}
        {filteredAndSortedMaterials.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200/70 dark:border-slate-700/60">
            <div className="mx-auto w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4"><Eye className="h-8 w-8 text-slate-400" /></div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">No matches found</h3>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Try adjusting your filters</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' && !materialId ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6" : materialId ? "max-w-4xl mx-auto" : "space-y-3"}>
            {filteredAndSortedMaterials.map((material, idx) => {
              const { icon: CatIcon, bg: catBg, text: catText, price: categoryPrice } = getCategoryInfo(material.category);
              const isFavorited = favoritedIds.has(material.id);
              const isDownloading = downloadingId === material.id;
              const priceInCoins = getMaterialPriceInCoins(material.category);
              const priceInNGN = getPriceInNGN(material.category);
              const isOwner = currentUser?.uid === material.uid;
              const canAfford = isOwner || (profile?.coins ?? 0) >= priceInCoins;
              const isFollowingUploader = followingStatus[material.uid];
              const isFollowingLoading = followingLoading[material.uid];

              // Single Material View
              if (materialId) {
                return (
                  <div key={material.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/70 dark:border-slate-700/60 overflow-hidden">
                    <div className="relative bg-slate-100 dark:bg-slate-900 min-h-[400px] flex items-center justify-center p-8">{renderPreviewContent()}</div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${catBg} ${catText} text-sm font-medium`}><CatIcon size={14} /><span>{material.category || 'Material'}</span></div>
                        {!isOwner && <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium shadow-lg"><Zap size={14} /><span>{priceInCoins} coin{priceInCoins !== 1 ? 's' : ''} (₦{priceInNGN})</span></div>}
                      </div>
                      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">{material.title}</h1>
                      <div className="flex items-center gap-4 mb-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1"><Download size={14} />{material.downloads || 0} downloads</span>
                        <span className="flex items-center gap-1"><Star size={14} className="text-amber-500" />{material.averageRating?.toFixed(1) || 0}/5 ({material.reviewCount || 0} reviews)</span>
                        <span className="flex items-center gap-1"><Calendar size={14} />{formatDate(material.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-3 mb-6 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                        <button onClick={() => navigate(`/profile/${material.uid}`)} className="flex items-center gap-2 hover:opacity-80">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">{getUserInitials(material.uid)}</div>
                          <div><p className="font-medium text-slate-900 dark:text-white">{getDisplayName(material.uid)}</p><p className="text-xs text-slate-500">Uploader</p></div>
                        </button>
                        {currentUser && !isOwner && (
                          <button
                            onClick={() => handleFollowUser(material.uid, getDisplayName(material.uid))}
                            disabled={isFollowingLoading}
                            className={`ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${isFollowingLoading ? 'opacity-50 cursor-wait' : isFollowingUploader ? 'bg-green-100 text-green-700' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                          >
                            {isFollowingLoading ? <Loader2 size={14} className="animate-spin" /> : (isFollowingUploader ? <UserCheck size={14} /> : <UserPlus size={14} />)}
                            {isFollowingLoading ? '...' : (isFollowingUploader ? 'Following' : 'Follow')}
                          </button>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => handleDownload(material)} disabled={isDownloading || (!isOwner && !canAfford)} className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${isDownloading ? 'bg-indigo-100 text-indigo-700 animate-pulse' : isOwner ? 'bg-emerald-100 text-emerald-700' : canAfford ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                          {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                          {isOwner ? 'Download for Free' : `Download for ${priceInCoins} Coin${priceInCoins !== 1 ? 's' : ''} (₦{priceInNGN})`}
                        </button>
                        <button onClick={() => toggleFavorite(material)} className={`px-4 py-3 rounded-xl transition ${isFavorited ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500'}`}>
                          <Heart size={20} fill={isFavorited ? "currentColor" : "none"} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              // Grid View
              if (viewMode === 'grid') {
                return (
                  <motion.div key={material.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-xl border border-slate-200/70 dark:border-slate-700/60 overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => navigate(`/materials/${material.id}`)}>
                    <div className="relative h-28 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                      <div className={`absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full ${catBg} ${catText} text-xs font-medium`}><CatIcon size={12} /><span>{material.category || 'Material'}</span></div>
                      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs"><Eye size={10} /><span>{material.downloads || 0}</span></div>
                      {!isOwner && <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-medium shadow-lg"><Zap size={10} /><span>{priceInCoins}</span></div>}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/profile/${material.uid}`); }} className="flex items-center gap-2 hover:opacity-80 group">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-md">{getUserInitials(material.uid)}</div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition truncate max-w-[100px]">{getDisplayName(material.uid)}</span>
                        </button>
                        {currentUser && !isOwner && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleFollowUser(material.uid, getDisplayName(material.uid)); }}
                            disabled={isFollowingLoading}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium transition ${isFollowingLoading ? 'opacity-50 cursor-wait' : isFollowingUploader ? 'text-green-600' : 'text-slate-500 hover:text-indigo-600'}`}
                          >
                            {isFollowingLoading ? <Loader2 size={10} className="animate-spin" /> : (isFollowingUploader ? <UserCheck size={10} /> : <UserPlus size={10} />)}
                            <span>{isFollowingLoading ? '...' : (isFollowingUploader ? 'Following' : 'Follow')}</span>
                          </button>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 mb-2 text-sm sm:text-base">{material.title || 'Untitled Material'}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-0.5">{[...Array(5)].map((_, i) => (<Star key={i} size={12} className={i + 1 <= (material.averageRating || 0) ? "text-amber-500 fill-amber-500" : "text-slate-300"} />))}</div>
                        <span className="text-xs text-slate-500">({material.reviewCount || 0} reviews)</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                        <button onClick={(e) => { e.stopPropagation(); openPreview(material); }} className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition"><Eye size={12} />Preview</button>
                        <div className="flex items-center gap-1">
                          <button onClick={(e) => { e.stopPropagation(); toggleFavorite(material); }} className={`p-1.5 rounded-lg transition ${isFavorited ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}><Heart size={14} fill={isFavorited ? "currentColor" : "none"} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDownload(material); }} disabled={isDownloading || (!isOwner && !canAfford)} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition ${isDownloading ? 'bg-indigo-100 text-indigo-700 animate-pulse' : isOwner ? 'bg-emerald-100 text-emerald-700' : canAfford ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                            {isDownloading ? <Loader2 size={10} className="animate-spin" /> : <Download size={10} />}
                            {isOwner ? 'Free' : `${priceInCoins}`}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              }

              // List View
              return (
                <motion.div key={material.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/70 dark:border-slate-700/60 p-3 hover:shadow-md transition cursor-pointer" onClick={() => navigate(`/materials/${material.id}`)}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${getCategoryInfo(material.category).color} flex-shrink-0`}>{React.createElement(getCategoryInfo(material.category).icon, { size: 20, className: "text-white" })}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <button onClick={(e) => { e.stopPropagation(); navigate(`/profile/${material.uid}`); }} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">{getDisplayName(material.uid)}</button>
                        {currentUser && !isOwner && (
                          <button onClick={(e) => { e.stopPropagation(); handleFollowUser(material.uid, getDisplayName(material.uid)); }} disabled={isFollowingLoading} className={`text-xs ${isFollowingLoading ? 'opacity-50' : 'text-slate-500 hover:text-indigo-600'}`}>
                            {isFollowingLoading ? '...' : (isFollowingUploader ? 'Following' : 'Follow')}
                          </button>
                        )}
                        <div className="flex items-center gap-0.5 ml-2">{[...Array(5)].map((_, i) => (<Star key={i} size={10} className={i + 1 <= (material.averageRating || 0) ? "text-amber-500 fill-amber-500" : "text-slate-300"} />))}<span className="text-xs text-slate-500 ml-1">({material.reviewCount || 0})</span></div>
                      </div>
                      <h3 className="font-medium text-slate-900 dark:text-white truncate text-sm sm:text-base">{material.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500"><span>{material.course || 'General'}</span><span>•</span><span>{material.downloads || 0} downloads</span><span>•</span><span className="flex items-center gap-1"><Calendar size={10} />{formatDate(material.createdAt)}</span></div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); openPreview(material); }} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 hover:text-indigo-600 transition">View</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDownload(material); }} disabled={isDownloading || (!isOwner && !canAfford)} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0 transition ${isOwner ? 'bg-emerald-100 text-emerald-700' : canAfford ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>{isOwner ? 'Free' : `${priceInCoins}`}</button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewMaterial && (
        <div className={`fixed inset-0 z-[999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 ${isFullscreen ? 'p-0' : ''}`}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className={`bg-white dark:bg-slate-900 w-full rounded-2xl overflow-hidden flex flex-col ${isFullscreen ? 'h-screen w-screen rounded-none' : 'max-w-6xl max-h-[90vh]'}`}>
            <div className="px-5 py-3 border-b flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
              <div><h2 className="font-semibold text-lg">{previewMaterial.title}</h2><div className="flex items-center gap-2 mt-0.5"><p className="text-xs text-slate-500">{previewMaterial.course} • {previewMaterial.school}</p><div className="flex items-center gap-1"><Star size={12} className="text-amber-500 fill-amber-500" /><span className="text-xs font-medium">{averageRating || '0'}</span><span className="text-xs text-slate-400">({reviewCount} reviews)</span></div></div></div>
              <div className="flex gap-1"><button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"><Maximize2 size={16} /></button><button onClick={() => setPreviewMaterial(null)} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"><X size={16} /></button></div>
            </div>
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              <div className={`${isFullscreen ? 'flex-1' : 'lg:w-2/3'} flex flex-col relative bg-slate-50 dark:bg-slate-950`}>
                <div className="flex-1 overflow-auto p-4">{renderPreviewContent()}</div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none whitespace-nowrap">Preview Mode – Full Download Requires Coins</div>
              </div>
              <div className={`${isFullscreen ? 'w-80' : 'lg:w-1/3'} border-l border-slate-200 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-800`}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                  <div className="flex items-center justify-between">
                    <div><div className="flex items-center gap-2"><div className="text-3xl font-bold text-amber-600">{averageRating || '0'}</div><div className="text-sm text-slate-500">out of 5</div></div><div className="flex items-center gap-1 mt-1">{[...Array(5)].map((_, i) => (<Star key={i} size={16} className={i + 1 <= (averageRating || 0) ? "text-amber-500 fill-amber-500" : "text-slate-300"} />))}</div><p className="text-xs text-slate-500 mt-1">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</p></div>
                    <button onClick={() => { if (!currentUser) { toast.info("Please sign in to review"); return; } setShowReviewModal(true); }} className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition">Write a Review</button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2"><MessageCircle size={16} />Community Reviews</h4>
                  {reviews.length === 0 ? (
                    <div className="text-center py-8"><MessageCircle size={40} className="text-slate-300 mx-auto mb-3" /><p className="text-slate-500 text-sm">No reviews yet. Be the first to review!</p></div>
                  ) : (
                    reviews.slice(0, showAllReviews ? undefined : 3).map((review, idx) => (
                      <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-3">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{review.userName?.charAt(0).toUpperCase() || 'U'}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between flex-wrap gap-1"><p className="font-medium text-sm text-slate-900 dark:text-white">{review.userName}</p><span className="text-xs text-slate-400">{formatDate(review.createdAt)}</span></div>
                            <div className="flex items-center gap-0.5 mt-1">{[...Array(5)].map((_, i) => (<Star key={i} size={12} className={i + 1 <= (review.rating || 0) ? "text-amber-500 fill-amber-500" : "text-slate-300"} />))}</div>
                            {review.comment && <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{review.comment}</p>}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                  {reviews.length > 3 && !showAllReviews && (<button onClick={() => setShowAllReviews(true)} className="w-full py-2 text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium">View all {reviews.length} reviews →</button>)}
                </div>
              </div>
            </div>
            <div className="px-5 py-2 border-t text-center text-xs text-slate-500 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between"><span>Preview Mode – Full Download Requires Coins</span><button onClick={() => handleDownload(previewMaterial)} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition">Download for {getMaterialPriceInCoins(previewMaterial.category)} coin{getMaterialPriceInCoins(previewMaterial.category) !== 1 ? 's' : ''} (₦{getPriceInNGN(previewMaterial.category)})</button></div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowReviewModal(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
                <div className="flex items-center justify-between"><h3 className="text-lg font-semibold">Rate & Review</h3><button onClick={() => setShowReviewModal(false)} className="p-1 hover:bg-slate-200 rounded-lg"><X size={18} /></button></div>
                <p className="text-sm text-slate-500 mt-1">{previewMaterial?.title}</p>
              </div>
              <div className="p-5">
                <div className="text-center mb-5"><p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Your Rating</p><div className="flex justify-center gap-2" onMouseLeave={() => setHoveredStar(0)}>{[1,2,3,4,5].map((star) => (<button key={star} onClick={() => setUserRating(star)} onMouseEnter={() => setHoveredStar(star)} className="focus:outline-none transition-transform hover:scale-110"><Star size={32} className={`transition-all ${star <= (hoveredStar || userRating) ? "text-amber-500 fill-amber-500" : "text-slate-300"}`} /></button>))}</div></div>
                <div className="mb-5"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Your Review (Optional)</label><textarea value={userComment} onChange={(e) => setUserComment(e.target.value)} rows={4} placeholder="Share your experience with this material..." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition resize-none" /></div>
                <button onClick={handleSubmitReview} disabled={submittingReview || userRating === 0} className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2">{submittingReview ? <Loader2 className="h-5 w-5 animate-spin" /> : <ThumbsUp size={18} />}{submittingReview ? 'Submitting...' : 'Submit Review'}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Download Confirmation Modal */}
      {confirmDownload && (
        <div className="fixed inset-0 z-[1000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setConfirmDownload(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3"><div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full"><Zap size={20} className="text-amber-600" /></div><h3 className="text-lg font-semibold">Confirm Purchase</h3></div>
            <p className="text-slate-600 dark:text-slate-300 mb-5">"{confirmDownload.title}" costs <span className="font-bold text-indigo-600">{getMaterialPriceInCoins(confirmDownload.category)} coin{getMaterialPriceInCoins(confirmDownload.category) !== 1 ? 's' : ''} (₦{getPriceInNGN(confirmDownload.category)})</span>. The uploader will receive 60% in diamonds.</p>
            <div className="flex gap-3 justify-end"><button onClick={() => setConfirmDownload(null)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm">Cancel</button><button onClick={confirmAndProcessPaidDownload} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm flex items-center gap-1">Pay & Download <ChevronRight size={14} /></button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Material;