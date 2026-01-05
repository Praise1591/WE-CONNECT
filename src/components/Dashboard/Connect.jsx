// Connect.jsx — Professional, Elegant & Mobile-Friendly (No Dummy Posts)
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  MessageCircle, 
  Heart, 
  MessageSquare, 
  Send, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  X, 
  Trash2, 
  UserPlus, 
  Users, 
  Bookmark,
  ChevronLeft
} from 'lucide-react';
import { toast } from 'react-toastify';

function Connect() {
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]); // No dummy posts — starts empty
  const [notifications, setNotifications] = useState([]);
  const [connections, setConnections] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('feed');
  const [networkSearch, setNetworkSearch] = useState('');
  const [newPost, setNewPost] = useState('');
  const [mediaPreview, setMediaPreview] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      setCurrentUser(JSON.parse(profile));
    }

    // Load from localStorage — no dummies
    const savedPosts = localStorage.getItem('connectPosts');
    if (savedPosts) setPosts(JSON.parse(savedPosts) || []);

    const savedNotifications = localStorage.getItem('connectNotifications');
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications) || []);

    const savedConnections = localStorage.getItem('connectConnections');
    if (savedConnections) setConnections(JSON.parse(savedConnections) || []);

    const savedMessages = localStorage.getItem('connectMessages');
    if (savedMessages) setMessages(JSON.parse(savedMessages) || []);
  }, []);

  const handleNewPost = () => {
    if (!newPost.trim()) {
      toast.error('Post cannot be empty');
      return;
    }
    if (!currentUser) {
      toast.error('Please log in to post');
      return;
    }

    const post = {
      id: Date.now(),
      user: currentUser,
      content: newPost,
      media: mediaPreview,
      likes: 0,
      comments: [],
      timestamp: new Date().toLocaleString(),
    };

    const updatedPosts = [post, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('connectPosts', JSON.stringify(updatedPosts));
    setNewPost('');
    setMediaPreview(null);
    toast.success('Post shared!');
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
        ? { ...p, comments: [...p.comments, { user: currentUser.name, content: comment }] } 
        : p
    );
    setPosts(updated);
    localStorage.setItem('connectPosts', JSON.stringify(updated));
    setCommentInputs({ ...commentInputs, [postId]: '' });
    toast.success('Comment added!');
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setMediaPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSendConnectionRequest = (student) => {
    toast.success(`Connection request sent to ${student.name}`);
    // Backend integration later
  };

  const filteredStudents = [
    // Sample data — replace with dynamic
    { id: 1, name: 'John Doe', school: 'University of Lagos', department: 'Computer Science' },
    { id: 2, name: 'Jane Smith', school: 'Babcock University', department: 'Business Administration' },
  ].filter(s => s.name.toLowerCase().includes(networkSearch.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-900 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Connect</h1>
          <div className="flex gap-4">
            <Search size={24} className="text-slate-600 dark:text-slate-400" />
            <div className="relative">
              <Bell size={24} className="text-slate-600 dark:text-slate-400" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2">
                  {notifications.length}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 overflow-x-auto pb-4 border-b border-slate-200 dark:border-slate-700">
          {['feed', 'network', 'messages', 'notifications'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {/* New Post */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
              />
              {mediaPreview && (
                <div className="relative mt-4">
                  <img src={mediaPreview} alt="Preview" className="rounded-2xl w-full" />
                  <button onClick={() => setMediaPreview(null)} className="absolute top-2 right-2 p-1 bg-white/80 rounded-full">
                    <X size={16} />
                  </button>
                </div>
              )}
              <div className="flex items-center justify-between mt-4">
                <div className="flex gap-4">
                  <label className="cursor-pointer">
                    <ImageIcon size={24} className="text-indigo-600" />
                    <input type="file" accept="image/*" onChange={handleMediaUpload} className="hidden" />
                  </label>
                  <label className="cursor-pointer">
                    <VideoIcon size={24} className="text-indigo-600" />
                    <input type="file" accept="video/*" onChange={handleMediaUpload} className="hidden" />
                  </label>
                </div>
                <button
                  onClick={handleNewPost}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                  Post <Send size={18} />
                </button>
              </div>
            </div>

            {/* Posts */}
            {posts.map(post => (
              <div key={post.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold">
                    {post.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold">{post.user?.name || 'Anonymous'}</p>
                    <p className="text-sm text-slate-500">{post.timestamp}</p>
                  </div>
                </div>
                <p>{post.content}</p>
                {post.media && <img src={post.media} alt="Media" className="rounded-2xl w-full" />}
                <div className="flex items-center gap-6">
                  <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 text-slate-600 hover:text-red-500">
                    <Heart size={20} className={post.likes > 0 ? 'fill-red-500' : ''} /> {post.likes}
                  </button>
                  <button className="flex items-center gap-2 text-slate-600 hover:text-indigo-500">
                    <MessageSquare size={20} /> {post.comments.length}
                  </button>
                  <button className="flex items-center gap-2 text-slate-600 hover:text-teal-500">
                    <Bookmark size={20} /> Save
                  </button>
                </div>
                {/* Comments */}
                {post.comments.map((comment, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-700 p-4 rounded-2xl mt-2">
                    <p className="font-medium">{comment.user}</p>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
                <div className="flex mt-4">
                  <input
                    value={commentInputs[post.id] || ''}
                    onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                    placeholder="Add a comment..."
                    className="flex-1 p-3 bg-slate-50 dark:bg-slate-700 rounded-l-2xl focus:outline-none"
                  />
                  <button onClick={() => handleComment(post.id)} className="p-3 bg-indigo-600 text-white rounded-r-2xl">
                    <Send size={18} />
                  </button>
                </div>
              </div>
            ))}
            {posts.length === 0 && (
              <div className="text-center py-12">
                <MessageCircle size={64} className="mx-auto text-slate-300 mb-4" />
                <p className="text-xl text-slate-500">No posts yet. Be the first!</p>
              </div>
            )}
          </div>
        )}

        {/* Network Tab */}
        {activeTab === 'network' && (
          <div className="space-y-6">
            <input
              value={networkSearch}
              onChange={(e) => setNetworkSearch(e.target.value)}
              placeholder="Search students..."
              className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-indigo-500"
            />
            <div className="space-y-4">
              {filteredStudents.map(student => (
                <div key={student.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white">
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-slate-500">{student.school} • {student.department}</p>
                  </div>
                  <button
                    onClick={() => handleSendConnectionRequest(student)}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-full font-medium hover:bg-indigo-700 flex items-center gap-2"
                  >
                    <UserPlus size={18} />
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Messages & Notifications */}
        {activeTab === 'messages' && (
          <div className="text-center py-20">
            <MessageCircle size={64} className="mx-auto text-slate-300 mb-4" />
            <p className="text-xl text-slate-500">No messages yet</p>
            <p className="text-sm text-slate-600 mt-2">Connect with students to start chatting</p>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            {notifications.map(notif => (
              <div key={notif.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <Bell size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{notif.title}</p>
                  <p className="text-sm text-slate-500">{notif.message}</p>
                </div>
                <button className="p-2 hover:bg-red-100 rounded-full">
                  <Trash2 size={20} className="text-red-500" />
                </button>
              </div>
            ))}
            {notifications.length === 0 && (
              <div className="text-center py-20">
                <Bell size={64} className="mx-auto text-slate-300 mb-4" />
                <p className="text-xl text-slate-500">No notifications</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Connect;