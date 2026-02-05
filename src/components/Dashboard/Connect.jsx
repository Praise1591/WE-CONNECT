// Connect.jsx — Social network component with posts, connections, chat, and connection request notifications

import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, MessageCircle, Heart, MessageSquare, Send, 
  Image as ImageIcon, Video as VideoIcon, X, Trash2, UserPlus, 
  Users, ChevronLeft, Loader2, Moon, Sun, UserCircle,
  Check, UserCheck, UserX, UserMinus, Share2
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [messages, setMessages] = useState({});
  const [activeTab, setActiveTab] = useState('feed');
  const [networkSearch, setNetworkSearch] = useState('');
  const [newPost, setNewPost] = useState('');
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
           (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      let profile = localStorage.getItem('userProfile');
      if (!profile) {
        const defaultUser = { id: Date.now(), name: 'Praise' };
        localStorage.setItem('userProfile', JSON.stringify(defaultUser));
        profile = JSON.stringify(defaultUser);
      }
      const parsedProfile = JSON.parse(profile);
      setCurrentUser(parsedProfile);

      let storedUsers = localStorage.getItem('connectUsers');
      if (!storedUsers) {
        const dummy = [
          { id: 1, name: 'Alice Johnson' },
          { id: 2, name: 'Bob Smith' },
          { id: 3, name: 'Charlie Davis' },
          { id: 4, name: 'Dana Evans' },
          { id: 5, name: 'Emma Wilson' },
        ];
        localStorage.setItem('connectUsers', JSON.stringify(dummy));
        storedUsers = JSON.stringify(dummy);
      }
      setUsers(JSON.parse(storedUsers));

      setPosts(JSON.parse(localStorage.getItem('connectPosts') || '[]'));
      setNotifications(JSON.parse(localStorage.getItem('connectNotifications') || '[]'));
      setConnections(JSON.parse(localStorage.getItem('connectConnections') || '[]'));
      setMessages(JSON.parse(localStorage.getItem('connectMessages') || '{}'));
      setBlockedUsers(JSON.parse(localStorage.getItem('connectBlockedUsers') || '[]'));

      let storedRequests = localStorage.getItem('connectConnectionRequests');
      if (!storedRequests) {
        const dummyRequests = [
          { id: Date.now() - 1000, from: 1, to: parsedProfile.id, timestamp: new Date().toLocaleString() },
          { id: Date.now() - 2000, from: 2, to: parsedProfile.id, timestamp: new Date().toLocaleString() },
        ];
        localStorage.setItem('connectConnectionRequests', JSON.stringify(dummyRequests));
        storedRequests = JSON.stringify(dummyRequests);
      }
      setConnectionRequests(JSON.parse(storedRequests));

      let storedReqNotifs = localStorage.getItem('connectRequestNotifications');
      if (!storedReqNotifs) {
        const dummyReqNotifs = [
          {
            id: Date.now() - 1500,
            requestId: JSON.parse(storedRequests)[0].id,
            title: 'Connection Request',
            message: 'Alice Johnson wants to connect with you',
            fromUserId: 1,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false
          },
          {
            id: Date.now() - 2500,
            requestId: JSON.parse(storedRequests)[1].id,
            title: 'Connection Request',
            message: 'Bob Smith wants to connect with you',
            fromUserId: 2,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: false
          },
        ];
        localStorage.setItem('connectRequestNotifications', JSON.stringify(dummyReqNotifs));
        storedReqNotifs = JSON.stringify(dummyReqNotifs);
      }
      setRequestNotifications(JSON.parse(storedReqNotifs));

      setIsLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const addNotification = (title, message, type = 'info') => {
    const notif = { 
      id: Date.now(), 
      title, 
      message, 
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    const updated = [notif, ...notifications];
    setNotifications(updated);
    localStorage.setItem('connectNotifications', JSON.stringify(updated));
    toast[type === 'success' ? 'success' : type === 'error' ? 'error' : 'info'](`${title}: ${message}`);
  };

  const addRequestNotification = (requestId, title, message, fromUserId) => {
    const notif = {
      id: Date.now(),
      requestId,
      title,
      message,
      fromUserId,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    const updated = [notif, ...requestNotifications];
    setRequestNotifications(updated);
    localStorage.setItem('connectRequestNotifications', JSON.stringify(updated));
  };

  const markRequestNotificationAsRead = (notifId) => {
    const updated = requestNotifications.map(n => 
      n.id === notifId ? { ...n, read: true } : n
    );
    setRequestNotifications(updated);
    localStorage.setItem('connectRequestNotifications', JSON.stringify(updated));
  };

  const removeNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('connectNotifications', JSON.stringify(updated));
  };

  const handleBlockUser = (userId, userName) => {
    if (blockedUsers.includes(userId)) {
      const updated = blockedUsers.filter(id => id !== userId);
      setBlockedUsers(updated);
      localStorage.setItem('connectBlockedUsers', JSON.stringify(updated));
      toast.success(`Unblocked ${userName}`);
      addNotification('User Unblocked', `You unblocked ${userName}`);
    } else {
      const updated = [...blockedUsers, userId];
      setBlockedUsers(updated);
      localStorage.setItem('connectBlockedUsers', JSON.stringify(updated));
      
      if (connections.includes(userId)) {
        const newConnections = connections.filter(id => id !== userId);
        setConnections(newConnections);
        localStorage.setItem('connectConnections', JSON.stringify(newConnections));
      }

      if (selectedChat === userId) {
        setSelectedChat(null);
      }

      toast.success(`Blocked ${userName}`);
      addNotification('User Blocked', `You blocked ${userName}`);
    }
  };

  const handleNewPost = () => {
    if (!newPost.trim()) return toast.error('Post cannot be empty');
    
    const post = {
      id: Date.now(),
      user: { ...currentUser },
      content: newPost,
      media: mediaPreview,
      mediaType,
      likes: 0,
      comments: [],
      timestamp: new Date().toLocaleString(),
    };

    const updated = [post, ...posts];
    setPosts(updated);
    localStorage.setItem('connectPosts', JSON.stringify(updated));
    setNewPost('');
    setMediaPreview(null);
    setMediaType(null);
    toast.success('Posted!');
  };

  const handleLike = (postId) => {
    const updated = posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p);
    setPosts(updated);
    localStorage.setItem('connectPosts', JSON.stringify(updated));
  };

  const handleComment = (postId) => {
    const comment = commentInputs[postId]?.trim();
    if (!comment) return toast.error('Comment cannot be empty');

    const updated = posts.map(p => 
      p.id === postId 
        ? { ...p, comments: [...p.comments, { user: currentUser.name, content: comment, timestamp: new Date().toLocaleTimeString() }] } 
        : p
    );
    setPosts(updated);
    localStorage.setItem('connectPosts', JSON.stringify(updated));
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    toast.success('Comment added');
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setMediaPreview(reader.result);
        setMediaType(file.type.startsWith('video') ? 'video' : 'image');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendConnectionRequest = (userId) => {
    if (connections.includes(userId)) return toast.error('Already connected');
    if (connectionRequests.some(r => r.from === currentUser.id && r.to === userId)) {
      return toast.error('Request already sent');
    }
    if (blockedUsers.includes(userId)) return toast.error('Cannot send request to blocked user');

    const request = {
      id: Date.now(),
      from: currentUser.id,
      to: userId,
      timestamp: new Date().toLocaleString(),
    };

    const updated = [...connectionRequests, request];
    setConnectionRequests(updated);
    localStorage.setItem('connectConnectionRequests', JSON.stringify(updated));
    toast.success('Connection request sent!');
    // Since receiver is dummy, no notification added for them, but for simulation, if to === currentUser.id, but here from is current.
  };

  const handleAcceptRequest = (requestId) => {
    const req = connectionRequests.find(r => r.id === requestId);
    if (!req) return;

    const updatedConnections = [...connections, req.from];
    setConnections(updatedConnections);
    localStorage.setItem('connectConnections', JSON.stringify(updatedConnections));

    const updatedRequests = connectionRequests.filter(r => r.id !== requestId);
    setConnectionRequests(updatedRequests);
    localStorage.setItem('connectConnectionRequests', JSON.stringify(updatedRequests));

    const updatedReqNotifs = requestNotifications.filter(n => n.requestId !== requestId);
    setRequestNotifications(updatedReqNotifs);
    localStorage.setItem('connectRequestNotifications', JSON.stringify(updatedReqNotifs));

    toast.success('Connection accepted!');
    // Automatically open chat and switch to messages tab
    setSelectedChat(req.from);
    setActiveTab('messages');
  };

  const handleRejectRequest = (requestId) => {
    const updated = connectionRequests.filter(r => r.id !== requestId);
    setConnectionRequests(updated);
    localStorage.setItem('connectConnectionRequests', JSON.stringify(updated));

    const updatedReqNotifs = requestNotifications.filter(n => n.requestId !== requestId);
    setRequestNotifications(updatedReqNotifs);
    localStorage.setItem('connectRequestNotifications', JSON.stringify(updatedReqNotifs));

    toast.info('Request rejected');
  };

  const getChatId = (id1, id2) => [id1, id2].sort((a,b)=>a-b).join('-');

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return toast.error('Cannot send empty message');
    if (blockedUsers.includes(selectedChat)) return toast.error('Cannot message blocked user');

    const chatId = getChatId(currentUser.id, selectedChat);
    const msg = {
      id: Date.now(),
      sender: currentUser.id,
      content: newMessage.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = {
      ...messages,
      [chatId]: [...(messages[chatId] || []), msg],
    };

    setMessages(updatedMessages);
    localStorage.setItem('connectMessages', JSON.stringify(updatedMessages));
    setNewMessage('');
  };

  const getUserById = (id) => users.find(u => u.id === id) || { name: 'Unknown' };

  const getChatPartnerName = (partnerId) => getUserById(partnerId)?.name || 'Unknown';

  const chatPartners = connections
    .filter(id => !blockedUsers.includes(id))
    .map(id => getUserById(id))
    .filter(Boolean);

  const currentChatMessages = selectedChat 
    ? messages[getChatId(currentUser?.id, selectedChat)] || [] 
    : [];

  const filteredUsers = users.filter(u => 
    u.id !== currentUser?.id &&
    u.name.toLowerCase().includes(networkSearch.toLowerCase()) &&
    !connections.includes(u.id) &&
    !connectionRequests.some(r => r.from === currentUser?.id && r.to === u.id) &&
    !blockedUsers.includes(u.id)
  );

  const incomingRequests = connectionRequests.filter(r => r.to === currentUser?.id);
  const unreadRequestCount = requestNotifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-100 dark:from-slate-950 dark:to-indigo-950">
        <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 dark:from-slate-950 dark:to-indigo-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-screen-2xl mx-auto px-3 xs:px-4 sm:px-5 lg:px-6 xl:px-8 py-4 sm:py-5 lg:py-6 xl:py-8">

        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Connect
          </h1>
          <div className="flex items-center gap-4 sm:gap-6">
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="relative cursor-pointer" onClick={() => setActiveTab('notifications')}>
              <Bell size={20} />
              {(notifications.length > 0 || unreadRequestCount > 0) && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length + unreadRequestCount}
                </span>
              )}
            </div>
            <UserCircle size={24} />
          </div>
        </header>

        <div className="flex overflow-x-auto gap-2 pb-4 border-b border-slate-200 dark:border-slate-700 mb-6 scrollbar-thin">
          {['feed', 'network', 'messages', 'notifications'].map(tab => (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm sm:text-base font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
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

            {activeTab === 'feed' && (
              <div className="space-y-6">
                {/* New Post Form - improved */}
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl p-5 border border-white/30 dark:border-slate-700/30">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {currentUser?.name?.[0] || '?'}
                    </div>
                    <textarea
                      value={newPost}
                      onChange={e => setNewPost(e.target.value)}
                      placeholder={`What's on your mind, ${currentUser?.name}?`}
                      className="flex-1 p-3 bg-transparent border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[90px] resize-none"
                    />
                  </div>
                  {mediaPreview && (
                    <div className="mt-2 relative rounded-xl overflow-hidden max-h-80 border border-slate-200 dark:border-slate-600">
                      {mediaType === 'video' ? (
                        <video src={mediaPreview} controls className="w-full h-auto object-contain" />
                      ) : (
                        <img src={mediaPreview} alt="preview" className="w-full h-auto object-contain" />
                      )}
                      <button
                        onClick={() => { setMediaPreview(null); setMediaType(null); }}
                        className="absolute top-3 right-3 bg-black/70 text-white p-2 rounded-full hover:bg-black/90"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex gap-6">
                      <label className="cursor-pointer hover:opacity-80 transition">
                        <ImageIcon size={24} className="text-indigo-600" />
                        <input type="file" accept="image/*" onChange={handleMediaUpload} className="hidden" />
                      </label>
                      <label className="cursor-pointer hover:opacity-80 transition">
                        <VideoIcon size={24} className="text-indigo-600" />
                        <input type="file" accept="video/*" onChange={handleMediaUpload} className="hidden" />
                      </label>
                    </div>
                    <button
                      onClick={handleNewPost}
                      className="px-7 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-medium hover:from-indigo-700 hover:to-purple-700 shadow-lg transition"
                    >
                      Post
                    </button>
                  </div>
                </div>

                {/* Posts list - improved styling */}
                {posts.length === 0 ? (
                  <div className="text-center py-16 text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600">
                    No posts yet. Share something!
                  </div>
                ) : (
                  <div className="space-y-6">
                    {posts.map(post => (
                      <div key={post.id} className="bg-white/85 dark:bg-slate-800/85 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden border border-white/40 dark:border-slate-700/40">
                        <div className="flex items-center gap-3 px-5 pt-4 pb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {post.user.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold">{post.user.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{post.timestamp}</p>
                          </div>
                        </div>
                        <div className="px-5 py-3">
                          <p className="whitespace-pre-wrap">{post.content}</p>
                          {post.media && (
                            <div className="mt-4 rounded-xl overflow-hidden">
                              {post.mediaType === 'video' ? (
                                <video src={post.media} controls className="w-full" />
                              ) : (
                                <img src={post.media} alt="post media" className="w-full" />
                              )}
                            </div>
                          )}
                        </div>
                        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center gap-8 text-slate-600 dark:text-slate-300">
                          <button onClick={() => handleLike(post.id)} className="flex items-center gap-1.5 hover:text-red-500">
                            <Heart size={18} className={post.likes > 0 ? "fill-red-500 text-red-500" : ""} />
                            <span>{post.likes}</span>
                          </button>
                          <button className="flex items-center gap-1.5 hover:text-indigo-600">
                            <MessageSquare size={18} />
                            <span>{post.comments?.length || 0}</span>
                          </button>
                          <button className="flex items-center gap-1.5 hover:text-indigo-600">
                            <Share2 size={18} />
                            <span>Share</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'network' && (
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    value={networkSearch}
                    onChange={e => setNetworkSearch(e.target.value)}
                    placeholder="Search people..."
                    className="w-full pl-12 pr-4 py-3 bg-white/70 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {incomingRequests.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Connection Requests</h3>
                    <div className="space-y-3">
                      {incomingRequests.map(req => {
                        const user = users.find(u => u.id === req.from);
                        return (
                          <div key={req.id} className="bg-white/70 dark:bg-slate-800/70 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {user?.name?.[0] || '?'}
                              </div>
                              <div>
                                <p className="font-medium">{user?.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{req.timestamp}</p>
                              </div>
                            </div>
                            <div className="flex gap-3 w-full sm:w-auto">
                              <button onClick={() => handleAcceptRequest(req.id)} className="flex-1 sm:flex-none px-5 py-2 bg-green-600 text-white rounded-full text-sm hover:bg-green-700 flex items-center justify-center gap-1.5">
                                <Check size={16} /> Accept
                              </button>
                              <button onClick={() => handleRejectRequest(req.id)} className="flex-1 sm:flex-none px-5 py-2 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 flex items-center justify-center gap-1.5">
                                <X size={16} /> Reject
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {chatPartners.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Your Connections</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {chatPartners.map(user => (
                        <div key={user.id} className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-4 shadow flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                              {user.name[0]}
                            </div>
                            <div className="font-medium">{user.name}</div>
                          </div>
                          <button
                            onClick={() => handleBlockUser(user.id, user.name)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full"
                            title="Block user"
                          >
                            <UserMinus size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {blockedUsers.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Blocked Users</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {blockedUsers.map(id => {
                        const user = getUserById(id);
                        return (
                          <div key={id} className="bg-white/70 dark:bg-slate-800/70 rounded-xl p-4 shadow flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {user.name[0]}
                              </div>
                              <div className="font-medium">{user.name}</div>
                            </div>
                            <button
                              onClick={() => handleBlockUser(id, user.name)}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 rounded-full"
                              title="Unblock user"
                            >
                              <UserCheck size={18} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-lg mb-3">People you may know</h3>
                  <div className="space-y-3">
                    {filteredUsers.map(user => (
                      <div key={user.id} className="flex items-center justify-between bg-white/70 dark:bg-slate-800/70 p-4 rounded-xl shadow">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {user.name[0]}
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSendConnectionRequest(user.id)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-full text-sm hover:bg-indigo-700 flex items-center gap-1.5"
                          >
                            <UserPlus size={16} /> Connect
                          </button>
                          <button
                            onClick={() => handleBlockUser(user.id, user.name)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full"
                            title="Block"
                          >
                            <UserMinus size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-[70vh] lg:h-[75vh]">
                <div className="lg:col-span-1 bg-white/70 dark:bg-slate-800/70 rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/20 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-lg">Messages</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {connections.length === 0 ? (
                      <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                        No connections yet
                      </div>
                    ) : (
                      connections.map(partnerId => {
                        const user = getUserById(partnerId);
                        const isActive = selectedChat === partnerId;
                        const chatId = getChatId(currentUser.id, partnerId);
                        const lastMsg = messages[chatId]?.slice(-1)[0];

                        return (
                          <button
                            key={partnerId}
                            onClick={() => setSelectedChat(partnerId)}
                            className={`w-full p-3 rounded-xl text-left transition ${
                              isActive 
                                ? 'bg-indigo-100 dark:bg-indigo-950/50 border-l-4 border-indigo-500' 
                                : 'hover:bg-slate-100 dark:hover:bg-slate-700/50'
                            }`}
                          >
                            <div className="font-medium">{user.name}</div>
                            {lastMsg && (
                              <div className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                {lastMsg.sender === currentUser.id ? 'You: ' : ''}{lastMsg.content}
                              </div>
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="lg:col-span-2 bg-white/70 dark:bg-slate-800/70 rounded-2xl shadow-lg border border-white/20 dark:border-slate-700/20 flex flex-col overflow-hidden">
                  {!selectedChat ? (
                    <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      Select a connection to start chatting
                    </div>
                  ) : (
                    <>
                      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
                        <button 
                          onClick={() => setSelectedChat(null)}
                          className="lg:hidden p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {getChatPartnerName(selectedChat)[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold">{getChatPartnerName(selectedChat)}</h3>
                        </div>
                      </div>

                      <div className="flex-1 p-4 overflow-y-auto space-y-3">
                        {currentChatMessages.length === 0 ? (
                          <div className="text-center text-slate-500 dark:text-slate-400 py-10">
                            No messages yet. Say hi!
                          </div>
                        ) : (
                          currentChatMessages.map(msg => {
                            const isOwn = msg.sender === currentUser.id;
                            return (
                              <div
                                key={msg.id}
                                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                                    isOwn
                                      ? 'bg-indigo-600 text-white rounded-br-none'
                                      : 'bg-slate-200 dark:bg-slate-700 rounded-bl-none'
                                  }`}
                                >
                                  <p>{msg.content}</p>
                                  <p className={`text-xs mt-1 opacity-70 ${isOwn ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                    {msg.timestamp}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex gap-2">
                          <input
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <button
                            onClick={handleSendMessage}
                            disabled={!newMessage.trim()}
                            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Send size={20} />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8">
                <section>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <UserCheck className="text-indigo-600" size={20} />
                    Connection Requests
                    {unreadRequestCount > 0 && (
                      <span className="bg-indigo-600 text-white text-xs px-2.5 py-1 rounded-full">
                        {unreadRequestCount} new
                      </span>
                    )}
                  </h3>

                  {requestNotifications.length === 0 ? (
                    <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400">
                      No connection requests at the moment
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {requestNotifications.map(notif => {
                        const user = users.find(u => u.id === notif.fromUserId);
                        return (
                          <div
                            key={notif.id}
                            className={`p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 shadow-md border-l-4 ${
                              notif.read ? 'border-gray-300' : 'border-indigo-500'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {user?.name?.[0] || '?'}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold">{notif.title}</p>
                                <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">{notif.message}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{notif.timestamp}</p>
                                <div className="flex gap-3 mt-3">
                                  <button onClick={() => handleAcceptRequest(notif.requestId)} className="px-5 py-2 bg-green-600 text-white rounded-full text-sm hover:bg-green-700 flex items-center justify-center gap-1.5">
                                    <Check size={16} /> Accept
                                  </button>
                                  <button onClick={() => handleRejectRequest(notif.requestId)} className="px-5 py-2 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 flex items-center justify-center gap-1.5">
                                    <X size={16} /> Reject
                                  </button>
                                </div>
                              </div>
                              {!notif.read && (
                                <button
                                  onClick={() => markRequestNotificationAsRead(notif.id)}
                                  className="text-xs text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 whitespace-nowrap"
                                >
                                  Mark read
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                <section>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Bell className="text-indigo-600" size={20} />
                    Activity
                  </h3>

                  {notifications.length === 0 ? (
                    <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400">
                      No recent activity
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.map(notif => (
                        <div
                          key={notif.id}
                          className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/70 shadow-md flex justify-between items-start gap-4"
                        >
                          <div className="flex-1">
                            <p className="font-semibold">{notif.title}</p>
                            <p className="text-sm mt-1 text-slate-600 dark:text-slate-300">{notif.message}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{notif.timestamp}</p>
                          </div>
                          <button
                            onClick={() => removeNotification(notif.id)}
                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Connect;