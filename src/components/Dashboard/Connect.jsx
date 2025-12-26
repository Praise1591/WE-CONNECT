// Connect.jsx — Mobile Optimized
import React, { useState, useEffect } from 'react';
import { 
  Zap, 
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
  School 
} from 'lucide-react';

function Connect() {
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [connections, setConnections] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('feed');
  const [networkSearch, setNetworkSearch] = useState('');
  const [newPost, setNewPost] = useState('');
  const [mediaPreview, setMediaPreview] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});

  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    if (profile) setCurrentUser(JSON.parse(profile));

    const savedPosts = localStorage.getItem('connectPosts');
    if (savedPosts) setPosts(JSON.parse(savedPosts));

    const savedNotifications = localStorage.getItem('connectNotifications');
    if (savedNotifications) setNotifications(JSON.parse(savedNotifications));

    const savedConnections = localStorage.getItem('connectConnections');
    if (savedConnections) setConnections(JSON.parse(savedConnections));

    const savedMessages = localStorage.getItem('connectMessages');
    if (savedMessages) setMessages(JSON.parse(savedMessages));
  }, []);

  const saveData = () => {
    localStorage.setItem('connectPosts', JSON.stringify(posts));
    localStorage.setItem('connectNotifications', JSON.stringify(notifications));
    localStorage.setItem('connectConnections', JSON.stringify(connections));
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview({
          url: reader.result,
          type: file.type.startsWith('image') ? 'image' : 'video',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeMedia = () => setMediaPreview(null);

  const addPost = () => {
    if (!newPost.trim() && !mediaPreview) return;

    const post = {
      id: Date.now(),
      author: currentUser.name,
      school: currentUser.school,
      role: currentUser.role || 'Student',
      content: newPost,
      media: mediaPreview,
      likes: 0,
      comments: [],
      timestamp: 'Just now',
    };

    setPosts([post, ...posts]);
    setNewPost('');
    setMediaPreview(null);
    saveData();
  };

  const deletePost = (postId) => {
    setPosts(posts.filter(p => p.id !== postId));
    saveData();
  };

  const likePost = (postId) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
    saveData();
  };

  const addComment = (postId, comment) => {
    if (!comment.trim()) return;

    const newComment = {
      id: Date.now(),
      author: currentUser.name,
      content: comment,
      time: 'Just now',
    };

    setPosts(posts.map(p => {
      if (p.id === postId) return { ...p, comments: [...p.comments, newComment] };
      return p;
    }));
    setCommentInputs({ ...commentInputs, [postId]: '' });
    saveData();
  };

  const deleteComment = (postId, commentId) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return { ...p, comments: p.comments.filter(c => c.id !== commentId) };
      }
      return p;
    }));
    saveData();
  };

  const sendConnectionRequest = (student) => {
    const newConn = { ...student, status: 'pending' };
    setConnections([...connections, newConn]);
    saveData();
  };

  const cancelConnectionRequest = (studentId) => {
    setConnections(connections.filter(c => c.id !== studentId));
    saveData();
  };

  const mockStudents = [
    { id: 1, name: 'Sarah Okonkwo', school: 'Covenant University', department: 'Computer Science', role: 'Student' },
    { id: 2, name: 'Emeka Chukwu', school: 'Rivers State University', department: 'Engineering', role: 'Student' },
    { id: 3, name: 'Aisha Bello', school: 'Lagos State University', department: 'Law', role: 'Tutor' },
    { id: 4, name: 'Tunde Adebayo', school: 'Delta State University', department: 'Business', role: 'Student' },
    { id: 5, name: 'Chioma Eze', school: 'University of Port Harcourt', department: 'Medicine', role: 'Lecturer' },
  ];

  const filteredStudents = mockStudents.filter(student =>
    student.name.toLowerCase().includes(networkSearch.toLowerCase()) ||
    student.school.toLowerCase().includes(networkSearch.toLowerCase()) ||
    student.department.toLowerCase().includes(networkSearch.toLowerCase()) ||
    student.role.toLowerCase().includes(networkSearch.toLowerCase())
  );

  const pendingSentRequests = connections.filter(c => c.status === 'pending');

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center max-w-sm w-full">
          <Zap className="w-16 h-16 text-purple-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Welcome to WE CONNECT</h2>
          <p className="text-slate-600">Please log in to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 pb-20">
      {/* Header */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 sticky top-0 z-50 shadow-md">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              WE CONNECT
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab('feed')}
              className={`font-medium text-sm ${activeTab === 'feed' ? 'text-purple-600' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Feed
            </button>
            <button
              onClick={() => setActiveTab('network')}
              className={`font-medium text-sm ${activeTab === 'network' ? 'text-purple-600' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Network
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative"
            >
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className="relative"
            >
              <MessageCircle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              {currentUser.name[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-6 max-w-full">
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {/* New Post */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {currentUser.name[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share something with the community..."
                    className="w-full p-3 rounded-2xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 resize-none focus:ring-2 focus:ring-purple-500 outline-none text-base"
                    rows="3"
                  />
                  {mediaPreview && (
                    <div className="mt-3 relative">
                      {mediaPreview.type === 'image' ? (
                        <img src={mediaPreview.url} alt="Preview" className="w-full rounded-2xl object-cover" />
                      ) : (
                        <video src={mediaPreview.url} controls className="w-full rounded-2xl" />
                      )}
                      <button
                        onClick={removeMedia}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                        <ImageIcon size={18} />
                        <span className="text-sm">Photo</span>
                        <input type="file" accept="image/*" onChange={handleMediaUpload} className="hidden" />
                      </label>
                      <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 cursor-pointer">
                        <VideoIcon size={18} />
                        <span className="text-sm">Video</span>
                        <input type="file" accept="video/*" onChange={handleMediaUpload} className="hidden" />
                      </label>
                    </div>
                    <button
                      onClick={addPost}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-lg transition-all text-sm"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts */}
            {posts.map(post => (
              <div key={post.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {post.author[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-white text-base">{post.author}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <School size={14} />
                        {post.school} • {post.role}
                      </p>
                    </div>
                  </div>
                  {post.author === currentUser.name && (
                    <button
                      onClick={() => deletePost(post.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <p className="text-slate-700 dark:text-slate-300 mb-4 text-base">{post.content}</p>

                {post.media && (
                  <div className="mb-4">
                    {post.media.type === 'image' ? (
                      <img src={post.media.url} alt="Post" className="w-full rounded-2xl object-cover" />
                    ) : (
                      <video src={post.media.url} controls className="w-full rounded-2xl" />
                    )}
                  </div>
                )}

                <div className="flex items-center gap-6 py-3 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => likePost(post.id)}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-red-500"
                  >
                    <Heart size={20} className={post.likes > 0 ? 'fill-red-500 text-red-500' : ''} />
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <MessageSquare size={20} />
                    <span className="text-sm">{post.comments.length}</span>
                  </div>
                </div>

                {/* Comments */}
                <div className="mt-4 space-y-3">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex items-start gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {comment.author[0].toUpperCase()}
                      </div>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-2xl px-3 py-2 relative">
                        <p className="font-medium text-sm text-slate-800 dark:text-white">{comment.author}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{comment.content}</p>
                        {comment.author === currentUser.name && (
                          <button
                            onClick={() => deleteComment(post.id, comment.id)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {currentUser.name[0].toUpperCase()}
                    </div>
                    <input
                      placeholder="Write a comment..."
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && addComment(post.id, commentInputs[post.id] || '')}
                      className="flex-1 px-3 py-2 rounded-full border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                    />
                    <button
                      onClick={() => addComment(post.id, commentInputs[post.id] || '')}
                      className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'network' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Network</h2>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search people..."
                value={networkSearch}
                onChange={(e) => setNetworkSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-md border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base"
              />
            </div>

            {/* Pending Requests */}
            {pendingSentRequests.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-3">Pending Requests</h3>
                <div className="space-y-3">
                  {pendingSentRequests.map(conn => (
                    <div key={conn.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {conn.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white">{conn.name}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{conn.role} • {conn.school}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => cancelConnectionRequest(conn.id)}
                        className="px-4 py-2 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Discover People */}
            <h3 className="text-lg font-bold mb-3">Discover People</h3>
            <div className="grid grid-cols-1 gap-5">
              {filteredStudents.map(student => {
                const connection = connections.find(c => c.id === student.id);
                return (
                  <div key={student.id} className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-5 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-2xl font-bold">
                      {student.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white mb-1 text-lg">{student.name}</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-2">{student.department}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500 flex items-center justify-center gap-2 mb-3">
                      <School size={14} />
                      {student.school}
                    </p>
                    <p className="text-sm font-medium text-purple-600 mb-4">
                      {student.role}
                    </p>
                    {connection ? (
                      connection.status === 'pending' ? (
                        <button
                          onClick={() => cancelConnectionRequest(student.id)}
                          className="w-full py-3 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-all"
                        >
                          Cancel Request
                        </button>
                      ) : (
                        <span className="text-green-600 dark:text-green-400 font-bold text-base">Connected</span>
                      )
                    ) : (
                      <button
                        onClick={() => sendConnectionRequest(student)}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2"
                      >
                        <UserPlus size={18} />
                        Connect
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notifications & Messages tabs can be added similarly with mobile spacing */}
      </div>
    </div>
  );
}

export default Connect;