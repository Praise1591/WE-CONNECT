// Connect.jsx — Social network component with posts, connections, chat, and connection request notifications
// Mobile-optimized version (better experience on ~360–420px screens)

import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, MessageCircle, Heart, MessageSquare, Send, 
  Image as ImageIcon, Video as VideoIcon, X, Trash2, UserPlus, 
  ChevronLeft, Loader2, Moon, Sun, UserCircle,
  Check, UserCheck, UserX, UserMinus, Share2, Home, Users, Inbox
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

// ── Firebase ────────────────────────────────────────────────────────────────
import { auth, db, storage } from '@/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  increment,
  runTransaction,
  arrayUnion,
  getDocs
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';

const tabVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

function Connect() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [requestNotifications, setRequestNotifications] = useState([]);
  const [connections, setConnections] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
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
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isNarrowScreen, setIsNarrowScreen] = useState(window.innerWidth < 640);

  // ── Resize listener for mobile detection ────────────────────────────────
  useEffect(() => {
    const handleResize = () => setIsNarrowScreen(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ── Auth listener ───────────────────────────────────────────────────────
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

        let profile = snap.exists() ? snap.data() : {
          name: firebaseUser.displayName || 'User',
          photoURL: firebaseUser.photoURL || null,
          createdAt: serverTimestamp()
        };

        if (!snap.exists()) {
          await setDoc(userRef, profile);
        }

        setCurrentUser({ id: firebaseUser.uid, ...profile });
      } catch (err) {
        console.error("Profile error:", err);
        setError("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // ── Real-time data listeners ────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.id) {
      console.log("[Connect] No current user ID → skipping all real-time listeners");
      return;
    }

    console.log("[Connect] Attaching real-time listeners for user:", currentUser.id);

    const unsubs = [];

    // ── Users (all) ───────────────────────────────────────────────────────
    unsubs.push(
      onSnapshot(
        collection(db, 'users'),
        (snap) => {
          console.log("[users] Snapshot received — count:", snap.size);
          setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        },
        (err) => console.error("[users listener error]", err)
      )
    );

    // ── Posts (feed) ──────────────────────────────────────────────────────
    unsubs.push(
      onSnapshot(
        query(collection(db, 'posts'), orderBy('createdAt', 'desc')),
        (snap) => {
          console.log("[posts] Snapshot received — count:", snap.size);
          setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        },
        (err) => console.error("[posts listener error]", err)
      )
    );

    // ── Activity notifications ────────────────────────────────────────────
    // Note: requires composite index on toUserId + type + createdAt
    unsubs.push(
      onSnapshot(
        query(
          collection(db, 'notifications'),
          where('toUserId', '==', currentUser.id),
          where('type', '==', 'activity'),
          orderBy('createdAt', 'desc')
        ),
        (snap) => {
          console.log("[activity notifications] count:", snap.size);
          setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        },
        (err) => console.error("[activity notifications error]", err)
      )
    );

    // ── Connection request notifications ──────────────────────────────────
    // Note: requires composite index on toUserId + type + createdAt
    unsubs.push(
      onSnapshot(
        query(
          collection(db, 'notifications'),
          where('toUserId', '==', currentUser.id),
          where('type', '==', 'connection_request'),
          orderBy('createdAt', 'desc')
        ),
        (snap) => {
          console.log("[connection request notifs] count:", snap.size);
          setRequestNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        },
        (err) => console.error("[conn request notifs error]", err)
      )
    );

    // ── Connections subcollection ─────────────────────────────────────────
    unsubs.push(
      onSnapshot(
        collection(db, `users/${currentUser.id}/connections`),
        (snap) => {
          console.log("[connections] count:", snap.size);
          setConnections(snap.docs.map(d => d.id));
        },
        (err) => console.error("[connections error]", err)
      )
    );

    // ── Received connection requests ──────────────────────────────────────
    unsubs.push(
      onSnapshot(
        collection(db, `users/${currentUser.id}/connectionRequestsReceived`),
        (snap) => {
          console.log("[received requests] count:", snap.size);
          setConnectionRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        },
        (err) => console.error("[received requests error]", err)
      )
    );

    // ── Sent connection requests ──────────────────────────────────────────
    unsubs.push(
      onSnapshot(
        collection(db, `users/${currentUser.id}/connectionRequestsSent`),
        (snap) => {
          console.log("[sent requests] count:", snap.size);
          setSentConnectionRequests(snap.docs.map(d => d.id));
        },
        (err) => console.error("[sent requests error]", err)
      )
    );

    // ── Blocked users ─────────────────────────────────────────────────────
    unsubs.push(
      onSnapshot(
        collection(db, `users/${currentUser.id}/blocked`),
        (snap) => {
          console.log("[blocked] count:", snap.size);
          setBlockedUsers(snap.docs.map(d => d.id));
        },
        (err) => console.error("[blocked error]", err)
      )
    );

    return () => {
      console.log("[Connect] Cleaning up all listeners");
      unsubs.forEach(u => u());
    };
  }, [currentUser?.id]);

  // ── Chat messages ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.id || !selectedChat) {
      console.log("[chat] No user or no selected chat → skipping chat listener");
      return;
    }

    const chatId = [currentUser.id, selectedChat].sort().join('_');
    console.log("[chat] Attaching listener for chat:", chatId);

    const q = query(collection(db, `chats/${chatId}/messages`), orderBy('createdAt'));

    return onSnapshot(q, snap => {
      console.log(`[chat:${chatId}] messages received:`, snap.size);
      setMessages(prev => ({
        ...prev,
        [chatId]: snap.docs.map(d => d.data())
      }));
    }, err => console.error(`[chat:${chatId}] error:`, err));
  }, [currentUser?.id, selectedChat]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleNewPost = async () => {
    if (!newPost.trim() && !mediaFile) return toast.error('Post cannot be empty');

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
        user: { id: currentUser.id, name: currentUser.name },
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
      toast.error('Failed to post');
    }
  };

  const handleLike = async (postId) => {
    try {
      await updateDoc(doc(db, 'posts', postId), { likes: increment(1) });
    } catch (err) {
      toast.error('Failed to like');
    }
  };

  const handleComment = async (postId) => {
    const comment = commentInputs[postId]?.trim();
    if (!comment) return toast.error('Comment cannot be empty');

    try {
      await updateDoc(doc(db, 'posts', postId), {
        comments: arrayUnion({
          user: currentUser.name,
          content: comment,
          timestamp: serverTimestamp()
        })
      });
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to comment');
    }
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setMediaPreview(reader.result);
        setMediaType(file.type.startsWith('video') ? 'video' : 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendConnectionRequest = async (userId) => {
    if (connections.includes(userId)) return toast.error('Already connected');
    if (sentConnectionRequests.includes(userId)) return toast.error('Request already sent');
    if (blockedUsers.includes(userId)) return toast.error('Cannot send request to blocked user');

    try {
      await setDoc(doc(db, `users/${currentUser.id}/connectionRequestsSent`, userId), {
        status: 'pending',
        sentAt: serverTimestamp()
      });

      await setDoc(doc(db, `users/${userId}/connectionRequestsReceived`, currentUser.id), {
        status: 'pending',
        fromName: currentUser.name,
        sentAt: serverTimestamp()
      });

      await addDoc(collection(db, 'notifications'), {
        toUserId: userId,
        type: 'connection_request',
        title: 'Connection Request',
        message: `${currentUser.name} wants to connect with you`,
        fromUserId: currentUser.id,
        createdAt: serverTimestamp(),
        read: false
      });

      toast.success('Connection request sent!');
    } catch (err) {
      toast.error('Failed to send request');
    }
  };

  const handleCancelSentRequest = async (targetUserId) => {
    if (!window.confirm("Cancel this connection request?")) return;

    try {
      await runTransaction(db, async (t) => {
        t.delete(doc(db, `users/${currentUser.id}/connectionRequestsSent`, targetUserId));
        t.delete(doc(db, `users/${targetUserId}/connectionRequestsReceived`, currentUser.id));
      });

      const notifQuery = query(
        collection(db, 'notifications'),
        where('toUserId', '==', targetUserId),
        where('fromUserId', '==', currentUser.id),
        where('type', '==', 'connection_request')
      );
      const snap = await getDocs(notifQuery);
      snap.forEach(d => deleteDoc(d.ref));

      toast.success("Connection request cancelled");
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel request");
    }
  };

  const handleAcceptRequest = async (senderId) => {
    try {
      await runTransaction(db, async (t) => {
        t.delete(doc(db, `users/${currentUser.id}/connectionRequestsReceived`, senderId));
        t.delete(doc(db, `users/${senderId}/connectionRequestsSent`, currentUser.id));

        t.set(doc(db, `users/${currentUser.id}/connections`, senderId), { addedAt: serverTimestamp() });
        t.set(doc(db, `users/${senderId}/connections`, currentUser.id), { addedAt: serverTimestamp() });
      });

      const notifQuery = query(
        collection(db, 'notifications'),
        where('toUserId', '==', currentUser.id),
        where('fromUserId', '==', senderId),
        where('type', '==', 'connection_request')
      );
      const snap = await getDocs(notifQuery);
      snap.forEach(d => deleteDoc(d.ref));

      toast.success('Connection accepted!');
      setSelectedChat(senderId);
      setActiveTab('messages');
    } catch (err) {
      console.error(err);
      toast.error('Failed to accept request');
    }
  };

  const handleRejectRequest = async (senderId) => {
    try {
      await deleteDoc(doc(db, `users/${currentUser.id}/connectionRequestsReceived`, senderId));
      await deleteDoc(doc(db, `users/${senderId}/connectionRequestsSent`, currentUser.id));

      const notifQuery = query(
        collection(db, 'notifications'),
        where('toUserId', '==', currentUser.id),
        where('fromUserId', '==', senderId),
        where('type', '==', 'connection_request')
      );
      const snap = await getDocs(notifQuery);
      snap.forEach(d => deleteDoc(d.ref));

      toast.info('Request rejected');
    } catch (err) {
      console.error(err);
      toast.error('Failed to reject');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    const chatId = [currentUser.id, selectedChat].sort().join('_');

    try {
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        sender: currentUser.id,
        content: newMessage.trim(),
        createdAt: serverTimestamp()
      });
      setNewMessage('');
    } catch (err) {
      toast.error('Failed to send message');
    }
  };

  const getUserById = (id) => users.find(u => u.id === id) || { name: 'Unknown', photoURL: null };

  // ── Bottom Navigation (mobile only) ─────────────────────────────────────
  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t dark:border-slate-800 z-50 md:hidden safe-area-inset-bottom">
      <div className="flex items-center justify-around py-2">
        {[
          { icon: Home, label: 'Feed', value: 'feed' },
          { icon: Users, label: 'Network', value: 'network' },
          { icon: MessageCircle, label: 'Messages', value: 'messages' },
          { icon: Bell, label: 'Alerts', value: 'notifications' },
        ].map(({ icon: Icon, label, value }) => (
          <button
            key={value}
            onClick={() => setActiveTab(value)}
            className={`flex flex-col items-center gap-1 p-2 flex-1 touch-manipulation active:scale-95 transition ${
              activeTab === value 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Icon size={24} />
            <span className="text-[10px] sm:text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4 text-center">
        <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
          Please sign in to use Connect
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pb-20 md:pb-0">
      <div className="p-4 sm:p-5 md:p-6 lg:p-8 max-w-5xl mx-auto space-y-5 md:space-y-6">

        {/* Header - visible only on larger screens */}
        <div className="flex justify-between items-center md:mb-6 hidden md:flex">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">Connect</h1>
          <div className="flex items-center gap-5">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Bell 
              onClick={() => setActiveTab('notifications')} 
              className="cursor-pointer text-slate-700 dark:text-slate-300 hover:text-indigo-600"
              size={24}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-5 md:space-y-6"
          >
            {/* FEED */}
            {activeTab === 'feed' && (
              <div className="space-y-5">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 sm:p-5">
                  <textarea
                    value={newPost}
                    onChange={e => setNewPost(e.target.value)}
                    placeholder={`What's on your mind, ${currentUser.name}?`}
                    className="w-full p-3 bg-transparent border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-indigo-500 resize-none min-h-[80px] sm:min-h-[100px] text-sm sm:text-base"
                    rows={3}
                  />
                  {mediaPreview && (
                    <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 max-h-56 sm:max-h-80">
                      {mediaType === 'video' ? (
                        <video src={mediaPreview} controls className="w-full h-auto" />
                      ) : (
                        <img src={mediaPreview} alt="preview" className="w-full h-auto object-contain" />
                      )}
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex gap-5">
                      <label className="cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                        <ImageIcon size={22} className="text-slate-600 dark:text-slate-400" />
                        <input type="file" accept="image/*" hidden onChange={handleMediaUpload} />
                      </label>
                      <label className="cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                        <VideoIcon size={22} className="text-slate-600 dark:text-slate-400" />
                        <input type="file" accept="video/*" hidden onChange={handleMediaUpload} />
                      </label>
                    </div>
                    <button 
                      onClick={handleNewPost}
                      disabled={!newPost.trim() && !mediaFile}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-sm sm:text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                    >
                      Post
                    </button>
                  </div>
                </div>

                {posts.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    No posts yet. Be the first to share!
                  </div>
                ) : (
                  posts.map(post => (
                    <div key={post.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 sm:p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <UserCircle size={40} className="text-slate-400" />
                        <div>
                          <p className="font-medium">{post.user.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {/* Add timestamp formatting here if needed */}
                          </p>
                        </div>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-[15px] sm:text-base whitespace-pre-wrap">
                        {post.content}
                      </p>
                      {post.media && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                          <img src={post.media} alt="" className="w-full h-auto object-cover max-h-80" />
                        </div>
                      )}
                      <div className="flex gap-6 mt-4 text-slate-600 dark:text-slate-400">
                        <button 
                          onClick={() => handleLike(post.id)}
                          className="flex items-center gap-1.5 hover:text-red-500 transition min-h-[44px]"
                        >
                          <Heart size={20} /> {post.likes}
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-indigo-500 transition min-h-[44px]">
                          <MessageSquare size={20} /> {post.comments?.length || 0}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* NETWORK */}
            {activeTab === 'network' && (
              <div className="space-y-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    value={networkSearch}
                    onChange={e => setNetworkSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:outline-none focus:border-indigo-500 text-sm sm:text-base"
                  />
                </div>

                <div className="space-y-3">
                  {users
                    .filter(u => 
                      u.id !== currentUser.id &&
                      u.name?.toLowerCase().includes(networkSearch.toLowerCase())
                    )
                    .map(user => {
                      const isConnected = connections.includes(user.id);
                      const hasSentRequest = sentConnectionRequests.includes(user.id);
                      const isBlocked = blockedUsers.includes(user.id);

                      let button;

                      if (isConnected) {
                        button = (
                          <span className="px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 rounded-full flex items-center gap-2 text-sm">
                            <UserCheck size={16} /> Connected
                          </span>
                        );
                      } else if (hasSentRequest) {
                        button = (
                          <button
                            onClick={() => handleCancelSentRequest(user.id)}
                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full flex items-center gap-2 transition text-sm min-h-[44px]"
                          >
                            <X size={16} /> Cancel
                          </button>
                        );
                      } else if (isBlocked) {
                        button = (
                          <span className="px-4 py-2 bg-gray-500 text-white rounded-full text-sm">
                            Blocked
                          </span>
                        );
                      } else {
                        button = (
                          <button
                            onClick={() => handleSendConnectionRequest(user.id)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition flex items-center gap-2 text-sm min-h-[44px]"
                          >
                            <UserPlus size={16} /> Connect
                          </button>
                        );
                      }

                      return (
                        <div 
                          key={user.id}
                          className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {user.photoURL ? (
                              <img src={user.photoURL} alt="" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <UserCircle size={44} className="text-slate-400 flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="font-medium truncate text-sm sm:text-base">{user.name}</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-3">
                            {button}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* MESSAGES */}
            {activeTab === 'messages' && (
              <div className={isNarrowScreen ? "space-y-4" : "grid lg:grid-cols-3 gap-6"}>
                {(!isNarrowScreen || !selectedChat) && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
                    <h3 className="font-semibold mb-4 text-lg">Conversations</h3>
                    {connections.length === 0 ? (
                      <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                        No connections yet
                      </p>
                    ) : (
                      connections.map(id => {
                        const user = getUserById(id);
                        return (
                          <button
                            key={id}
                            onClick={() => setSelectedChat(id)}
                            className={`w-full p-3 text-left rounded-xl mb-2 flex items-center gap-3 transition ${
                              selectedChat === id 
                                ? 'bg-indigo-50 dark:bg-indigo-900/40' 
                                : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            {user.photoURL ? (
                              <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <UserCircle size={40} className="text-slate-400 flex-shrink-0" />
                            )}
                            <span className="font-medium truncate text-sm sm:text-base">{user.name}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}

                {(!isNarrowScreen || selectedChat) && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm flex flex-col h-[70vh] sm:h-[75vh] lg:col-span-2">
                    {selectedChat ? (
                      <>
                        <div className="p-4 border-b dark:border-slate-700 flex items-center gap-3">
                          {isNarrowScreen && (
                            <button 
                              onClick={() => setSelectedChat(null)}
                              className="p-2 -ml-2"
                            >
                              <ChevronLeft size={24} />
                            </button>
                          )}
                          {getUserById(selectedChat).photoURL ? (
                            <img src={getUserById(selectedChat).photoURL} alt="" className="w-10 h-10 rounded-full" />
                          ) : (
                            <UserCircle size={40} className="text-slate-400" />
                          )}
                          <h3 className="font-semibold truncate">{getUserById(selectedChat).name}</h3>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/30">
                          {(messages[[currentUser.id, selectedChat].sort().join('_')] || []).map((msg, i) => (
                            <div 
                              key={i} 
                              className={`flex ${msg.sender === currentUser.id ? 'justify-end' : 'justify-start'}`}
                            >
                              <span 
                                className={`inline-block px-4 py-2.5 rounded-2xl max-w-[80%] sm:max-w-[70%] text-sm ${
                                  msg.sender === currentUser.id 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100'
                                }`}
                              >
                                {msg.content}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="p-4 border-t dark:border-slate-700 flex gap-2">
                          <input
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-3 rounded-full bg-slate-100 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                          />
                          <button 
                            onClick={handleSendMessage}
                            className="p-3 bg-indigo-600 text-white rounded-full min-w-[48px] min-h-[48px] flex items-center justify-center"
                          >
                            <Send size={20} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
                        Select a conversation to start chatting
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* NOTIFICATIONS */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Notifications</h3>

                {requestNotifications.length === 0 && notifications.length === 0 ? (
                  <p className="text-slate-500 dark:text-slate-400 py-8 text-center">
                    No notifications yet
                  </p>
                ) : (
                  <>
                    {requestNotifications.map(notif => {
                      const sender = getUserById(notif.fromUserId);
                      return (
                        <div key={notif.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm">
                          <div className="flex items-start gap-4">
                            {sender.photoURL ? (
                              <img src={sender.photoURL} alt="" className="w-12 h-12 rounded-full object-cover" />
                            ) : (
                              <UserCircle size={48} className="text-slate-400" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">
                                {sender.name} wants to connect with you
                              </p>
                              <div className="flex gap-3 mt-4">
                                <button
                                  onClick={() => handleAcceptRequest(notif.fromUserId)}
                                  className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg min-h-[44px]"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleRejectRequest(notif.fromUserId)}
                                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg min-h-[44px]"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {notifications.map(notif => (
                      <div key={notif.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm">
                        <p className="font-medium">{notif.title}</p>
                        <p className="text-slate-600 dark:text-slate-300 mt-1">{notif.message}</p>
                      </div>
                    ))}
                  </>
                )}
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