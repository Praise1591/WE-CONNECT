// Connect.jsx - Complete Redesign with Modern UI/UX
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Bell, MessageCircle, Heart, MessageSquare, Send, 
  Image as ImageIcon, Video as VideoIcon, Trash2, UserPlus, 
  ChevronLeft, Loader2, UserCircle,
  UserCheck, Home, Users, User, Edit2, LogOut, Camera, Slash, AlertTriangle,
  Sparkles, TrendingUp, Compass, Gift, Star, Zap, MoreHorizontal,
  Bookmark, Share2, Smile, Globe, AtSign, Link, Mic, Phone,
  Video, MoreVertical, CheckCircle, XCircle, Clock, Filter
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase imports remain the same
import { auth, db, storage } from '@/firebase';
import {
  collection, query, where, orderBy, onSnapshot, doc, getDoc, setDoc,
  updateDoc, deleteDoc, addDoc, serverTimestamp, increment,
  arrayUnion, getDocs, runTransaction, writeBatch
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const tabVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  hover: { y: -4, transition: { duration: 0.2 } }
};

function Connect() {
  // All state variables remain exactly the same
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
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);

  // All useEffect hooks remain exactly the same
  useEffect(() => {
    const handleResize = () => setIsNarrowScreen(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auth listener (unchanged)
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

  // Real-time data listeners (unchanged)
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

    unsubs.push(onSnapshot(
      query(collection(db, 'connections'), where('users', 'array-contains', currentUser.id)),
      snap => {
        const conns = snap.docs.map(doc => {
          const data = doc.data();
          return data.users.find(id => id !== currentUser.id);
        });
        setConnections(conns.filter(Boolean));
      }
    ));

    unsubs.push(onSnapshot(collection(db, `users/${currentUser.id}/connectionRequestsSent`), snap => 
      setSentConnectionRequests(snap.docs.map(d => d.id))
    ));

    unsubs.push(onSnapshot(collection(db, `users/${currentUser.id}/blocked`), snap => 
      setBlockedUsers(snap.docs.map(d => d.id))
    ));

    return () => unsubs.forEach(u => u());
  }, [currentUser?.id]);

  // Chat listener (unchanged)
  useEffect(() => {
    if (!currentUser?.id || !selectedChat) return;

    const chatId = [currentUser.id, selectedChat].sort().join('_');
    
    const setupChatRoom = async () => {
      try {
        const chatRoomRef = doc(db, 'chats', chatId);
        const chatRoomSnap = await getDoc(chatRoomRef);
        
        if (!chatRoomSnap.exists()) {
          await setDoc(chatRoomRef, {
            participants: [currentUser.id, selectedChat],
            createdAt: serverTimestamp(),
            lastMessage: null,
            lastMessageTime: null,
            createdBy: currentUser.id
          });
        }
      } catch (err) {
        console.warn('Could not setup chat room:', err.message);
      }
    };
    
    setupChatRoom();

    const q = query(collection(db, `chats/${chatId}/messages`), orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, snap => {
      const newMsgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(prev => ({ ...prev, [chatId]: newMsgs }));
      
      if (newMsgs.length > 0) {
        const lastMsg = newMsgs[newMsgs.length - 1];
        updateDoc(doc(db, 'chats', chatId), {
          lastMessage: lastMsg.content,
          lastMessageTime: lastMsg.createdAt,
          lastMessageSender: lastMsg.sender
        }).catch(err => console.warn('Could not update last message:', err.message));
      }
    }, err => {
      console.error(`Chat listener failed for chat ${chatId}:`, err.code, err.message);
    });

    return unsubscribe;
  }, [currentUser?.id, selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChat]);

  // All handler functions remain exactly the same
  const formatMessageTime = (timestamp) => {
    if (!timestamp?.toDate) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now - date;
    if (diffMs < 60000) return 'just now';
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
    if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const handleNewPost = async () => {
    if (!newPost.trim() && !mediaFile) return toast.error('Post cannot be empty');
    if (!auth.currentUser) return toast.error('Please sign in');

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
        user: { id: currentUser.id, name: currentUser.name || 'User', photoURL: currentUser.photoURL },
        content: newPost.trim(),
        media: mediaUrl,
        mediaType: mType,
        likes: 0,
        likesCount: 0,
        comments: [],
        createdAt: serverTimestamp()
      });
      setNewPost('');
      setMediaPreview(null);
      setMediaType(null);
      setMediaFile(null);
      toast.success('Posted!');
    } catch (err) {
      console.error("Post error:", err);
      toast.error("Failed to post");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
      toast.success('Post deleted');
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleLike = async (postId) => {
    try {
      await updateDoc(doc(db, 'posts', postId), { likes: increment(1) });
    } catch (err) {
      toast.error("Like failed");
    }
  };

  const handleComment = async (postId) => {
    const comment = commentInputs[postId]?.trim();
    if (!comment) return toast.error('Comment required');

    try {
      await updateDoc(doc(db, 'posts', postId), {
        comments: arrayUnion({
          user: currentUser.name || 'User',
          userId: currentUser.id,
          content: comment,
          timestamp: serverTimestamp()
        })
      });
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      toast.success('Comment added');
    } catch (err) {
      toast.error("Comment failed");
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
    if (!editedName.trim()) return toast.error('Name required');

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
      toast.error("Profile update failed");
    }
  };

  const handleBlockUser = async (userId, userName = 'this user') => {
    if (!window.confirm(`Block ${userName}?`)) return;

    try {
      await setDoc(doc(db, `users/${currentUser.id}/blocked`, userId), {
        blockedAt: serverTimestamp(),
        name: userName
      });
      
      const connectionQuery = query(
        collection(db, 'connections'),
        where('users', 'array-contains', currentUser.id),
        where('users', 'array-contains', userId)
      );
      const connSnap = await getDocs(connectionQuery);
      const batch = writeBatch(db);
      connSnap.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      
      toast.success('User blocked');
    } catch (err) {
      toast.error("Block failed");
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      await deleteDoc(doc(db, `users/${currentUser.id}/blocked`, userId));
      toast.success('User unblocked');
    } catch (err) {
      toast.error("Unblock failed");
    }
  };

  const handleSendConnectionRequest = async (userId) => {
    if (connections.includes(userId)) return toast.error('Already connected');
    if (sentConnectionRequests.includes(userId)) return toast.error('Request already sent');

    try {
      await setDoc(doc(db, `users/${currentUser.id}/connectionRequestsSent`, userId), {
        status: 'pending',
        sentAt: serverTimestamp(),
        toUserId: userId
      });

      await addDoc(collection(db, 'notifications'), {
        toUserId: userId,
        type: 'connection_request',
        title: 'Connection Request',
        message: `${currentUser.name} wants to connect`,
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        createdAt: serverTimestamp(),
        read: false
      });

      toast.success('Request sent');
    } catch (err) {
      toast.error("Failed to send request");
    }
  };

  const handleCancelSentRequest = async (targetUserId) => {
    if (!window.confirm('Cancel request?')) return;

    try {
      await deleteDoc(doc(db, `users/${currentUser.id}/connectionRequestsSent`, targetUserId));

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
      toast.error("Cancel failed");
    }
  };

  const handleAcceptRequest = async (senderId) => {
    if (acceptingId === senderId) return;
    setAcceptingId(senderId);

    try {
      const connectionId = [currentUser.id, senderId].sort().join('_');
      const connectionRef = doc(db, 'connections', connectionId);
      
      await setDoc(connectionRef, {
        users: [currentUser.id, senderId],
        createdAt: serverTimestamp(),
        createdBy: currentUser.id,
        status: 'accepted'
      });

      const chatId = [currentUser.id, senderId].sort().join('_');
      const chatRoomRef = doc(db, 'chats', chatId);
      
      const chatRoomSnap = await getDoc(chatRoomRef);
      if (!chatRoomSnap.exists()) {
        await setDoc(chatRoomRef, {
          participants: [currentUser.id, senderId],
          createdAt: serverTimestamp(),
          lastMessage: null,
          lastMessageTime: null,
          createdBy: currentUser.id
        });
      }

      try {
        await deleteDoc(doc(db, `users/${senderId}/connectionRequestsSent`, currentUser.id));
      } catch (err) {
        console.warn('Could not delete sent request:', err.message);
      }

      try {
        const notifQuery = query(
          collection(db, 'notifications'),
          where('toUserId', '==', currentUser.id),
          where('fromUserId', '==', senderId),
          where('type', '==', 'connection_request')
        );
        const notifSnap = await getDocs(notifQuery);

        if (!notifSnap.empty) {
          const batch = writeBatch(db);
          notifSnap.docs.forEach(d => batch.delete(d.ref));
          await batch.commit();
        }
      } catch (notifError) {
        console.warn('[ACCEPT] Could not clean up notifications:', notifError.message);
      }

      await addDoc(collection(db, 'notifications'), {
        toUserId: senderId,
        type: 'connection_accepted',
        title: 'Connection Accepted',
        message: `${currentUser.name} accepted your connection request`,
        fromUserId: currentUser.id,
        fromUserName: currentUser.name,
        createdAt: serverTimestamp(),
        read: false
      });

      toast.success('Connected! You can now chat.');
      setSelectedChat(senderId);
      setActiveTab('messages');
    } catch (err) {
      console.error("[ACCEPT ERROR]", err.message);
      toast.error("Accept failed — please try again");
    } finally {
      setAcceptingId(null);
    }
  };

  const handleRejectRequest = async (senderId) => {
    try {
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
      
      await deleteDoc(doc(db, `users/${senderId}/connectionRequestsSent`, currentUser.id));
      
      toast.info('Request declined');
    } catch (err) {
      toast.error("Decline failed");
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || isSendingMessage) return;
    
    setIsSendingMessage(true);
    const chatId = [currentUser.id, selectedChat].sort().join('_');

    try {
      const chatRoomRef = doc(db, 'chats', chatId);
      const chatRoomSnap = await getDoc(chatRoomRef);
      
      if (!chatRoomSnap.exists()) {
        await setDoc(chatRoomRef, {
          participants: [currentUser.id, selectedChat],
          createdAt: serverTimestamp(),
          lastMessage: null,
          lastMessageTime: null,
          createdBy: currentUser.id
        });
      }
      
      await addDoc(collection(db, `chats/${chatId}/messages`), {
        sender: currentUser.id,
        senderName: currentUser.name,
        content: newMessage.trim(),
        createdAt: serverTimestamp(),
        read: false
      });
      
      await updateDoc(chatRoomRef, {
        lastMessage: newMessage.trim(),
        lastMessageTime: serverTimestamp(),
        lastMessageSender: currentUser.id,
        lastMessageSenderName: currentUser.name
      });
      
      setNewMessage('');
    } catch (err) {
      console.error("Send message error:", err.message);
      toast.error("Failed to send message");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const getUserById = (id) => users.find(u => u.id === id) || { name: 'Unknown', photoURL: null };

  // Enhanced Bottom Navigation with animations
  const BottomNav = () => (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 z-40 md:hidden shadow-lg"
    >
      <div className="flex justify-around py-2">
        {[
          { icon: Home, label: 'Feed', value: 'feed' },
          { icon: Compass, label: 'Network', value: 'network' },
          { icon: UserPlus, label: 'Requests', value: 'requests', badge: requestNotifications.length },
          { icon: MessageCircle, label: 'Chat', value: 'messages' },
          { icon: Bell, label: 'Alerts', value: 'notifications', badge: notifications.length },
          { icon: User, label: 'Profile', value: 'profile' },
        ].map(item => (
          <motion.button
            key={item.value}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(item.value)}
            className={`relative flex flex-col items-center gap-1 p-2 flex-1 transition-all duration-200 ${
              activeTab === item.value ? 'text-indigo-600' : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <item.icon size={22} />
            <span className="text-xs font-medium">{item.label}</span>
            {item.badge > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1"
              >
                {item.badge > 9 ? '9+' : item.badge}
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="h-12 w-12 text-indigo-600" />
      </motion.div>
    </div>
  );
  
  if (!currentUser) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900">
      <div className="text-center">
        <UserCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">Please sign in to continue</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30 pb-20 md:pb-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
        
        {/* Enhanced Desktop Navigation with Glassmorphism */}
        <div className="hidden md:flex justify-center gap-3 mb-8">
          {[
            { label: 'Feed', value: 'feed', icon: Home, color: 'from-blue-500 to-cyan-500' },
            { label: 'Network', value: 'network', icon: Compass, color: 'from-emerald-500 to-teal-500' },
            { label: 'Requests', value: 'requests', icon: UserPlus, color: 'from-orange-500 to-red-500', badge: requestNotifications.length },
            { label: 'Messages', value: 'messages', icon: MessageCircle, color: 'from-purple-500 to-pink-500' },
            { label: 'Notifications', value: 'notifications', icon: Bell, color: 'from-amber-500 to-yellow-500', badge: notifications.length },
            { label: 'Profile', value: 'profile', icon: User, color: 'from-indigo-500 to-purple-500' },
          ].map(item => (
            <motion.button
              key={item.value}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(item.value)}
              className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === item.value 
                  ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-${item.color.split('-')[1]}-500/30` 
                  : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.badge > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1 shadow-lg"
                >
                  {item.badge}
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            variants={tabVariants} 
            initial="initial" 
            animate="animate" 
            exit="exit" 
            className="space-y-6"
          >
            {/* FEED TAB - Enhanced Design */}
            {activeTab === 'feed' && (
              <div className="space-y-6">
                {/* Create Post Card - Modern Design */}
                <motion.div 
                  variants={cardVariants}
                  whileHover="hover"
                  className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-4">
                      {currentUser?.photoURL ? (
                        <img src={currentUser.photoURL} className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <textarea
                        value={newPost}
                        onChange={e => setNewPost(e.target.value)}
                        placeholder={`What's on your mind, ${currentUser.name}?`}
                        className="flex-1 p-4 bg-slate-50 dark:bg-slate-700/50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[100px] placeholder:text-slate-400"
                        rows={3}
                      />
                    </div>
                    
                    {mediaPreview && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-3 rounded-xl overflow-hidden border-2 border-indigo-500/30 relative group"
                      >
                        {mediaType === 'video' ? (
                          <video src={mediaPreview} controls className="w-full max-h-96" />
                        ) : (
                          <img src={mediaPreview} alt="preview" className="w-full max-h-96 object-contain" />
                        )}
                        <button 
                          onClick={() => {
                            setMediaPreview(null);
                            setMediaFile(null);
                          }}
                          className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                        >
                          <XCircle size={20} />
                        </button>
                      </motion.div>
                    )}
                    
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex gap-3">
                        <motion.label 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="cursor-pointer p-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors group"
                        >
                          <ImageIcon size={22} className="text-indigo-500 group-hover:text-indigo-600" />
                          <input type="file" accept="image/*" hidden onChange={handleMediaUpload} />
                        </motion.label>
                        <motion.label 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="cursor-pointer p-2.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors group"
                        >
                          <VideoIcon size={22} className="text-purple-500 group-hover:text-purple-600" />
                          <input type="file" accept="video/*" hidden onChange={handleMediaUpload} />
                        </motion.label>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNewPost}
                        disabled={!newPost.trim() && !mediaFile}
                        className="px-8 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50 hover:shadow-lg transition-all duration-200"
                      >
                        <Sparkles size={18} className="inline mr-2" />
                        Post
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Posts Feed */}
                <AnimatePresence>
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover="hover"
                      transition={{ delay: index * 0.05 }}
                      className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden relative group"
                    >
                      <div className="p-6">
                        {/* Post Header */}
                        <div className="flex items-center gap-3 mb-4">
                          {post.user.photoURL ? (
                            <img src={post.user.photoURL} className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                              <User className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-bold text-slate-800 dark:text-white">{post.user.name}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Clock size={12} />
                              {post.createdAt?.toDate?.() ? post.createdAt.toDate().toLocaleString() : 'Recent'}
                            </p>
                          </div>
                          {post.user.id === currentUser.id && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeletePost(post.id)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                            >
                              <Trash2 size={18} className="text-red-500" />
                            </motion.button>
                          )}
                        </div>
                        
                        {/* Post Content */}
                        <p className="mb-4 whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed">
                          {post.content}
                        </p>
                        
                        {/* Media */}
                        {post.media && post.mediaType === 'image' && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="rounded-xl overflow-hidden mb-4"
                          >
                            <img src={post.media} alt="" className="w-full max-h-[500px] object-cover" />
                          </motion.div>
                        )}
                        {post.media && post.mediaType === 'video' && (
                          <video src={post.media} controls className="rounded-xl mb-4 max-h-[500px] w-full" />
                        )}
                        
                        {/* Engagement Buttons */}
                        <div className="flex gap-8 mb-4 pt-2">
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleLike(post.id)} 
                            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors group"
                          >
                            <Heart size={22} className="group-hover:fill-red-500 group-hover:text-red-500 transition-colors" />
                            <span className="font-medium">{post.likes || 0}</span>
                          </motion.button>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <MessageSquare size={22} />
                            <span className="font-medium">{post.comments?.length || 0}</span>
                          </div>
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-500 transition-colors"
                          >
                            <Share2 size={20} />
                          </motion.button>
                        </div>
                        
                        {/* Comments Section */}
                        <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <AnimatePresence>
                            {post.comments?.slice(-2).map((c, i) => (
                              <motion.div 
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-sm bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl"
                              >
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{c.user}: </span>
                                <span className="text-slate-700 dark:text-slate-300">{c.content}</span>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                          
                          <div className="flex gap-3 mt-2">
                            <input
                              value={commentInputs[post.id] || ''}
                              onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                              placeholder="Write a comment..."
                              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleComment(post.id))}
                            />
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleComment(post.id)}
                              className="p-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
                            >
                              <Send size={20} />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* NETWORK TAB - Enhanced Design */}
            {activeTab === 'network' && (
              <motion.div variants={cardVariants} className="space-y-6">
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input
                        value={networkSearch}
                        onChange={e => setNetworkSearch(e.target.value)}
                        placeholder="Search users by name..."
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 rounded-xl text-center">
                      <p className="text-2xl font-bold text-white">{totalUsers.toLocaleString()}</p>
                      <p className="text-xs text-indigo-100">Community Members</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  {users
                    .filter(u => u.id !== currentUser.id && (!networkSearch || u.name?.toLowerCase().includes(networkSearch.toLowerCase())))
                    .map((user, idx) => {
                      const isConnected = connections.includes(user.id);
                      const hasSent = sentConnectionRequests.includes(user.id);
                      const isBlocked = blockedUsers.includes(user.id);

                      let btn;
                      if (isBlocked) btn = (
                        <span className="px-5 py-2 bg-slate-500 text-white rounded-full text-sm">Blocked</span>
                      );
                      else if (isConnected) btn = (
                        <span className="px-5 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm flex items-center gap-1">
                          <CheckCircle size={16} /> Connected
                        </span>
                      );
                      else if (hasSent) btn = (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCancelSentRequest(user.id)}
                          className="px-5 py-2 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-colors"
                        >
                          Cancel Request
                        </motion.button>
                      );
                      else btn = (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSendConnectionRequest(user.id)}
                          className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm hover:shadow-lg transition-all"
                        >
                          Connect
                        </motion.button>
                      );

                      return (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-xl transition-all"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                              {user.photoURL ? (
                                <img src={user.photoURL} className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-500/20" />
                              ) : (
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                  <User className="w-7 h-7 text-white" />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="font-bold text-slate-800 dark:text-white">{user.name || 'Unknown'}</p>
                                {isConnected && (
                                  <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                                    <UserCheck size={12} /> Connected
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {btn}
                              {!isBlocked && !isConnected && (
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleBlockUser(user.id, user.name)}
                                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                  title="Block user"
                                >
                                  <Slash size={18} />
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </motion.div>
            )}

            {/* REQUESTS TAB - Enhanced Design */}
            {activeTab === 'requests' && (
              <motion.div variants={cardVariants} className="space-y-8">
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
                  <h2 className="text-3xl font-bold flex items-center gap-3 mb-6">
                    <UserPlus className="w-8 h-8 text-indigo-500" />
                    Connection Requests
                    {requestNotifications.length > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm px-3 py-1 rounded-full"
                      >
                        {requestNotifications.length}
                      </motion.span>
                    )}
                  </h2>

                  {requestNotifications.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserPlus className="h-12 w-12 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-medium text-slate-700 dark:text-slate-300">No pending requests</h3>
                      <p className="text-slate-500 mt-2">When someone sends you a connection request, it will appear here</p>
                    </div>
                  ) : requestNotifications.map(notif => {
                    const sender = getUserById(notif.fromUserId);
                    const isAccepting = acceptingId === notif.fromUserId;

                    return (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800"
                      >
                        <div className="flex flex-col sm:flex-row gap-5 items-center">
                          {sender.photoURL ? (
                            <img src={sender.photoURL} className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-500/30" />
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                              <User className="w-10 h-10 text-white" />
                            </div>
                          )}
                          <div className="flex-1 text-center sm:text-left">
                            <p className="font-bold text-xl text-slate-800 dark:text-white">{sender.name || 'Someone'}</p>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">wants to connect with you</p>
                          </div>
                          <div className="flex gap-3 w-full sm:w-auto">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleAcceptRequest(notif.fromUserId)}
                              disabled={isAccepting}
                              className={`flex-1 sm:flex-none px-8 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all ${isAccepting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                              {isAccepting ? <><Loader2 className="h-5 w-5 animate-spin" /> Accepting...</> : <><CheckCircle size={18} /> Accept</>}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleRejectRequest(notif.fromUserId)}
                              className="flex-1 sm:flex-none px-8 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                            >
                              Decline
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {sentConnectionRequests.length > 0 && (
                  <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Clock size={20} className="text-orange-500" />
                      Sent Requests ({sentConnectionRequests.length})
                    </h3>
                    <div className="space-y-3">
                      {sentConnectionRequests.map(id => {
                        const u = getUserById(id);
                        return (
                          <motion.div
                            key={id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              {u.photoURL ? (
                                <img src={u.photoURL} className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <UserCircle size={40} className="text-slate-400" />
                              )}
                              <span className="font-medium">{u.name}</span>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleCancelSentRequest(id)}
                              className="px-5 py-2 bg-orange-500 text-white rounded-lg text-sm hover:bg-orange-600 transition-colors"
                            >
                              Cancel
                            </motion.button>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* MESSAGES TAB - Enhanced Design */}
            {activeTab === 'messages' && (
              <motion.div variants={cardVariants} className={isNarrowScreen ? "space-y-4" : "grid md:grid-cols-12 gap-6"}>
                {(!isNarrowScreen || !selectedChat) && (
                  <div className="md:col-span-4 lg:col-span-3 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <MessageCircle size={20} className="text-indigo-500" />
                        Conversations
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">{connections.length} connections</p>
                    </div>
                    <div className="max-h-[calc(75vh-80px)] overflow-y-auto">
                      {connections.length === 0 ? (
                        <div className="text-center py-12 px-4">
                          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageCircle size={32} className="text-slate-400" />
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 font-medium">No connections yet</p>
                          <p className="text-sm text-slate-500 mt-1">Connect with people to start chatting!</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                          {connections.map(id => {
                            const u = getUserById(id);
                            const chatId = [currentUser.id, id].sort().join('_');
                            const last = messages[chatId]?.slice(-1)[0];

                            return (
                              <motion.button
                                key={id}
                                whileHover={{ backgroundColor: "rgba(99, 102, 241, 0.05)" }}
                                onClick={() => setSelectedChat(id)}
                                className={`w-full p-4 flex items-center gap-3 transition-all text-left ${
                                  selectedChat === id ? 'bg-indigo-50 dark:bg-indigo-950/40' : ''
                                }`}
                              >
                                {u.photoURL ? (
                                  <img src={u.photoURL} className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-500/20" />
                                ) : (
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                    <User className="w-6 h-6 text-white" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold truncate text-slate-800 dark:text-white">{u.name}</div>
                                  <div className="text-xs text-slate-500 truncate mt-0.5">
                                    {last ? (
                                      <span className="flex items-center gap-1">
                                        {last.sender === currentUser.id && 'You: '}
                                        {last.content?.slice(0, 35) || ''}
                                        {last.content?.length > 35 ? '...' : ''}
                                      </span>
                                    ) : (
                                      'Start a conversation'
                                    )}
                                  </div>
                                </div>
                                {last && last.sender !== currentUser.id && !last.read && (
                                  <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(!isNarrowScreen || selectedChat) && (
                  <div className={`md:col-span-8 lg:col-span-9 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col ${isNarrowScreen ? 'h-[70vh]' : 'h-[75vh]'}`}>
                    {selectedChat ? (
                      <>
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
                          {isNarrowScreen && (
                            <motion.button 
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setSelectedChat(null)} 
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                            >
                              <ChevronLeft size={24} />
                            </motion.button>
                          )}
                          {getUserById(selectedChat).photoURL ? (
                            <img src={getUserById(selectedChat).photoURL} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800 dark:text-white">{getUserById(selectedChat).name}</h3>
                            {connections.includes(selectedChat) && (
                              <p className="text-xs text-emerald-600 flex items-center gap-1">
                                <UserCheck size={12} /> Connected
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <motion.button whileHover={{ scale: 1.1 }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                              <Phone size={18} />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                              <Video size={18} />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.1 }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                              <MoreVertical size={18} />
                            </motion.button>
                          </div>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/30 dark:to-slate-800/30">
                          {(messages[[currentUser.id, selectedChat].sort().join('_')] || []).length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                              <MessageCircle size={64} className="mb-4 opacity-30" />
                              <p className="text-lg font-medium">No messages yet</p>
                              <p className="text-sm">Start the conversation!</p>
                            </div>
                          ) : (
                            messages[[currentUser.id, selectedChat].sort().join('_')].map((msg, i) => {
                              const isOwn = msg.sender === currentUser.id;
                              return (
                                <motion.div
                                  key={msg.id || i}
                                  initial={{ opacity: 0, x: isOwn ? 20 : -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                                    isOwn 
                                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white' 
                                      : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white'
                                  }`}>
                                    <p className="break-words">{msg.content}</p>
                                    <div className={`text-xs mt-1 ${isOwn ? 'text-indigo-200' : 'text-slate-500'}`}>
                                      {formatMessageTime(msg.createdAt)}
                                    </div>
                                  </div>
                                </motion.div>
                              );
                            })
                          )}
                          <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-2 bg-white/50 dark:bg-slate-800/50">
                          <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                          >
                            <Smile size={20} className="text-slate-500" />
                          </motion.button>
                          <input
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder={connections.includes(selectedChat) ? "Type a message..." : "Connect first to send messages"}
                            disabled={!connections.includes(selectedChat)}
                            className="flex-1 px-5 py-3 rounded-full bg-slate-100 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && connections.includes(selectedChat) && (e.preventDefault(), handleSendMessage())}
                          />
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSendMessage} 
                            disabled={!newMessage.trim() || !connections.includes(selectedChat) || isSendingMessage} 
                            className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
                          >
                            {isSendingMessage ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                          </motion.button>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <div className="w-32 h-32 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-6">
                          <MessageCircle size={64} className="text-slate-400" />
                        </div>
                        <p className="text-xl font-medium">Select a conversation</p>
                        <p className="text-sm mt-1">Choose someone from the list to start chatting</p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* NOTIFICATIONS TAB - Enhanced Design */}
            {activeTab === 'notifications' && (
              <motion.div variants={cardVariants} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
                  <h2 className="text-3xl font-bold flex items-center gap-3">
                    <Bell className="w-8 h-8 text-indigo-500" />
                    Notifications
                    {notifications.length > 0 && (
                      <span className="text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full">
                        {notifications.length} new
                      </span>
                    )}
                  </h2>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {notifications.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="h-12 w-12 text-slate-400" />
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">No notifications yet</p>
                      <p className="text-sm text-slate-500 mt-1">When you receive notifications, they'll appear here</p>
                    </div>
                  ) : (
                    notifications.map((n, idx) => (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex gap-4">
                          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center">
                            {n.type === 'connection_accepted' ? (
                              <UserCheck className="w-5 h-5 text-indigo-600" />
                            ) : (
                              <Bell className="w-5 h-5 text-indigo-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-slate-800 dark:text-white">{n.title}</p>
                            <p className="text-slate-600 dark:text-slate-400 mt-1">{n.message}</p>
                            <p className="mt-2 text-xs text-slate-500 flex items-center gap-1">
                              <Clock size={12} />
                              {n.createdAt?.toDate?.() ? n.createdAt.toDate().toLocaleString() : 'Recent'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* PROFILE TAB - Enhanced Design */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Profile Header */}
                <motion.div 
                  variants={cardVariants}
                  className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <div className="relative">
                    <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                    <div className="absolute -bottom-16 left-6">
                      <div className="relative">
                        {profilePhotoPreview ? (
                          <img src={profilePhotoPreview} className="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-xl" />
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center">
                            <User className="w-16 h-16 text-white" />
                          </div>
                        )}
                        {editingProfile && (
                          <label className="absolute bottom-2 right-2 bg-indigo-600 p-2 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors shadow-lg">
                            <Camera size={18} className="text-white" />
                            <input type="file" accept="image/*" hidden onChange={handleProfilePhotoUpload} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-20 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div>
                        {editingProfile ? (
                          <input
                            value={editedName}
                            onChange={e => setEditedName(e.target.value)}
                            className="text-3xl font-bold w-full mb-2 bg-transparent border-b-2 border-indigo-500 focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <h2 className="text-3xl font-bold text-slate-800 dark:text-white">{currentUser.name}</h2>
                        )}
                        <p className="text-slate-500 mt-1 flex items-center gap-2">
                          <AtSign size={14} />
                          {currentUser.email}
                        </p>
                      </div>

                      <div className="flex gap-3">
                        {!editingProfile ? (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setEditingProfile(true)}
                              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl flex items-center gap-2 hover:shadow-lg transition-all"
                            >
                              <Edit2 size={18} /> Edit Profile
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => auth.signOut()}
                              className="px-6 py-2.5 bg-red-600 text-white rounded-xl flex items-center gap-2 hover:bg-red-700 transition-all"
                            >
                              <LogOut size={18} /> Sign Out
                            </motion.button>
                          </>
                        ) : (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleSaveProfile}
                              className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all"
                            >
                              Save Changes
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => { setEditingProfile(false); setEditedName(currentUser.name); setProfilePhotoPreview(currentUser.photoURL); }}
                              className="px-6 py-2.5 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-all"
                            >
                              Cancel
                            </motion.button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="mt-8 grid grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/30 dark:to-indigo-900/30 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-indigo-600">{myPosts.length}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Posts</p>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-emerald-600">{connections.length}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Connections</p>
                      </div>
                      <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/30 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-red-600">{blockedUsers.length}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Blocked</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* My Posts Section */}
                <motion.div variants={cardVariants} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <MessageSquare size={24} className="text-indigo-500" />
                      My Posts
                      <span className="text-sm bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-1 rounded-full ml-2">{myPosts.length}</span>
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {myPosts.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                        <p className="text-slate-500">You haven't posted anything yet</p>
                      </div>
                    ) : (
                      myPosts.map(post => (
                        <div key={post.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors relative">
                          <p className="mb-3 whitespace-pre-wrap text-slate-700 dark:text-slate-300">{post.content}</p>
                          {post.media && post.mediaType === 'image' && (
                            <img src={post.media} className="rounded-xl mb-3 max-h-64 object-cover" />
                          )}
                          {post.media && post.mediaType === 'video' && (
                            <video src={post.media} controls className="rounded-xl mb-3 max-h-64 w-full" />
                          )}
                          <div className="flex gap-6 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5"><Heart size={16} /> {post.likes || 0}</span>
                            <span className="flex items-center gap-1.5"><MessageSquare size={16} /> {post.comments?.length || 0}</span>
                          </div>
                          <button onClick={() => handleDeletePost(post.id)} className="absolute top-5 right-5 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>

                {/* Connections List */}
                <motion.div variants={cardVariants} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <Users size={24} className="text-indigo-500" />
                      Connections ({connections.length})
                    </h3>
                  </div>
                  <div className="p-6">
                    {connections.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                        <p className="text-slate-500">No connections yet</p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {connections.map(id => {
                          const u = getUserById(id);
                          return (
                            <motion.div
                              key={id}
                              whileHover={{ scale: 1.02 }}
                              className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                {u.photoURL ? (
                                  <img src={u.photoURL} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                  <UserCircle size={40} className="text-slate-400" />
                                )}
                                <span className="font-medium truncate">{u.name}</span>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleBlockUser(id, u.name)}
                                className="px-4 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                              >
                                Block
                              </motion.button>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Blocked Users */}
                <motion.div variants={cardVariants} className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <Slash size={24} className="text-red-500" />
                      Blocked Users ({blockedUsers.length})
                    </h3>
                  </div>
                  <div className="p-6">
                    {blockedUsers.length === 0 ? (
                      <div className="text-center py-8">
                        <Slash className="mx-auto h-12 w-12 text-slate-400 mb-3" />
                        <p className="text-slate-500">No blocked users</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {blockedUsers.map(id => {
                          const u = getUserById(id);
                          return (
                            <motion.div
                              key={id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 flex items-center justify-between"
                            >
                              <div className="flex items-center gap-3">
                                {u.photoURL ? (
                                  <img src={u.photoURL} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                  <UserCircle size={40} className="text-slate-400" />
                                )}
                                <span className="font-medium">{u.name}</span>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleUnblockUser(id)}
                                className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors"
                              >
                                Unblock
                              </motion.button>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
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