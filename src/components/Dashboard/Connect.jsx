// Connect.jsx — FULL COMPLETE VERSION (one-sided messaging enabled)
// March 2025 style — all tabs filled in, no placeholders

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Bell, MessageCircle, Heart, MessageSquare, Send, 
  Image as ImageIcon, Video as VideoIcon, Trash2, UserPlus, 
  ChevronLeft, Loader2, UserCircle,
  UserCheck, Home, Users, User, Edit2, LogOut, Camera, Slash, AlertTriangle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

// Firebase
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

  const messagesEndRef = useRef(null);

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);

  const [acceptingId, setAcceptingId] = useState(null);

  useEffect(() => {
    const handleResize = () => setIsNarrowScreen(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auth listener
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

  // Real-time data
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

  // Chat listener + auto-scroll
  useEffect(() => {
    if (!currentUser?.id || !selectedChat) return;

    const chatId = [currentUser.id, selectedChat].sort().join('_');
    const q = query(collection(db, `chats/${chatId}/messages`), orderBy('createdAt'));

    const unsubscribe = onSnapshot(q, snap => {
      const newMsgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(prev => ({ ...prev, [chatId]: newMsgs }));
    }, err => {
      console.error("Chat listener error:", err);
      toast.error("Cannot load messages — check connection");
    });

    return unsubscribe;
  }, [currentUser?.id, selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedChat]);

  const formatMessageTime = (timestamp) => {
    if (!timestamp?.toDate) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now - date;
    if (diffMs < 60000) return 'just now';
    if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
    if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      await runTransaction(db, async (t) => {
        t.delete(doc(db, `users/${currentUser.id}/connections`, userId));
        t.delete(doc(db, `users/${userId}/connections`, currentUser.id));
        t.delete(doc(db, `users/${currentUser.id}/connectionRequestsSent`, userId));
      });
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
        sentAt: serverTimestamp()
      });

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
      await setDoc(doc(db, `users/${currentUser.id}/connections`, senderId), {
        connectedAt: serverTimestamp(),
        userId: senderId,
        status: 'accepted_by_me'
      });

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

      toast.success('Accepted! You can now chat.');
      setSelectedChat(senderId);
      setActiveTab('messages');
    } catch (err) {
      toast.error("Accept failed — check rules");
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
      toast.info('Request declined');
    } catch (err) {
      toast.error("Decline failed");
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
      toast.error(
        err.code === 'permission-denied'
          ? "Cannot send — connection may be required"
          : "Send failed"
      );
    }
  };

  const getUserById = (id) => users.find(u => u.id === id) || { name: 'Unknown', photoURL: null };

  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 border-t z-50 md:hidden">
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
            className={`flex flex-col items-center gap-1 p-2 flex-1 ${activeTab === item.value ? 'text-indigo-600' : 'text-slate-600 dark:text-slate-400'}`}
          >
            <item.icon size={24} />
            <span className="text-xs">{item.label}</span>
            {item.badge > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">{item.badge}</span>}
          </button>
        ))}
      </div>
    </div>
  );

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-indigo-600" /></div>;
  if (!currentUser) return <div className="min-h-screen flex items-center justify-center">Please sign in</div>;

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-gradient-to-br from-slate-50 to-violet-50/20 dark:from-slate-950 dark:to-slate-950">

      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* Desktop nav */}
        <div className="hidden md:flex justify-center gap-3 mb-8 bg-white/90 dark:bg-slate-900/70 rounded-2xl p-2 shadow-lg sticky top-4 z-40">
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
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium ${
                activeTab === item.value ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <item.icon size={18} /> {item.label}
              {item.badge > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{item.badge}</span>}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} variants={tabVariants} initial="initial" animate="animate" exit="exit" className="space-y-6">

            {activeTab === 'feed' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5">
                  <textarea
                    value={newPost}
                    onChange={e => setNewPost(e.target.value)}
                    placeholder={`What's on your mind, ${currentUser.name}?`}
                    className="w-full p-3 bg-transparent border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:border-indigo-500 resize-none min-h-[100px]"
                    rows={3}
                  />
                  {mediaPreview && (
                    <div className="mt-3 rounded-lg overflow-hidden border max-h-72">
                      {mediaType === 'video' ? (
                        <video src={mediaPreview} controls className="w-full" />
                      ) : (
                        <img src={mediaPreview} alt="preview" className="w-full object-contain" />
                      )}
                    </div>
                  )}
                  <div className="flex justify-between mt-4">
                    <div className="flex gap-4">
                      <label className="cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                        <ImageIcon size={22} className="text-slate-500" />
                        <input type="file" accept="image/*" hidden onChange={handleMediaUpload} />
                      </label>
                      <label className="cursor-pointer p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
                        <VideoIcon size={22} className="text-slate-500" />
                        <input type="file" accept="video/*" hidden onChange={handleMediaUpload} />
                      </label>
                    </div>
                    <button
                      onClick={handleNewPost}
                      disabled={!newPost.trim() && !mediaFile}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-full disabled:opacity-50"
                    >
                      Post
                    </button>
                  </div>
                </div>

                {posts.map(post => (
                  <div key={post.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 relative">
                    <div className="flex items-center gap-3 mb-4">
                      <UserCircle size={44} className="text-slate-400" />
                      <div>
                        <p className="font-medium">{post.user.name}</p>
                        <p className="text-xs text-slate-500">
                          {post.createdAt?.toDate?.() ? post.createdAt.toDate().toLocaleString() : 'Recent'}
                        </p>
                      </div>
                    </div>
                    <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
                    {post.media && <img src={post.media} alt="" className="rounded-lg mb-4 max-h-96 object-cover" />}

                    <div className="flex gap-10 mb-4 text-slate-600">
                      <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 hover:text-red-500">
                        <Heart size={20} /> {post.likes || 0}
                      </button>
                      <span className="flex items-center gap-1.5">
                        <MessageSquare size={20} /> {post.comments?.length || 0}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {post.comments?.map((c, i) => (
                        <div key={i} className="text-sm">
                          <span className="font-medium">{c.user}: </span>{c.content}
                        </div>
                      ))}
                      <div className="flex gap-3">
                        <input
                          value={commentInputs[post.id] || ''}
                          onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="Add a comment..."
                          className="flex-1 px-4 py-2 rounded-xl border bg-transparent focus:outline-none focus:border-indigo-500"
                          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleComment(post.id))}
                        />
                        <button onClick={() => handleComment(post.id)} className="p-2 bg-indigo-600 text-white rounded-xl">
                          <Send size={20} />
                        </button>
                      </div>
                    </div>

                    {post.user.id === currentUser.id && (
                      <button onClick={() => handleDeletePost(post.id)} className="absolute top-4 right-4 text-red-500">
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'network' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      value={networkSearch}
                      onChange={e => setNetworkSearch(e.target.value)}
                      placeholder="Search users..."
                      className="w-full pl-12 py-3 rounded-xl border bg-white/90 dark:bg-slate-800 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="bg-white/90 dark:bg-slate-900 px-6 py-3 rounded-2xl text-center font-medium">
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

                      let btn;
                      if (isBlocked) btn = <span className="px-5 py-2.5 bg-slate-500 text-white rounded-full">Blocked</span>;
                      else if (isConnected) btn = <span className="px-5 py-2.5 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-2"><UserCheck size={16} /> Connected</span>;
                      else if (hasSent) btn = (
                        <button onClick={() => handleCancelSentRequest(user.id)} className="px-5 py-2.5 bg-orange-600 text-white rounded-full">
                          Cancel Request
                        </button>
                      );
                      else btn = (
                        <button onClick={() => handleSendConnectionRequest(user.id)} className="px-5 py-2.5 bg-indigo-600 text-white rounded-full">
                          Connect
                        </button>
                      );

                      return (
                        <div key={user.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow p-4 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {user.photoURL ? <img src={user.photoURL} className="w-12 h-12 rounded-full" /> : <UserCircle size={48} className="text-slate-400" />}
                            <p className="font-medium truncate">{user.name || 'Unknown'}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            {btn}
                            {!isBlocked && !isConnected && (
                              <button onClick={() => handleBlockUser(user.id, user.name)} className="p-2.5 text-red-600 hover:bg-red-50 rounded-full">
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
                <h2 className="text-3xl font-bold flex items-center gap-3">
                  Connection Requests
                  {requestNotifications.length > 0 && <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">{requestNotifications.length}</span>}
                </h2>

                {requestNotifications.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center">
                    <UserPlus className="mx-auto h-16 w-16 text-slate-400 mb-4" />
                    <h3 className="text-xl font-medium">No pending requests</h3>
                  </div>
                ) : requestNotifications.map(notif => {
                  const sender = getUserById(notif.fromUserId);
                  const isAccepting = acceptingId === notif.fromUserId;

                  return (
                    <div key={notif.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 flex flex-col sm:flex-row gap-5">
                      {sender.photoURL ? <img src={sender.photoURL} className="w-16 h-16 rounded-full" /> : <UserCircle size={64} className="text-slate-400" />}
                      <div className="flex-1">
                        <p className="font-bold text-lg">{sender.name || 'Someone'}</p>
                        <p className="text-slate-600 mt-1">wants to connect with you</p>
                        <div className="flex gap-4 mt-6">
                          <button
                            onClick={() => handleAcceptRequest(notif.fromUserId)}
                            disabled={isAccepting}
                            className={`flex-1 py-3 bg-green-600 text-white rounded-xl flex items-center justify-center gap-2 ${isAccepting ? 'opacity-70' : ''}`}
                          >
                            {isAccepting ? <><Loader2 className="h-5 w-5 animate-spin" /> Accepting...</> : 'Accept'}
                          </button>
                          <button
                            onClick={() => handleRejectRequest(notif.fromUserId)}
                            className="flex-1 py-3 bg-red-100 text-red-700 rounded-xl"
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
                    <h3 className="text-xl font-semibold mb-4">Sent Requests ({sentConnectionRequests.length})</h3>
                    <div className="space-y-3">
                      {sentConnectionRequests.map(id => {
                        const u = getUserById(id);
                        return (
                          <div key={id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 flex items-center justify-between">
                            {u.photoURL ? <img src={u.photoURL} className="w-10 h-10 rounded-full" /> : <UserCircle size={40} className="text-slate-400" />}
                            <span className="font-medium truncate flex-1 ml-3">{u.name}</span>
                            <button onClick={() => handleCancelSentRequest(id)} className="px-5 py-2 bg-orange-600 text-white rounded-lg">
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
                  <div className="md:col-span-4 lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl shadow p-5">
                    <h3 className="font-bold text-lg mb-4">Conversations</h3>
                    {connections.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">No connections yet</div>
                    ) : (
                      <div className="space-y-1">
                        {connections.map(id => {
                          const u = getUserById(id);
                          const chatId = [currentUser.id, id].sort().join('_');
                          const last = messages[chatId]?.slice(-1)[0];

                          return (
                            <button
                              key={id}
                              onClick={() => setSelectedChat(id)}
                              className={`w-full p-3 rounded-xl flex items-center gap-3 ${selectedChat === id ? 'bg-indigo-50 dark:bg-indigo-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                              {u.photoURL ? <img src={u.photoURL} className="w-10 h-10 rounded-full" /> : <UserCircle size={40} className="text-slate-400" />}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">{u.name}</div>
                                <div className="text-xs text-slate-500 truncate">
                                  {last ? (last.sender === currentUser.id ? 'You: ' : '') + last.content.slice(0, 30) + (last.content.length > 30 ? '...' : '') : 'No messages'}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {(!isNarrowScreen || selectedChat) && (
                  <div className={`md:col-span-8 lg:col-span-9 bg-white dark:bg-slate-800 rounded-2xl shadow flex flex-col ${isNarrowScreen ? 'h-[60vh]' : 'h-[75vh]'}`}>
                    {selectedChat ? (
                      <>
                        <div className="p-4 border-b flex items-center gap-3 bg-white/50 dark:bg-slate-900/50">
                          {isNarrowScreen && <button onClick={() => setSelectedChat(null)}><ChevronLeft size={24} /></button>}
                          {getUserById(selectedChat).photoURL ? <img src={getUserById(selectedChat).photoURL} className="w-10 h-10 rounded-full" /> : <UserCircle size={40} />}
                          <div>
                            <h3 className="font-bold truncate">{getUserById(selectedChat).name}</h3>
                            {!connections.includes(selectedChat) && (
                              <p className="text-xs text-amber-600 flex items-center gap-1">
                                <AlertTriangle size={14} /> One-sided — they may not see messages
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 dark:bg-slate-950/30">
                          {(messages[[currentUser.id, selectedChat].sort().join('_')] || []).length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-500">
                              <MessageCircle size={48} className="mb-3 opacity-50" />
                              <p>No messages yet</p>
                            </div>
                          ) : (
                            messages[[currentUser.id, selectedChat].sort().join('_')].map((msg, i) => (
                              <div key={msg.id || i} className={`flex ${msg.sender === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                                  msg.sender === currentUser.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
                                }`}>
                                  {msg.content}
                                  <div className="text-xs opacity-70 mt-1 text-right">
                                    {formatMessageTime(msg.createdAt)}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                          <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t flex gap-2 bg-white/50 dark:bg-slate-900/50">
                          <input
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-5 py-3 rounded-full bg-slate-100 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                          />
                          <button onClick={handleSendMessage} disabled={!newMessage.trim()} className="p-3 bg-indigo-600 text-white rounded-full">
                            <Send size={20} />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-slate-500">
                        Select someone to chat
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold">Notifications</h2>
                {notifications.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center text-slate-500">
                    No notifications yet
                  </div>
                ) : notifications.map(n => (
                  <div key={n.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow p-5">
                    <p className="font-semibold">{n.title}</p>
                    <p className="mt-1">{n.message}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {n.createdAt?.toDate?.() ? n.createdAt.toDate().toLocaleString() : 'Recent'}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    <div className="relative">
                      {profilePhotoPreview ? (
                        <img src={profilePhotoPreview} className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-indigo-100" />
                      ) : (
                        <UserCircle size={160} className="text-slate-300" />
                      )}
                      {editingProfile && (
                        <label className="absolute bottom-2 right-2 bg-indigo-600 p-3 rounded-full cursor-pointer">
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
                          className="text-4xl font-bold w-full mb-3 bg-transparent border-b-2 border-indigo-500 focus:outline-none"
                          autoFocus
                        />
                      ) : (
                        <h2 className="text-4xl font-bold">{currentUser.name}</h2>
                      )}
                      <p className="mt-2 text-slate-600">{currentUser.email}</p>

                      <div className="mt-8 flex flex-wrap gap-4 justify-center sm:justify-start">
                        {!editingProfile ? (
                          <>
                            <button onClick={() => setEditingProfile(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-full flex items-center gap-2">
                              <Edit2 size={18} /> Edit Profile
                            </button>
                            <button onClick={() => auth.signOut()} className="px-6 py-3 bg-red-600 text-white rounded-full flex items-center gap-2">
                              <LogOut size={18} /> Sign Out
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={handleSaveProfile} className="px-6 py-3 bg-green-600 text-white rounded-full">
                              Save Changes
                            </button>
                            <button onClick={() => { setEditingProfile(false); setEditedName(currentUser.name); setProfilePhotoPreview(currentUser.photoURL); }} className="px-6 py-3 bg-slate-600 text-white rounded-full">
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 grid grid-cols-3 gap-6 text-center">
                    <div>
                      <p className="text-3xl font-bold">{myPosts.length}</p>
                      <p className="text-slate-600 mt-1">Posts</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{connections.length}</p>
                      <p className="text-slate-600 mt-1">Connections</p>
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{blockedUsers.length}</p>
                      <p className="text-slate-600 mt-1">Blocked</p>
                    </div>
                  </div>
                </div>

                {/* My Posts section */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold flex items-center gap-2"><MessageSquare size={24} className="text-indigo-600" /> My Posts</h3>
                  {myPosts.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center text-slate-500">
                      You haven't posted anything yet
                    </div>
                  ) : myPosts.map(post => (
                    <div key={post.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow p-5 relative">
                      <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
                      {post.media && <img src={post.media} className="rounded-lg mb-5 max-h-80 object-cover" />}
                      <div className="flex gap-10 text-sm text-slate-600">
                        <span className="flex items-center gap-1.5"><Heart size={18} /> {post.likes}</span>
                        <span className="flex items-center gap-1.5"><MessageSquare size={18} /> {post.comments?.length || 0}</span>
                      </div>
                      <button onClick={() => handleDeletePost(post.id)} className="absolute top-5 right-5 text-red-600">
                        <Trash2 size={22} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Connections list */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold flex items-center gap-2"><Users size={24} className="text-indigo-600" /> Connections ({connections.length})</h3>
                  {connections.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center text-slate-500">
                      No connections yet
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {connections.map(id => {
                        const u = getUserById(id);
                        return (
                          <div key={id} className="bg-white dark:bg-slate-800 rounded-2xl shadow p-5 flex items-center justify-between gap-4">
                            {u.photoURL ? <img src={u.photoURL} className="w-12 h-12 rounded-full" /> : <UserCircle size={48} className="text-slate-400" />}
                            <span className="font-medium truncate flex-1">{u.name}</span>
                            <button onClick={() => handleBlockUser(id, u.name)} className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm">
                              Block
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Blocked users */}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold flex items-center gap-2"><Slash size={24} className="text-red-500" /> Blocked Users ({blockedUsers.length})</h3>
                  {blockedUsers.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center text-slate-500">
                      No blocked users
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {blockedUsers.map(id => {
                        const u = getUserById(id);
                        return (
                          <div key={id} className="bg-white dark:bg-slate-800 rounded-2xl shadow p-5 flex items-center justify-between">
                            {u.photoURL ? <img src={u.photoURL} className="w-12 h-12 rounded-full" /> : <UserCircle size={48} className="text-slate-400" />}
                            <span className="font-medium truncate flex-1 ml-3">{u.name}</span>
                            <button onClick={() => handleUnblockUser(id)} className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm">
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