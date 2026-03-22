// MonetaryValue.jsx - Complete with all imports fixed
import React, { useState, useEffect } from 'react';
import { 
  Coins, Gem, CreditCard, Banknote, Wallet, Loader2, 
  AlertCircle, Sparkles, History, ArrowDownToLine, ArrowUpFromLine,
  TrendingUp, Shield, Zap, Clock, CheckCircle, XCircle,
  Building2, Smartphone, User, CreditCard as CardIcon,
  DollarSign, Gift, Star, Award, Target, Flame, Copy, Check
} from 'lucide-react';
import { toast } from 'react-toastify';
import { auth, db, functions } from '../../firebase';
import { httpsCallable } from 'firebase/functions';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit,
  getDocs, 
  runTransaction, 
  serverTimestamp,
  updateDoc,
  onSnapshot,
  where
} from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

// Velvpay Configuration
const VELVPAY_CONFIG = {
  publicKey: "PK_LIVE_10b2f0233c8aa554e05fe289e29fa362f54291869887afbc68615e9b131f670b",
  privateKey: "SK_LIVE_ae55f420d8463cfd1c44a71369712abe9da5e9779c034932d547c587539213e0",
  encryptionKey: "e0e8e75c085af936dc1b4ee78cc8d0e4678709018399b772"
};

function MonetaryValue() {
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
  const [loadingError, setLoadingError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buy');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [copied, setCopied] = useState(false);

  const VALUE_PER_DIAMOND = 60;

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
  ];

  const fintechOptions = [
    { name: 'OPay', color: '#FF6600', icon: '💚' },
    { name: 'PalmPay', color: '#00C853', icon: '🌴' },
    { name: 'Kuda', color: '#00A8E8', icon: '💜' },
    { name: 'Moniepoint', color: '#FF0000', icon: '🔴' },
    { name: 'Carbon', color: '#6B46C1', icon: '⚫' },
  ];

  const coinPresets = [
    { coins: 10, bonus: 0, price: 1000, popular: false },
    { coins: 50, bonus: 5, price: 5000, popular: false },
    { coins: 100, bonus: 15, price: 10000, popular: true },
    { coins: 200, bonus: 40, price: 20000, popular: false },
    { coins: 500, bonus: 125, price: 50000, popular: false },
  ];

  const diamondPresets = [
    { diamonds: 10, amount: 600, popular: false },
    { diamonds: 20, amount: 1200, popular: false },
    { diamonds: 50, amount: 3000, popular: true },
    { diamonds: 100, amount: 6000, popular: false },
    { diamonds: 200, amount: 12000, popular: false },
  ];

  // Initialize Firebase Functions (check if functions exists)
  const initiateTransfer = functions ? httpsCallable(functions, 'initiateVelvpayTransfer') : null;
  const checkPaymentStatus = functions ? httpsCallable(functions, 'checkPaymentStatus') : null;

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      setLoading(true);
      setLoadingError(null);

      if (!user) {
        toast.info('Please log in to access wallet');
        setProfile(null);
        setTransactions([]);
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        let userData = null;

        if (!userSnap.exists()) {
          const fallback = user.displayName || user.email?.split('@')[0] || `user_${user.uid.slice(0,8)}` || 'New User';
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

        setProfile({
          ...userData,
          id: user.uid,
        });

        // Set up real-time transaction listener
        const txRef = collection(db, 'users', user.uid, 'transactions');
        const txQuery = query(txRef, orderBy('timestamp', 'desc'), limit(50));
        
        const unsubscribeTx = onSnapshot(txQuery, (snapshot) => {
          const txList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp),
          }));
          setTransactions(txList);
        });

        return () => unsubscribeTx();
        
      } catch (err) {
        console.error('Wallet load error:', err);
        setLoadingError(`Failed to load wallet: ${err.message || 'Unknown error'}`);
        toast.error('Failed to load wallet');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    setWithdrawDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Generate unique reference
  const generateReference = () => {
    return `WC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Velvpay Deposit
  const handleBuyCoins = async () => {
    if (!currentUser) return toast.error('Please log in first');
    const amount = Number(coinsToBuy);
    if (isNaN(amount) || amount < 1) return toast.error('Enter a valid amount');
    
    const totalAmount = amount * 100;
    
    setIsBuying(true);
    const reference = generateReference();
    setPaymentReference(reference);

    try {
      // Create payment record in Firestore
      const paymentRef = doc(collection(db, 'pending_payments'));
      await setDoc(paymentRef, {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        amount: totalAmount,
        coins: amount,
        reference: reference,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      // Initialize Velvpay payment
      const paymentData = {
        public_key: VELVPAY_CONFIG.publicKey,
        tx_ref: reference,
        amount: totalAmount,
        currency: "NGN",
        redirect_url: `${window.location.origin}/payment-callback`,
        customer: {
          email: currentUser.email,
          name: profile?.name || currentUser.displayName || 'User',
        },
        customizations: {
          title: "WE CONNECT - Buy Coins",
          description: `Purchase ${amount} WE CONNECT Coins`,
          logo: "https://your-logo-url.com/logo.png"
        }
      };

      // Call Velvpay API
      const response = await fetch('https://api.velvpay.com/v1/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${VELVPAY_CONFIG.privateKey}`
        },
        body: JSON.stringify(paymentData)
      });

      const result = await response.json();

      if (result.status === 'success' && result.data.authorization_url) {
        // Open Velvpay payment modal
        const paymentWindow = window.open(result.data.authorization_url, '_blank');
        
        // Poll for payment confirmation
        const checkPaymentInterval = setInterval(async () => {
          try {
            if (checkPaymentStatus) {
              const { data } = await checkPaymentStatus({ reference });
              
              if (data.status === 'completed') {
                clearInterval(checkPaymentInterval);
                toast.success(`Success! ${amount} coins added to your wallet`);
                
                // Refresh profile
                const userRef = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                  setProfile(prev => ({ ...prev, coins: userSnap.data().coins || 0 }));
                }
                
                setCoinsToBuy('');
                setPaymentReference('');
              } else if (data.status === 'failed') {
                clearInterval(checkPaymentInterval);
                toast.error('Payment failed. Please try again.');
              }
            }
          } catch (err) {
            console.error('Error checking payment status:', err);
          }
        }, 3000);
        
        // Stop polling after 10 minutes
        setTimeout(() => {
          clearInterval(checkPaymentInterval);
          setIsBuying(false);
        }, 600000);
        
      } else {
        throw new Error(result.message || 'Payment initialization failed');
      }
      
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Failed to initialize payment. Please try again.');
      
      // Update payment status to failed
      const paymentRef = doc(db, 'pending_payments', reference);
      await updateDoc(paymentRef, {
        status: 'failed',
        error: err.message,
        updatedAt: serverTimestamp(),
      });
    } finally {
      setIsBuying(false);
    }
  };

  // Velvpay Withdrawal
  const handleWithdraw = async () => {
    if (!currentUser) return toast.error('Please log in first');
    const amount = Number(diamondsToWithdraw);
    if (isNaN(amount) || amount < 10) return toast.error(`Minimum withdrawal is 10 diamonds (₦${(10 * VALUE_PER_DIAMOND).toLocaleString()})`);
    if ((profile?.diamonds || 0) < amount) return toast.error('Not enough diamonds');

    if (withdrawMethod === 'bank') {
      if (!withdrawDetails.bankName || !withdrawDetails.bankCode || !withdrawDetails.accountNumber || !withdrawDetails.accountName) {
        return toast.error('Please select a bank and complete all details');
      }
      if (withdrawDetails.accountNumber.length < 10) {
        return toast.error('Account number should be at least 10 digits');
      }
    }

    if (withdrawMethod === 'mobile') {
      if (!withdrawDetails.fintechName || !withdrawDetails.mobileNumber) {
        return toast.error('Please select a fintech wallet and enter your number');
      }
    }

    setIsWithdrawing(true);

    try {
      // Call Firebase Function to initiate transfer
      if (initiateTransfer) {
        const result = await initiateTransfer({
          diamonds: amount,
          method: withdrawMethod,
          bankDetails: withdrawMethod === 'bank' ? {
            bankName: withdrawDetails.bankName,
            bankCode: withdrawDetails.bankCode,
            accountNumber: withdrawDetails.accountNumber,
            accountName: withdrawDetails.accountName,
          } : null,
          mobileDetails: withdrawMethod === 'mobile' ? {
            fintechName: withdrawDetails.fintechName,
            mobileNumber: withdrawDetails.mobileNumber,
          } : null,
        });

        if (result.data.success) {
          toast.success(`Withdrawal request of ₦${(amount * VALUE_PER_DIAMOND).toLocaleString()} submitted! Processing takes 5-30 minutes.`);
          
          // Refresh profile
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setProfile(prev => ({ ...prev, diamonds: userSnap.data().diamonds || 0 }));
          }
          
          // Clear form
          setDiamondsToWithdraw('');
          setWithdrawDetails({
            bankName: '',
            bankCode: '',
            accountNumber: '',
            accountName: '',
            mobileNumber: '',
            fintechName: '',
          });
        } else {
          throw new Error(result.data.message || 'Withdrawal failed');
        }
      } else {
        throw new Error('Firebase Functions not initialized');
      }
      
    } catch (err) {
      console.error('Withdrawal error:', err);
      toast.error(err.message || 'Failed to process withdrawal. Please try again.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Reference copied!');
  };

  const totalBuyAmount = Number(coinsToBuy) * 100 || 0;
  const totalWithdrawAmount = Number(diamondsToWithdraw) * VALUE_PER_DIAMOND || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600" />
          <p className="text-slate-600 dark:text-slate-400">Loading wallet...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 text-center max-w-sm w-full">
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-2xl p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Loading Error</h2>
          <p className="text-red-600 dark:text-red-400">{loadingError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
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
          {/* Coins Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl"
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

          {/* Diamonds Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl"
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
                <DollarSign className="w-4 h-4" />
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
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-slate-200/70 dark:border-slate-700/60 mb-6">
          <div className="flex">
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

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'buy' ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/85 dark:bg-slate-800/75 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/70 dark:border-slate-700/60 p-6 md:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                    <Zap className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Buy Coins</h2>
                    <p className="text-sm text-slate-500">Powered by Velvpay • ₦100 = 1 Coin</p>
                  </div>
                </div>

                {/* Preset Packages */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                  {coinPresets.map((preset) => (
                    <button
                      key={preset.coins}
                      onClick={() => {
                        setCoinsToBuy(preset.coins.toString());
                        setSelectedPreset(preset.coins);
                      }}
                      className={`relative p-4 rounded-xl border-2 text-center transition-all ${
                        coinsToBuy === preset.coins.toString()
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-lg'
                          : 'border-slate-200 dark:border-slate-600 hover:border-amber-400'
                      }`}
                    >
                      {preset.popular && (
                        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full">
                          Popular
                        </div>
                      )}
                      <div className="text-xl font-bold text-slate-800 dark:text-white">{preset.coins}</div>
                      <div className="text-xs text-slate-500">Coins</div>
                      <div className="text-sm font-semibold text-amber-600 mt-1">₦{preset.price.toLocaleString()}</div>
                      {preset.bonus > 0 && (
                        <div className="text-xs text-green-600 mt-1">+{preset.bonus} FREE</div>
                      )}
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

                {/* Summary */}
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

                {/* Buy Button */}
                <button
                  onClick={handleBuyCoins}
                  disabled={isBuying || !coinsToBuy || Number(coinsToBuy) < 1}
                  className="w-full py-4 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isBuying ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                  {isBuying ? 'Processing...' : `Pay ₦${totalBuyAmount.toLocaleString()}`}
                </button>

                {/* Payment Reference Display */}
                {paymentReference && (
                  <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Reference: {paymentReference}</span>
                    <button
                      onClick={() => copyToClipboard(paymentReference)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                    >
                      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/85 dark:bg-slate-800/75 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/70 dark:border-slate-700/60 p-6 md:p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <Gem className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Withdraw Diamonds</h2>
                    <p className="text-sm text-slate-500">Powered by Velvpay • Minimum 10 diamonds</p>
                  </div>
                </div>

                {/* Preset Packages */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                  {diamondPresets.map((preset) => (
                    <button
                      key={preset.diamonds}
                      onClick={() => setDiamondsToWithdraw(preset.diamonds.toString())}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        diamondsToWithdraw === preset.diamonds.toString()
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-lg'
                          : 'border-slate-200 dark:border-slate-600 hover:border-purple-400'
                      }`}
                    >
                      <div className="text-xl font-bold text-slate-800 dark:text-white">{preset.diamonds}</div>
                      <div className="text-xs text-slate-500">Diamonds</div>
                      <div className="text-sm font-semibold text-purple-600 mt-1">₦{preset.amount.toLocaleString()}</div>
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
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

                {/* Withdrawal Method Selection */}
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
                    <div>
                      <input
                        name="accountNumber"
                        value={withdrawDetails.accountNumber}
                        onChange={handleInputChange}
                        placeholder="Account Number"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl"
                      />
                    </div>
                    <div>
                      <input
                        name="accountName"
                        value={withdrawDetails.accountName}
                        onChange={handleInputChange}
                        placeholder="Account Name"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl"
                      />
                    </div>
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
                    <div>
                      <input
                        name="mobileNumber"
                        value={withdrawDetails.mobileNumber}
                        onChange={handleInputChange}
                        placeholder="Wallet Phone Number"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl"
                      />
                    </div>
                  </div>
                )}

                {/* Summary */}
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
                  </div>
                )}

                {/* Withdraw Button */}
                <button
                  onClick={handleWithdraw}
                  disabled={isWithdrawing || !diamondsToWithdraw || Number(diamondsToWithdraw) < 10}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isWithdrawing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowDownToLine className="w-5 h-5" />}
                  {isWithdrawing ? 'Processing...' : `Withdraw ₦${totalWithdrawAmount.toLocaleString()}`}
                </button>
              </motion.div>
            )}
          </div>

          {/* Transactions History */}
          <div className="lg:col-span-1">
            <div className="bg-white/85 dark:bg-slate-800/75 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/70 dark:border-slate-700/60 p-6 sticky top-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                  <History className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Transaction History</h3>
                  <p className="text-xs text-slate-500">Last 50 transactions</p>
                </div>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                    <History className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500">No transactions yet</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {transactions.map((tx, idx) => {
                    const isPositive = tx.type === 'purchase' || tx.type === 'earning';
                    return (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition"
                      >
                        <div className={`p-2 rounded-full ${isPositive ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                          {isPositive ? <ArrowUpFromLine size={14} className="text-green-600" /> : <ArrowDownToLine size={14} className="text-red-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{tx.description}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {tx.timestamp?.toLocaleString?.() || 'Just now'}
                          </p>
                          {tx.reference && (
                            <p className="text-xs text-slate-400 mt-0.5 font-mono">Ref: {tx.reference.slice(-8)}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                            {isPositive ? '+' : '-'}₦{tx.amountNGN?.toLocaleString() || '—'}
                          </p>
                          <p className="text-xs text-slate-400 capitalize mt-0.5">{tx.status}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonetaryValue;