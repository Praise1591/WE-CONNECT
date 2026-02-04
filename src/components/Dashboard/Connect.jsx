// Connect.jsx — Enhanced with better UI/UX, trends, and full social features including chat

import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, MessageCircle, Heart, MessageSquare, Send, 
  Image as ImageIcon, Video as VideoIcon, X, Trash2, UserPlus, 
  Users, Bookmark, ChevronLeft, Loader2, Moon, Sun, UserCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const tabVariants = {
  initial: { opacity: 0, x: -15 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { opacity: 0, x: 15, transition: { duration: 0.2 } }
};

const emptyStateVariants = {
  initial: { opacity: 0, scale: 0.94, y: 16 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
  float: {
    y: [-5, 5, -5],
    transition: { duration: 5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
  }
};

const chatBubbleVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

function Connect() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [connections, setConnections] = useState([]);
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
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const timer = setTimeout(() => {
      let profile = localStorage.getItem('userProfile');
      if (!profile) {
        const defaultUser = { id: Date.now(), name: 'Praise' };
        localStorage.setItem('userProfile', JSON.stringify(defaultUser));
        profile = JSON.stringify(defaultUser);
      }
      setCurrentUser(JSON.parse(profile));

      // Initialize dummy users if not present
      let storedUsers = localStorage.getItem('connectUsers');
      if (!storedUsers) {
        const dummyUsers = [
          { id: 1, name: 'Alice Johnson', profilePic: null },
          { id: 2, name: 'Bob Smith', profilePic: null },
          { id: 3, name: 'Charlie Davis', profilePic: null },
          { id: 4, name: 'Dana Evans', profilePic: null },
        ];
        localStorage.setItem('connectUsers', JSON.stringify(dummyUsers));
        storedUsers = JSON.stringify(dummyUsers);
      }
      setUsers(JSON.parse(storedUsers));

      setPosts(JSON.parse(localStorage.getItem('connectPosts') || '[]'));
      setNotifications(JSON.parse(localStorage.getItem('connectNotifications') || '[]'));
      setConnections(JSON.parse(localStorage.getItem('connectConnections') || '[]'));
      setMessages(JSON.parse(localStorage.getItem('connectMessages') || '{}'));

      setIsLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const addNotification = (title, message) => {
    const notif = { 
      id: Date.now(), 
      title, 
      message, 
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
    };
    const updated = [notif, ...notifications];
    setNotifications(updated);
    localStorage.setItem('connectNotifications', JSON.stringify(updated));
    toast.info(`${title}: ${message}`);
  };

  const removeNotification = (id) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('connectNotifications', JSON.stringify(updated));
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

    // Notify connections (simulated)
    connections.forEach(conn => addNotification('New Post', `${currentUser.name} shared a new post.`));
  };

  const handleLike = (postId) => {
    const updated = posts.map(p => 
      p.id === postId ? { ...p, likes: p.likes + 1 } : p
    );
    setPosts(updated);
    localStorage.setItem('connectPosts', JSON.stringify(updated));

    // Add notification to post owner if not self
    const post = posts.find(p => p.id === postId);
    if (post.user.id !== currentUser.id) {
      addNotification('Like', `${currentUser.name} liked your post.`);
    }
  };

  const handleComment = (postId) => {
    const comment = commentInputs[postId]?.trim();
    if (!comment) return toast.error('Comment cannot be empty');

    const updated = posts.map(p => 
      p.id === postId 
        ? { ...p, comments: [...p.comments, { user: currentUser.name, content: comment }] } 
        : p
    );
    setPosts(updated);
    localStorage.setItem('connectPosts', JSON.stringify(updated));
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    toast.success('Comment added');

    // Add notification to post owner if not self
    const post = posts.find(p => p.id === postId);
    if (post.user.id !== currentUser.id) {
      addNotification('Comment', `${currentUser.name} commented on your post.`);
    }
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

  const handleConnect = (userId) => {
    if (connections.includes(userId)) return toast.error('Already connected');
    
    const updated = [...connections, userId];
    setConnections(updated);
    localStorage.setItem('connectConnections', JSON.stringify(updated));
    toast.success('Connection added!');

    // Simulate mutual connection and notification
    addNotification('New Connection', `You are now connected with ${users.find(u => u.id === userId).name}`);
  };

  const getChatId = (userId1, userId2) => {
    return [userId1, userId2].sort().join('-');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return toast.error('Message cannot be empty');
    if (!selectedChat) return;

    const chatId = getChatId(currentUser.id, selectedChat);
    const message = {
      id: Date.now(),
      sender: currentUser.id,
      content: newMessage,
      timestamp: new Date().toLocaleString(),
    };

    const updatedMessages = {
      ...messages,
      [chatId]: [...(messages[chatId] || []), message],
    };

    setMessages(updatedMessages);
    localStorage.setItem('connectMessages', JSON.stringify(updatedMessages));
    setNewMessage('');

    // Add notification to recipient
    addNotification('New Message', `${currentUser.name} sent you a message.`);
  };

  const filteredUsers = users.filter(u => 
    u.id !== currentUser.id && 
    u.name.toLowerCase().includes(networkSearch.toLowerCase()) &&
    !connections.includes(u.id)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-100 dark:from-slate-950 dark:to-indigo-950">
        <Loader2 className="w-10 h-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 dark:from-slate-950 dark:to-indigo-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-screen-2xl mx-auto px-3 xs:px-4 sm:px-3 lg:px-6 xl:px-8 py-4 sm:py-5 lg:py-6 xl:py-8">

        {/* Header — Modern with profile icon */}
        <header className="flex items-center justify-between mb-5 sm:mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Connect
          </h1>
          
          <div className="flex items-center gap-3 sm:gap-5 lg:gap-6">
            <button
              onClick={toggleDarkMode}
              className="p-2 -m-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="relative">
              <Bell size={20} className="cursor-pointer" onClick={() => setActiveTab('notifications')} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 min-w-[18px] h-[18px] flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </div>
            <UserCircle size={20} className="cursor-pointer" />
          </div>
        </header>

        {/* Tabs — Smooth scroll, trendy pill design */}
        <div className="flex overflow-x-auto pb-3 sm:pb-4 gap-1.5 sm:gap-2 lg:gap-3 border-b border-slate-200 dark:border-slate-700 mb-5 sm:mb-6 lg:mb-7 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-100 dark:scrollbar-track-slate-800">
          {['feed', 'network', 'messages', 'notifications'].map(tab => (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.96 }}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 sm:px-5 sm:py-2 rounded-full font-medium text-sm sm:text-base whitespace-nowrap transition-all flex-shrink-0 shadow-sm ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
            className="space-y-4 sm:space-y-5 lg:space-y-6"
          >
            {activeTab === 'feed' && (
              <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                {/* New Post — Glassmorphism effect for trendiness */}
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-5 lg:p-6 border border-white/20 dark:border-slate-700/20">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder={`What's on your mind, ${currentUser.name}?`}
                    className="w-full p-3 sm:p-4 bg-slate-50/50 dark:bg-slate-700/50 rounded-xl border border-slate-200/50 dark:border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[70px] sm:min-h-[90px] lg:min-h-[110px] resize-none text-sm sm:text-base backdrop-blur-sm"
                  />

                  {mediaPreview && (
                    <div className="mt-3 rounded-xl overflow-hidden max-h-[220px] xs:max-h-[260px] sm:max-h-[340px] lg:max-h-[420px] relative">
                      {mediaType === 'video' ? (
                        <video 
                          src={mediaPreview} 
                          controls 
                          className="w-full h-auto max-h-inherit object-contain bg-black/10" 
                        />
                      ) : (
                        <img 
                          src={mediaPreview} 
                          alt="preview" 
                          className="w-full h-auto max-h-inherit object-contain" 
                        />
                      )}
                      <button
                        onClick={() => { setMediaPreview(null); setMediaType(null); }}
                        className="absolute top-2 right-2 bg-black/60 p-1.5 rounded-full text-white hover:bg-black/80 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center mt-3 sm:mt-4 gap-3 sm:gap-4">
                    <div className="flex gap-5 sm:gap-6">
                      <label className="cursor-pointer hover:opacity-80 transition p-1 -m-1">
                        <ImageIcon size={22} className="text-indigo-600" />
                        <input type="file" accept="image/*" onChange={handleMediaUpload} className="hidden" />
                      </label>
                      <label className="cursor-pointer hover:opacity-80 transition p-1 -m-1">
                        <VideoIcon size={22} className="text-indigo-600" />
                        <input type="file" accept="video/*" onChange={handleMediaUpload} className="hidden" />
                      </label>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleNewPost}
                      className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full font-medium shadow-md transition-colors w-full xs:w-auto min-h-[44px] text-sm sm:text-base"
                    >
                      Post
                    </motion.button>
                  </div>
                </div>

                {/* Posts or Empty State — Added subtle animation */}
                {posts.length === 0 ? (
                  <motion.div 
                    variants={emptyStateVariants}
                    initial="initial"
                    animate={["animate", "float"]}
                    className="text-center py-16 sm:py-20 lg:py-24 px-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-lg"
                  >
                    <MessageCircle className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto text-slate-300 dark:text-slate-600 mb-4 sm:mb-5 lg:mb-6" />
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-slate-600 dark:text-slate-300 mb-2">
                      No posts yet
                    </h3>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      Be the first to share something with your network! Start by posting above.
                    </p>
                  </motion.div>
                ) : (
                  posts.map(post => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4 border border-white/20 dark:border-slate-700/20"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                          {post.user?.name?.[0] || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm sm:text-base lg:text-lg truncate">{post.user?.name || 'Anonymous'}</p>
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">{post.timestamp}</p>
                        </div>
                      </div>

                      <p className="text-sm sm:text-base lg:text-[17px] leading-relaxed whitespace-pre-wrap">{post.content}</p>

                      {post.media && (
                        <div className="rounded-xl overflow-hidden max-h-[240px] xs:max-h-[280px] sm:max-h-[360px] lg:max-h-[480px] bg-black/10">
                          {post.mediaType === 'video' ? (
                            <video src={post.media} controls className="w-full h-auto object-contain" />
                          ) : (
                            <img src={post.media} alt="Post media" className="w-full h-auto object-contain" />
                          )}
                        </div>
                      )}

                      <div className="flex gap-5 sm:gap-7 lg:gap-8 text-slate-600 dark:text-slate-400 pt-1">
                        <button 
                          onClick={() => handleLike(post.id)}
                          className="flex items-center gap-1.5 hover:text-red-500 transition-colors min-w-[44px] min-h-[44px] justify-center -m-1.5 p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20"
                        >
                          <Heart 
                            size={20} 
                            className={post.likes > 0 ? "fill-red-500 text-red-500" : ""}
                          />
                          <span className="text-sm">{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-indigo-500 transition-colors min-w-[44px] min-h-[44px] justify-center -m-1.5 p-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/20">
                          <MessageSquare size={20} />
                          <span className="text-sm">{post.comments?.length || 0}</span>
                        </button>
                      </div>

                      {/* Comments Section — Expandable for better UX */}
                      {post.comments?.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-200/50 dark:border-slate-700/50">
                          {post.comments.map((comment, idx) => (
                            <div key={idx} className="text-sm text-slate-700 dark:text-slate-300">
                              <span className="font-semibold">{comment.user}:</span> {comment.content}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-col xs:flex-row gap-2 sm:gap-0 mt-1 sm:mt-2">
                        <input
                          value={commentInputs[post.id] || ''}
                          onChange={e => setCommentInputs({...commentInputs, [post.id]: e.target.value})}
                          placeholder="Add a comment..."
                          className="flex-1 p-2.5 sm:p-3 text-sm sm:text-base bg-slate-50/50 dark:bg-slate-700/50 border border-slate-200/50 dark:border-slate-600/50 rounded-xl xs:rounded-l-xl xs:rounded-r-none focus:outline-none focus:ring-2 focus:ring-indigo-500 backdrop-blur-sm"
                        />
                        <button
                          onClick={() => handleComment(post.id)}
                          className="px-5 sm:px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl xs:rounded-l-none xs:rounded-r-xl hover:from-indigo-700 hover:to-purple-700 text-sm sm:text-base min-h-[44px] xs:min-h-auto shadow-md"
                        >
                          Send
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'network' && (
              <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                {/* Search Bar — Modern with icon */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    value={networkSearch}
                    onChange={e => setNetworkSearch(e.target.value)}
                    placeholder="Search for people to connect..."
                    className="w-full pl-10 pr-4 py-3 sm:py-4 bg-white/70 dark:bg-slate-800/70 rounded-xl border border-slate-200/50 dark:border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base backdrop-blur-sm shadow-sm"
                  />
                </div>

                {/* Connections List or Empty */}
                {filteredUsers.length === 0 ? (
                  <motion.div 
                    variants={emptyStateVariants}
                    initial="initial"
                    animate={["animate", "float"]}
                    className="text-center py-16 sm:py-20 lg:py-24 px-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-lg"
                  >
                    <Users className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto text-slate-300 dark:text-slate-600 mb-4 sm:mb-5 lg:mb-6" />
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-3">No suggestions</h3>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      Try searching for names or expand your network!
                    </p>
                  </motion.div>
                ) : (
                  filteredUsers.map(user => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {user.name[0]}
                        </div>
                        <p className="font-semibold text-sm sm:text-base">{user.name}</p>
                      </div>
                      <button
                        onClick={() => handleConnect(user.id)}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 text-sm shadow-md"
                      >
                        <UserPlus size={16} /> Connect
                      </button>
                    </motion.div>
                  ))
                )}

                {/* Your Connections Section */}
                {connections.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Your Connections</h3>
                    <div className="space-y-3">
                      {connections.map(connId => {
                        const user = users.find(u => u.id === connId);
                        return (
                          <div key={connId} className="flex items-center gap-3 sm:gap-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-xl p-3 shadow-sm">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                              {user?.name[0]}
                            </div>
                            <p className="font-medium text-sm sm:text-base">{user?.name}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                {selectedChat ? (
                  <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-5 lg:p-6">
                    {/* Chat Header */}
                    <div className="flex items-center gap-3 mb-4 border-b border-slate-200/50 dark:border-slate-700/50 pb-3">
                      <button onClick={() => setSelectedChat(null)} className="text-slate-600 dark:text-slate-400">
                        <ChevronLeft size={24} />
                      </button>
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {users.find(u => u.id === selectedChat)?.name[0]}
                      </div>
                      <p className="font-semibold text-base sm:text-lg">
                        {users.find(u => u.id === selectedChat)?.name}
                      </p>
                    </div>

                    {/* Messages */}
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-slate-100 dark:scrollbar-track-slate-800">
                      <AnimatePresence>
                        {(messages[getChatId(currentUser.id, selectedChat)] || []).map(msg => (
                          <motion.div
                            key={msg.id}
                            variants={chatBubbleVariants}
                            initial="initial"
                            animate="animate"
                            className={`flex ${msg.sender === currentUser.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm sm:text-base ${
                              msg.sender === currentUser.id 
                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-none'
                            }`}>
                              {msg.content}
                              <p className="text-xs opacity-70 mt-1 text-right">{msg.timestamp}</p>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Message Input */}
                    <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                      <input
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 p-3 bg-slate-50/50 dark:bg-slate-700/50 rounded-xl border border-slate-200/50 dark:border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base backdrop-blur-sm"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 shadow-md"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Chat List or Empty */}
                    {connections.length === 0 ? (
                      <motion.div 
                        variants={emptyStateVariants}
                        initial="initial"
                        animate={["animate", "float"]}
                        className="text-center py-16 sm:py-20 lg:py-24 px-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-lg"
                      >
                        <MessageCircle className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto text-slate-300 dark:text-slate-600 mb-4 sm:mb-5 lg:mb-6" />
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-3">No chats yet</h3>
                        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                          Connect with people in the Network tab to start chatting!
                        </p>
                      </motion.div>
                    ) : (
                      connections.map(connId => {
                        const user = users.find(u => u.id === connId);
                        const chatId = getChatId(currentUser.id, connId);
                        const lastMessage = messages[chatId]?.[messages[chatId]?.length - 1]?.content || 'Start a conversation...';
                        return (
                          <motion.div
                            key={connId}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedChat(connId)}
                            className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:shadow-xl transition-shadow"
                          >
                            <div className="flex items-center gap-3 sm:gap-4">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                {user?.name[0]}
                              </div>
                              <div>
                                <p className="font-semibold text-sm sm:text-base">{user?.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-[300px]">{lastMessage}</p>
                              </div>
                            </div>
                            <ChevronLeft className="rotate-180 text-slate-400" size={20} />
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                {notifications.length === 0 ? (
                  <motion.div 
                    variants={emptyStateVariants}
                    initial="initial"
                    animate={["animate", "float"]}
                    className="text-center py-16 sm:py-20 lg:py-24 px-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-lg"
                  >
                    <Bell className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto text-slate-300 dark:text-slate-600 mb-4 sm:mb-5 lg:mb-6" />
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2 sm:mb-3">No notifications yet</h3>
                    <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      Activity from your network will appear here.
                    </p>
                  </motion.div>
                ) : (
                  notifications.map(notif => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-5 flex items-start justify-between gap-4"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-sm sm:text-base">{notif.title}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{notif.message}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{notif.timestamp}</p>
                      </div>
                      <button
                        onClick={() => removeNotification(notif.id)}
                        className="text-red-500 hover:text-red-700 p-1 -m-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Connect;