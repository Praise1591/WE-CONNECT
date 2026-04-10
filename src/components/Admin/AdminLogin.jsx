// components/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, DollarSign, TrendingUp, TrendingDown,
  Eye, CheckCircle, XCircle, Clock, Search, Filter, Download,
  RefreshCw, Shield, AlertTriangle, Activity, Calendar, Award,
  Coins, Gem, Wallet, LogOut, Settings, Bell, UserCheck,
  CreditCard, ArrowUp, ArrowDown, PieChart, BarChart3
} from 'lucide-react';
import { db, auth } from '../../firebase';
import { 
  collection, getDocs, query, orderBy, limit, 
  where, updateDoc, doc, getDoc, onSnapshot,
  Timestamp, writeBatch
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCoins: 0,
    totalDiamonds: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
    pendingAmount: 0,
    activeUsers: 0,
    monthlyVolume: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Load all data
  useEffect(() => {
    loadAllData();
    setupRealtimeListeners();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      // Load users
      const usersRef = collection(db, 'users');
      const usersSnap = await getDocs(usersRef);
      const usersList = usersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      setUsers(usersList);

      // Load all transactions
      const allTransactions = [];
      for (const user of usersList) {
        const txRef = collection(db, 'users', user.id, 'transactions');
        const txSnap = await getDocs(query(txRef, orderBy('timestamp', 'desc')));
        txSnap.forEach(doc => {
          allTransactions.push({
            id: doc.id,
            userId: user.id,
            userName: user.name || user.email,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date()
          });
        });
      }
      allTransactions.sort((a, b) => b.timestamp - a.timestamp);
      setTransactions(allTransactions);

      // Filter withdrawals
      const withdrawalsList = allTransactions.filter(tx => tx.type === 'withdrawal');
      setWithdrawals(withdrawalsList);

      // Calculate stats
      const totalDeposits = allTransactions
        .filter(tx => tx.type === 'purchase' && tx.status === 'completed')
        .reduce((sum, tx) => sum + (tx.amountNGN || 0), 0);
      
      const totalWithdrawals = withdrawalsList
        .filter(w => w.status === 'completed')
        .reduce((sum, w) => sum + (w.amountNGN || 0), 0);
      
      const pendingWithdrawals = withdrawalsList.filter(w => w.status === 'pending' || w.status === 'processing');
      const pendingAmount = pendingWithdrawals.reduce((sum, w) => sum + (w.amountNGN || 0), 0);

      setStats({
        totalUsers: usersList.length,
        totalCoins: usersList.reduce((sum, u) => sum + (u.coins || 0), 0),
        totalDiamonds: usersList.reduce((sum, u) => sum + (u.diamonds || 0), 0),
        totalDeposits: totalDeposits,
        totalWithdrawals: totalWithdrawals,
        pendingWithdrawals: pendingWithdrawals.length,
        pendingAmount: pendingAmount,
        activeUsers: usersList.filter(u => (u.coins > 0 || u.diamonds > 0)).length,
        monthlyVolume: totalDeposits + totalWithdrawals
      });
    } catch (err) {
      console.error('Error loading data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeListeners = () => {
    // Listen for new transactions across all users
    // This is a simplified version - in production, use Cloud Functions
  };

  const handleUpdateWithdrawal = async (withdrawalId, userId, newStatus, rejectionReason = null) => {
    try {
      const txRef = doc(db, 'users', userId, 'transactions', withdrawalId);
      const updateData = {
        status: newStatus,
        processedAt: Timestamp.now()
      };
      if (rejectionReason) updateData.rejectionReason = rejectionReason;
      
      await updateDoc(txRef, updateData);
      toast.success(`Withdrawal ${newStatus}`);
      loadAllData(); // Refresh data
    } catch (err) {
      console.error('Error updating withdrawal:', err);
      toast.error('Failed to update withdrawal');
    }
  };

  const handleAdjustBalance = async (userId, type, amount, reason) => {
    if (!window.confirm(`Are you sure you want to ${type === 'add' ? 'add' : 'deduct'} ${amount} ${type === 'coins' ? 'coins' : 'diamonds'}?`)) return;
    
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      const currentBalance = userDoc.data()[type] || 0;
      const newBalance = type === 'add' ? currentBalance + amount : currentBalance - amount;
      
      await updateDoc(userRef, { [type]: newBalance });
      
      // Log the adjustment
      const adjustmentRef = collection(db, 'admin', 'adjustments');
      await addDoc(adjustmentRef, {
        userId,
        type,
        amount,
        reason,
        admin: 'weconnect159@gmail.com',
        timestamp: Timestamp.now()
      });
      
      toast.success(`${type.toUpperCase()} adjusted successfully`);
      loadAllData();
    } catch (err) {
      console.error('Error adjusting balance:', err);
      toast.error('Failed to adjust balance');
    }
  };

  const filteredWithdrawals = withdrawals.filter(w => 
    filterStatus === 'all' ? true : w.status === filterStatus
  );

  const filteredUsers = users.filter(u =>
    (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     u.id?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-purple-900">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-12 h-12 animate-spin text-white" />
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 dark:text-white">Admin Panel</h1>
              <p className="text-xs text-slate-500">weconnect159@gmail.com</p>
            </div>
          </div>
          
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'overview' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard size={20} />
              <span>Overview</span>
            </button>
            
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'users' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Users size={20} />
              <span>Users</span>
              <span className="ml-auto text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">{stats.totalUsers}</span>
            </button>
            
            <button
              onClick={() => setActiveTab('withdrawals')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'withdrawals' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Wallet size={20} />
              <span>Withdrawals</span>
              {stats.pendingWithdrawals > 0 && (
                <span className="ml-auto text-xs bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                  {stats.pendingWithdrawals}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setActiveTab('transactions')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === 'transactions' 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Activity size={20} />
              <span>Transactions</span>
            </button>
          </nav>
          
          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-600 rounded-xl hover:bg-red-500/20 transition-all"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'withdrawals' && 'Withdrawal Requests'}
              {activeTab === 'transactions' && 'Transaction History'}
            </h1>
            <p className="text-slate-500 mt-1">Monitor and manage all platform activities</p>
          </div>
          <button
            onClick={loadAllData}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow transition-all"
          >
            <RefreshCw size={16} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-2xl font-bold text-blue-600">{stats.totalUsers}</span>
                </div>
                <h3 className="text-slate-600 dark:text-slate-400 text-sm">Total Users</h3>
                <p className="text-xs text-slate-500 mt-1">{stats.activeUsers} active users</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-2xl font-bold text-green-600">₦{stats.totalDeposits.toLocaleString()}</span>
                </div>
                <h3 className="text-slate-600 dark:text-slate-400 text-sm">Total Deposits</h3>
                <p className="text-xs text-slate-500 mt-1">All time revenue</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                  <span className="text-2xl font-bold text-red-600">₦{stats.totalWithdrawals.toLocaleString()}</span>
                </div>
                <h3 className="text-slate-600 dark:text-slate-400 text-sm">Total Withdrawals</h3>
                <p className="text-xs text-slate-500 mt-1">Paid out to users</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">₦{stats.pendingAmount.toLocaleString()}</span>
                </div>
                <h3 className="text-slate-600 dark:text-slate-400 text-sm">Pending Withdrawals</h3>
                <p className="text-xs text-slate-500 mt-1">{stats.pendingWithdrawals} requests pending</p>
              </motion.div>
            </div>

            {/* Balance Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Token Distribution</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-600">Total Coins in Circulation</span>
                      <span className="font-semibold text-amber-600">{stats.totalCoins.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-600">Total Diamonds in Circulation</span>
                      <span className="font-semibold text-purple-600">{stats.totalDiamonds.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-2xl font-bold text-indigo-600">{stats.monthlyVolume.toLocaleString()}</p>
                    <p className="text-xs text-slate-500">Monthly Volume (NGN)</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    <p className="text-2xl font-bold text-indigo-600">{stats.totalUsers}</p>
                    <p className="text-xs text-slate-500">Total Users</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Recent Transactions</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-200 dark:border-slate-700">
                    <tr className="text-left text-sm text-slate-500">
                      <th className="pb-3">User</th>
                      <th className="pb-3">Type</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 10).map((tx, idx) => (
                      <tr key={idx} className="border-b border-slate-100 dark:border-slate-700/50">
                        <td className="py-3 text-sm">{tx.userName || tx.userId?.slice(0, 8)}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            tx.type === 'purchase' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {tx.type === 'purchase' ? 'Deposit' : 'Withdrawal'}
                          </span>
                        </td>
                        <td className="py-3 text-sm font-semibold">₦{tx.amountNGN?.toLocaleString()}</td>
                        <td className="py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                            tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 text-sm text-slate-500">{tx.timestamp?.toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search users by name, email or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900"
                  />
                </div>
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2">
                  <Download size={16} />
                  Export Users
                </button>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr className="text-left text-sm text-slate-500">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Coins</th>
                    <th className="px-6 py-4">Diamonds</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 dark:text-white">{user.name || 'Anonymous'}</p>
                            <p className="text-xs text-slate-500">ID: {user.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{user.email || 'No email'}</td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-amber-600">{user.coins?.toLocaleString() || 0}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-purple-600">{user.diamonds?.toLocaleString() || 0}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{user.createdAt?.toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-all"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex gap-3">
                {['all', 'pending', 'processing', 'completed', 'rejected'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-xl capitalize transition-all ${
                      filterStatus === status
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {status}
                    {status === 'pending' && stats.pendingWithdrawals > 0 && (
                      <span className="ml-2 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                        {stats.pendingWithdrawals}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filteredWithdrawals.map((wd) => (
                <div key={wd.id} className="p-6">
                  <div className="flex flex-wrap gap-4 justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {wd.userName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-white">{wd.userName || 'Anonymous User'}</p>
                          <p className="text-xs text-slate-500">User ID: {wd.userId?.slice(0, 8)}</p>
                        </div>
                      </div>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm">
                          <span className="text-slate-500">Amount:</span>{' '}
                          <span className="font-bold text-purple-600">₦{wd.amountNGN?.toLocaleString()}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-slate-500">Diamonds:</span>{' '}
                          <span>{wd.diamonds?.toLocaleString()}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-slate-500">Method:</span>{' '}
                          <span>{wd.withdrawalMethod === 'bank' ? 'Bank Transfer' : 'Mobile Wallet'}</span>
                        </p>
                        <p className="text-sm">
                          <span className="text-slate-500">Account:</span>{' '}
                          <span>
                            {wd.withdrawalMethod === 'bank' 
                              ? `${wd.withdrawalDetails?.bankName} - ${wd.withdrawalDetails?.accountNumber}`
                              : `${wd.withdrawalDetails?.fintechName} - ${wd.withdrawalDetails?.mobileNumber}`
                            }
                          </span>
                        </p>
                        <p className="text-sm">
                          <span className="text-slate-500">Account Name:</span>{' '}
                          <span>{wd.withdrawalDetails?.accountName}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(wd.status)}`}>
                        {wd.status.toUpperCase()}
                      </div>
                      <p className="text-xs text-slate-500 mt-2">Requested: {wd.timestamp?.toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  {(wd.status === 'pending' || wd.status === 'processing') && (
                    <div className="mt-4 flex gap-3 justify-end">
                      <button
                        onClick={() => handleUpdateWithdrawal(wd.id, wd.userId, 'processing')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
                      >
                        <Clock size={16} />
                        Mark Processing
                      </button>
                      <button
                        onClick={() => handleUpdateWithdrawal(wd.id, wd.userId, 'completed')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('Enter rejection reason:');
                          if (reason) handleUpdateWithdrawal(wd.id, wd.userId, 'rejected', reason);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50">
                  <tr className="text-left text-sm text-slate-500">
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, idx) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-700/50">
                      <td className="px-6 py-4 text-sm">{tx.timestamp?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm">{tx.userName || tx.userId?.slice(0, 8)}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          tx.type === 'purchase' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {tx.type === 'purchase' ? 'Deposit' : 'Withdrawal'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold">₦{tx.amountNGN?.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                          tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono">{tx.reference?.slice(-12)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* User Management Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Manage User</h2>
              <button onClick={() => setShowUserModal(false)} className="text-slate-500 hover:text-slate-700">
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-500">User ID</p>
                <p className="font-mono text-sm">{selectedUser.id}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Name</p>
                <p className="font-medium">{selectedUser.name || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p>{selectedUser.email || 'Not set'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl">
                  <p className="text-sm text-slate-500">Coins</p>
                  <p className="text-2xl font-bold text-amber-600">{selectedUser.coins?.toLocaleString() || 0}</p>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-xl">
                  <p className="text-sm text-slate-500">Diamonds</p>
                  <p className="text-2xl font-bold text-purple-600">{selectedUser.diamonds?.toLocaleString() || 0}</p>
                </div>
              </div>
              
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Adjust Balance</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const amount = prompt('Enter amount of coins to add:');
                      if (amount) handleAdjustBalance(selectedUser.id, 'coins', parseInt(amount), 'Admin adjustment');
                    }}
                    className="px-3 py-2 bg-amber-600 text-white rounded-lg text-sm"
                  >
                    + Add Coins
                  </button>
                  <button
                    onClick={() => {
                      const amount = prompt('Enter amount of diamonds to add:');
                      if (amount) handleAdjustBalance(selectedUser.id, 'diamonds', parseInt(amount), 'Admin adjustment');
                    }}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm"
                  >
                    + Add Diamonds
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;