// Connect.jsx - Optimized with useMemo, useCallback, and debounced search
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Search, Bell, MessageCircle, Heart, MessageSquare, Send, 
  Image as ImageIcon, Video as VideoIcon, Trash2, UserPlus, 
  ChevronLeft, Loader2, UserCircle,
  UserCheck, Home, Users, User, Edit2, LogOut, Camera, Slash,
  Sparkles, Compass, Gift, Star, Zap, MoreHorizontal,
  Bookmark, Share2, AtSign, Mic, Phone,
  Video, MoreVertical, CheckCircle, XCircle, Clock, Filter,
  TrendingUp, Flame, Crown, Coffee, Rocket, Palette,
  Reply, Download, ExternalLink, File, X, AlertTriangle, Shield, Ban,
  Smile, MapPin, Calendar, Globe, SendHorizontal
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { auth, db, storage } from '../../firebase';
import {
  collection, query, where, orderBy, onSnapshot, doc, getDoc, setDoc,
  updateDoc, deleteDoc, addDoc, serverTimestamp, increment,
  arrayUnion, getDocs, writeBatch
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const Connect = () => {
  // State variables
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
  const [blockedByUsers, setBlockedByUsers] = useState([]);
  const [messages, setMessages] = useState({});
  const [activeTab, setActiveTab] = useState('feed');
  const [networkSearch, setNetworkSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
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
  const [uploadingPost, setUploadingPost] = useState(false);
  
  // New states for chat features
  const [replyingTo, setReplyingTo] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [selectedMediaFile, setSelectedMediaFile] = useState(null);
  const [selectedMediaType, setSelectedMediaType] = useState(null);
  const [showMediaViewer, setShowMediaViewer] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [postPrivacy, setPostPrivacy] = useState('public');
  
  // Block modal state
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [userToBlock, setUserToBlock] = useState(null);
  const [isBlocking, setIsBlocking] = useState(false);

  // Refs
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const postInputRef = useRef(null);
  const renderCount = useRef(0);

  const minSwipeDistance = 50;

  // Log render count for debugging (remove in production)
  renderCount.current++;
  console.log(`Connect rendered ${renderCount.current} times`);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(networkSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [networkSearch]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => setIsNarrowScreen(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auth listener - runs once
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
        
        try {
          const blockedByRef = collection(db, `users/${firebaseUser.uid}/blockedBy`);
          const blockedBySnap = await getDocs(blockedByRef);
          setBlockedByUsers(blockedBySnap.docs.map(d => d.id));
        } catch (blockErr) {
          console.log('Could not load blockedBy list:', blockErr.message);
          setBlockedByUsers([]);
        }
      } catch (err) {
        console.error("Profile load error:", err);
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Firebase listeners - runs only when currentUser.id changes
  useEffect(() => {
    if (!currentUser?.id) return;

    const unsubs = [];

    // Users listener
    unsubs.push(onSnapshot(collection(db, 'users'), snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setTotalUsers(snap.size);
    }));

    // Posts listener
    unsubs.push(onSnapshot(
      query(collection(db, 'posts'), orderBy('createdAt', 'desc')),
      snap => setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));

    // My posts listener
    unsubs.push(onSnapshot(
      query(collection(db, 'posts'), where('user.id', '==', currentUser.id), orderBy('createdAt', 'desc')),
      snap => setMyPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));

    // Notifications listener
    unsubs.push(onSnapshot(
      query(collection(db, 'notifications'), where('toUserId', '==', currentUser.id), where('type', '!=', 'connection_request'), orderBy('createdAt', 'desc')),
      snap => setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));

    // Request notifications listener
    unsubs.push(onSnapshot(
      query(collection(db, 'notifications'), where('toUserId', '==', currentUser.id), where('type', '==', 'connection_request'), orderBy('createdAt', 'desc')),
      snap => setRequestNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));

    // Connections listener
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

    // Sent requests listener
    unsubs.push(onSnapshot(collection(db, `users/${currentUser.id}/connectionRequestsSent`), snap => 
      setSentConnectionRequests(snap.docs.map(d => d.id))
    ));

    // Blocked users listener
    unsubs.push(onSnapshot(collection(db, `users/${currentUser.id}/blocked`), snap => 
      setBlockedUsers(snap.docs.map(d => d.id))
    ));

    return () => unsubs.forEach(u => u());
  }, [currentUser?.id]);

  // Chat listener
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
    }, err => {
      console.error(`Chat listener failed:`, err.code, err.message);
    });

    return unsubscribe;
  }, [currentUser?.id, selectedChat]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChat]);

  // Initialize blockedBy collection
  useEffect(() => {
    if (!currentUser?.id) return;
    
    const initBlockedBy = async () => {
      try {
        const blockedByRef = collection(db, `users/${currentUser.id}/blockedBy`);
        await getDocs(blockedByRef);
      } catch (err) {
        if (err.code === 'permission-denied') {
          try {
            await setDoc(doc(db, `users/${currentUser.id}/blockedBy`, '_init'), {
              _init: true,
              createdAt: serverTimestamp()
            });
            await deleteDoc(doc(db, `users/${currentUser.id}/blockedBy`, '_init'));
          } catch (initErr) {
            console.log('Could not initialize blockedBy collection:', initErr.message);
          }
        }
      }
    };
    
    initBlockedBy();
  }, [currentUser?.id]);

  // Memoized filtered users for network tab
  const filteredUsers = useMemo(() => {
    return users.filter(u => 
      u.id !== currentUser?.id && 
      (!debouncedSearch || u.name?.toLowerCase().includes(debouncedSearch.toLowerCase()))
    );
  }, [users, currentUser?.id, debouncedSearch]);

  // Memoized filtered posts for feed
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const isBlocked = blockedUsers.includes(post.user?.id);
      const isBlockedBy = blockedByUsers.includes(post.user?.id);
      return !isBlocked && !isBlockedBy;
    });
  }, [posts, blockedUsers, blockedByUsers]);

  // Helper functions
  const formatMessageTime = useCallback((timestamp) => {
    if (!timestamp?.toDate) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now - date;
    if (diffMs < 60000) return 'just now';
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
    if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }, []);

  const getUserById = useCallback((id) => {
    return users.find(u => u.id === id) || { name: 'Unknown', photoURL: null };
  }, [users]);

  // Optimized post creation handler
  const handleNewPost = useCallback(async () => {
    if ((!newPost.trim() && !mediaFile) || uploadingPost) return;
    if (!auth.currentUser) {
      toast.error('Please sign in');
      return;
    }

    setUploadingPost(true);
    let mediaUrl = null;
    let mType = null;

    try {
      if (mediaFile) {
        const fileExt = mediaFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const sRef = storageRef(storage, `posts/${currentUser.id}/${fileName}`);
        
        await uploadBytes(sRef, mediaFile);
        mediaUrl = await getDownloadURL(sRef);
        mType = mediaFile.type.startsWith('video') ? 'video' : 'image';
      }

      await addDoc(collection(db, 'posts'), {
        user: { 
          id: currentUser.id, 
          name: currentUser.name || 'User', 
          photoURL: currentUser.photoURL 
        },
        content: newPost.trim() || null,
        media: mediaUrl,
        mediaType: mType,
        likes: 0,
        comments: [],
        commentsCount: 0,
        createdAt: serverTimestamp(),
        privacy: postPrivacy
      });
      
      // Clear form AFTER successful upload
      setNewPost('');
      setMediaPreview(null);
      setMediaType(null);
      setMediaFile(null);
      setPostPrivacy('public');
      toast.success('Posted!');
    } catch (err) {
      console.error("Post error:", err);
      toast.error("Failed to post. Please try again.");
    } finally {
      setUploadingPost(false);
    }
  }, [newPost, mediaFile, uploadingPost, currentUser, postPrivacy]);

  const handleDeletePost = useCallback(async (postId) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await deleteDoc(doc(db, 'posts', postId));
      toast.success('Post deleted');
    } catch (err) {
      toast.error("Delete failed");
    }
  }, []);

  const handleLike = useCallback(async (postId) => {
    try {
      await updateDoc(doc(db, 'posts', postId), { likes: increment(1) });
    } catch (err) {
      toast.error("Like failed");
    }
  }, []);

  const handleComment = useCallback(async (postId) => {
    const comment = commentInputs[postId]?.trim();
    if (!comment) {
      toast.error('Write a comment first');
      return;
    }

    try {
      await updateDoc(doc(db, 'posts', postId), {
        comments: arrayUnion({
          id: Date.now().toString(),
          user: currentUser?.name || 'User',
          userId: currentUser?.id,
          userPhoto: currentUser?.photoURL,
          content: comment,
          timestamp: serverTimestamp()
        }),
        commentsCount: increment(1)
      });
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));
      toast.success('Comment added');
    } catch (err) {
      toast.error("Comment failed");
    }
  }, [commentInputs, currentUser]);

  const handleMediaUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const maxSize = file.type.startsWith('video') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large. Max ${maxSize / (1024 * 1024)}MB`);
      return;
    }
    
    setMediaFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setMediaPreview(reader.result);
      setMediaType(file.type.startsWith('video') ? 'video' : 'image');
    };
    reader.readAsDataURL(file);
    
    e.target.value = '';
  }, []);

  const removeMediaPreview = useCallback(() => {
    setMediaPreview(null);
    setMediaType(null);
    setMediaFile(null);
  }, []);

  const handleProfilePhotoUpload = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setProfilePhotoPreview(reader.result);
    reader.readAsDataURL(file);
  }, []);

  const handleSaveProfile = useCallback(async () => {
    if (!editedName.trim()) return toast.error('Name required');

    try {
      let newPhotoURL = currentUser?.photoURL;
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
  }, [editedName, profilePhotoFile, currentUser]);

  const openBlockModal = useCallback((userId, userName) => {
    setUserToBlock({ id: userId, name: userName });
    setShowBlockModal(true);
  }, []);

  const executeBlock = useCallback(async () => {
    if (!userToBlock) return;
    
    setIsBlocking(true);
    
    try {
      await setDoc(doc(db, `users/${currentUser.id}/blocked`, userToBlock.id), {
        blockedAt: serverTimestamp(),
        name: userToBlock.name
      });
      
      try {
        await setDoc(doc(db, `users/${userToBlock.id}/blockedBy`, currentUser.id), {
          blockedAt: serverTimestamp(),
          name: currentUser.name
        });
      } catch (err) {
        console.warn('Could not add to blockedBy collection:', err.message);
      }
      
      const connectionQuery = query(
        collection(db, 'connections'),
        where('users', 'array-contains', currentUser.id),
        where('users', 'array-contains', userToBlock.id)
      );
      const connSnap = await getDocs(connectionQuery);
      const batch = writeBatch(db);
      connSnap.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      
      try {
        await deleteDoc(doc(db, `users/${currentUser.id}/connectionRequestsSent`, userToBlock.id));
        await deleteDoc(doc(db, `users/${userToBlock.id}/connectionRequestsSent`, currentUser.id));
      } catch (err) {}
      
      const chatId = [currentUser.id, userToBlock.id].sort().join('_');
      const chatMessagesRef = collection(db, `chats/${chatId}/messages`);
      const messagesSnap = await getDocs(chatMessagesRef);
      const deleteBatch = writeBatch(db);
      messagesSnap.docs.forEach(doc => deleteBatch.delete(doc.ref));
      await deleteBatch.commit();
      
      await deleteDoc(doc(db, 'chats', chatId)).catch(() => {});
      
      setConnections(prev => prev.filter(id => id !== userToBlock.id));
      if (selectedChat === userToBlock.id) {
        setSelectedChat(null);
        setReplyingTo(null);
      }
      
      setBlockedByUsers(prev => [...prev, userToBlock.id]);
      
      toast.success(`${userToBlock.name} has been blocked`);
      setShowBlockModal(false);
      setUserToBlock(null);
    } catch (err) {
      console.error("Block error:", err);
      toast.error("Block failed: " + err.message);
    } finally {
      setIsBlocking(false);
    }
  }, [userToBlock, currentUser, selectedChat]);

  const handleUnblockUser = useCallback(async (userId) => {
    const userToUnblock = users.find(u => u.id === userId);
    if (!window.confirm(`Unblock ${userToUnblock?.name || 'this user'}?`)) return;
    
    try {
      await deleteDoc(doc(db, `users/${currentUser.id}/blocked`, userId));
      try {
        await deleteDoc(doc(db, `users/${userId}/blockedBy`, currentUser.id));
      } catch (err) {
        console.warn('Could not remove from blockedBy collection:', err.message);
      }
      
      setBlockedByUsers(prev => prev.filter(id => id !== userId));
      toast.success('User unblocked');
    } catch (err) {
      toast.error("Unblock failed: " + err.message);
    }
  }, [currentUser, users]);

  const handleSendConnectionRequest = useCallback(async (userId) => {
    if (connections.includes(userId)) return toast.error('Already connected');
    if (sentConnectionRequests.includes(userId)) return toast.error('Request already sent');
    if (blockedUsers.includes(userId)) return toast.error('Cannot send request to blocked user');
    if (blockedByUsers.includes(userId)) return toast.error('You have been blocked by this user');

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
  }, [connections, sentConnectionRequests, blockedUsers, blockedByUsers, currentUser]);

  const handleCancelSentRequest = useCallback(async (targetUserId) => {
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
  }, [currentUser]);

  const handleAcceptRequest = useCallback(async (senderId) => {
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
      } catch (err) {}

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
      } catch (notifError) {}

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
  }, [acceptingId, currentUser]);

  const handleRejectRequest = useCallback(async (senderId) => {
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
  }, [currentUser]);

  const uploadMediaToStorage = useCallback(async (file) => {
    const sRef = storageRef(storage, `chat_media/${[currentUser.id, selectedChat].sort().join('_')}/${Date.now()}_${file.name}`);
    await uploadBytes(sRef, file);
    return await getDownloadURL(sRef);
  }, [currentUser?.id, selectedChat]);

  const sendChatMessage = useCallback(async (text, mediaUrl = null, mediaTypeParam = null) => {
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
      
      const messageData = {
        sender: currentUser.id,
        senderName: currentUser.name,
        createdAt: serverTimestamp(),
        read: false
      };
      
      if (text) {
        messageData.content = text;
      }
      
      if (mediaUrl) {
        messageData.mediaUrl = mediaUrl;
        messageData.mediaType = mediaTypeParam;
        if (!text) {
          messageData.content = mediaTypeParam === 'image' ? '📷 Photo' : '🎥 Video';
        }
      }
      
      if (replyingTo) {
        messageData.replyTo = {
          messageId: replyingTo.id,
          content: replyingTo.content,
          senderName: replyingTo.senderName,
          mediaType: replyingTo.mediaType,
          mediaUrl: replyingTo.mediaUrl
        };
        setReplyingTo(null);
      }
      
      await addDoc(collection(db, `chats/${chatId}/messages`), messageData);
      
      await updateDoc(chatRoomRef, {
        lastMessage: messageData.content,
        lastMessageTime: serverTimestamp(),
        lastMessageSender: currentUser.id,
        lastMessageSenderName: currentUser.name
      });
      
      return true;
    } catch (err) {
      console.error("Send message error:", err.message);
      toast.error("Failed to send message");
      return false;
    }
  }, [currentUser, selectedChat, replyingTo]);

  const handleMediaMessageUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedChat) return;
    
    if (!connections.includes(selectedChat)) {
      toast.error('Connect first to send media');
      return;
    }
    
    setUploadingMedia(true);
    
    try {
      const mediaUrl = await uploadMediaToStorage(file);
      const mediaTypeParam = file.type.startsWith('video') ? 'video' : 'image';
      
      await sendChatMessage(null, mediaUrl, mediaTypeParam);
      toast.success('Media sent!');
    } catch (err) {
      console.error("Media upload error:", err);
      toast.error("Failed to send media");
    } finally {
      setUploadingMedia(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [selectedChat, connections, uploadMediaToStorage, sendChatMessage]);

  const handleSendMessage = useCallback(async () => {
    if ((!newMessage.trim() && !selectedMediaFile) || !selectedChat || isSendingMessage) return;
    if (!connections.includes(selectedChat)) {
      toast.error('Connect first to send messages');
      return;
    }
    
    setIsSendingMessage(true);
    
    try {
      if (selectedMediaFile) {
        const file = selectedMediaFile;
        const mediaUrl = await uploadMediaToStorage(file);
        const mediaTypeParam = file.type.startsWith('video') ? 'video' : 'image';
        await sendChatMessage(null, mediaUrl, mediaTypeParam);
        setSelectedMediaFile(null);
        setSelectedMediaType(null);
      } else if (newMessage.trim()) {
        await sendChatMessage(newMessage.trim());
        setNewMessage('');
      }
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setIsSendingMessage(false);
    }
  }, [newMessage, selectedMediaFile, selectedChat, connections, isSendingMessage, uploadMediaToStorage, sendChatMessage]);

  const onTouchStart = useCallback((e, message) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    window.replyMessageData = message;
  }, []);

  const onTouchMove = useCallback((e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback((message) => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    
    if (isLeftSwipe && message.sender !== currentUser?.id) {
      setReplyingTo({
        id: message.id,
        content: message.content || (message.mediaType === 'image' ? '📷 Photo' : message.mediaType === 'video' ? '🎥 Video' : 'Media'),
        senderName: message.senderName,
        mediaType: message.mediaType,
        mediaUrl: message.mediaUrl
      });
      toast.info(`Replying to ${message.senderName}`);
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, currentUser?.id]);

  // Media Viewer Component
  const MediaViewer = useCallback(({ url, type, onClose }) => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full z-10">
        <X size={24} />
      </button>
      {type === 'image' ? (
        <img src={url} alt="Full size" className="max-w-full max-h-[90vh] object-contain" />
      ) : (
        <video src={url} controls autoPlay className="max-w-full max-h-[90vh]" />
      )}
    </motion.div>
  ), []);

  // Block Modal Component
  const BlockModal = useCallback(() => (
    <AnimatePresence>
      {showBlockModal && userToBlock && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => !isBlocking && setShowBlockModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Ban size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Block User</h3>
                  <p className="text-red-100 text-sm">This action can be reversed later</p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={24} className="text-amber-600 dark:text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-amber-800 dark:text-amber-400">Are you sure?</p>
                  <p className="text-sm text-amber-700 dark:text-amber-500">You won't be able to message or connect with them</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                {userToBlock.photoURL ? (
                  <img src={userToBlock.photoURL} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-bold text-slate-800 dark:text-white">{userToBlock.name}</p>
                  <p className="text-xs text-slate-500">will be blocked</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Shield size={14} className="text-red-500" />
                  They won't be able to message you
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Shield size={14} className="text-red-500" />
                  Your chat history will be hidden
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <Shield size={14} className="text-red-500" />
                  They won't see your posts or profile
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowBlockModal(false)}
                  disabled={isBlocking}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={executeBlock}
                  disabled={isBlocking}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isBlocking ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Blocking...
                    </>
                  ) : (
                    <>
                      <Ban size={18} />
                      Block User
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  ), [showBlockModal, userToBlock, isBlocking, executeBlock]);

  // Post Composer Component
  const PostComposer = useCallback(() => (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden mb-6"
    >
      <div className="p-4">
        <div className="flex gap-3">
          {currentUser?.photoURL ? (
            <img src={currentUser.photoURL} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setPostPrivacy(prev => prev === 'public' ? 'friends' : prev === 'friends' ? 'only-me' : 'public')}
                className="flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg text-xs text-slate-600 dark:text-slate-400"
              >
                <Globe size={12} />
                <span>{postPrivacy === 'public' ? 'Public' : postPrivacy === 'friends' ? 'Friends' : 'Only me'}</span>
              </button>
            </div>
            <textarea
              ref={postInputRef}
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder={`What's on your mind, ${currentUser?.name?.split(' ')[0] || 'User'}?`}
              className="w-full p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-white placeholder:text-slate-400"
              rows={mediaPreview ? 2 : 3}
            />
            
            {mediaPreview && (
              <div className="relative mt-3 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700">
                <div className="relative">
                  {mediaType === 'video' ? (
                    <video src={mediaPreview} controls className="w-full max-h-80 object-contain" />
                  ) : (
                    <img src={mediaPreview} alt="preview" className="w-full max-h-80 object-contain" />
                  )}
                  <button 
                    onClick={removeMediaPreview}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="p-2 text-xs text-slate-500 bg-slate-100 dark:bg-slate-700 flex items-center justify-between">
                  <span>{mediaFile?.name}</span>
                  <span>{mediaFile && (mediaFile.size / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="flex gap-2">
                <label className="cursor-pointer p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-colors group">
                  <ImageIcon size={20} className="text-green-500 group-hover:scale-110 transition-transform" />
                  <span className="sr-only">Photo</span>
                  <input type="file" accept="image/*" hidden onChange={handleMediaUpload} />
                </label>
                <label className="cursor-pointer p-2 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-xl transition-colors group">
                  <VideoIcon size={20} className="text-purple-500 group-hover:scale-110 transition-transform" />
                  <span className="sr-only">Video</span>
                  <input type="file" accept="video/*" hidden onChange={handleMediaUpload} />
                </label>
                <button className="p-2 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-colors group">
                  <Smile size={20} className="text-amber-500 group-hover:scale-110 transition-transform" />
                </button>
                <button className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl transition-colors group">
                  <MapPin size={20} className="text-blue-500 group-hover:scale-110 transition-transform" />
                </button>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNewPost}
                disabled={(!newPost.trim() && !mediaFile) || uploadingPost}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium disabled:opacity-50 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md flex items-center gap-2"
              >
                {uploadingPost ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <SendHorizontal size={16} />
                    Post
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  ), [currentUser, newPost, mediaPreview, mediaType, mediaFile, uploadingPost, postPrivacy, handleMediaUpload, removeMediaPreview, handleNewPost]);

  // Post Card Component
  const PostCard = useCallback(({ post, index }) => {
    const [showComments, setShowComments] = useState(false);
    const [localComment, setLocalComment] = useState('');
    const [isLiking, setIsLiking] = useState(false);
    
    const handleLocalLike = async () => {
      if (isLiking) return;
      setIsLiking(true);
      await handleLike(post.id);
      setIsLiking(false);
    };
    
    const handleLocalComment = async () => {
      if (!localComment.trim()) return;
      setCommentInputs(prev => ({ ...prev, [post.id]: localComment }));
      await handleComment(post.id);
      setLocalComment('');
    };
    
    return (
      <motion.div
        key={post.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            {post.user.photoURL ? (
              <img src={post.user.photoURL} className="w-10 h-10 rounded-full object-cover cursor-pointer" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center cursor-pointer">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-slate-800 dark:text-white hover:underline cursor-pointer">
                  {post.user.name}
                </p>
                <span className="text-xs text-slate-400">•</span>
                <p className="text-xs text-slate-500">
                  {post.createdAt?.toDate?.() ? post.createdAt.toDate().toLocaleString() : 'Just now'}
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <Globe size={10} />
                <span>{post.privacy === 'public' ? 'Public' : post.privacy === 'friends' ? 'Friends' : 'Only me'}</span>
              </div>
            </div>
            {post.user.id === currentUser?.id && (
              <button 
                onClick={() => handleDeletePost(post.id)} 
                className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
          
          {post.content && (
            <p className="mb-4 text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {post.content}
            </p>
          )}
          
          {post.media && post.mediaType === 'image' && (
            <div className="rounded-xl overflow-hidden mb-3 -mx-4">
              <img 
                src={post.media} 
                alt="Post" 
                className="w-full max-h-[500px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => setShowMediaViewer({ url: post.media, type: 'image' })}
              />
            </div>
          )}
          
          {post.media && post.mediaType === 'video' && (
            <div className="rounded-xl overflow-hidden mb-3 -mx-4">
              <video 
                src={post.media} 
                controls 
                className="w-full max-h-[500px]"
                onClick={() => setShowMediaViewer({ url: post.media, type: 'video' })}
              />
            </div>
          )}
          
          <div className="flex items-center justify-between pt-2 pb-1 text-sm text-slate-500">
            <div className="flex items-center gap-1">
              <Heart size={14} className="fill-red-500 text-red-500" />
              <span>{post.likes || 0} likes</span>
            </div>
            <div className="flex gap-3">
              <span>{post.comments?.length || 0} comments</span>
            </div>
          </div>
          
          <div className="flex items-center justify-around pt-2 border-t border-slate-200 dark:border-slate-700">
            <button 
              onClick={handleLocalLike}
              disabled={isLiking}
              className="flex items-center gap-2 py-2 px-4 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
            >
              <Heart size={20} className="group-hover:fill-red-500 group-hover:text-red-500 transition-colors" />
              <span className="text-sm font-medium">Like</span>
            </button>
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-2 py-2 px-4 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
            >
              <MessageSquare size={20} className="group-hover:text-indigo-500 transition-colors" />
              <span className="text-sm font-medium">Comment</span>
            </button>
            <button className="flex items-center gap-2 py-2 px-4 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group">
              <Share2 size={18} className="group-hover:text-green-500 transition-colors" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
          
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3"
            >
              {post.comments?.slice(-5).reverse().map((comment, i) => (
                <div key={i} className="flex gap-2">
                  {comment.userPhoto ? (
                    <img src={comment.userPhoto} className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center flex-shrink-0">
                      <User size={14} className="text-white" />
                    </div>
                  )}
                  <div className="flex-1 bg-slate-100 dark:bg-slate-700/50 rounded-2xl px-3 py-2">
                    <p className="font-semibold text-sm text-slate-800 dark:text-white">{comment.user}</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{comment.content}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {comment.timestamp?.toDate?.() ? formatMessageTime(comment.timestamp) : 'Just now'}
                    </p>
                  </div>
                </div>
              ))}
              
              <div className="flex gap-2 mt-3">
                {currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <User size={14} className="text-white" />
                  </div>
                )}
                <div className="flex-1 flex gap-2">
                  <input
                    value={localComment}
                    onChange={e => setLocalComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 focus:outline-none focus:border-indigo-500 text-sm"
                    onKeyDown={e => e.key === 'Enter' && handleLocalComment()}
                  />
                  <button 
                    onClick={handleLocalComment}
                    disabled={!localComment.trim()}
                    className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  }, [currentUser, handleLike, handleComment, handleDeletePost, formatMessageTime]);

  const BottomNav = useCallback(() => (
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
  ), [activeTab, requestNotifications.length, notifications.length]);

  const DesktopNav = useCallback(() => (
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
  ), [activeTab, currentUser, connections.length, requestNotifications.length, notifications.length]);

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
            
            {/* FEED TAB */}
            {activeTab === 'feed' && (
              <div className="max-w-2xl mx-auto">
                <PostComposer />
                <div className="space-y-4">
                  {filteredPosts.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Sparkles size={32} className="text-indigo-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">No posts yet</h3>
                      <p className="text-slate-500 dark:text-slate-400">Be the first to share something with the community!</p>
                    </div>
                  ) : (
                    filteredPosts.map((post, index) => (
                      <PostCard key={post.id} post={post} index={index} />
                    ))
                  )}
                </div>
              </div>
            )}

            {/* NETWORK TAB */}
            {activeTab === 'network' && (
              <div className="space-y-6">
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

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredUsers.map((user, idx) => {
                    const isConnected = connections.includes(user.id);
                    const hasSent = sentConnectionRequests.includes(user.id);
                    const isBlocked = blockedUsers.includes(user.id);
                    const isBlockedBy = blockedByUsers.includes(user.id);

                    let btn;
                    if (isBlocked) {
                      btn = <button onClick={() => handleUnblockUser(user.id)} className="px-4 py-2 bg-emerald-600 text-white rounded-full text-sm hover:bg-emerald-700 transition-colors">Unblock</button>;
                    } else if (isBlockedBy) {
                      btn = <span className="px-4 py-2 bg-red-500 text-white rounded-full text-sm">Blocked You</span>;
                    } else if (isConnected) {
                      btn = <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm flex items-center gap-1"><CheckCircle size={14} /> Connected</span>;
                    } else if (hasSent) {
                      btn = <button onClick={() => handleCancelSentRequest(user.id)} className="px-4 py-2 bg-amber-500 text-white rounded-full text-sm hover:bg-amber-600 transition-colors">Cancel Request</button>;
                    } else {
                      btn = <button onClick={() => handleSendConnectionRequest(user.id)} className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700 transition-colors flex items-center gap-1"><UserPlus size={14} /> Connect</button>;
                    }

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
                            <div className="mt-3">{btn}</div>
                          </div>
                          {!isBlocked && !isConnected && !isBlockedBy && (
                            <button 
                              onClick={() => openBlockModal(user.id, user.name)} 
                              className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"
                              title="Block user"
                            >
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

            {/* REQUESTS TAB (simplified for brevity - same as original but with useMemo) */}
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

            {/* MESSAGES TAB (simplified for brevity - same functionality) */}
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
                        connections
                          .filter(id => !blockedUsers.includes(id) && !blockedByUsers.includes(id))
                          .map(id => {
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
                            <button onClick={() => { setSelectedChat(null); setReplyingTo(null); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
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
                            {connections.includes(selectedChat) && <p className="text-xs text-emerald-600">Connected</p>}
                            {blockedUsers.includes(selectedChat) && <p className="text-xs text-red-600">Blocked</p>}
                            {blockedByUsers.includes(selectedChat) && <p className="text-xs text-red-600">Blocked You</p>}
                          </div>
                          <div className="flex gap-1">
                            {!blockedUsers.includes(selectedChat) && !blockedByUsers.includes(selectedChat) && connections.includes(selectedChat) && (
                              <>
                                <label className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full cursor-pointer">
                                  <ImageIcon size={18} className="text-indigo-500" />
                                  <input type="file" accept="image/*,video/*" hidden ref={fileInputRef} onChange={handleMediaMessageUpload} />
                                </label>
                                <button 
                                  onClick={() => openBlockModal(selectedChat, getUserById(selectedChat).name)}
                                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"
                                  title="Block user"
                                >
                                  <Ban size={18} className="text-red-500" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {replyingTo && (
                          <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <Reply size={14} className="text-indigo-500" />
                              <span className="text-slate-600 dark:text-slate-400">
                                Replying to <span className="font-semibold text-indigo-600">{replyingTo.senderName}</span>
                              </span>
                              <span className="text-slate-500 truncate max-w-[200px]">"{replyingTo.content?.slice(0, 50)}"</span>
                            </div>
                            <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                              <XCircle size={16} />
                            </button>
                          </div>
                        )}

                        <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-3">
                          {(messages[[currentUser.id, selectedChat].sort().join('_')] || []).length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                              <MessageCircle size={48} className="mb-3 opacity-30" />
                              <p>No messages yet</p>
                              <p className="text-sm">Say hello!</p>
                            </div>
                          ) : (
                            messages[[currentUser.id, selectedChat].sort().join('_')].map((msg, i) => {
                              const isOwn = msg.sender === currentUser.id;
                              const showSwipeInstruction = !isOwn && !replyingTo;
                              
                              return (
                                <div
                                  key={msg.id || i}
                                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} message-item`}
                                  onTouchStart={(e) => showSwipeInstruction && onTouchStart(e, msg)}
                                  onTouchMove={showSwipeInstruction ? onTouchMove : undefined}
                                  onTouchEnd={() => showSwipeInstruction && onTouchEnd(msg)}
                                >
                                  <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                                    {msg.replyTo && (
                                      <div className={`mb-1 px-3 py-1.5 rounded-lg text-xs ${isOwn ? 'bg-indigo-700/50' : 'bg-slate-200 dark:bg-slate-700'} border-l-3 border-indigo-500`}>
                                        <p className="font-semibold text-indigo-600 dark:text-indigo-400">↪ {msg.replyTo.senderName}</p>
                                        <p className="text-slate-500 dark:text-slate-400 truncate">{msg.replyTo.content}</p>
                                      </div>
                                    )}
                                    
                                    <div className={`px-4 py-2.5 rounded-2xl ${
                                      isOwn ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white'
                                    }`}>
                                      {msg.mediaUrl && msg.mediaType === 'image' && (
                                        <div className="mb-2">
                                          <img 
                                            src={msg.mediaUrl} 
                                            alt="Shared image" 
                                            className="rounded-lg max-w-full max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                            onClick={() => setShowMediaViewer({ url: msg.mediaUrl, type: 'image' })}
                                          />
                                        </div>
                                      )}
                                      {msg.mediaUrl && msg.mediaType === 'video' && (
                                        <div className="mb-2">
                                          <video 
                                            src={msg.mediaUrl} 
                                            controls 
                                            className="rounded-lg max-w-full max-h-48"
                                            onClick={() => setShowMediaViewer({ url: msg.mediaUrl, type: 'video' })}
                                          />
                                        </div>
                                      )}
                                      {msg.content && msg.content !== '📷 Photo' && msg.content !== '🎥 Video' && (
                                        <p className="break-words text-sm">{msg.content}</p>
                                      )}
                                      <div className={`text-[10px] mt-1 ${isOwn ? 'text-indigo-200' : 'text-slate-400'}`}>
                                        {formatMessageTime(msg.createdAt)}
                                      </div>
                                    </div>
                                    
                                    {showSwipeInstruction && (
                                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Reply size={10} />
                                        <span>Swipe left to reply</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                          <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                          {selectedMediaFile && (
                            <div className="mb-3 p-2 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {selectedMediaType === 'image' ? <ImageIcon size={20} className="text-indigo-500" /> : <VideoIcon size={20} className="text-purple-500" />}
                                <span className="text-sm truncate">{selectedMediaFile.name}</span>
                              </div>
                              <button onClick={() => { setSelectedMediaFile(null); setSelectedMediaType(null); }} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded">
                                <XCircle size={16} />
                              </button>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            {!blockedUsers.includes(selectedChat) && !blockedByUsers.includes(selectedChat) && connections.includes(selectedChat) && (
                              <label className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full cursor-pointer">
                                <ImageIcon size={20} className="text-indigo-500" />
                                <input 
                                  type="file" 
                                  accept="image/*,video/*" 
                                  hidden 
                                  onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      setSelectedMediaFile(file);
                                      setSelectedMediaType(file.type.startsWith('video') ? 'video' : 'image');
                                    }
                                  }}
                                />
                              </label>
                            )}
                            <input
                              value={newMessage}
                              onChange={e => setNewMessage(e.target.value)}
                              placeholder={!connections.includes(selectedChat) ? "Connect first to send messages" : blockedUsers.includes(selectedChat) ? "You blocked this user" : blockedByUsers.includes(selectedChat) ? "You have been blocked" : "Type a message..."}
                              disabled={!connections.includes(selectedChat) || blockedUsers.includes(selectedChat) || blockedByUsers.includes(selectedChat)}
                              className="flex-1 px-4 py-2.5 rounded-full bg-slate-100 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                              onKeyDown={e => e.key === 'Enter' && connections.includes(selectedChat) && !blockedUsers.includes(selectedChat) && !blockedByUsers.includes(selectedChat) && handleSendMessage()}
                            />
                            <button 
                              onClick={handleSendMessage} 
                              disabled={(!newMessage.trim() && !selectedMediaFile) || !connections.includes(selectedChat) || blockedUsers.includes(selectedChat) || blockedByUsers.includes(selectedChat) || uploadingMedia || isSendingMessage} 
                              className="p-2.5 bg-indigo-600 text-white rounded-full disabled:opacity-50 hover:bg-indigo-700 transition-colors"
                            >
                              {uploadingMedia || isSendingMessage ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            </button>
                          </div>
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

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Bell size={22} className="text-amber-500" />
                    Notifications
                    {notifications.length > 0 && <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">{notifications.length}</span>}
                  </h2>
                </div>
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {notifications.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-500">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                            {n.type === 'connection_accepted' ? <UserCheck size={20} className="text-amber-600" /> : <Bell size={20} className="text-amber-600" />}
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

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="max-w-3xl mx-auto space-y-6">
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
                          const isBlocked = blockedUsers.includes(id);
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
                              <button 
                                onClick={() => isBlocked ? handleUnblockUser(id) : openBlockModal(id, u.name)} 
                                className={`px-3 py-1 rounded-lg text-xs transition-colors ${isBlocked ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
                              >
                                {isBlocked ? 'Unblock' : 'Block'}
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
      
      <BlockModal />
      
      <AnimatePresence>
        {showMediaViewer && (
          <MediaViewer 
            url={showMediaViewer.url} 
            type={showMediaViewer.type} 
            onClose={() => setShowMediaViewer(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Connect;