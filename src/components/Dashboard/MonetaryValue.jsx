// MonetaryValue.jsx

import React, { useState, useEffect } from 'react';
import { 
  Coins, Gem, CreditCard, Banknote, Wallet, Loader2, 
  AlertCircle, Sparkles, History, ArrowDownToLine, ArrowUpFromLine 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { auth, db } from '../../firebase';
import { 
  doc, getDoc, setDoc, collection, addDoc, 
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
    fintechName: '',
  });
  const [isBuying, setIsBuying] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loadingError, setLoadingError] = useState(null);
  const [loading, setLoading] = useState(true);

  const VALUE_PER_DIAMOND = 60;

  const nigerianBanks = [
    { name: 'Access Bank', color: '#0066CC' },
    { name: 'GTBank', color: '#00A651' },
    { name: 'Zenith Bank', color: '#FF0000' },
    { name: 'First Bank', color: '#003087' },
    { name: 'UBA', color: '#004B8D' },
    { name: 'Fidelity Bank', color: '#00B140' },
    { name: 'Stanbic IBTC', color: '#003087' },
    { name: 'Union Bank', color: '#004B8D' },
  ];

  const fintechOptions = [
    { name: 'OPay', color: '#FF6600' },
    { name: 'PalmPay', color: '#00C853' },
    { name: 'Kuda', color: '#00A8E8' },
    { name: 'Moniepoint', color: '#FF0000' },
    { name: 'Carbon', color: '#6B46C1' },
  ];

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
        console.error('Wallet load error:', err);
        setLoadingError(`Failed to load wallet: ${err.message || 'Unknown error'}`);
        toast.error('Failed to load wallet');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const coinPresets = [10, 50, 100, 200, 500];
  const pricePerCoin = 100;
  const totalBuyAmount = Number(coinsToBuy) * pricePerCoin || 0;

  const diamondPresets = [10, 20, 50, 100, 200];
  const totalWithdrawAmount = Number(diamondsToWithdraw) * VALUE_PER_DIAMOND || 0;

  const withdrawMethods = [
    { value: 'bank', label: 'Bank Transfer', icon: Banknote },
    { value: 'mobile', label: 'Mobile Money / Fintech', icon: Wallet },
  ];

  const handleInputChange = (e) => {
    setWithdrawDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
            await runTransaction(db, async (t) => {
              const userDoc = await t.get(userRef);
              if (!userDoc.exists()) throw new Error("User profile not found");
              const newCoins = (userDoc.data().coins || 0) + amount;
              t.update(userRef, { coins: newCoins });
            });

            await addDoc(collection(db, 'users', currentUser.uid, 'transactions'), {
              type: 'purchase',
              amountNGN: totalBuyAmount,
              description: `Bought ${amount} coins via Paystack`,
              status: 'completed',
              timestamp: serverTimestamp(),
            });

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
    if (isNaN(amount) || amount < 10) return toast.error(`Minimum withdrawal is 10 diamonds (₦${(10 * VALUE_PER_DIAMOND).toLocaleString()})`);
    if ((profile?.diamonds || 0) < amount) return toast.error('Not enough diamonds');

    if (withdrawMethod === 'bank') {
      if (!withdrawDetails.bankName || !withdrawDetails.accountNumber || !withdrawDetails.accountName) {
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
      const userRef = doc(db, 'users', currentUser.uid);
      await runTransaction(db, async (t) => {
        const userDoc = await t.get(userRef);
        if (!userDoc.exists()) throw new Error("User not found");
        const currentDiamonds = userDoc.data().diamonds || 0;
        if (currentDiamonds < amount) throw new Error("Insufficient diamonds");

        t.update(userRef, { diamonds: currentDiamonds - amount });
      });

      const methodLabel = withdrawMethod === 'bank' 
        ? withdrawDetails.bankName 
        : `${withdrawDetails.fintechName} Wallet`;

      await addDoc(collection(db, 'users', currentUser.uid, 'transactions'), {
        type: 'withdrawal',
        amountNGN: totalWithdrawAmount,
        description: `Withdrawal request: ₦${totalWithdrawAmount.toLocaleString()} (${amount} diamonds) via ${methodLabel}`,
        status: 'pending',
        timestamp: serverTimestamp(),
        diamondsUsed: amount,
        method: withdrawMethod,
        bankDetails: withdrawMethod === 'bank' ? {
          bankName: withdrawDetails.bankName.trim(),
          accountNumber: withdrawDetails.accountNumber.trim(),
          accountName: withdrawDetails.accountName.trim(),
        } : null,
        mobileDetails: withdrawMethod === 'mobile' ? {
          fintech: withdrawDetails.fintechName,
          number: withdrawDetails.mobileNumber.trim(),
        } : null,
        userEmail: currentUser.email || null,
      });

      toast.success(`Withdrawal request of ₦${totalWithdrawAmount.toLocaleString()} submitted! Processing usually takes 5–60 minutes.`);
      setDiamondsToWithdraw('');
      setWithdrawDetails({
        bankName: '',
        accountNumber: '',
        accountName: '',
        mobileNumber: '',
        fintechName: '',
      });
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 text-center max-w-sm w-full border border-white/30 dark:border-slate-700/40">
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-slate-950 dark:via-indigo-950/20 dark:to-purple-950/10 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-2">
            <Wallet className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-500 bg-clip-text text-transparent">
              Wallet
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400">Current balance & withdrawal options</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/40 dark:border-slate-700/50 p-8 text-center hover:shadow-2xl transition-all">
                <Coins className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">Coins</p>
                <p className="text-5xl font-extrabold text-slate-900 dark:text-white mt-2">
                  {(profile?.coins ?? 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100/80 dark:from-purple-950/60 dark:to-purple-900/50 backdrop-blur-lg rounded-3xl shadow-2xl border border-purple-200/50 dark:border-purple-700/40 p-8 text-center hover:shadow-3xl transition-all relative overflow-hidden">
                <div className="absolute -top-10 -right-10 opacity-20">
                  <Gem className="w-40 h-40 text-purple-300" />
                </div>
                <Gem className="w-16 h-16 text-purple-700 dark:text-purple-400 mx-auto mb-5 animate-pulse-slow" />
                <p className="text-2xl font-bold text-purple-800 dark:text-purple-300 mb-2 flex items-center justify-center gap-2">
                  Diamonds
                </p>
                <p className="text-6xl sm:text-7xl font-black text-purple-800 dark:text-purple-300 tracking-tight drop-shadow-md">
                  {(profile?.diamonds ?? 0).toLocaleString()}
                </p>
                <p className="text-xl font-semibold text-purple-700 dark:text-purple-400 mt-4">
                  Withdrawable now: ₦{((profile?.diamonds ?? 0) * VALUE_PER_DIAMOND).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-white/85 dark:bg-slate-800/75 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 dark:border-slate-700/40 p-6 sm:p-10">
              <div className="flex items-center gap-4 mb-6">
                <ArrowUpFromLine className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Buy Coins</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-6">₦100 = 1 Coin • Instant addition after payment</p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
                {coinPresets.map(amount => (
                  <button
                    key={amount}
                    onClick={() => setCoinsToBuy(amount.toString())}
                    className={`p-5 rounded-2xl border-2 text-center transition-all ${
                      coinsToBuy === amount.toString()
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 shadow-lg'
                        : 'border-slate-200 dark:border-slate-600 hover:border-amber-400 hover:bg-amber-50/30'
                    }`}
                  >
                    <div className="text-2xl font-bold">{amount}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">₦{(amount * pricePerCoin).toLocaleString()}</div>
                  </button>
                ))}
              </div>

              <div className="mb-8">
                <input
                  type="number"
                  min="1"
                  value={coinsToBuy}
                  onChange={e => setCoinsToBuy(e.target.value)}
                  placeholder="Custom amount"
                  className="w-full p-5 text-xl bg-white/70 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <button
                onClick={handleBuyCoins}
                disabled={isBuying || !coinsToBuy || Number(coinsToBuy) < 1}
                className="w-full py-5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-xl font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-60"
              >
                {isBuying ? <Loader2 className="w-6 h-6 animate-spin" /> : <CreditCard className="w-6 h-6" />}
                {isBuying ? 'Processing...' : `Pay ₦${totalBuyAmount.toLocaleString()}`}
              </button>
            </div>

            <div className="bg-white/85 dark:bg-slate-800/75 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 dark:border-slate-700/40 p-6 sm:p-10">
              <div className="flex items-center gap-4 mb-6">
                <ArrowDownToLine className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Withdraw Diamonds</h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                ₦{VALUE_PER_DIAMOND.toLocaleString()} = 1 Diamond • Minimum 10 diamonds (₦{(10 * VALUE_PER_DIAMOND).toLocaleString()})
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
                {diamondPresets.map(amount => (
                  <button
                    key={amount}
                    onClick={() => setDiamondsToWithdraw(amount.toString())}
                    className={`p-5 rounded-2xl border-2 text-center transition-all ${
                      diamondsToWithdraw === amount.toString()
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-lg'
                        : 'border-slate-200 dark:border-slate-600 hover:border-purple-400 hover:bg-purple-50/30'
                    }`}
                  >
                    <div className="text-2xl font-bold">{amount}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      ₦{(amount * VALUE_PER_DIAMOND).toLocaleString()}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mb-8">
                <input
                  type="number"
                  min="10"
                  value={diamondsToWithdraw}
                  onChange={e => setDiamondsToWithdraw(e.target.value)}
                  placeholder="Custom amount (diamonds)"
                  className="w-full p-5 text-xl bg-white/70 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="mb-8">
                <label className="block text-lg font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Choose Withdrawal Method
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {withdrawMethods.map(method => (
                    <button
                      key={method.value}
                      onClick={() => setWithdrawMethod(method.value)}
                      className={`p-6 rounded-2xl border-2 flex items-center justify-center gap-4 text-lg transition-all ${
                        withdrawMethod === method.value
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 shadow-lg'
                          : 'border-slate-300 dark:border-slate-600 hover:border-purple-400'
                      }`}
                    >
                      <method.icon className="w-7 h-7" />
                      <span className="font-semibold">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {withdrawMethod === 'bank' && (
                <div className="mb-8 space-y-4">
                  <label className="block text-lg font-medium text-slate-700 dark:text-slate-300">Select Bank</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                    {nigerianBanks.map(bank => {
                      const selected = withdrawDetails.bankName === bank.name;
                      const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(bank.name)}&background=${bank.color.slice(1)}&color=fff&size=64`;
                      return (
                        <button
                          key={bank.name}
                          onClick={() => setWithdrawDetails(prev => ({ ...prev, bankName: bank.name }))}
                          className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                            selected ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 shadow-md' : 'border-slate-200 dark:border-slate-600 hover:border-purple-300'
                          }`}
                        >
                          <img src={avatar} alt={bank.name} className="w-16 h-16 rounded-full mb-2 ring-2 ring-white dark:ring-slate-800" />
                          <span className="text-sm font-medium text-center">{bank.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid gap-4 mt-6">
                    <input
                      name="accountNumber"
                      value={withdrawDetails.accountNumber}
                      onChange={handleInputChange}
                      placeholder="Account Number (10 digits)"
                      type="tel"
                      maxLength={10}
                      className="p-5 bg-white/70 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-2xl"
                    />
                    <input
                      name="accountName"
                      value={withdrawDetails.accountName}
                      onChange={handleInputChange}
                      placeholder="Account Name (as registered)"
                      className="p-5 bg-white/70 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-2xl"
                    />
                  </div>
                </div>
              )}

              {withdrawMethod === 'mobile' && (
                <div className="mb-8 space-y-4">
                  <label className="block text-lg font-medium text-slate-700 dark:text-slate-300">Select Wallet / Fintech</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                    {fintechOptions.map(ft => {
                      const selected = withdrawDetails.fintechName === ft.name;
                      const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(ft.name)}&background=${ft.color.slice(1)}&color=fff&size=64`;
                      return (
                        <button
                          key={ft.name}
                          onClick={() => setWithdrawDetails(prev => ({ ...prev, fintechName: ft.name }))}
                          className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                            selected ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 shadow-md' : 'border-slate-200 dark:border-slate-600 hover:border-purple-300'
                          }`}
                        >
                          <img src={avatar} alt={ft.name} className="w-16 h-16 rounded-full mb-2 ring-2 ring-white dark:ring-slate-800" />
                          <span className="text-sm font-medium text-center">{ft.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6">
                    <input
                      name="mobileNumber"
                      value={withdrawDetails.mobileNumber}
                      onChange={handleInputChange}
                      placeholder="Wallet Phone Number (e.g. 080xxxxxxxx)"
                      type="tel"
                      className="w-full p-5 bg-white/70 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-2xl"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleWithdraw}
                disabled={isWithdrawing || !diamondsToWithdraw || Number(diamondsToWithdraw) < 10}
                className="w-full py-5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white text-xl font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-60 mt-6"
              >
                {isWithdrawing ? <Loader2 className="w-6 h-6 animate-spin" /> : <ArrowDownToLine className="w-6 h-6" />}
                {isWithdrawing ? 'Submitting...' : `Withdraw ₦${totalWithdrawAmount.toLocaleString()}`}
              </button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white/85 dark:bg-slate-800/75 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 dark:border-slate-700/40 p-6 sm:p-8 sticky top-8">
              <div className="flex items-center gap-4 mb-6">
                <History className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">History</h2>
              </div>

              {transactions.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-lg">
                  No transactions yet
                </div>
              ) : (
                <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-indigo-300 dark:scrollbar-thumb-indigo-600">
                  {transactions.map(tx => {
                    const isPositive = tx.type === 'purchase' || tx.type === 'earning';
                    const colorClass = isPositive 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400';
                    const iconBg = isPositive 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-red-100 dark:bg-red-900/30';

                    return (
                      <div 
                        key={tx.id}
                        className="flex items-start justify-between p-5 rounded-2xl bg-white/60 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600/60 transition-all"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-4 rounded-full ${iconBg}`}>
                            {isPositive ? <ArrowUpFromLine size={24} /> : <ArrowDownToLine size={24} />}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 dark:text-slate-100 text-base">{tx.description}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              {tx.timestamp.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold text-lg ${colorClass}`}>
                            {isPositive ? '+' : '-'}₦{tx.amountNGN?.toLocaleString() || '—'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">{tx.status}</p>
                        </div>
                      </div>
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