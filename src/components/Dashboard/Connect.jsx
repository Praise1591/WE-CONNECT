// ConnectV2-with-realtime-notifications.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Search, Bell, MessageCircle, Heart, MessageSquare, Send,
  Image as ImageIcon, Video as VideoIcon, X, Trash2, UserPlus,
  Users, ChevronLeft, Loader2, Moon, Sun, Sparkles
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

// ────────────────────────────────────────────────
//   Tiny in-browser notification center (simulates real-time)
const notificationCenter = {
  listeners: new Set(),
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  },
  publish(notification) {
    this.listeners.forEach(cb => cb(notification));
  }
};

// ────────────────────────────────────────────────
const spring = { type: 'spring', stiffness: 380, damping: 28 };

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { ...spring, duration: 0.55 } },
};

function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const unsubscribe = notificationCenter.subscribe((notif) => {
      setNotifications(prev => [{ ...notif, id: Date.now(), read: false, timestamp: Date.now() }, ...prev]);
      if (notif.important) {
        toast(notif.message, { type: notif.type || 'info' });
      }
    });
    return unsubscribe;
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, markAsRead };
}

// ────────────────────────────────────────────────
function ConnectV2() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));

  const [currentUser] = useState(() => {
    const saved = localStorage.getItem('userProfile');
    if (saved) return JSON.parse(saved);
    const user = { id: 'u_' + Date.now(), name: 'Praise', avatar: null };
    localStorage.setItem('userProfile', JSON.stringify(user));
    return user;
  });

  const [activeTab, setActiveTab] = useState('feed');
  const [posts, setPosts] = useState(() => JSON.parse(localStorage.getItem('posts') || '[]'));
  const [connections, setConnections] = useState(() => JSON.parse(localStorage.getItem('connections') || []));
  const [messages, setMessages] = useState(() => JSON.parse(localStorage.getItem('messages') || '{}'));
  const [selectedChat, setSelectedChat] = useState(null);

  const { notifications, unreadCount, markAsRead } = useNotifications();

  // UI states
  const [newPost, setNewPost] = useState('');
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [networkSearch, setNetworkSearch] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [commentInputs, setCommentInputs] = useState({});

  const isDark = theme === 'dark';

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', theme);
  }, [isDark, theme]);

  // Persist important data
  useEffect(() => { localStorage.setItem('posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem('connections', JSON.stringify(connections)); }, [connections]);
  useEffect(() => { localStorage.setItem('messages', JSON.stringify(messages)); }, [messages]);

  const dummyUsers = useMemo(() => [
    { id: 'u1', name: 'Aisha Bello' },
    { id: 'u2', name: 'Tunde Ade' },
    { id: 'u3', name: 'Ngozi Okeke' },
    { id: 'u4', name: 'Emeka Nwosu' },
  ], []);

  // ─── Notification helpers ───────────────────────────────────────
  const notify = useCallback((data) => {
    notificationCenter.publish({
      ...data,
      important: data.important !== false,
      type: data.type || 'info'
    });
  }, []);

  const notifyNewPost = useCallback((post) => {
    connections.forEach(connId => {
      if (connId !== currentUser.id) {
        notify({
          message: `${currentUser.name} posted: "${post.content.slice(0, 40)}${post.content.length > 40 ? '...' : ''}"`,
          from: currentUser.id,
          important: true,
          type: 'post'
        });
      }
    });
  }, [connections, currentUser, notify]);

  const notifyLike = useCallback((post) => {
    if (post.user.id !== currentUser.id) {
      notify({
        message: `${currentUser.name} liked your post`,
        from: currentUser.id,
        important: true,
        type: 'like'
      });
    }
  }, [currentUser, notify]);

  const notifyComment = useCallback((post) => {
    if (post.user.id !== currentUser.id) {
      notify({
        message: `${currentUser.name} commented on your post`,
        from: currentUser.id,
        important: true,
        type: 'comment'
      });
    }
  }, [currentUser, notify]);

  const notifyNewMessage = useCallback((toUserId, content) => {
    notify({
      message: `New message from ${currentUser.name}: ${content.slice(0, 30)}${content.length > 30 ? '...' : ''}`,
      from: currentUser.id,
      to: toUserId,
      important: true,
      type: 'message'
    });
  }, [currentUser, notify]);

  // ─── Actions ────────────────────────────────────────────────────
  const handleNewPost = () => {
    if (!newPost.trim() && !mediaPreview) return toast.error("Nothing to share");

    const post = {
      id: 'p_' + Date.now(),
      user: currentUser,
      content: newPost,
      media: mediaPreview,
      mediaType,
      likes: [],
      comments: [],
      timestamp: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
    };

    setPosts(prev => [post, ...prev]);
    setNewPost('');
    setMediaPreview(null);
    setMediaType(null);

    notifyNewPost(post);
    toast.success('Posted ✨');
  };

  const toggleLike = (postId) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const liked = p.likes.includes(currentUser.id);
      const newLikes = liked 
        ? p.likes.filter(id => id !== currentUser.id)
        : [...p.likes, currentUser.id];

      if (!liked) notifyLike(p);

      return { ...p, likes: newLikes };
    }));
  };

  const addComment = (postId) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, comments: [...p.comments, { 
            id: 'c_' + Date.now(), 
            user: currentUser, 
            text, 
            time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
          }] }
        : p
    ));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));

    const post = posts.find(p => p.id === postId);
    if (post) notifyComment(post);

    toast.success('Commented');
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;

    const chatId = [currentUser.id, selectedChat].sort().join('-');
    const msg = {
      id: 'm_' + Date.now(),
      sender: currentUser.id,
      text: newMessage,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), msg]
    }));

    notifyNewMessage(selectedChat, newMessage);

    setNewMessage('');
  };

  const connectUser = (userId) => {
    if (connections.includes(userId)) return;
    setConnections(prev => [...prev, userId]);

    notify({
      message: `You are now connected with ${dummyUsers.find(u => u.id === userId)?.name}`,
      type: 'connect',
      important: true
    });

    toast.success('Connected!');
  };

  const handleMedia = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setMediaPreview(reader.result);
      setMediaType(file.type.startsWith('video') ? 'video' : 'image');
    };
    reader.readAsDataURL(file);
  };

  const relativeTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50 dark:from-gray-950 dark:via-indigo-950/30 dark:to-purple-950 text-slate-900 dark:text-slate-100`}>
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 dark:bg-gray-950/70 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              Connect
            </h1>
          </div>

          <div className="flex items-center gap-5">
            <button 
              onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="relative cursor-pointer" onClick={() => setActiveTab('notifications')}>
              <Bell size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="sticky top-[60px] z-20 backdrop-blur-lg bg-white/60 dark:bg-gray-950/60 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex gap-2 py-3 overflow-x-auto">
          {['feed', 'network', 'messages', 'notifications'].map(tab => (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.94 }}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'hover:bg-slate-200/70 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* ─── Feed ────────────────────────────────────────────── */}
            {activeTab === 'feed' && (
              <LayoutGroup>
                {/* Post composer */}
                <motion.div layout variants={cardVariants} initial="hidden" animate="visible" className="mb-8">
                  <div className="bg-white/75 dark:bg-gray-900/75 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/40 p-5">
                    <textarea
                      value={newPost}
                      onChange={e => setNewPost(e.target.value)}
                      placeholder={`What's on your mind, ${currentUser.name}?`}
                      className="w-full bg-transparent focus:outline-none text-lg placeholder-slate-400 dark:placeholder-slate-500 resize-none min-h-[88px]"
                    />

                    {mediaPreview && (
                      <div className="mt-4 rounded-xl overflow-hidden border border-slate-200/60 dark:border-slate-700/50 relative">
                        {mediaType === 'video' ? (
                          <video src={mediaPreview} controls className="w-full max-h-80 object-contain" />
                        ) : (
                          <img src={mediaPreview} alt="preview" className="w-full max-h-80 object-contain" />
                        )}
                        <button
                          onClick={() => { setMediaPreview(null); setMediaType(null); }}
                          className="absolute top-3 right-3 bg-black/65 text-white p-2 rounded-full hover:bg-black/80 transition"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    )}

                    <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex gap-7">
                        <label className="cursor-pointer hover:text-indigo-600 transition-colors">
                          <ImageIcon size={24} />
                          <input type="file" accept="image/*" onChange={handleMedia} className="hidden" />
                        </label>
                        <label className="cursor-pointer hover:text-purple-600 transition-colors">
                          <VideoIcon size={24} />
                          <input type="file" accept="video/*" onChange={handleMedia} className="hidden" />
                        </label>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleNewPost}
                        disabled={!newPost.trim() && !mediaPreview}
                        className="px-7 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white rounded-full font-medium shadow-lg disabled:opacity-50 transition-all"
                      >
                        Post
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Posts list */}
                {posts.length === 0 ? (
                  <motion.div variants={cardVariants} initial="hidden" animate="visible" className="text-center py-20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-slate-200/40 dark:border-slate-700/40">
                    <MessageCircle className="w-16 h-16 mx-auto text-slate-400 mb-5 opacity-80" />
                    <h3 className="text-xl font-semibold mb-2">Your feed is empty</h3>
                    <p className="text-slate-500 dark:text-slate-400">Share something to get started</p>
                  </motion.div>
                ) : (
                  posts.map(post => (
                    <motion.div
                      layout
                      key={post.id}
                      variants={cardVariants}
                      initial="hidden"
                      animate="visible"
                      className="mb-7 bg-white/75 dark:bg-gray-900/75 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/40 overflow-hidden"
                    >
                      <div className="flex items-center gap-3.5 p-5 pb-3">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xl flex items-center justify-center shrink-0">
                          {post.user.name[0]}
                        </div>
                        <div>
                          <p className="font-semibold">{post.user.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{post.timestamp}</p>
                        </div>
                      </div>

                      <p className="px-5 pb-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                      {post.media && (
                        <div className="px-5 pb-5">
                          {post.mediaType === 'video' ? (
                            <video src={post.media} controls className="w-full rounded-xl" />
                          ) : (
                            <img src={post.media} alt="" className="w-full rounded-xl" />
                          )}
                        </div>
                      )}

                      <div className="flex justify-around py-3.5 border-t border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300">
                        <button 
                          onClick={() => toggleLike(post.id)}
                          className="flex items-center gap-2 hover:text-red-500 transition-colors"
                        >
                          <Heart 
                            size={22} 
                            className={post.likes.includes(currentUser.id) ? "fill-red-500 text-red-500" : ""} 
                          />
                          <span>{post.likes.length}</span>
                        </button>

                        <div className="flex items-center gap-2">
                          <MessageSquare size={22} />
                          <span>{post.comments.length}</span>
                        </div>
                      </div>

                      {post.comments.length > 0 && (
                        <div className="px-5 pt-2 pb-4 space-y-3.5 border-t border-slate-200/50 dark:border-slate-700/50">
                          {post.comments.map(c => (
                            <div key={c.id} className="flex gap-3 text-[15px]">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                                {c.user.name[0]}
                              </div>
                              <div className="flex-1">
                                <span className="font-medium">{c.user.name}</span> {c.text}
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{c.time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-3 p-5 pt-3 border-t border-slate-200/50 dark:border-slate-700/50">
                        <input
                          value={commentInputs[post.id] || ''}
                          onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="Add comment..."
                          className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), addComment(post.id))}
                        />
                        <button
                          onClick={() => addComment(post.id)}
                          disabled={!commentInputs[post.id]?.trim()}
                          className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </LayoutGroup>
            )}

            {/* ─── Network ─────────────────────────────────────────── */}
            {activeTab === 'network' && (
              <div className="space-y-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  <input
                    value={networkSearch}
                    onChange={e => setNetworkSearch(e.target.value)}
                    placeholder="Find people..."
                    className="w-full pl-11 pr-5 py-3.5 bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/40 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  />
                </div>

                {dummyUsers
                  .filter(u => u.id !== currentUser.id && u.name.toLowerCase().includes(networkSearch.toLowerCase()))
                  .map(user => {
                    const isConnected = connections.includes(user.id);
                    return (
                      <motion.div
                        key={user.id}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex items-center justify-between bg-white/75 dark:bg-gray-900/75 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/50 dark:border-slate-700/40"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xl font-bold flex items-center justify-center">
                            {user.name[0]}
                          </div>
                          <p className="font-semibold text-lg">{user.name}</p>
                        </div>

                        {isConnected ? (
                          <span className="px-5 py-2 bg-green-600/90 text-white rounded-full text-sm font-medium">
                            Connected
                          </span>
                        ) : (
                          <button
                            onClick={() => connectUser(user.id)}
                            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 text-white rounded-full font-medium shadow-md transition-all"
                          >
                            Connect
                          </button>
                        )}
                      </motion.div>
                    );
                  })}
              </div>
            )}

            {/* ─── Messages ────────────────────────────────────────── */}
            {activeTab === 'messages' && (
              <div className="space-y-6">
                {selectedChat ? (
                  <div className="bg-white/75 dark:bg-gray-900/75 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/40 flex flex-col h-[68vh]">
                    <div className="flex items-center gap-4 p-5 border-b border-slate-200/50 dark:border-slate-700/50">
                      <button onClick={() => setSelectedChat(null)} className="p-2 hover:bg-slate-200/60 dark:hover:bg-slate-800/50 rounded-full">
                        <ChevronLeft size={24} />
                      </button>
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center">
                        {dummyUsers.find(u => u.id === selectedChat)?.name[0]}
                      </div>
                      <h3 className="font-semibold text-lg">
                        {dummyUsers.find(u => u.id === selectedChat)?.name}
                      </h3>
                    </div>

                    <div className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                      <AnimatePresence>
                        {(messages[[currentUser.id, selectedChat].sort().join('-')] || []).map(msg => {
                          const isOwn = msg.sender === currentUser.id;
                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 12, scale: 0.96 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[78%] p-3.5 rounded-2xl shadow-sm ${
                                isOwn 
                                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none' 
                                  : 'bg-slate-200/90 dark:bg-slate-800/80 rounded-bl-none'
                              }`}>
                                {msg.text}
                                <p className="text-xs opacity-75 mt-1.5 text-right">{msg.time}</p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>

                    <div className="p-5 border-t border-slate-200/50 dark:border-slate-700/50 flex gap-3">
                      <input
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                        className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={sendMessage}
                        disabled={!newMessage.trim()}
                        className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:brightness-110 disabled:opacity-50 shadow-md transition-all"
                      >
                        <Send size={20} />
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <motion.div variants={cardVariants} initial="hidden" animate="visible" className="text-center py-20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-slate-200/40 dark:border-slate-700/40">
                    <MessageCircle className="w-16 h-16 mx-auto text-slate-400 mb-5 opacity-80" />
                    <h3 className="text-xl font-semibold mb-3">No chat selected</h3>
                    <p className="text-slate-500 dark:text-slate-400">Choose someone from your connections</p>
                  </motion.div>
                )}
              </div>
            )}

            {/* ─── Notifications ───────────────────────────────────── */}
            {activeTab === 'notifications' && (
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <motion.div variants={cardVariants} initial="hidden" animate="visible" className="text-center py-20 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-3xl border border-slate-200/40 dark:border-slate-700/40">
                    <Bell className="w-16 h-16 mx-auto text-slate-400 mb-5 opacity-80" />
                    <h3 className="text-xl font-semibold mb-3">No notifications yet</h3>
                    <p className="text-slate-500 dark:text-slate-400">Stay tuned for activity</p>
                  </motion.div>
                ) : (
                  notifications.map(notif => (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-5 rounded-2xl border ${
                        notif.read 
                          ? 'bg-white/60 dark:bg-gray-900/60 border-slate-200/40 dark:border-slate-700/40' 
                          : 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200/60 dark:border-indigo-800/50'
                      } backdrop-blur-xl shadow-sm flex justify-between items-start gap-4`}
                      onClick={() => !notif.read && markAsRead(notif.id)}
                    >
                      <div className="flex-1">
                        <p className={`font-medium ${!notif.read ? 'text-indigo-700 dark:text-indigo-300' : ''}`}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                          {relativeTime(notif.timestamp)}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-2"></div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default ConnectV2;