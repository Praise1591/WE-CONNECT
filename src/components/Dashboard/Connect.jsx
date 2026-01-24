// Connect.jsx — Enhanced with Dark Mode Toggle, Mobile Responsiveness & Animated Empty States

import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, MessageCircle, Heart, MessageSquare, Send, 
  Image as ImageIcon, Video as VideoIcon, X, Trash2, UserPlus, 
  Users, Bookmark, ChevronLeft, Loader2, Moon, Sun
} from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const tabVariants = {
  initial: { opacity: 0, x: -15 },
  animate: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.3, ease: "easeOut" } 
  },
  exit: { 
    opacity: 0, 
    x: 15, 
    transition: { duration: 0.2 } 
  }
};

const emptyStateVariants = {
  initial: { opacity: 0, scale: 0.92, y: 20 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  },
  float: {
    y: [-8, 8, -8],
    transition: { 
      duration: 6, 
      repeat: Infinity, 
      repeatType: "reverse", 
      ease: "easeInOut" 
    }
  }
};

function Connect() {
  const [currentUser, setCurrentUser] = useState(null);
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

  // Sample students — you can load this from API later
  const allStudents = [
    { id: 1, name: 'John Doe', school: 'University of Lagos', department: 'Computer Science' },
    { id: 2, name: 'Jane Smith', school: 'Babcock University', department: 'Business Administration' },
    { id: 3, name: 'Alex Johnson', school: 'University of Ibadan', department: 'Mechanical Engineering' },
  ];

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
    const updated = posts.map(p => 
      p.id === postId ? { ...p, likes: p.likes + 1 } : p
    );
    setPosts(updated);
    localStorage.setItem('connectPosts', JSON.stringify(updated));
  };

  const handleComment = (postId) => {
    const comment = commentInputs[postId]?.trim();
    if (!comment) return toast.error('Comment cannot be empty');

    const updated = posts.map(p => 
      p.id === postId 
        ? { ...p, comments: [...p.comments, { user: currentUser?.name || 'You', content: comment }] } 
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-100 dark:from-slate-950 dark:to-indigo-950">
        <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 dark:from-slate-950 dark:to-indigo-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Connect
          </h1>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <div className="relative">
              <Bell size={24} className="cursor-pointer" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex overflow-x-auto pb-4 gap-2 sm:gap-3 border-b border-slate-200 dark:border-slate-700 mb-6 scrollbar-hide">
          {['feed', 'network', 'messages', 'notifications'].map(tab => (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full font-medium text-sm sm:text-base flex-shrink-0 transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
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
                {/* New Post */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-6">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="What's on your mind, Praise?"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px] resize-none text-base"
                  />

                  {mediaPreview && (
                    <div className="mt-4 relative rounded-xl overflow-hidden">
                      {mediaType === 'video' ? (
                        <video src={mediaPreview} controls className="w-full" />
                      ) : (
                        <img src={mediaPreview} alt="preview" className="w-full" />
                      )}
                      <button
                        onClick={() => { setMediaPreview(null); setMediaType(null); }}
                        className="absolute top-3 right-3 bg-black/60 p-2 rounded-full text-white"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-4 gap-4">
                    <div className="flex gap-6">
                      <label className="cursor-pointer hover:opacity-80 transition">
                        <ImageIcon size={26} className="text-indigo-600" />
                        <input type="file" accept="image/*" onChange={handleMediaUpload} className="hidden" />
                      </label>
                      <label className="cursor-pointer hover:opacity-80 transition">
                        <VideoIcon size={26} className="text-indigo-600" />
                        <input type="file" accept="video/*" onChange={handleMediaUpload} className="hidden" />
                      </label>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleNewPost}
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium shadow-md transition-colors w-full sm:w-auto"
                    >
                      Post
                    </motion.button>
                  </div>
                </div>

                {/* Posts or Empty State */}
                {posts.length === 0 ? (
                  <motion.div 
                    variants={emptyStateVariants}
                    initial="initial"
                    animate={["animate", "float"]}
                    className="text-center py-16 sm:py-24"
                  >
                    <MessageCircle className="w-20 h-20 sm:w-24 sm:h-24 mx-auto text-slate-300 dark:text-slate-600 mb-6" />
                    <h3 className="text-xl sm:text-2xl font-semibold text-slate-600 dark:text-slate-300 mb-3">
                      No posts yet
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                      Be the first to share something with your network!
                    </p>
                  </motion.div>
                ) : (
                  posts.map(post => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-6 space-y-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                          {post.user?.name?.[0] || '?'}
                        </div>
                        <div>
                          <p className="font-semibold">{post.user?.name || 'Anonymous'}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{post.timestamp}</p>
                        </div>
                      </div>

                      <p className="text-lg leading-relaxed">{post.content}</p>

                      {post.media && (
                        post.mediaType === 'video' ? (
                          <video src={post.media} controls className="rounded-xl w-full" />
                        ) : (
                          <img src={post.media} alt="Post media" className="rounded-xl w-full" />
                        )
                      )}

                      <div className="flex gap-8 text-slate-600 dark:text-slate-400 pt-2">
                        <button 
                          onClick={() => handleLike(post.id)}
                          className="flex items-center gap-2 hover:text-red-500 transition-colors"
                        >
                          <Heart 
                            size={22} 
                            className={post.likes > 0 ? "fill-red-500 text-red-500" : ""} 
                          />
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-2 hover:text-indigo-500 transition-colors">
                          <MessageSquare size={22} />
                          {post.comments?.length || 0}
                        </button>
                      </div>

                      {/* Simple comment input */}
                      <div className="flex mt-3">
                        <input
                          value={commentInputs[post.id] || ''}
                          onChange={e => setCommentInputs({...commentInputs, [post.id]: e.target.value})}
                          placeholder="Add a comment..."
                          className="flex-1 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => handleComment(post.id)}
                          className="px-5 bg-indigo-600 text-white rounded-r-xl hover:bg-indigo-700"
                        >
                          Send
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {/* Add other tab contents here as needed */}
            {activeTab === 'notifications' && (
              <motion.div 
                variants={emptyStateVariants}
                initial="initial"
                animate={["animate", "float"]}
                className="text-center py-20"
              >
                <Bell className="w-24 h-24 mx-auto text-slate-300 dark:text-slate-600 mb-6" />
                <h3 className="text-2xl font-semibold mb-3">No notifications yet</h3>
                <p className="text-slate-500 dark:text-slate-400">Stay tuned — activity will show up here</p>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default Connect;