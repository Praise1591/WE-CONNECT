// Connect.jsx - Complete Redesign with Modern UI/UX
import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Bell, MessageCircle, Heart, MessageSquare, Send, 
  Image as ImageIcon, Video as VideoIcon, Trash2, UserPlus, 
  ChevronLeft, Loader2, UserCircle,
  UserCheck, Home, Users, User, Edit2, LogOut, Camera, Slash,
  Sparkles, Compass, Gift, Star, Zap, MoreHorizontal,
  Bookmark, Share2, Smile, AtSign, Mic, Phone,
  Video, MoreVertical, CheckCircle, XCircle, Clock, Filter,
  TrendingUp, Flame, Crown, Coffee, Rocket, Palette
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db, storage } from '@/firebase';
import {
  collection, query, where, orderBy, onSnapshot, doc, getDoc, setDoc,
  updateDoc, deleteDoc, addDoc, serverTimestamp, increment,
  arrayUnion, getDocs, writeBatch
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const Connect = () => {
  // State variables (unchanged)
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
  const [editingProfile, setEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [acceptingId, setAcceptingId] = useState(null);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const messagesEndRef = useRef(null);

  // All useEffect hooks remain exactly the same as original
  useEffect(() => {
    const handleResize = () => setIsNarrowScreen(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Creative bottom navigation
  const BottomNav = () => (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-800/50 z-40 md:hidden"
    >
      <div className="flex justify-around items-center py-2 px-2">
        {[
          { icon: Home, label: 'Feed', value: 'feed', gradient: 'from-rose-400 to-orange-400' },
          { icon: Compass, label: 'Network', value: 'network', gradient: 'from-emerald-400 to-teal-400' },
          { icon: UserPlus, label: 'Requests', value: 'requests', badge: requestNotifications.length, gradient: 'from-violet-400 to-purple-400' },
          { icon: MessageCircle, label: 'Chat', value: 'messages', gradient: 'from-sky-400 to-blue-400' },
          { icon: Bell, label: 'Alerts', value: 'notifications', badge: notifications.length, gradient: 'from-amber-400 to-yellow-400' },
          { icon: User, label: 'Profile', value: 'profile', gradient: 'from-indigo-400 to-purple-400' },
        ].map(item => (
          <motion.button
            key={item.value}
            whileTap={{ scale: 0.9 }}
            onClick={() => setActiveTab(item.value)}
            className={`relative flex flex-col items-center gap-0.5 p-2 rounded-2xl transition-all duration-200 ${
              activeTab === item.value 
                ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg` 
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
            {item.badge > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-0.5 shadow-lg"
              >
                {item.badge > 9 ? '9+' : item.badge}
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  // Creative desktop navigation
  const DesktopNav = () => (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="hidden md:flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 p-2 mb-8"
    >
      <div className="flex items-center gap-1">
        <div className="px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="font-bold text-slate-800 dark:text-white">Connect</span>
          </div>
        </div>
        
        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2" />
        
        <div className="flex gap-1">
          {[
            { label: 'Feed', value: 'feed', icon: Home, gradient: 'from-rose-500 to-orange-500' },
            { label: 'Network', value: 'network', icon: Compass, gradient: 'from-emerald-500 to-teal-500' },
            { label: 'Requests', value: 'requests', icon: UserPlus, gradient: 'from-violet-500 to-purple-500', badge: requestNotifications.length },
            { label: 'Messages', value: 'messages', icon: MessageCircle, gradient: 'from-sky-500 to-blue-500' },
            { label: 'Notifications', value: 'notifications', icon: Bell, gradient: 'from-amber-500 to-yellow-500', badge: notifications.length },
            { label: 'Profile', value: 'profile', icon: User, gradient: 'from-indigo-500 to-purple-500' },
          ].map(item => (
            <motion.button
              key={item.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(item.value)}
              className={`relative flex items-center gap-2 px-5 py-2 rounded-xl font-medium transition-all duration-200 ${
                activeTab === item.value 
                  ? `bg-gradient-to-r ${item.gradient} text-white shadow-md` 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {item.badge > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 shadow-lg"
                >
                  {item.badge}
                </motion.span>
              )}
            </motion.button>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {currentUser?.photoURL ? (
          <img src={currentUser.photoURL} className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/30" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
            <User size={18} className="text-white" />
          </div>
        )}
        <div className="text-sm">
          <p className="font-semibold text-slate-800 dark:text-white">{currentUser?.name}</p>
          <p className="text-xs text-slate-500">{connections.length} connections</p>
        </div>
      </div>
    </motion.div>
  );

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 dark:from-slate-950 dark:to-indigo-950/20">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="relative"
      >
        <div className="w-16 h-16 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 w-6 h-6" />
      </motion.div>
    </div>
  );
  
  if (!currentUser) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-50 dark:from-slate-950 dark:to-indigo-950/20">
      <div className="text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-xl">
          <User className="w-12 h-12 text-white" />
        </div>
        <p className="text-slate-600 dark:text-slate-400">Please sign in to continue</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        
        <DesktopNav />

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            
            {/* FEED TAB - Minimalist Card Design */}
            {activeTab === 'feed' && (
              <div className="max-w-2xl mx-auto space-y-6">
                {/* Create Post - Floating Card */}
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex gap-3">
                      {currentUser?.photoURL ? (
                        <img src={currentUser.photoURL} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <textarea
                          value={newPost}
                          onChange={e => setNewPost(e.target.value)}
                          placeholder={`What's happening, ${currentUser.name?.split(' ')[0]}?`}
                          className="w-full p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          rows={2}
                        />
                        
                        {mediaPreview && (
                          <div className="relative mt-3 rounded-xl overflow-hidden">
                            {mediaType === 'video' ? (
                              <video src={mediaPreview} controls className="w-full max-h-64" />
                            ) : (
                              <img src={mediaPreview} alt="preview" className="w-full max-h-64 object-cover" />
                            )}
                            <button 
                              onClick={() => { setMediaPreview(null); setMediaFile(null); }}
                              className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80"
                            >
                              <XCircle size={18} />
                            </button>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex gap-2">
                            <label className="cursor-pointer p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors">
                              <ImageIcon size={20} className="text-indigo-500" />
                              <input type="file" accept="image/*" hidden onChange={handleMediaUpload} />
                            </label>
                            <label className="cursor-pointer p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors">
                              <VideoIcon size={20} className="text-purple-500" />
                              <input type="file" accept="video/*" hidden onChange={handleMediaUpload} />
                            </label>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleNewPost}
                            disabled={!newPost.trim() && !mediaFile}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                          >
                            Post
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Posts Feed */}
                <div className="space-y-5">
                  {posts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
                    >
                      <div className="p-5">
                        {/* Post Header */}
                        <div className="flex items-center gap-3 mb-4">
                          {post.user.photoURL ? (
                            <img src={post.user.photoURL} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-800 dark:text-white">{post.user.name}</p>
                              <span className="text-xs text-slate-400">•</span>
                              <p className="text-xs text-slate-500">
                                {post.createdAt?.toDate?.() ? post.createdAt.toDate().toLocaleString() : 'Recent'}
                              </p>
                            </div>
                          </div>
                          {post.user.id === currentUser.id && (
                            <button onClick={() => handleDeletePost(post.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                        
                        {/* Post Content */}
                        {post.content && (
                          <p className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed">{post.content}</p>
                        )}
                        
                        {/* Media */}
                        {post.media && post.mediaType === 'image' && (
                          <div className="rounded-xl overflow-hidden mb-4">
                            <img src={post.media} alt="" className="w-full max-h-96 object-cover" />
                          </div>
                        )}
                        {post.media && post.mediaType === 'video' && (
                          <video src={post.media} controls className="rounded-xl mb-4 max-h-96 w-full" />
                        )}
                        
                        {/* Engagement */}
                        <div className="flex items-center gap-6 pt-2 border-t border-slate-200 dark:border-slate-700">
                          <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 py-2 text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors group">
                            <Heart size={20} className="group-hover:fill-red-500 group-hover:text-red-500" />
                            <span className="text-sm">{post.likes || 0}</span>
                          </button>
                          <button onClick={() => setSelectedPostId(selectedPostId === post.id ? null : post.id)} className="flex items-center gap-2 py-2 text-slate-600 dark:text-slate-400 hover:text-indigo-500 transition-colors">
                            <MessageSquare size={20} />
                            <span className="text-sm">{post.comments?.length || 0}</span>
                          </button>
                          <button className="flex items-center gap-2 py-2 text-slate-600 dark:text-slate-400 hover:text-indigo-500 transition-colors">
                            <Share2 size={18} />
                          </button>
                        </div>
                        
                        {/* Comments Section */}
                        {selectedPostId === post.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3"
                          >
                            {post.comments?.slice(-3).map((c, i) => (
                              <div key={i} className="text-sm bg-slate-50 dark:bg-slate-700/30 p-3 rounded-xl">
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{c.user}: </span>
                                <span className="text-slate-700 dark:text-slate-300">{c.content}</span>
                              </div>
                            ))}
                            <div className="flex gap-2">
                              <input
                                value={commentInputs[post.id] || ''}
                                onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                                placeholder="Write a comment..."
                                className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 focus:outline-none focus:border-indigo-500"
                                onKeyDown={e => e.key === 'Enter' && handleComment(post.id)}
                              />
                              <button onClick={() => handleComment(post.id)} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                                <Send size={18} />
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* NETWORK TAB - Glassmorphism Grid */}
            {activeTab === 'network' && (
              <div className="space-y-6">
                {/* Search Header */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-6">
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        value={networkSearch}
                        onChange={e => setNetworkSearch(e.target.value)}
                        placeholder="Find friends, colleagues, mentors..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-center">
                        <p className="text-2xl font-bold text-white">{totalUsers.toLocaleString()}</p>
                        <p className="text-[10px] text-indigo-100">Community</p>
                      </div>
                      <div className="px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-200 dark:border-emerald-800 text-center">
                        <p className="text-2xl font-bold text-emerald-600">{connections.length}</p>
                        <p className="text-[10px] text-emerald-600">Connections</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Users Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {users
                    .filter(u => u.id !== currentUser.id && (!networkSearch || u.name?.toLowerCase().includes(networkSearch.toLowerCase())))
                    .map((user, idx) => {
                      const isConnected = connections.includes(user.id);
                      const hasSent = sentConnectionRequests.includes(user.id);
                      const isBlocked = blockedUsers.includes(user.id);

                      let btn;
                      if (isBlocked) btn = <span className="px-4 py-2 bg-slate-500 text-white rounded-full text-sm">Blocked</span>;
                      else if (isConnected) btn = (
                        <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm flex items-center gap-1">
                          <CheckCircle size={14} /> Connected
                        </span>
                      );
                      else if (hasSent) btn = (
                        <button onClick={() => handleCancelSentRequest(user.id)} className="px-4 py-2 bg-amber-500 text-white rounded-full text-sm hover:bg-amber-600 transition-colors">
                          Cancel Request
                        </button>
                      );
                      else btn = (
                        <button onClick={() => handleSendConnectionRequest(user.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700 transition-colors flex items-center gap-1">
                          <UserPlus size={14} /> Connect
                        </button>
                      );

                      return (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.03 }}
                          className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-5 hover:shadow-xl transition-all hover:-translate-y-1"
                        >
                          <div className="flex items-start gap-4">
                            <div className="relative">
                              {user.photoURL ? (
                                <img src={user.photoURL} className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/20" />
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                  <User className="w-8 h-8 text-white" />
                                </div>
                              )}
                              {isConnected && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
                                  <CheckCircle size={12} className="text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-slate-800 dark:text-white">{user.name}</h4>
                              {user.role && (
                                <p className="text-xs text-slate-500 mt-0.5 capitalize">{user.role}</p>
                              )}
                              {user.school && (
                                <p className="text-xs text-slate-400 mt-1 truncate">{user.school}</p>
                              )}
                              <div className="mt-3">
                                {btn}
                              </div>
                            </div>
                            {!isBlocked && !isConnected && (
                              <button onClick={() => handleBlockUser(user.id, user.name)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                <Slash size={16} />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* REQUESTS TAB - Split View Design */}
            {activeTab === 'requests' && (
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Incoming Requests */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-violet-500/10 to-purple-500/10">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <UserPlus size={22} className="text-violet-500" />
                      Incoming Requests
                      {requestNotifications.length > 0 && (
                        <span className="bg-violet-500 text-white text-xs px-2 py-0.5 rounded-full">{requestNotifications.length}</span>
                      )}
                    </h2>
                  </div>
                  <div className="p-5 space-y-4">
                    {requestNotifications.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                          <UserPlus className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500">No pending requests</p>
                      </div>
                    ) : (
                      requestNotifications.map(notif => {
                        const sender = getUserById(notif.fromUserId);
                        const isAccepting = acceptingId === notif.fromUserId;
                        return (
                          <div key={notif.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                            {sender.photoURL ? (
                              <img src={sender.photoURL} className="w-14 h-14 rounded-full object-cover" />
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                <User className="w-7 h-7 text-white" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-bold text-slate-800 dark:text-white">{sender.name}</p>
                              <p className="text-sm text-slate-500">wants to connect</p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptRequest(notif.fromUserId)}
                                disabled={isAccepting}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
                              >
                                {isAccepting ? <Loader2 size={14} className="animate-spin" /> : 'Accept'}
                              </button>
                              <button
                                onClick={() => handleRejectRequest(notif.fromUserId)}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
                              >
                                Decline
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Sent Requests */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Clock size={22} className="text-amber-500" />
                      Sent Requests
                      {sentConnectionRequests.length > 0 && (
                        <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{sentConnectionRequests.length}</span>
                      )}
                    </h2>
                  </div>
                  <div className="p-5 space-y-3">
                    {sentConnectionRequests.length === 0 ? (
                      <div className="text-center py-8">
                        <Clock className="h-8 w-8 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-500">No sent requests</p>
                      </div>
                    ) : (
                      sentConnectionRequests.map(id => {
                        const u = getUserById(id);
                        return (
                          <div key={id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                            <div className="flex items-center gap-3">
                              {u.photoURL ? (
                                <img src={u.photoURL} className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <UserCircle size={40} className="text-slate-400" />
                              )}
                              <span className="font-medium">{u.name}</span>
                            </div>
                            <button onClick={() => handleCancelSentRequest(id)} className="px-4 py-1.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors">
                              Cancel
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MESSAGES TAB - Modern Chat Layout */}
            {activeTab === 'messages' && (
              <div className={isNarrowScreen ? "space-y-4" : "grid lg:grid-cols-12 gap-6"}>
                {(!isNarrowScreen || !selectedChat) && (
                  <div className="lg:col-span-4 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <MessageCircle size={20} className="text-indigo-500" />
                        Messages
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">{connections.length} conversations</p>
                    </div>
                    <div className="max-h-[calc(75vh-80px)] overflow-y-auto">
                      {connections.length === 0 ? (
                        <div className="text-center py-12 px-4">
                          <MessageCircle size={48} className="text-slate-400 mx-auto mb-3" />
                          <p className="text-slate-500">No connections yet</p>
                          <p className="text-xs text-slate-400 mt-1">Connect with people to start chatting</p>
                        </div>
                      ) : (
                        connections.map(id => {
                          const u = getUserById(id);
                          const chatId = [currentUser.id, id].sort().join('_');
                          const last = messages[chatId]?.slice(-1)[0];
                          return (
                            <button
                              key={id}
                              onClick={() => setSelectedChat(id)}
                              className={`w-full p-4 flex items-center gap-3 transition-all text-left hover:bg-slate-50 dark:hover:bg-slate-700/30 ${
                                selectedChat === id ? 'bg-indigo-50 dark:bg-indigo-950/40' : ''
                              }`}
                            >
                              {u.photoURL ? (
                                <img src={u.photoURL} className="w-12 h-12 rounded-full object-cover" />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                  <User className="w-6 h-6 text-white" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold truncate">{u.name}</div>
                                <div className="text-xs text-slate-500 truncate mt-0.5">
                                  {last ? (
                                    <span>{last.sender === currentUser.id ? 'You: ' : ''}{last.content?.slice(0, 35)}</span>
                                  ) : 'Start a conversation'}
                                </div>
                              </div>
                              {last && last.sender !== currentUser.id && !last.read && (
                                <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {(!isNarrowScreen || selectedChat) && (
                  <div className={`lg:col-span-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col ${isNarrowScreen ? 'h-[70vh]' : 'h-[75vh]'}`}>
                    {selectedChat ? (
                      <>
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                          {isNarrowScreen && (
                            <button onClick={() => setSelectedChat(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                              <ChevronLeft size={20} />
                            </button>
                          )}
                          {getUserById(selectedChat).photoURL ? (
                            <img src={getUserById(selectedChat).photoURL} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-bold">{getUserById(selectedChat).name}</h3>
                            {connections.includes(selectedChat) && (
                              <p className="text-xs text-emerald-600">Connected</p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                              <Phone size={18} />
                            </button>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                              <Video size={18} />
                            </button>
                          </div>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto space-y-3">
                          {(messages[[currentUser.id, selectedChat].sort().join('_')] || []).length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                              <MessageCircle size={48} className="mb-3 opacity-30" />
                              <p>No messages yet</p>
                              <p className="text-sm">Say hello!</p>
                            </div>
                          ) : (
                            messages[[currentUser.id, selectedChat].sort().join('_')].map((msg, i) => {
                              const isOwn = msg.sender === currentUser.id;
                              return (
                                <div key={msg.id || i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                                    isOwn 
                                      ? 'bg-indigo-600 text-white' 
                                      : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white'
                                  }`}>
                                    <p className="break-words text-sm">{msg.content}</p>
                                    <div className={`text-[10px] mt-1 ${isOwn ? 'text-indigo-200' : 'text-slate-400'}`}>
                                      {formatMessageTime(msg.createdAt)}
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          )}
                          <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-2">
                          <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                            <Smile size={20} className="text-slate-500" />
                          </button>
                          <input
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder={connections.includes(selectedChat) ? "Type a message..." : "Connect first to send messages"}
                            disabled={!connections.includes(selectedChat)}
                            className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                            onKeyDown={e => e.key === 'Enter' && connections.includes(selectedChat) && handleSendMessage()}
                          />
                          <button 
                            onClick={handleSendMessage} 
                            disabled={!newMessage.trim() || !connections.includes(selectedChat)} 
                            className="p-2.5 bg-indigo-600 text-white rounded-full disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                          >
                            {isSendingMessage ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <MessageCircle size={64} className="mb-4 opacity-30" />
                        <p className="font-medium">Select a conversation</p>
                        <p className="text-sm">Choose someone to start chatting</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* NOTIFICATIONS TAB - Timeline Style */}
            {activeTab === 'notifications' && (
              <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Bell size={22} className="text-amber-500" />
                    Notifications
                    {notifications.length > 0 && (
                      <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{notifications.length}</span>
                    )}
                  </h2>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {notifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-500">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n, idx) => (
                      <div key={n.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                            {n.type === 'connection_accepted' ? (
                              <UserCheck size={20} className="text-amber-600" />
                            ) : (
                              <Bell size={20} className="text-amber-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-800 dark:text-white">{n.title}</p>
                            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">{n.message}</p>
                            <p className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                              <Clock size={12} />
                              {n.createdAt?.toDate?.() ? n.createdAt.toDate().toLocaleString() : 'Recent'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* PROFILE TAB - Modern Dashboard Style */}
            {activeTab === 'profile' && (
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Profile Header Card */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="relative h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                  <div className="relative px-6 pb-6">
                    <div className="absolute -top-16 left-6">
                      <div className="relative">
                        {profilePhotoPreview ? (
                          <img src={profilePhotoPreview} className="w-28 h-28 rounded-full object-cover border-4 border-white dark:border-slate-800 shadow-xl" />
                        ) : (
                          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border-4 border-white dark:border-slate-800 shadow-xl flex items-center justify-center">
                            <User className="w-14 h-14 text-white" />
                          </div>
                        )}
                        {editingProfile && (
                          <label className="absolute bottom-1 right-1 bg-indigo-600 p-1.5 rounded-full cursor-pointer hover:bg-indigo-700 shadow-lg">
                            <Camera size={14} className="text-white" />
                            <input type="file" accept="image/*" hidden onChange={handleProfilePhotoUpload} />
                          </label>
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        {editingProfile ? (
                          <input
                            value={editedName}
                            onChange={e => setEditedName(e.target.value)}
                            className="text-2xl font-bold bg-transparent border-b-2 border-indigo-500 focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">{currentUser.name}</h2>
                        )}
                        <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                          <AtSign size={12} /> {currentUser.email}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        {!editingProfile ? (
                          <>
                            <button onClick={() => setEditingProfile(true)} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition-colors">
                              Edit Profile
                            </button>
                            <button onClick={() => auth.signOut()} className="px-5 py-2 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 transition-colors">
                              Sign Out
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={handleSaveProfile} className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700 transition-colors">
                              Save
                            </button>
                            <button onClick={() => { setEditingProfile(false); setEditedName(currentUser.name); setProfilePhotoPreview(currentUser.photoURL); }} className="px-5 py-2 bg-slate-600 text-white rounded-xl text-sm hover:bg-slate-700 transition-colors">
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-indigo-600">{myPosts.length}</p>
                        <p className="text-xs text-slate-500">Posts</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-emerald-600">{connections.length}</p>
                        <p className="text-xs text-slate-500">Connections</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-red-600">{blockedUsers.length}</p>
                        <p className="text-xs text-slate-500">Blocked</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* My Posts Section */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <MessageSquare size={20} className="text-indigo-500" />
                      My Posts
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {myPosts.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-500">No posts yet</p>
                      </div>
                    ) : (
                      myPosts.map(post => (
                        <div key={post.id} className="p-5 relative">
                          <p className="text-slate-700 dark:text-slate-300 mb-3">{post.content}</p>
                          {post.media && post.mediaType === 'image' && (
                            <img src={post.media} className="rounded-xl mb-3 max-h-48 object-cover" />
                          )}
                          {post.media && post.mediaType === 'video' && (
                            <video src={post.media} controls className="rounded-xl mb-3 max-h-48" />
                          )}
                          <div className="flex gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1"><Heart size={14} /> {post.likes || 0}</span>
                            <span className="flex items-center gap-1"><MessageSquare size={14} /> {post.comments?.length || 0}</span>
                          </div>
                          <button onClick={() => handleDeletePost(post.id)} className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-red-500">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Connections List */}
                {connections.length > 0 && (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Users size={20} className="text-indigo-500" />
                        Your Connections ({connections.length})
                      </h3>
                    </div>
                    <div className="p-5">
                      <div className="grid sm:grid-cols-2 gap-3">
                        {connections.slice(0, 6).map(id => {
                          const u = getUserById(id);
                          return (
                            <div key={id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 rounded-xl">
                              <div className="flex items-center gap-3">
                                {u.photoURL ? (
                                  <img src={u.photoURL} className="w-8 h-8 rounded-full object-cover" />
                                ) : (
                                  <UserCircle size={32} className="text-slate-400" />
                                )}
                                <span className="font-medium text-sm truncate">{u.name}</span>
                              </div>
                              <button onClick={() => handleBlockUser(id, u.name)} className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700">
                                Block
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
};

export default Connect;