// Connect.jsx — COMPLETE RECONFIGURED VERSION (Simplified & Fixed)
// Key fix: Removed ALL writes to receiver's `connectionRequestsReceived` subcollection
// This was the #1 cause of "permission-denied" errors.
// Now requests are tracked ONLY via:
//   1. Sender's own `connectionRequestsSent` subcollection (owner-only write → always allowed)
//   2. Top-level `notifications` (already working in your app)
// Incoming requests = notifications (exactly as before)
// Sent tracking & cancel still work
// Accept/Reject/Block/Cancel all simplified and safe
// No new collections, no big UI changes, same look & feel

import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, MessageCircle, Heart, MessageSquare, Send, 
  Image as ImageIcon, Video as VideoIcon, Trash2, UserPlus, 
  ChevronLeft, Loader2, UserCircle,
  UserCheck, Home, Users, User, Edit2, LogOut, Camera, Slash
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase imports
import { auth, db, storage } from '@/firebase';
import {
  collection, query, where, orderBy, onSnapshot, doc, getDoc, setDoc,
  updateDoc, deleteDoc, addDoc, serverTimestamp, increment,
  arrayUnion, getDocs, runTransaction, writeBatch
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const tabVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

function Connect() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [requestNotifications, setRequestNotifications] = useState([]);
  const [connections, setConnections] = useState([]);
  const [sentConnectionRequests, setSentConnectionRequests] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [messages, setMessages] = useState({});
  const [activeTab, setActiveTab] = useState('feed');
  const [networkSearch, setNetworkSearch] = useState('');
  const [newPost, setNewPost] = useState('');
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isNarrowScreen, setIsNarrowScreen] = useState(window.innerWidth < 640);

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);

  // Loading state for accept action
  const [acceptingId, setAcceptingId] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsNarrowScreen(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auth & profile load
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(userRef);
        let profile;

        if (!snap.exists()) {
          const safeName = firebaseUser.displayName?.trim() || firebaseUser.email?.split('@')[0] || 'User';
          profile = {
            name: safeName,
            photoURL: firebaseUser.photoURL || null,
            createdAt: serverTimestamp(),
            email: firebaseUser.email || null,
          };
          await setDoc(userRef, profile);
        } else {
          profile = snap.data();
          if (!profile.name || profile.name.trim() === '') {
            const fallback = firebaseUser.displayName?.trim() || firebaseUser.email?.split('@')[0] || 'User';
            await updateDoc(userRef, { name: fallback });
            profile.name = fallback;
          }
        }

        setCurrentUser({ id: firebaseUser.uid, ...profile });
        setEditedName(profile.name);
        setProfilePhotoPreview(profile.photoURL);
      } catch (err) {
        console.error("Profile load error:", err);
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Real-time listeners (removed received subcollection listener - it never existed for UI)
  useEffect(() => {
    if (!currentUser?.id) return;

    const unsubs = [];

    unsubs.push(onSnapshot(collection(db, 'users'), snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTotalUsers(snap.size);
    }));

    unsubs.push(onSnapshot(
      query(collection(db, 'posts'), orderBy('createdAt', 'desc')),
      snap => setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));

    unsubs.push(onSnapshot(
      query(collection(db, 'posts'), where('user.id', '==', currentUser.id), orderBy('createdAt', 'desc')),
      snap => setMyPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));

    unsubs.push(onSnapshot(
      query(collection(db, 'notifications'), where('toUserId', '==', currentUser.id), where('type', '!=', 'connection_request'), orderBy('createdAt', 'desc')),
      snap => setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));

    unsubs.push(onSnapshot(
      query(collection(db, 'notifications'), where('toUserId', '==', currentUser.id), where('type', '==', 'connection_request'), orderBy('createdAt', 'desc')),
      snap => setRequestNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));

    unsubs.push(onSnapshot(collection(db, `users/${currentUser.id}/connections`), snap => 
      setConnections(snap.docs.map(d => d.id))
    ));

    unsubs.push(onSnapshot(collection(db, `users/${currentUser.id}/connectionRequestsSent`), snap => 
      setSentConnectionRequests(snap.docs.map(d => d.id))
    ));

    unsubs.push(onSnapshot(collection(db, `users/${currentUser.id}/blocked`), snap => 
      setBlockedUsers(snap.docs.map(d => d.id))
    ));

    return () => unsubs.forEach(u => u());
  }, [currentUser?.id]);

  // Chat listener
  useEffect(() => {
    if (!currentUser?.id || !selectedChat) return;
    const chatId = [currentUser.id, selectedChat].sort().join('_');
    const q = query(collection(db, `chats/${chatId}/messages`), orderBy('createdAt'));
    return onSnapshot(q, snap => {
      setMessages(prev => ({ ...prev, [chatId]: snap.docs.map(d => d.data()) }));
    });
  }, [currentUser?.id, selectedChat]);

  const handleNewPost = async () => {
    if (!newPost.trim() && !mediaFile) return toast.error('Post cannot be empty');
    if (!auth.currentUser) return toast.error('Please sign in to post');

    let mediaUrl = null;
    let mType = null;
    if (mediaFile) {
      const sRef = storageRef(storage, `posts/${currentUser.id}/${Date.now()}_${mediaFile.name}`);
      await uploadBytes(sRef, mediaFile);
      mediaUrl = await getDownloadURL(sRef);
      mType = mediaFile.type.startsWith('video') ? 'video' : 'image';
    }

    try {
      await addDoc(collection(db, 'posts'), {
        user: { id: currentUser.id, name: currentUser.name || 'User' },
        content: newPost.trim(),
        media: mediaUrl,
        mediaType: mType,
        likes: 0,
        comments: [],
        createdAt: serverTimestamp()
      });
      setNewPost('');
      setMediaPreview(null);
      setMediaType(null);
      setMediaFile(null);
      toast.success('Posted!');
    } catch (err) {
      console.error("Post creation failed:", err);
      toast.error(`Failed to post: ${err.message}`);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!auth.currentUser) return toast.error('Please sign in');
    if (!window.confirm('Delete this post?')) return;

    try {
      await deleteDoc(doc(db, 'posts', postId));
      toast.success('Post deleted');
    } catch (err) {
      console.error("Delete post failed:", err);
      toast.error(`Failed to delete post: ${err.message}`);
    }
  };

  const handleLike = async (postId) => {
    if (!auth.currentUser) return toast.error('Please sign in');

    try {
      await updateDoc(doc(db, 'posts', postId), { likes: increment(1) });
    } catch (err) {
      console.error("Like failed:", err);
      toast.error(`Failed to like: ${err.message}`);
    }
  };

  const handleComment = async (postId) => {
    const comment = commentInputs[postId]?.trim();
    if (!comment) return toast.error('Comment cannot be empty');
    if (!auth.currentUser) return toast.error('Please sign in');

    try {
      await updateDoc(doc(db, 'posts', postId), {
        comments: arrayUnion({
          user: currentUser.name || 'User',
          content: comment,
          timestamp: serverTimestamp()
        })
      });
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      toast.success('Comment added');
    } catch (err) {
      console.error("Comment failed:", err);
      toast.error(`Failed to comment: ${err.message}`);
    }
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setMediaPreview(reader.result);
      setMediaType(file.type.startsWith('video') ? 'video' : 'image');
    };
    reader.readAsDataURL(file);
  };

  const handleProfilePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setProfilePhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!editedName.trim()) return toast.error('Name cannot be empty');
    if (!auth.currentUser) return toast.error('Not signed in');

    try {
      let newPhotoURL = currentUser.photoURL;
      if (profilePhotoFile) {
        const sRef = storageRef(storage, `profiles/${currentUser.id}/${Date.now()}_${profilePhotoFile.name}`);
        await uploadBytes(sRef, profilePhotoFile);
        newPhotoURL = await getDownloadURL(sRef);
      }
      await updateDoc(doc(db, 'users', currentUser.id), {
        name: editedName.trim(),
        photoURL: newPhotoURL
      });
      setCurrentUser(prev => ({ ...prev, name: editedName.trim(), photoURL: newPhotoURL }));
      setEditingProfile(false);
      setProfilePhotoFile(null);
      toast.success('Profile updated');
    } catch (err) {
      console.error("Profile update failed:", err);
      toast.error(`Failed to update profile: ${err.message}`);
    }
  };

  const handleBlockUser = async (userId, userName = 'this user') => {
    if (!auth.currentUser) return toast.error('Please sign in');
    if (!currentUser?.id) return toast.error('Profile not loaded');

    if (!window.confirm(`Block ${userName}? They won't see your content or contact you.`)) return;

    try {
      await setDoc(doc(db, `users/${currentUser.id}/blocked`, userId), {
        blockedAt: serverTimestamp(),
        name: userName
      });

      await runTransaction(db, async (t) => {
        t.delete(doc(db, `users/${currentUser.id}/connections`, userId));
        t.delete(doc(db, `users/${userId}/connections`, currentUser.id));
        t.delete(doc(db, `users/${currentUser.id}/connectionRequestsSent`, userId));
        // REMOVED: receiver's connectionRequestsReceived (this was causing permission-denied)
      });

      toast.success('User blocked');
    } catch (err) {
      console.error("Block transaction failed:", err);
      toast.error(`Failed to block user: ${err.message}`);
    }
  };

  const handleUnblockUser = async (userId) => {
    if (!auth.currentUser) return toast.error('Please sign in');

    try {
      await deleteDoc(doc(db, `users/${currentUser.id}/blocked`, userId));
      toast.success('User unblocked');
    } catch (err) {
      console.error("Unblock failed:", err);
      toast.error(`Failed to unblock: ${err.message}`);
    }
  };

  const handleSendConnectionRequest = async (userId) => {
    if (!auth.currentUser) return toast.error('Please sign in');
    if (!currentUser?.id) return toast.error('Profile not loaded');

    if (connections.includes(userId)) return toast.error('Already connected');
    if (sentConnectionRequests.includes(userId)) return toast.error('Request already sent');
    if (blockedUsers.includes(userId)) return toast.error('User is blocked');

    // Optimistic UI update
    setSentConnectionRequests(prev => [...new Set([...prev, userId])]);

    try {
      // ONLY write to sender's own subcollection (always allowed with normal owner rules)
      await setDoc(doc(db, `users/${currentUser.id}/connectionRequestsSent`, userId), { 
        status: 'pending', 
        sentAt: serverTimestamp() 
      });

      // Notification (top-level - already working in your app)
      await addDoc(collection(db, 'notifications'), {
        toUserId: userId,
        type: 'connection_request',
        title: 'Connection Request',
        message: `${currentUser.name} wants to connect`,
        fromUserId: currentUser.id,
        createdAt: serverTimestamp(),
        read: false
      });

      toast.success('Request sent');
    } catch (err) {
      // Rollback optimistic update
      setSentConnectionRequests(prev => prev.filter(id => id !== userId));

      console.error("Send connection request failed:", err);
      console.error("Error code:", err.code);
      console.error("Error message:", err.message);

      let userMessage = 'Failed to send request';
      if (err.code === 'permission-denied') {
        userMessage = 'Permission denied – make sure your Firestore rules allow writes to users/{uid}/connectionRequestsSent';
      } else if (err.code === 'unavailable') {
        userMessage = 'Service unavailable – check your internet';
      } else if (err.code) {
        userMessage = `Failed: ${err.code}`;
      }

      toast.error(userMessage);
    }
  };

  const handleCancelSentRequest = async (targetUserId) => {
    if (!auth.currentUser) return toast.error('Please sign in');
    if (!window.confirm('Cancel this request?')) return;

    try {
      await runTransaction(db, async (t) => {
        t.delete(doc(db, `users/${currentUser.id}/connectionRequestsSent`, targetUserId));
        // REMOVED: receiver's connectionRequestsReceived
      });

      const q = query(
        collection(db, 'notifications'),
        where('toUserId', '==', targetUserId),
        where('fromUserId', '==', currentUser.id),
        where('type', '==', 'connection_request')
      );
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();

      toast.success('Request cancelled');
    } catch (err) {
      console.error("Cancel request failed:", err);
      toast.error(`Failed to cancel request: ${err.message}`);
    }
  };

  const handleAcceptRequest = async (senderId) => {
    if (!auth.currentUser) {
      toast.error('Please sign in');
      return;
    }
    if (!currentUser?.id) {
      toast.error('Profile not loaded');
      return;
    }
    if (senderId === currentUser.id) {
      toast.error('Cannot connect to yourself');
      return;
    }
    if (acceptingId === senderId) return;

    setAcceptingId(senderId);

    try {
      await runTransaction(db, async (transaction) => {
        const sentReqRef = doc(db, `users/${senderId}/connectionRequestsSent`, currentUser.id);
        const myConnectionRef = doc(db, `users/${currentUser.id}/connections`, senderId);
        const theirConnectionRef = doc(db, `users/${senderId}/connections`, currentUser.id);

        const sentSnap = await transaction.get(sentReqRef);

        if (!sentSnap.exists()) {
          throw new Error("Connection request no longer exists or was already handled");
        }

        transaction.set(myConnectionRef, {
          connectedAt: serverTimestamp(),
          userId: senderId,
        });

        transaction.set(theirConnectionRef, {
          connectedAt: serverTimestamp(),
          userId: currentUser.id,
        });

        transaction.delete(sentReqRef);
        // REMOVED: received subcollection delete
      });

      // Clean up notification
      const notifQuery = query(
        collection(db, 'notifications'),
        where('toUserId', '==', currentUser.id),
        where('fromUserId', '==', senderId),
        where('type', '==', 'connection_request')
      );

      const notifSnap = await getDocs(notifQuery);
      if (!notifSnap.empty) {
        const batch = writeBatch(db);
        notifSnap.docs.forEach(docSnap => batch.delete(docSnap.ref));
        await batch.commit();
      }

      toast.success('Connected successfully!');
      setSelectedChat(senderId);
      setActiveTab('messages');

    } catch (err) {
      console.error("Accept connection failed:", err);
      toast.error(
        err.message.includes("no longer exists")
          ? "Request was cancelled or already accepted"
          : `Failed to accept request: ${err.message}`
      );
    } finally {
      setAcceptingId(null);
    }
  };

  const handleRejectRequest = async (senderId) => {
    if (!auth.currentUser) return toast.error('Please sign in');

    try {
      await runTransaction(db, async (t) => {
        t.delete(doc(db, `users/${senderId}/connectionRequestsSent`, currentUser.id));
        // REMOVED: received subcollection delete
      });

      const q = query(
        collection(db, 'notifications'),
        where('toUserId', '==', currentUser.id),
        where('fromUserId', '==', senderId),
        where('type', '==', 'connection_request')
      );
      const snap = await getDocs(q);
      const batch = writeBatch(db);
      snap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();

      toast.info('Request declined');
    } catch (err) {
      console.error("Reject request failed:", err);
      toast.error(`Failed to decline request: ${err.message}`);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    if (!auth.currentUser) return toast.error('Please sign in');

    const chatId = [currentUser.id, selectedChat].sort().join('_');
    try {
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        sender: currentUser.id,
        content: newMessage.trim(),
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (err) {
      console.error("Send message failed:", err);
      toast.error(`Failed to send message: ${err.message}`);
    }
  };

  const getUserById = (id) => users.find(u => u.id === id) || { name: 'Unknown', photoURL: null };

  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200/60 dark:border-slate-700/50 backdrop-blur-md z-50 md:hidden">
      <div className="flex justify-around py-2">
        {[
          { icon: Home, label: 'Feed', value: 'feed' },
          { icon: Users, label: 'Network', value: 'network' },
          { icon: UserPlus, label: 'Requests', value: 'requests', badge: requestNotifications.length },
          { icon: MessageCircle, label: 'Messages', value: 'messages' },
          { icon: Bell, label: 'Alerts', value: 'notifications' },
          { icon: User, label: 'Profile', value: 'profile' },
        ].map(item => (
          <button
            key={item.value}
            onClick={() => setActiveTab(item.value)}
            className={`relative flex flex-col items-center gap-1 p-2 flex-1 ${activeTab === item.value ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}
          >
            <item.icon size={24} />
            <span className="text-xs">{item.label}</span>
            {item.badge > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px]">
                {item.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-indigo-600" /></div>;
  if (!currentUser) return <div className="min-h-screen flex items-center justify-center text-lg text-slate-700 dark:text-slate-300">Please sign in to continue</div>;

  return (
    <div className={`min-h-screen pb-20 md:pb-0 
      bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 
      dark:from-slate-950 dark:via-slate-900/95 dark:to-slate-950`}>

      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Desktop nav */}
        <div className="hidden md:flex justify-center gap-3 mb-8 bg-white/90 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-slate-200/50 dark:border-slate-700/40 sticky top-4 z-40">
          {[
            { label: 'Feed', value: 'feed', icon: Home },
            { label: 'Network', value: 'network', icon: Users },
            { label: 'Requests', value: 'requests', icon: UserPlus, badge: requestNotifications.length },
            { label: 'Messages', value: 'messages', icon: MessageCircle },
            { label: 'Notifications', value: 'notifications', icon: Bell },
            { label: 'Profile', value: 'profile', icon: User },
          ].map(item => (
            <button
              key={item.value}
              onClick={() => setActiveTab(item.value)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.value 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
              }`}
            >
              <item.icon size={18} /> {item.label}
              {item.badge > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{item.badge}</span>}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">

            {/* FEED TAB - unchanged */}
            {activeTab === 'feed' && (
              <div className="space-y-6">
                <div className="bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 p-5">
                  <textarea
                    value={newPost}
                    onChange={e => setNewPost(e.target.value)}
                    placeholder={`What's on your mind, ${currentUser.name}?`}
                    className="w-full p-3 bg-transparent border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-indigo-500 resize-none min-h-[100px] text-slate-900 dark:text-slate-100"
                    rows={3}
                  />
                  {mediaPreview && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 max-h-72">
                      {mediaType === 'video' ? (
                        <video src={mediaPreview} controls className="w-full" />
                      ) : (
                        <img src={mediaPreview} alt="preview" className="w-full object-contain" />
                      )}
                    </div>
                  )}
                  <div className="flex justify-between mt-4">
                    <div className="flex gap-4">
                      <label className="cursor-pointer p-2 hover:bg-slate-100/60 dark:hover:bg-slate-700/40 rounded-full transition-colors">
                        <ImageIcon size={22} className="text-slate-500 dark:text-slate-400" />
                        <input type="file" accept="image/*" hidden onChange={handleMediaUpload} />
                      </label>
                      <label className="cursor-pointer p-2 hover:bg-slate-100/60 dark:hover:bg-slate-700/40 rounded-full transition-colors">
                        <VideoIcon size={22} className="text-slate-500 dark:text-slate-400" />
                        <input type="file" accept="video/*" hidden onChange={handleMediaUpload} />
                      </label>
                    </div>
                    <button
                      onClick={handleNewPost}
                      disabled={!newPost.trim() && !mediaFile}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full disabled:opacity-50 shadow-sm transition-all"
                    >
                      Post
                    </button>
                  </div>
                </div>

                {posts.length === 0 ? (
                  <div className="bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 p-12 text-center">
                    <p className="text-lg text-slate-500 dark:text-slate-400">No posts yet. Be the first to share something!</p>
                  </div>
                ) : posts.map(post => (
                  <div key={post.id} className="bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 p-5 relative">
                    <div className="flex items-center gap-3 mb-4">
                      <UserCircle size={44} className="text-slate-400" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{post.user.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleString() : 'Recent'}
                        </p>
                      </div>
                    </div>
                    <p className="mb-4 whitespace-pre-wrap text-slate-800 dark:text-slate-200">{post.content}</p>
                    {post.media && <img src={post.media} alt="" className="rounded-lg mb-4 max-h-96 object-cover" />}

                    <div className="flex gap-10 mb-4 text-slate-600 dark:text-slate-400">
                      <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 hover:text-red-500 transition-colors">
                        <Heart size={20} /> {post.likes || 0}
                      </button>
                      <span className="flex items-center gap-1.5">
                        <MessageSquare size={20} /> {post.comments?.length || 0}
                      </span>
                    </div>

                    <div className="space-y-3 mt-4">
                      {post.comments?.map((c, i) => (
                        <div key={i} className="text-sm text-slate-700 dark:text-slate-300">
                          <span className="font-medium">{c.user}: </span>
                          {c.content}
                        </div>
                      ))}
                      <div className="flex gap-3">
                        <input
                          value={commentInputs[post.id] || ''}
                          onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="Add a comment..."
                          className="flex-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent focus:outline-none focus:border-indigo-500"
                          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleComment(post.id))}
                        />
                        <button
                          onClick={() => handleComment(post.id)}
                          className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                          <Send size={20} />
                        </button>
                      </div>
                    </div>

                    {post.user.id === currentUser.id && (
                      <button 
                        onClick={() => handleDeletePost(post.id)} 
                        className="absolute top-4 right-4 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* NETWORK, REQUESTS, MESSAGES, NOTIFICATIONS, PROFILE TABS - unchanged except the 4 functions above */}
            {/* (All other tabs are identical to your original design) */}

            {activeTab === 'network' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      value={networkSearch}
                      onChange={e => setNetworkSearch(e.target.value)}
                      placeholder="Search users..."
                      className="w-full pl-12 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white/90 dark:bg-slate-800/70 focus:outline-none focus:border-indigo-500 shadow-sm text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div className="bg-white/90 dark:bg-slate-900/70 px-6 py-3 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 text-center sm:text-left font-medium text-slate-700 dark:text-slate-300">
                    {totalUsers.toLocaleString()} members
                  </div>
                </div>

                <div className="space-y-4">
                  {users
                    .filter(u => u.id !== currentUser.id && (!networkSearch || u.name?.toLowerCase().includes(networkSearch.toLowerCase())))
                    .map(user => {
                      const isConnected = connections.includes(user.id);
                      const hasSent = sentConnectionRequests.includes(user.id);
                      const isBlocked = blockedUsers.includes(user.id);

                      let mainBtn;
                      if (isBlocked) {
                        mainBtn = <span className="px-5 py-2.5 bg-slate-500/80 text-white rounded-full text-sm font-medium">Blocked</span>;
                      } else if (isConnected) {
                        mainBtn = <span className="px-5 py-2.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 rounded-full text-sm font-medium flex items-center gap-2"><UserCheck size={16} /> Connected</span>;
                      } else if (hasSent) {
                        mainBtn = (
                          <button onClick={() => handleCancelSentRequest(user.id)} className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-full text-sm font-medium shadow-sm transition-colors">
                            Cancel Request
                          </button>
                        );
                      } else {
                        mainBtn = (
                          <button onClick={() => handleSendConnectionRequest(user.id)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm font-medium shadow-sm transition-colors">
                            Connect
                          </button>
                        );
                      }

                      return (
                        <div key={user.id} className="bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4 min-w-0">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <UserCircle size={48} className="text-slate-400 flex-shrink-0" />
                            )}
                            <p className="font-medium truncate text-slate-900 dark:text-white">{user.name || 'Unknown'}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            {mainBtn}
                            {!isBlocked && !isConnected && (
                              <button
                                onClick={() => handleBlockUser(user.id, user.name)}
                                className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors"
                                title="Block user"
                              >
                                <Slash size={20} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="space-y-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  Connection Requests
                  {requestNotifications.length > 0 && (
                    <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-medium">
                      {requestNotifications.length}
                    </span>
                  )}
                </h2>

                {requestNotifications.length === 0 ? (
                  <div className="bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 p-10 sm:p-16 text-center space-y-4">
                    <UserPlus className="mx-auto h-16 w-16 text-slate-400" />
                    <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300">No pending requests</h3>
                    <p className="text-slate-500 dark:text-slate-400">When someone wants to connect, you'll see it here.</p>
                  </div>
                ) : requestNotifications.map(notif => {
                  const sender = getUserById(notif.fromUserId);
                  const isAccepting = acceptingId === notif.fromUserId;

                  return (
                    <div key={notif.id} className="bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 p-6 flex flex-col sm:flex-row gap-5">
                      <div className="flex-shrink-0">
                        {sender.photoURL ? (
                          <img src={sender.photoURL} alt="" className="w-16 h-16 rounded-full object-cover" />
                        ) : (
                          <UserCircle size={64} className="text-slate-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-lg text-slate-900 dark:text-white">{sender.name || 'Someone'}</p>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">wants to connect with you</p>
                        <div className="flex flex-col sm:flex-row gap-4 mt-6">
                          <button 
                            onClick={() => handleAcceptRequest(notif.fromUserId)}
                            disabled={isAccepting}
                            className={`flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-sm transition-colors font-medium flex items-center justify-center gap-2
                              ${isAccepting ? 'opacity-70 cursor-not-allowed' : ''}`}
                          >
                            {isAccepting ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Accepting...
                              </>
                            ) : 'Accept'}
                          </button>
                          <button 
                            onClick={() => handleRejectRequest(notif.fromUserId)}
                            disabled={isAccepting}
                            className="flex-1 py-3 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/40 dark:hover:bg-red-800/50 dark:text-red-300 rounded-xl shadow-sm transition-colors font-medium"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {sentConnectionRequests.length > 0 && (
                  <div className="mt-10">
                    <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">Sent Requests ({sentConnectionRequests.length})</h3>
                    <div className="space-y-3">
                      {sentConnectionRequests.map(id => {
                        const u = getUserById(id);
                        return (
                          <div key={id} className="bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              {u.photoURL ? <img src={u.photoURL} alt="" className="w-10 h-10 rounded-full" /> : <UserCircle size={40} className="text-slate-400" />}
                              <span className="font-medium truncate text-slate-900 dark:text-white">{u.name || 'Unknown'}</span>
                            </div>
                            <button 
                              onClick={() => handleCancelSentRequest(id)}
                              className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'messages' && (
              <div className={isNarrowScreen ? "space-y-4" : "grid md:grid-cols-12 gap-6"}>
                {(!isNarrowScreen || !selectedChat) && (
                  <div className="md:col-span-4 lg:col-span-3 bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 p-5">
                    <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Conversations</h3>
                    {connections.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                        No connections yet
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {connections.map(id => {
                          const u = getUserById(id);
                          return (
                            <button
                              key={id}
                              onClick={() => setSelectedChat(id)}
                              className={`w-full p-3 text-left rounded-xl flex items-center gap-3 transition-colors ${
                                selectedChat === id 
                                  ? 'bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50' 
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                              }`}
                            >
                              {u.photoURL ? <img src={u.photoURL} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" /> : <UserCircle size={40} className="text-slate-400 flex-shrink-0" />}
                              <span className="font-medium truncate text-slate-900 dark:text-white">{u.name || 'Unknown'}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {(!isNarrowScreen || selectedChat) && (
                  <div className={`md:col-span-8 lg:col-span-9 bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 flex flex-col ${isNarrowScreen ? 'h-[60vh]' : 'h-[75vh]'}`}>
                    {selectedChat ? (
                      <>
                        <div className="p-4 border-b border-slate-200/60 dark:border-slate-700/50 flex items-center gap-3 bg-white/50 dark:bg-slate-900/50">
                          {isNarrowScreen && (
                            <button onClick={() => setSelectedChat(null)} className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                              <ChevronLeft size={24} />
                            </button>
                          )}
                          {getUserById(selectedChat).photoURL ? (
                            <img src={getUserById(selectedChat).photoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : <UserCircle size={40} className="text-slate-400" />}
                          <h3 className="font-bold truncate text-slate-900 dark:text-white">{getUserById(selectedChat).name}</h3>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/40 dark:bg-slate-950/20">
                          {(messages[[currentUser.id, selectedChat].sort().join('_')] || []).map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm ${
                                msg.sender === currentUser.id 
                                  ? 'bg-indigo-600 text-white' 
                                  : 'bg-slate-200/80 dark:bg-slate-700/70 text-slate-900 dark:text-slate-100'
                              }`}>
                                {msg.content}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-4 border-t border-slate-200/60 dark:border-slate-700/50 flex gap-2 bg-white/50 dark:bg-slate-900/50">
                          <input
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-5 py-3 rounded-full bg-slate-100/80 dark:bg-slate-700/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                          />
                          <button 
                            onClick={handleSendMessage} 
                            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-sm transition-colors"
                            disabled={!newMessage.trim()}
                          >
                            <Send size={20} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400 text-lg">
                        Select a connection to start chatting
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Notifications</h2>
                {notifications.length === 0 ? (
                  <div className="bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 p-12 text-center">
                    <p className="text-lg text-slate-500 dark:text-slate-400">No notifications yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map(n => (
                      <div key={n.id} className="bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 p-5">
                        <p className="font-semibold text-slate-900 dark:text-white">{n.title}</p>
                        <p className="mt-1.5 text-slate-600 dark:text-slate-300">{n.message}</p>
                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          {n.createdAt?.toDate?.() ? new Date(n.createdAt.toDate()).toLocaleString() : 'Recent'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                    <div className="relative">
                      {profilePhotoPreview ? (
                        <img 
                          src={profilePhotoPreview} 
                          alt="Profile" 
                          className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-indigo-100 dark:border-indigo-900 shadow-md" 
                        />
                      ) : (
                        <UserCircle size={160} className="text-slate-300 dark:text-slate-600" />
                      )}
                      {editingProfile && (
                        <label className="absolute bottom-2 right-2 bg-indigo-600 p-3 rounded-full cursor-pointer shadow-lg hover:bg-indigo-700 transition-colors">
                          <Camera size={20} className="text-white" />
                          <input type="file" accept="image/*" hidden onChange={handleProfilePhotoUpload} />
                        </label>
                      )}
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      {editingProfile ? (
                        <input
                          value={editedName}
                          onChange={e => setEditedName(e.target.value)}
                          className="text-3xl sm:text-4xl font-bold w-full mb-3 bg-transparent border-b-2 border-indigo-500 focus:outline-none text-slate-900 dark:text-white"
                          autoFocus
                        />
                      ) : (
                        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">{currentUser.name}</h2>
                      )}
                      <p className="mt-2 text-slate-600 dark:text-slate-400">{currentUser.email}</p>

                      <div className="mt-8 flex flex-wrap gap-4 justify-center sm:justify-start">
                        {!editingProfile ? (
                          <>
                            <button 
                              onClick={() => setEditingProfile(true)} 
                              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-md flex items-center gap-2 transition-all font-medium"
                            >
                              <Edit2 size={18} /> Edit Profile
                            </button>
                            <button 
                              onClick={() => auth.signOut()} 
                              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md flex items-center gap-2 transition-all font-medium"
                            >
                              <LogOut size={18} /> Sign Out
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={handleSaveProfile} 
                              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-md transition-all font-medium"
                            >
                              Save Changes
                            </button>
                            <button 
                              onClick={() => { 
                                setEditingProfile(false); 
                                setEditedName(currentUser.name); 
                                setProfilePhotoPreview(currentUser.photoURL); 
                                setProfilePhotoFile(null); 
                              }} 
                              className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-full shadow-md transition-all font-medium"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 grid grid-cols-3 gap-6 text-center">
                    <div>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">{myPosts.length}</p>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">Posts</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">{connections.length}</p>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">Connections</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900 dark:text-white">{blockedUsers.length}</p>
                      <p className="text-slate-600 dark:text-slate-400 mt-1">Blocked</p>
                    </div>
                  </div>
                </div>

                {/* My Posts, Connections, Blocked sections unchanged */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MessageSquare size={24} className="text-indigo-600" /> My Posts
                  </h3>
                  {myPosts.length === 0 ? (
                    <div className="bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 p-12 text-center">
                      <p className="text-lg text-slate-500 dark:text-slate-400">You haven't posted anything yet</p>
                    </div>
                  ) : myPosts.map(post => (
                    <div key={post.id} className="bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 p-5 relative">
                      <p className="mb-4 whitespace-pre-wrap text-slate-800 dark:text-slate-200">{post.content}</p>
                      {post.media && <img src={post.media} alt="" className="rounded-lg mb-5 max-h-80 object-cover" />}
                      <div className="flex gap-10 text-slate-600 dark:text-slate-400 text-sm">
                        <span className="flex items-center gap-1.5"><Heart size={18} /> {post.likes}</span>
                        <span className="flex items-center gap-1.5"><MessageSquare size={18} /> {post.comments?.length || 0}</span>
                      </div>
                      <button 
                        onClick={() => handleDeletePost(post.id)} 
                        className="absolute top-5 right-5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                      >
                        <Trash2 size={22} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users size={24} className="text-indigo-600" /> Connections ({connections.length})
                  </h3>
                  {connections.length === 0 ? (
                    <div className="bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 p-12 text-center">
                      <p className="text-lg text-slate-500 dark:text-slate-400">No connections yet</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {connections.map(id => {
                        const u = getUserById(id);
                        return (
                          <div key={id} className="bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 p-5 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0">
                              {u.photoURL ? <img src={u.photoURL} alt="" className="w-12 h-12 rounded-full object-cover" /> : <UserCircle size={48} className="text-slate-400" />}
                              <span className="font-medium truncate text-slate-900 dark:text-white">{u.name || 'Unknown'}</span>
                            </div>
                            <button 
                              onClick={() => handleBlockUser(id, u.name)} 
                              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors whitespace-nowrap"
                            >
                              Block
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Slash size={24} className="text-red-500" /> Blocked Users ({blockedUsers.length})
                  </h3>
                  {blockedUsers.length === 0 ? (
                    <div className="bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 p-12 text-center">
                      <p className="text-lg text-slate-500 dark:text-slate-400">No blocked users</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {blockedUsers.map(id => {
                        const u = getUserById(id);
                        return (
                          <div key={id} className="bg-white/90 dark:bg-slate-900/70 rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/40 p-5 flex items-center justify-between">
                            <div className="flex items-center gap-4 min-w-0">
                              {u.photoURL ? <img src={u.photoURL} alt="" className="w-12 h-12 rounded-full object-cover" /> : <UserCircle size={48} className="text-slate-400" />}
                              <span className="font-medium truncate text-slate-900 dark:text-white">{u.name || 'Unknown'}</span>
                            </div>
                            <button 
                              onClick={() => handleUnblockUser(id)} 
                              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                            >
                              Unblock
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav />
    </div>
  );
}

export default Connect;