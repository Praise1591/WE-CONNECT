// Connect.jsx — Social network component with posts, connections, chat, and connection request notifications

import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, MessageCircle, Heart, MessageSquare, Send, 
  Image as ImageIcon, Video as VideoIcon, X, Trash2, UserPlus, 
  ChevronLeft, Loader2, Moon, Sun, UserCircle,
  Check, UserCheck, UserX, UserMinus, Share2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

// ── Firebase ────────────────────────────────────────────────────────────────
import { auth, db, storage } from '@/firebase'; // adjust path to your config
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
  getDocs    // ← added
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';

const tabVariants = {
  initial: { opacity: 0, x: -15 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, x: 15, transition: { duration: 0.2 } }
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

  // ── Auth listener ──────────────────────────────────────────────────────────
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

  // ── Real-time data listeners ───────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser?.id) return;

    const unsubs = [];

    unsubs.push(onSnapshot(collection(db, 'users'), snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }));

    unsubs.push(onSnapshot(query(collection(db, 'posts'), orderBy('createdAt', 'desc')), snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }));

    unsubs.push(onSnapshot(
      query(collection(db, 'notifications'), 
        where('toUserId', '==', currentUser.id),
        where('type', '==', 'activity'),
        orderBy('createdAt', 'desc')),
      snap => setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));

    unsubs.push(onSnapshot(
      query(collection(db, 'notifications'), 
        where('toUserId', '==', currentUser.id),
        where('type', '==', 'connection_request'),
        orderBy('createdAt', 'desc')),
      snap => setRequestNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    ));

    unsubs.push(onSnapshot(collection(db, `users/${currentUser.id}/connections`), snap => {
      setConnections(snap.docs.map(d => d.id));
    }));

    unsubs.push(onSnapshot(collection(db, `users/${currentUser.id}/connectionRequestsReceived`), snap => {
      setConnectionRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }));

    unsubs.push(onSnapshot(collection(db, `users/${currentUser.id}/connectionRequestsSent`), snap => {
      setSentConnectionRequests(snap.docs.map(d => d.id));
    }));

    unsubs.push(onSnapshot(collection(db, `users/${currentUser.id}/blocked`), snap => {
      setBlockedUsers(snap.docs.map(d => d.id));
    }));

    return () => unsubs.forEach(u => u());
  }, [currentUser?.id]);

  // Chat messages
  useEffect(() => {
    if (!currentUser?.id || !selectedChat) return;

    const chatId = [currentUser.id, selectedChat].sort().join('_');
    const q = query(collection(db, `chats/${chatId}/messages`), orderBy('createdAt'));

    return onSnapshot(q, snap => {
      setMessages(prev => ({
        ...prev,
        [chatId]: snap.docs.map(d => d.data())
      }));
    });
  }, [currentUser?.id, selectedChat]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

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

      // Clean up notification
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

      // Clean up notification
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Please sign in to use Connect</p>
      </div>
    );
  }

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Connect</h1>
          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode}>
              {isDarkMode ? <Sun /> : <Moon />}
            </button>
            <Bell onClick={() => setActiveTab('notifications')} className="cursor-pointer" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4">
          {['feed', 'network', 'messages', 'notifications'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full ${
                activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Feed */}
            {activeTab === 'feed' && (
              <div className="space-y-6">
                {/* Post form */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow">
                  <textarea
                    value={newPost}
                    onChange={e => setNewPost(e.target.value)}
                    placeholder={`What's on your mind, ${currentUser.name}?`}
                    className="w-full p-3 bg-transparent border rounded-xl focus:outline-none min-h-[90px]"
                  />
                  {mediaPreview && (
                    <div className="mt-3">
                      {mediaType === 'video' ? (
                        <video src={mediaPreview} controls className="max-h-64 rounded" />
                      ) : (
                        <img src={mediaPreview} alt="preview" className="max-h-64 rounded" />
                      )}
                    </div>
                  )}
                  <div className="flex justify-between mt-4">
                    <div className="flex gap-4">
                      <label className="cursor-pointer"><ImageIcon /><input type="file" accept="image/*" hidden onChange={handleMediaUpload} /></label>
                      <label className="cursor-pointer"><VideoIcon /><input type="file" accept="video/*" hidden onChange={handleMediaUpload} /></label>
                    </div>
                    <button onClick={handleNewPost} className="px-6 py-2 bg-indigo-600 text-white rounded-full">
                      Post
                    </button>
                  </div>
                </div>

                {/* Posts list */}
                {posts.map(post => (
                  <div key={post.id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow">
                    <p>{post.content}</p>
                    {post.media && <img src={post.media} alt="" className="mt-2 rounded" />}
                    <div className="flex gap-4 mt-4">
                      <button onClick={() => handleLike(post.id)}><Heart /> {post.likes}</button>
                      <button><MessageSquare /> {post.comments?.length || 0}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Network - user discovery */}
            {activeTab === 'network' && (
              <div className="space-y-6">
                <input
                  value={networkSearch}
                  onChange={e => setNetworkSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full p-3 rounded-xl border dark:bg-slate-800 dark:border-slate-600"
                />
                
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
                        <span className="px-4 py-2 bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 rounded-full flex items-center gap-2">
                          <UserCheck size={16} /> Connected
                        </span>
                      );
                    } else if (hasSentRequest) {
                      button = (
                        <button
                          onClick={() => handleCancelSentRequest(user.id)}
                          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full flex items-center gap-2 transition"
                        >
                          <X size={16} /> Cancel Request
                        </button>
                      );
                    } else if (isBlocked) {
                      button = (
                        <span className="px-4 py-2 bg-gray-500 text-white rounded-full">
                          Blocked
                        </span>
                      );
                    } else {
                      button = (
                        <button
                          onClick={() => handleSendConnectionRequest(user.id)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition flex items-center gap-2"
                        >
                          <UserPlus size={16} /> Connect
                        </button>
                      );
                    }

                    return (
                      <div 
                        key={user.id} 
                        className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          {user.photoURL ? (
                            <img 
                              src={user.photoURL} 
                              alt={user.name} 
                              className="w-10 h-10 rounded-full object-cover" 
                            />
                          ) : (
                            <UserCircle size={40} className="text-slate-400" />
                          )}
                          <span className="font-medium">{user.name}</span>
                        </div>
                        {button}
                      </div>
                    );
                  })}
              </div>
            )}

            {/* Messages tab */}
            {activeTab === 'messages' && (
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Chat list */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl p-4">
                  <h3 className="font-bold mb-4">Messages</h3>
                  {connections.map(id => {
                    const user = getUserById(id);
                    return (
                      <button
                        key={id}
                        onClick={() => setSelectedChat(id)}
                        className={`w-full p-3 text-left rounded-xl mb-2 flex items-center gap-3 ${
                          selectedChat === id ? 'bg-indigo-100 dark:bg-indigo-900' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" />
                        ) : (
                          <UserCircle size={32} className="text-slate-400" />
                        )}
                        <span>{user.name}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Chat window */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl flex flex-col">
                  {selectedChat ? (
                    <>
                      <div className="p-4 border-b dark:border-slate-700 flex items-center gap-3">
                        {getUserById(selectedChat).photoURL ? (
                          <img src={getUserById(selectedChat).photoURL} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                          <UserCircle size={40} className="text-slate-400" />
                        )}
                        <h3>{getUserById(selectedChat).name}</h3>
                      </div>
                      <div className="flex-1 p-4 overflow-y-auto">
                        {(messages[[currentUser.id, selectedChat].sort().join('_')] || []).map((msg, i) => (
                          <div key={i} className={`mb-3 ${msg.sender === currentUser.id ? 'text-right' : 'text-left'}`}>
                            <span className={`inline-block p-3 rounded-2xl max-w-[75%] ${
                              msg.sender === currentUser.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
                            }`}>
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
                          className="flex-1 p-3 rounded-full bg-slate-100 dark:bg-slate-700 focus:outline-none"
                          onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button onClick={handleSendMessage} className="p-3 bg-indigo-600 text-white rounded-full">
                          <Send size={20} />
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500">
                      Select a conversation
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold">Notifications</h3>

                {requestNotifications.length === 0 && notifications.length === 0 && (
                  <p className="text-slate-500 dark:text-slate-400">No notifications yet</p>
                )}

                {requestNotifications.map(notif => {
                  const sender = getUserById(notif.fromUserId);
                  return (
                    <div key={notif.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow">
                      <div className="flex items-center gap-3 mb-3">
                        {sender.photoURL ? (
                          <img src={sender.photoURL} alt="" className="w-10 h-10 rounded-full" />
                        ) : (
                          <UserCircle size={40} className="text-slate-400" />
                        )}
                        <p className="font-medium">
                          {sender.name} wants to connect with you
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleAcceptRequest(notif.fromUserId)}
                          className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(notif.fromUserId)}
                          className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}

                {notifications.map(notif => (
                  <div key={notif.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow">
                    <p>{notif.title}: {notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Connect;