// MonetaryValue.jsx - Complete with Sports Betting Style Withdrawal System (No Enclosing Boxes)
import React, { useState, useEffect } from 'react';
import { 
  Coins, Gem, CreditCard, Wallet, Loader2, 
  AlertCircle, Sparkles, History, ArrowDownToLine, ArrowUpFromLine,
  TrendingUp, Shield, Zap, Clock, CheckCircle, XCircle,
  Building2, Smartphone, Copy, Check, Eye, Filter, Search,
  ChevronDown, ChevronUp, Info, DollarSign, Users, Award
} from 'lucide-react';
import { toast } from 'react-toastify';
import { auth, db } from '../../firebase';
import { 
  doc, getDoc, setDoc, collection, addDoc, query, orderBy, limit,
  runTransaction, serverTimestamp, onSnapshot, where, getDocs,
  updateDoc, writeBatch
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

// Paystack Live Configuration
const PAYSTACK_PUBLIC_KEY = 'pk_live_8e6ac6ab9876e300cc6b8d37270028aaf57f5c61';

function MonetaryValue() {
  // ==================== STATE ====================
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [coinsToBuy, setCoinsToBuy] = useState('');
  const [diamondsToWithdraw, setDiamondsToWithdraw] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [withdrawDetails, setWithdrawDetails] = useState({
    bankName: '',
    bankCode: '',
    accountNumber: '',
    accountName: '',
    mobileNumber: '',
    fintechName: '',
  });
  const [isBuying, setIsBuying] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [loadingError, setLoadingError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buy');
  const [paymentReference, setPaymentReference] = useState('');
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paystackLoaded, setPaystackLoaded] = useState(false);
  const [showWithdrawalHistory, setShowWithdrawalHistory] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    totalWithdrawn: 0,
    pendingWithdrawals: 0,
    totalDeposits: 0,
    withdrawalCount: 0
  });

  const VALUE_PER_DIAMOND = 60;

  // ==================== CONSTANTS ====================
  const nigerianBanks = [
    { name: 'Access Bank', code: '044', color: '#0066CC', icon: '🏦' },
    { name: 'GTBank', code: '058', color: '#00A651', icon: '💳' },
    { name: 'Zenith Bank', code: '057', color: '#FF0000', icon: '🏛️' },
    { name: 'First Bank', code: '011', color: '#003087', icon: '🏦' },
    { name: 'UBA', code: '033', color: '#004B8D', icon: '🌍' },
    { name: 'Fidelity Bank', code: '070', color: '#00B140', icon: '⭐' },
    { name: 'Stanbic IBTC', code: '221', color: '#003087', icon: '🏦' },
    { name: 'Union Bank', code: '032', color: '#004B8D', icon: '🤝' },
    { name: 'Polaris Bank', code: '076', color: '#FF6600', icon: '❄️' },
    { name: 'Wema Bank', code: '035', color: '#00A651', icon: '🐘' },
    { name: 'FCMB', code: '214', color: '#003366', icon: '🏦' },
    { name: 'Sterling Bank', code: '232', color: '#006633', icon: '⭐' },
    { name: 'Jaiz Bank', code: '301', color: '#008000', icon: '⭐' },
  ];

  const fintechOptions = [
    { name: 'OPay', color: '#FF6600', icon: '💚' },
    { name: 'PalmPay', color: '#00C853', icon: '🌴' },
    { name: 'Kuda', color: '#00A8E8', icon: '💜' },
    { name: 'Moniepoint', color: '#FF0000', icon: '🔴' },
    { name: 'Carbon', color: '#6B46C1', icon: '⚫' },
  ];

  const coinPresets = [
    { coins: 10, price: 1000, popular: false },
    { coins: 50, price: 5000, popular: false },
    { coins: 100, price: 10000, popular: true },
    { coins: 200, price: 20000, popular: false },
    { coins: 500, price: 50000, popular: false },
    { coins: 1000, price: 100000, popular: false },
  ];

  const diamondPresets = [
    { diamonds: 10, amount: 600, popular: false },
    { diamonds: 20, amount: 1200, popular: false },
    { diamonds: 50, amount: 3000, popular: true },
    { diamonds: 100, amount: 6000, popular: false },
    { diamonds: 200, amount: 12000, popular: false },
    { diamonds: 500, amount: 30000, popular: false },
  ];

  // Load Paystack script on mount
  useEffect(() => {
    if (window.PaystackPop) {
      setPaystackLoaded(true);
      console.log('[Paystack] Already loaded');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    
    script.onload = () => {
      setTimeout(() => {
        if (window.PaystackPop) {
          setPaystackLoaded(true);
          console.log('[Paystack] Ready to use');
        }
      }, 500);
    };
    
    script.onerror = () => {
      toast.error('Failed to load payment system. Please refresh.');
    };
    
    document.body.appendChild(script);
  }, []);

  // Load user data and withdrawals
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      setLoading(true);
      setLoadingError(null);

      if (!user) {
        setProfile(null);
        setTransactions([]);
        setWithdrawalRequests([]);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        let userData = null;

        if (!userSnap.exists()) {
          const fallback = user.displayName || user.email?.split('@')[0] || `user_${user.uid.slice(0,8)}`;
          userData = {
            coins: 0,
            diamonds: 0,
            name: fallback,
            username: fallback.toLowerCase().replace(/\s+/g, '_'),
            full_name: fallback,
            createdAt: serverTimestamp(),
            email: user.email || null,
          };
          await setDoc(userRef, userData);
        } else {
          userData = userSnap.data();
        }

        setProfile({ ...userData, id: user.uid });

        // Real-time transaction listener
        const txRef = collection(db, 'users', user.uid, 'transactions');
        const txQuery = query(txRef, orderBy('timestamp', 'desc'), limit(50));
        
        const unsubscribeTx = onSnapshot(txQuery, (snapshot) => {
          const txList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp),
          }));
          setTransactions(txList);
          
          // Calculate stats
          const withdrawals = txList.filter(tx => tx.type === 'withdrawal');
          const deposits = txList.filter(tx => tx.type === 'purchase');
          const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending' || w.status === 'processing');
          
          setStats({
            totalWithdrawn: withdrawals.reduce((sum, w) => sum + (w.amountNGN || 0), 0),
            pendingWithdrawals: pendingWithdrawals.reduce((sum, w) => sum + (w.amountNGN || 0), 0),
            totalDeposits: deposits.reduce((sum, d) => sum + (d.amountNGN || 0), 0),
            withdrawalCount: withdrawals.length
          });
        });

        // Real-time withdrawal requests listener
        const withdrawalRef = collection(db, 'users', user.uid, 'transactions');
        const withdrawalQuery = query(
          withdrawalRef, 
          where('type', '==', 'withdrawal'),
          orderBy('timestamp', 'desc')
        );
        
        const unsubscribeWithdrawals = onSnapshot(withdrawalQuery, (snapshot) => {
          const withdrawalList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp),
            processedAt: doc.data().processedAt?.toDate?.() || null
          }));
          setWithdrawalRequests(withdrawalList);
        });

        return () => {
          unsubscribeTx();
          unsubscribeWithdrawals();
        };
      } catch (err) {
        console.error('Wallet load error:', err);
        setLoadingError(`Failed to load wallet: ${err.message}`);
        toast.error('Failed to load wallet');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // ==================== HELPER FUNCTIONS ====================
  const handleInputChange = (e) => {
    setWithdrawDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const generateReference = () => {
    return `WC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Reference copied!');
  };

  const formatDate = (date) => {
    if (!date) return 'Just now';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'processing': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle size={14} />;
      case 'pending': return <Clock size={14} />;
      case 'processing': return <Loader2 size={14} className="animate-spin" />;
      case 'rejected': return <XCircle size={14} />;
      default: return <Info size={14} />;
    }
  };

  // ==================== PAYSTACK PAYMENT ====================
  const handlePaystackPayment = (amount, coins, reference) => {
    return new Promise((resolve, reject) => {
      if (!window.PaystackPop) {
        reject(new Error('Paystack not loaded. Please refresh.'));
        return;
      }

      try {
        const paymentCallback = (response) => {
          if (response.status === 'success') {
            resolve({ status: 'success', reference: response.reference });
          } else {
            reject(new Error('Payment failed'));
          }
        };

        const paymentOnClose = () => {
          reject(new Error('Payment window closed'));
        };

        const handler = window.PaystackPop.setup({
          key: PAYSTACK_PUBLIC_KEY,
          email: currentUser.email || `${currentUser.uid}@user.com`,
          amount: amount * 100,
          ref: reference,
          metadata: {
            custom_fields: [
              { display_name: "Coins Purchased", variable_name: "coins", value: coins.toString() },
              { display_name: "User ID", variable_name: "user_id", value: currentUser.uid }
            ]
          },
          callback: paymentCallback,
          onClose: paymentOnClose
        });
        
        handler.openIframe();
      } catch (err) {
        reject(err);
      }
    });
  };

  // ==================== BUY COINS HANDLER ====================
  const handleBuyCoins = async () => {
    if (!currentUser) {
      toast.error('Please log in first');
      return;
    }
    
    if (!paystackLoaded) {
      toast.error('Payment system is loading. Please wait...');
      return;
    }
    
    const amount = Number(coinsToBuy);
    if (isNaN(amount) || amount < 1) {
      toast.error('Enter a valid amount');
      return;
    }
    
    const totalAmount = amount * 100;
    setIsBuying(true);
    const reference = generateReference();
    setPaymentReference(reference);
    setPaymentStatus('processing');

    try {
      const result = await handlePaystackPayment(totalAmount, amount, reference);
      
      if (result.status === 'success') {
        const userRef = doc(db, 'users', currentUser.uid);
        await runTransaction(db, async (t) => {
          const userDoc = await t.get(userRef);
          const currentCoins = userDoc.data().coins || 0;
          t.update(userRef, { coins: currentCoins + amount });
        });
        
        await addDoc(collection(db, 'users', currentUser.uid, 'transactions'), {
          type: 'purchase',
          amountNGN: totalAmount,
          description: `Bought ${amount} WE CONNECT Coins`,
          status: 'completed',
          timestamp: serverTimestamp(),
          reference: reference,
          paymentMethod: 'Paystack',
          paystackReference: result.reference
        });
        
        toast.success(`Success! ${amount} coins added!`);
        setProfile(prev => ({ ...prev, coins: (prev?.coins || 0) + amount }));
        setCoinsToBuy('');
        setPaymentReference('');
        setPaymentStatus('success');
        
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setProfile({ ...userSnap.data(), id: currentUser.uid });
        }
        
        setTimeout(() => setPaymentStatus(null), 3000);
      }
    } catch (err) {
      console.error('Payment error:', err);
      if (err.message === 'Payment window closed') {
        toast.info('Payment was cancelled');
      } else {
        toast.error(err.message || 'Payment failed. Please try again.');
      }
      setPaymentStatus('failed');
      setTimeout(() => setPaymentStatus(null), 3000);
    } finally {
      setIsBuying(false);
    }
  };

  // ==================== WITHDRAW HANDLER (Enhanced) ====================
  const handleWithdraw = async () => {
    if (!currentUser) {
      toast.error('Please log in first');
      return;
    }
    
    const amount = Number(diamondsToWithdraw);
    if (isNaN(amount) || amount < 10) {
      toast.error(`Minimum withdrawal is 10 diamonds (₦${(10 * VALUE_PER_DIAMOND).toLocaleString()})`);
      return;
    }
    
    if ((profile?.diamonds || 0) < amount) {
      toast.error('Not enough diamonds');
      return;
    }

    // Check for pending withdrawals
    const hasPending = withdrawalRequests.some(w => w.status === 'pending' || w.status === 'processing');
    if (hasPending) {
      toast.error('You have a pending withdrawal request. Please wait for it to be processed.');
      return;
    }

    // Validate withdrawal details
    if (withdrawMethod === 'bank') {
      if (!withdrawDetails.bankName || !withdrawDetails.accountNumber || !withdrawDetails.accountName) {
        toast.error('Please complete all bank details');
        return;
      }
      if (withdrawDetails.accountNumber.length < 10) {
        toast.error('Account number should be at least 10 digits');
        return;
      }
    }

    if (withdrawMethod === 'mobile') {
      if (!withdrawDetails.fintechName || !withdrawDetails.mobileNumber) {
        toast.error('Please complete all mobile wallet details');
        return;
      }
      if (withdrawDetails.mobileNumber.length < 10) {
        toast.error('Please enter a valid phone number');
        return;
      }
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
      `💰 WITHDRAWAL CONFIRMATION\n\n` +
      `Amount: ₦${(amount * VALUE_PER_DIAMOND).toLocaleString()}\n` +
      `Diamonds: ${amount.toLocaleString()}\n` +
      `Method: ${withdrawMethod === 'bank' ? 'Bank Transfer' : 'Mobile Wallet'}\n` +
      `Account: ${withdrawMethod === 'bank' ? withdrawDetails.accountNumber : withdrawDetails.mobileNumber}\n\n` +
      `⏱️ Processing Time: 1-3 business days\n` +
      `💰 Processing Fee: FREE\n\n` +
      `Click OK to confirm withdrawal request.`
    );

    if (!confirmed) return;

    setIsWithdrawing(true);
    const totalAmount = amount * VALUE_PER_DIAMOND;
    const reference = generateReference();

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      
      // Use batch write for atomic operation
      const batch = writeBatch(db);
      
      // Update user diamonds
      const userDoc = await getDoc(userRef);
      const currentDiamonds = userDoc.data().diamonds || 0;
      if (currentDiamonds < amount) throw new Error('Insufficient diamonds');
      batch.update(userRef, { diamonds: currentDiamonds - amount });
      
      // Create withdrawal request
      const withdrawalRef = doc(collection(db, 'users', currentUser.uid, 'transactions'));
      batch.set(withdrawalRef, {
        type: 'withdrawal',
        amountNGN: totalAmount,
        diamonds: amount,
        description: `Withdrawal request of ₦${totalAmount.toLocaleString()} (${amount.toLocaleString()} diamonds)`,
        status: 'pending',
        timestamp: serverTimestamp(),
        reference: reference,
        withdrawalMethod: withdrawMethod,
        withdrawalDetails: withdrawDetails,
        paymentMethod: withdrawMethod === 'bank' ? 'Bank Transfer' : 'Mobile Wallet'
      });
      
      await batch.commit();
      
      toast.success(`✅ Withdrawal request submitted successfully!`);
      toast.info(`💰 ₦${totalAmount.toLocaleString()} will be sent within 1-3 business days`, { autoClose: 5000 });
      
      // Reset form
      setProfile(prev => ({ ...prev, diamonds: currentDiamonds - amount }));
      setDiamondsToWithdraw('');
      setWithdrawDetails({
        bankName: '',
        bankCode: '',
        accountNumber: '',
        accountName: '',
        mobileNumber: '',
        fintechName: '',
      });
      
    } catch (err) {
      console.error('Withdrawal error:', err);
      toast.error(err.message || 'Failed to process withdrawal. Please try again.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const totalBuyAmount = Number(coinsToBuy) * 100 || 0;
  const totalWithdrawAmount = Number(diamondsToWithdraw) * VALUE_PER_DIAMOND || 0;

  // Filtered withdrawal requests
  const filteredWithdrawals = withdrawalRequests.filter(w => 
    filterStatus === 'all' ? true : w.status === filterStatus
  );

  // ==================== LOADING STATES ====================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <p className="text-slate-600 dark:text-slate-400">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="p-10 text-center max-w-sm w-full">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">Welcome to Wallet</h2>
          <p className="text-slate-600 dark:text-slate-400">Sign in to access your coins & diamonds</p>
        </div>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Loading Error</h2>
          <p className="text-red-600 dark:text-red-400">{loadingError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
      
      {/* Live Mode Badge */}
      <div className="mb-6 rounded-xl p-4 flex items-start gap-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
        <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800 dark:text-green-300">
            🔒 Live Payments Active - Powered by Paystack
          </p>
          <p className="text-xs mt-1 text-green-700 dark:text-green-400">
            All transactions are processed securely. Withdrawals processed within 1-3 business days.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Deposits</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">₦{stats.totalDeposits.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <ArrowDownToLine className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Withdrawn</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">₦{stats.totalWithdrawn.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Pending Withdrawals</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">₦{stats.pendingWithdrawals.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Total Withdrawals</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{stats.withdrawalCount}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-3 mb-3">
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
          <span className="text-xs tracking-[3px] font-mono uppercase text-indigo-600 dark:text-indigo-400">FINANCIAL HUB</span>
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          My Wallet
        </h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Manage your coins, diamonds, and withdrawals in one place
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl cursor-pointer hover:shadow-2xl transition-all"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          <div className="relative p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white/90 font-medium">Available Balance</h3>
              </div>
              <Sparkles className="w-5 h-5 text-white/60" />
            </div>
            <div className="mb-4">
              <p className="text-5xl md:text-6xl font-bold text-white">
                {(profile?.coins ?? 0).toLocaleString()}
              </p>
              <p className="text-white/70 text-sm mt-2">WE CONNECT Coins</p>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Zap className="w-4 h-4" />
              <span>1 Coin = ₦100</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl cursor-pointer hover:shadow-2xl transition-all"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
          <div className="relative p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Gem className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white/90 font-medium">Withdrawable Balance</h3>
              </div>
              <TrendingUp className="w-5 h-5 text-white/60" />
            </div>
            <div className="mb-4">
              <p className="text-5xl md:text-6xl font-bold text-white">
                {(profile?.diamonds ?? 0).toLocaleString()}
              </p>
              <p className="text-white/70 text-sm mt-2">Diamonds</p>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-sm">
              <Zap className="w-4 h-4" />
              <span>1 Diamond = ₦{VALUE_PER_DIAMOND}</span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/20">
              <p className="text-white/90 font-semibold">
                Withdrawable: ₦{((profile?.diamonds ?? 0) * VALUE_PER_DIAMOND).toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('buy')}
            className={`flex-1 py-4 text-center font-medium transition-all relative ${activeTab === 'buy' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowUpFromLine size={18} />
              <span>Buy Coins</span>
            </div>
            {activeTab === 'buy' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-4 text-center font-medium transition-all relative ${activeTab === 'withdraw' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowDownToLine size={18} />
              <span>Withdraw Diamonds</span>
            </div>
            {activeTab === 'withdraw' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {activeTab === 'buy' ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                  <Zap className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Buy Coins</h2>
                  <p className="text-sm text-slate-500">Live • ₦100 = 1 Coin</p>
                </div>
              </div>

              {/* Preset Packages */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {coinPresets.map((preset) => (
                  <button
                    key={preset.coins}
                    onClick={() => setCoinsToBuy(preset.coins.toString())}
                    className={`relative p-3 rounded-xl border-2 text-center transition-all ${
                      coinsToBuy === preset.coins.toString()
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-lg'
                        : 'border-slate-200 dark:border-slate-600 hover:border-amber-400'
                    }`}
                  >
                    {preset.popular && (
                      <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] rounded-full">
                        Popular
                      </div>
                    )}
                    <div className="text-lg font-bold text-slate-800 dark:text-white">{preset.coins}</div>
                    <div className="text-[10px] text-slate-500">Coins</div>
                    <div className="text-xs font-semibold text-amber-600 mt-1">₦{preset.price.toLocaleString()}</div>
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Or enter custom amount
                </label>
                <div className="relative">
                  <Coins className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="number"
                    min="1"
                    value={coinsToBuy}
                    onChange={e => setCoinsToBuy(e.target.value)}
                    placeholder="Enter number of coins"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {coinsToBuy && Number(coinsToBuy) > 0 && (
                <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">Total Amount:</span>
                    <span className="text-2xl font-bold text-amber-600">₦{totalBuyAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1 text-sm">
                    <span className="text-slate-500">You'll receive:</span>
                    <span className="font-semibold">{coinsToBuy} Coins</span>
                  </div>
                </div>
              )}

              {paymentStatus && (
                <div className={`mb-6 p-4 rounded-xl ${
                  paymentStatus === 'processing' ? 'bg-blue-50 dark:bg-blue-950/20' :
                  paymentStatus === 'success' ? 'bg-green-50 dark:bg-green-950/20' :
                  'bg-red-50 dark:bg-red-950/20'
                }`}>
                  <div className="flex items-center gap-3">
                    {paymentStatus === 'processing' && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
                    {paymentStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                    {paymentStatus === 'failed' && <XCircle className="w-5 h-5 text-red-600" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {paymentStatus === 'processing' && 'Initializing Paystack payment...'}
                        {paymentStatus === 'success' && 'Payment successful! Coins added to wallet'}
                        {paymentStatus === 'failed' && 'Payment failed - please try again'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleBuyCoins}
                disabled={isBuying || !coinsToBuy || Number(coinsToBuy) < 1 || !paystackLoaded}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isBuying ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                {isBuying ? 'Processing...' : `Pay ₦${totalBuyAmount.toLocaleString()} with Paystack`}
              </button>

              <p className="text-xs text-center text-slate-500 mt-4">
                🔒 Secure payments powered by Paystack. Your financial details are encrypted and secure.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <Gem className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Withdraw Diamonds</h2>
                  <p className="text-sm text-slate-500">Live • Minimum 10 diamonds</p>
                </div>
              </div>

              {/* Diamond Presets */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                {diamondPresets.map((preset) => (
                  <button
                    key={preset.diamonds}
                    onClick={() => setDiamondsToWithdraw(preset.diamonds.toString())}
                    className={`relative p-3 rounded-xl border-2 text-center transition-all ${
                      diamondsToWithdraw === preset.diamonds.toString()
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-lg'
                        : 'border-slate-200 dark:border-slate-600 hover:border-purple-400'
                    }`}
                  >
                    {preset.popular && (
                      <div className="absolute -top-2 -right-2 px-1.5 py-0.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] rounded-full">
                        Popular
                      </div>
                    )}
                    <div className="text-lg font-bold text-slate-800 dark:text-white">{preset.diamonds}</div>
                    <div className="text-[10px] text-slate-500">Diamonds</div>
                    <div className="text-xs font-semibold text-purple-600 mt-1">₦{preset.amount.toLocaleString()}</div>
                  </button>
                ))}
              </div>

              {/* Custom Diamonds */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Or enter custom amount
                </label>
                <div className="relative">
                  <Gem className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="number"
                    min="10"
                    value={diamondsToWithdraw}
                    onChange={e => setDiamondsToWithdraw(e.target.value)}
                    placeholder="Enter number of diamonds"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Withdrawal Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Select Withdrawal Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setWithdrawMethod('bank')}
                    className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${
                      withdrawMethod === 'bank'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                        : 'border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                    <span className="font-medium">Bank Transfer</span>
                  </button>
                  <button
                    onClick={() => setWithdrawMethod('mobile')}
                    className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${
                      withdrawMethod === 'mobile'
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                        : 'border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    <Smartphone className="w-5 h-5" />
                    <span className="font-medium">Mobile Wallet</span>
                  </button>
                </div>
              </div>

              {/* Bank Details */}
              {withdrawMethod === 'bank' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Bank</label>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {nigerianBanks.map(bank => (
                        <button
                          key={bank.name}
                          onClick={() => setWithdrawDetails(prev => ({ ...prev, bankName: bank.name, bankCode: bank.code }))}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            withdrawDetails.bankName === bank.name
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                              : 'border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{bank.icon}</span>
                            <span className="text-sm">{bank.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    name="accountNumber"
                    value={withdrawDetails.accountNumber}
                    onChange={handleInputChange}
                    placeholder="Account Number"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl"
                  />
                  <input
                    name="accountName"
                    value={withdrawDetails.accountName}
                    onChange={handleInputChange}
                    placeholder="Account Name"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl"
                  />
                </div>
              )}

              {/* Mobile Details */}
              {withdrawMethod === 'mobile' && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Wallet</label>
                    <div className="grid grid-cols-2 gap-2">
                      {fintechOptions.map(fintech => (
                        <button
                          key={fintech.name}
                          onClick={() => setWithdrawDetails(prev => ({ ...prev, fintechName: fintech.name }))}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            withdrawDetails.fintechName === fintech.name
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30'
                              : 'border-slate-200 dark:border-slate-600'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{fintech.icon}</span>
                            <span className="text-sm">{fintech.name}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    name="mobileNumber"
                    value={withdrawDetails.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="Wallet Phone Number"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl"
                  />
                </div>
              )}

              {diamondsToWithdraw && Number(diamondsToWithdraw) >= 10 && (
                <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 dark:text-slate-400">You'll receive:</span>
                    <span className="text-2xl font-bold text-purple-600">₦{totalWithdrawAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1 text-sm">
                    <span className="text-slate-500">Diamonds to withdraw:</span>
                    <span className="font-semibold">{diamondsToWithdraw} Diamonds</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-800">
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <Clock size={12} /> Processing time: 1-3 business days
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={handleWithdraw}
                disabled={isWithdrawing || !diamondsToWithdraw || Number(diamondsToWithdraw) < 10}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isWithdrawing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowDownToLine className="w-5 h-5" />}
                {isWithdrawing ? 'Processing...' : `Request Withdrawal`}
              </button>

              <p className="text-xs text-center text-slate-500 mt-4">
                💰 Withdrawals are processed within 1-3 business days to your selected account
              </p>
            </motion.div>
          )}
        </div>

        {/* Withdrawal History Section */}
        <div className="lg:col-span-1">
          <div className="p-6 sticky top-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                  <History className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Withdrawal History</h3>
                  <p className="text-xs text-slate-500">Track your withdrawal requests</p>
                </div>
              </div>
              
              {/* Filter Dropdown */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {withdrawalRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                  <History className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500">No withdrawal requests yet</p>
                <p className="text-xs text-slate-400 mt-2">Your withdrawal history will appear here</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredWithdrawals.map((wd, idx) => (
                  <motion.div
                    key={wd.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-full ${getStatusColor(wd.status)}`}>
                          {getStatusIcon(wd.status)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                            ₦{wd.amountNGN?.toLocaleString()}
                          </p>
                          <p className="text-xs text-slate-500">
                            {wd.diamonds?.toLocaleString()} diamonds
                          </p>
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(wd.status)}`}>
                        {wd.status.charAt(0).toUpperCase() + wd.status.slice(1)}
                      </div>
                    </div>
                    
                    <div className="text-xs text-slate-500 space-y-1">
                      <p className="flex items-center gap-1">
                        <Building2 size={10} />
                        {wd.withdrawalMethod === 'bank' ? wd.withdrawalDetails?.bankName : wd.withdrawalDetails?.fintechName}
                      </p>
                      <p className="flex items-center gap-1">
                        <span>📅</span> Requested: {formatDate(wd.timestamp)}
                      </p>
                      {wd.processedAt && (
                        <p className="flex items-center gap-1 text-green-600">
                          <CheckCircle size={10} />
                          Processed: {formatDate(wd.processedAt)}
                        </p>
                      )}
                      {wd.rejectionReason && (
                        <p className="flex items-center gap-1 text-red-600">
                          <XCircle size={10} />
                          Reason: {wd.rejectionReason}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Info Note */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Info size={12} />
                Withdrawals are processed manually. You'll receive email notifications when your withdrawal status changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonetaryValue;