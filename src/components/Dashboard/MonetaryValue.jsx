// MonetaryValue.jsx — Fully Firebase version (Firestore + Auth) + Paystack
// Updated: Enhanced withdrawal request with metadata for backend processing

import React, { useState, useEffect } from 'react';
import { 
  Coins, Gem, CreditCard, Banknote, Wallet, Loader2, 
  AlertCircle, Sparkles, History, ArrowDownToLine, ArrowUpFromLine 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { auth, db } from '../../firebase'; // Adjust path to your firebase.js
import { 
  doc, getDoc, setDoc, updateDoc, collection, addDoc, 
  query, orderBy, limit, getDocs, runTransaction, serverTimestamp 
} from 'firebase/firestore';

function MonetaryValue() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [coinsToBuy, setCoinsToBuy] = useState('');
  const [diamondsToWithdraw, setDiamondsToWithdraw] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [withdrawDetails, setWithdrawDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    mobileNumber: '',
  });
  const [isBuying, setIsBuying] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingError, setLoadingError] = useState(null);
  const [loading, setLoading] = useState(true);

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
          const fallback = 
            user.displayName ||
            user.email?.split('@')[0] ||
            `user_${user.uid.slice(0,8)}` ||
            'New User';

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
          console.log('Profile auto-created for UID:', user.uid);
        } else {
          userData = userSnap.data();
        }

        setProfile({
          ...userData,
          id: user.uid,
        });

        const txRef = collection(db, 'users', user.uid, 'transactions');
        const txQuery = query(txRef, orderBy('timestamp', 'desc'), limit(50));
        const txSnap = await getDocs(txQuery);

        const txList = txSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate?.() || new Date(doc.data().timestamp),
        }));

        setTransactions(txList);
      } catch (err) {
        console.error('Firebase data load error:', err);
        console.error('Error code:', err.code);
        console.error('Error message:', err.message);
        setLoadingError(`Failed to load wallet: ${err.message || 'Unknown error'}`);
        toast.error('Failed to load wallet');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const coinPresets = [10, 50, 100, 200];
  const pricePerCoin = 100;           // ₦100 per coin
  const totalBuyAmount = Number(coinsToBuy) * pricePerCoin || 0;

  const diamondPresets = [10, 20, 50, 100];
  const valuePerDiamond = 100;        // ₦100 per diamond
  const totalWithdrawAmount = Number(diamondsToWithdraw) * valuePerDiamond || 0;

  const withdrawMethods = [
    { value: 'bank', label: 'Bank Transfer', icon: Banknote },
    { value: 'mobile', label: 'Mobile Money', icon: Wallet },
  ];

  const handleInputChange = (e) => {
    setWithdrawDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addTransaction = async (type, amount, description, status = 'completed', extraData = {}) => {
    if (!currentUser) return false;
    try {
      const txRef = collection(db, 'users', currentUser.uid, 'transactions');
      await addDoc(txRef, {
        type,
        amount,
        description,
        status,
        timestamp: serverTimestamp(),
        ...extraData,
        processedAt: null,
      });
      return true;
    } catch (err) {
      console.error('Transaction save failed:', err);
      return false;
    }
  };

  const handleBuyCoins = async () => {
    if (!currentUser) return toast.error('Please log in first');
    const amount = Number(coinsToBuy);
    if (isNaN(amount) || amount < 1) return toast.error('Enter a valid amount');

    setIsBuying(true);

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.onload = () => {
      const handler = window.PaystackPop.setup({
        key: 'pk_test_480d88a5cbfa09b6864e9796af08dd241de9d1a6',
        email: currentUser.email || 'test@example.com',
        amount: totalBuyAmount * 100,
        currency: 'NGN',
        ref: 'WC_TEST_' + Math.floor(Math.random() * 1000000000 + 1).toString(),
        metadata: { coins: amount },
        callback: async (response) => {
          try {
            const userRef = doc(db, 'users', currentUser.uid);
            await runTransaction(db, async (transaction) => {
              const userDoc = await transaction.get(userRef);
              if (!userDoc.exists()) throw new Error("User profile not found");
              const newCoins = (userDoc.data().coins || 0) + amount;
              transaction.update(userRef, { coins: newCoins });
            });

            await addTransaction('purchase', totalBuyAmount, `Bought ${amount} coins via Paystack`);
            toast.success(`Success! ${amount} coins added`);
            setProfile(prev => ({ ...prev, coins: (prev?.coins || 0) + amount }));
          } catch (err) {
            console.error('Coin update failed:', err);
            toast.error('Failed to update coins – contact support');
          }
          setCoinsToBuy('');
        },
        onClose: () => toast.info('Payment cancelled'),
      });
      handler.openIframe();
      setIsBuying(false);
    };
    script.onerror = () => {
      toast.error('Could not load Paystack');
      setIsBuying(false);
    };
    document.body.appendChild(script);
  };

  const handleWithdraw = async () => {
    if (!currentUser) return toast.error('Please log in first');
    const amount = Number(diamondsToWithdraw);
    if (isNaN(amount) || amount < 10) return toast.error('Minimum withdrawal is 10 diamonds (₦1,000)');
    if ((profile?.diamonds || 0) < amount) return toast.error('Not enough diamonds');

    if (withdrawMethod === 'bank') {
      if (!withdrawDetails.bankName || !withdrawDetails.accountNumber || !withdrawDetails.accountName) {
        return toast.error('Please complete all bank transfer details');
      }
      if (withdrawDetails.accountNumber.length < 10) {
        return toast.error('Account number should be at least 10 digits');
      }
    }
    if (withdrawMethod === 'mobile' && !withdrawDetails.mobileNumber) {
      return toast.error('Please enter your mobile money number');
    }

    setIsWithdrawing(true);

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw new Error("User not found");
        const currentDiamonds = userDoc.data().diamonds || 0;
        if (currentDiamonds < amount) throw new Error("Insufficient diamonds");

        transaction.update(userRef, { diamonds: currentDiamonds - amount });
      });

      const success = await addTransaction(
        'withdrawal',
        totalWithdrawAmount,
        `Withdraw ₦${totalWithdrawAmount.toLocaleString()} (${amount} diamonds) via ${withdrawMethod === 'bank' ? 'Bank Transfer' : 'Mobile Money'}`,
        'pending',
        {
          diamondsUsed: amount,
          method: withdrawMethod,
          bankDetails: withdrawMethod === 'bank' ? {
            bankName: withdrawDetails.bankName.trim(),
            accountNumber: withdrawDetails.accountNumber.trim(),
            accountName: withdrawDetails.accountName.trim(),
          } : null,
          mobileNumber: withdrawMethod === 'mobile' ? withdrawDetails.mobileNumber.trim() : null,
          userEmail: currentUser.email || null,
        }
      );

      if (success) {
        toast.success(`Withdrawal request of ₦${totalWithdrawAmount.toLocaleString()} submitted! Processing usually takes 5–60 minutes.`);
        setDiamondsToWithdraw('');
        setWithdrawDetails({ bankName: '', accountNumber: '', accountName: '', mobileNumber: '' });
      } else {
        throw new Error("Failed to save withdrawal request");
      }
    } catch (err) {
      console.error('Withdraw failed:', err);
      toast.error('Failed to process withdrawal request. Please try again.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/30 dark:from-slate-950 dark:via-indigo-950/30 dark:to-purple-950/20 flex items-center justify-center p-4">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-10 text-center max-w-sm w-full border border-white/30 dark:border-slate-700/40">
          <Sparkles className="w-16 h-16 text-indigo-500 mx-auto mb-6 opacity-90" />
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
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">
            Check browser console (F12 → Console) for details.
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-slate-950 dark:via-indigo-950/20 dark:to-purple-950/10 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <Wallet className="w-9 h-9 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-500 bg-clip-text text-transparent">
              Wallet
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">Manage Coins • Withdraw Diamonds • View History</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-lg border border-white/40 dark:border-slate-700/50 p-6 text-center hover:shadow-xl transition-all">
                <Coins className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Coins</p>
                <p className="text-4xl font-bold text-slate-900 dark:text-white mt-1">{profile.coins ?? 0}</p>
              </div>
              <div className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-lg border border-white/40 dark:border-slate-700/50 p-6 text-center hover:shadow-xl transition-all">
                <Gem className="w-10 h-10 text-purple-500 mx-auto mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Diamonds</p>
                <p className="text-4xl font-bold text-slate-900 dark:text-white mt-1">{profile.diamonds ?? 0}</p>
              </div>
            </div>

            {/* Buy Coins Section */}
            <div className="bg-white/75 dark:bg-slate-800/65 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 dark:border-slate-700/40 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <ArrowUpFromLine className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Buy Coins</h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">₦1,000 = 10 Coins • Instant</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {coinPresets.map(amount => (
                  <button
                    key={amount}
                    onClick={() => setCoinsToBuy(amount.toString())}
                    className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                      coinsToBuy === amount.toString()
                        ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/30 shadow-md'
                        : 'border-transparent hover:border-amber-300 dark:hover:border-amber-700/50 bg-white/60 dark:bg-slate-700/40 hover:shadow-md'
                    }`}
                  >
                    <div className="text-center">
                      <p className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {amount}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        ₦{(amount * pricePerCoin).toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="relative mb-6">
                <input
                  type="number"
                  min="1"
                  value={coinsToBuy}
                  onChange={e => setCoinsToBuy(e.target.value)}
                  placeholder=" "
                  className="peer w-full p-4 pt-6 pb-2 bg-white/60 dark:bg-slate-700/40 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
                />
                <label className="absolute left-4 top-1.5 text-sm text-slate-500 dark:text-slate-400 pointer-events-none transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-amber-600 dark:peer-focus:text-amber-400">
                  Custom amount (coins)
                </label>
              </div>

              <button
                onClick={handleBuyCoins}
                disabled={isBuying || !coinsToBuy || Number(coinsToBuy) < 1}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-semibold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isBuying ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                {isBuying ? 'Processing...' : `Pay ₦${totalBuyAmount.toLocaleString()}`}
              </button>
            </div>

            {/* Withdraw Diamonds Section – now fully initialized */}
            <div className="bg-white/75 dark:bg-slate-800/65 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 dark:border-slate-700/40 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <ArrowDownToLine className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Withdraw Diamonds</h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">
                ₦1,000 = 10 Diamonds • Min. 10 diamonds • Processing: 5–60 mins
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {diamondPresets.map(amount => (
                  <button
                    key={amount}
                    onClick={() => setDiamondsToWithdraw(amount.toString())}
                    className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                      diamondsToWithdraw === amount.toString()
                        ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/30 shadow-md'
                        : 'border-transparent hover:border-purple-300 dark:hover:border-purple-700/50 bg-white/60 dark:bg-slate-700/40 hover:shadow-md'
                    }`}
                  >
                    <div className="text-center">
                      <p className="text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {amount}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                        ₦{(amount * valuePerDiamond).toLocaleString()}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="relative mb-6">
                <input
                  type="number"
                  min="10"
                  value={diamondsToWithdraw}
                  onChange={e => setDiamondsToWithdraw(e.target.value)}
                  placeholder=" "
                  className="peer w-full p-4 pt-6 pb-2 bg-white/60 dark:bg-slate-700/40 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                />
                <label className="absolute left-4 top-1.5 text-sm text-slate-500 dark:text-slate-400 pointer-events-none transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-purple-600 dark:peer-focus:text-purple-400">
                  Amount to withdraw (diamonds)
                </label>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Withdrawal Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {withdrawMethods.map(method => (
                    <button
                      key={method.value}
                      onClick={() => setWithdrawMethod(method.value)}
                      className={`p-4 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${
                        withdrawMethod === method.value
                          ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/30 shadow-md'
                          : 'border-slate-200 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-700/50 bg-white/60 dark:bg-slate-700/40'
                      }`}
                    >
                      <method.icon className="w-5 h-5" />
                      <span className="font-medium">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {withdrawMethod === 'bank' && (
                <div className="space-y-4 mb-6">
                  <input
                    name="bankName"
                    value={withdrawDetails.bankName}
                    onChange={handleInputChange}
                    placeholder="Bank Name (e.g. GTBank, Access Bank)"
                    className="w-full p-4 bg-white/60 dark:bg-slate-700/40 border border-slate-300 dark:border-slate-600 rounded-xl"
                  />
                  <input
                    name="accountNumber"
                    value={withdrawDetails.accountNumber}
                    onChange={handleInputChange}
                    placeholder="Account Number"
                    type="tel"
                    maxLength={10}
                    className="w-full p-4 bg-white/60 dark:bg-slate-700/40 border border-slate-300 dark:border-slate-600 rounded-xl"
                  />
                  <input
                    name="accountName"
                    value={withdrawDetails.accountName}
                    onChange={handleInputChange}
                    placeholder="Account Name (as registered)"
                    className="w-full p-4 bg-white/60 dark:bg-slate-700/40 border border-slate-300 dark:border-slate-600 rounded-xl"
                  />
                </div>
              )}

              {withdrawMethod === 'mobile' && (
                <div className="mb-6">
                  <input
                    name="mobileNumber"
                    value={withdrawDetails.mobileNumber}
                    onChange={handleInputChange}
                    placeholder="Mobile Money Number (e.g. 08012345678)"
                    type="tel"
                    className="w-full p-4 bg-white/60 dark:bg-slate-700/40 border border-slate-300 dark:border-slate-600 rounded-xl"
                  />
                </div>
              )}

              <button
                onClick={handleWithdraw}
                disabled={isWithdrawing || !diamondsToWithdraw || Number(diamondsToWithdraw) < 10}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {isWithdrawing ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowDownToLine className="w-5 h-5" />}
                {isWithdrawing ? 'Submitting...' : `Withdraw ₦${totalWithdrawAmount.toLocaleString()}`}
              </button>
            </div>
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-1">
            <div className="bg-white/75 dark:bg-slate-800/65 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 dark:border-slate-700/40 p-6 sm:p-8 sticky top-8">
              <div className="flex items-center gap-3 mb-5">
                <History className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Transaction History</h2>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                  No transactions yet
                </div>
              ) : (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                  {transactions.map(tx => (
                    <div 
                      key={tx.id}
                      className="flex items-start justify-between p-4 rounded-2xl bg-white/50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 transition-all hover:bg-slate-50 dark:hover:bg-slate-600/40"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-full ${
                          tx.type === 'purchase' 
                            ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' 
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                        }`}>
                          {tx.type === 'purchase' ? <ArrowUpFromLine size={20} /> : <ArrowDownToLine size={20} />}
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-100">{tx.description}</p>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                            {tx.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          tx.type === 'purchase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          {tx.type === 'purchase' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">{tx.status}</p>
                      </div>
                    </div>
                  ))}
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