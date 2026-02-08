// MonetaryValue.jsx — Wallet with side-by-side layout + Paystack Production Setup + Transaction Filters + Collapsible History

import React, { useState, useEffect } from 'react';
import { 
  Coins, Gem, CreditCard, Banknote, Wallet, Loader2, 
  AlertCircle, Sparkles, History, ArrowDownToLine, ArrowUpFromLine, ChevronDown, ChevronUp, Filter 
} from 'lucide-react';
import { toast } from 'react-toastify';

function MonetaryValue() {
  const [currentUser, setCurrentUser] = useState(null);
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
  const [filterType, setFilterType] = useState('all'); // 'all', 'purchase', 'withdrawal'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'pending'
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);

  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    if (profile) setCurrentUser(JSON.parse(profile));

    const storedTx = localStorage.getItem('walletTransactions');
    if (storedTx) setTransactions(JSON.parse(storedTx));
  }, []);

  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('walletTransactions', JSON.stringify(transactions));
    }
  }, [transactions]);

  const coinPresets = [10, 50, 100, 200];
  const pricePerCoin = 100;
  const totalBuyAmount = parseInt(coinsToBuy) * pricePerCoin || 0;

  const diamondPresets = [10, 20, 50, 100];
  const valuePerDiamond = 100;
  const totalWithdrawAmount = parseInt(diamondsToWithdraw) * valuePerDiamond || 0;

  const withdrawMethods = [
    { value: 'bank', label: 'Bank Transfer', icon: Banknote },
    { value: 'mobile', label: 'Mobile Money', icon: Wallet },
  ];

  const handleInputChange = (e) => {
    setWithdrawDetails({ ...withdrawDetails, [e.target.name]: e.target.value });
  };

  const addTransaction = (type, amount, description, status = 'completed') => {
    const newTx = {
      id: Date.now(),
      type,
      amount,
      description,
      status,
      timestamp: new Date().toLocaleString('en-NG', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }),
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleBuyCoins = () => {
    if (!currentUser) return toast.error('Please log in first');
    if (!coinsToBuy || parseInt(coinsToBuy) < 1) return toast.error('Enter valid amount');

    setIsBuying(true);

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.onload = () => {
      const handler = window.PaystackPop.setup({
        // For production: Replace with your live public key (e.g., 'pk_live_xxxxxxxxxxxxx')
        // IMPORTANT: Never expose secret keys in frontend code. Use backend for verification.
        key: 'pk_test_480d88a5cbfa09b6864e9796af08dd241de9d1a6', // Test key; change to live for production
        email: currentUser.email || 'test@example.com',
        amount: totalBuyAmount * 100,
        currency: 'NGN',
        ref: 'WC_' + Math.floor(Math.random() * 1000000000 + 1).toString(), // Removed 'TEST_' for production readiness
        metadata: { coins: parseInt(coinsToBuy) },
        callback: (response) => {
          // In production: Send response.reference to backend for verification using sk_live_...
          // Example backend call: fetch('/verify-payment', { method: 'POST', body: JSON.stringify({ reference: response.reference }) })
          // Only credit coins after backend confirms

          const coinsAdded = parseInt(coinsToBuy);
          const updated = { ...currentUser, coins: (currentUser.coins || 0) + coinsAdded };
          localStorage.setItem('userProfile', JSON.stringify(updated));
          setCurrentUser(updated);

          addTransaction('purchase', totalBuyAmount, `Bought ${coinsAdded} coins via Paystack`);
          toast.success(`Success! ${coinsAdded} coins added`);
          setCoinsToBuy('');
          setIsBuying(false);
        },
        onClose: () => {
          toast.info('Payment cancelled');
          setIsBuying(false);
        }
      });
      handler.openIframe();
    };
    script.onerror = () => {
      toast.error('Could not load Paystack');
      setIsBuying(false);
    };
    document.body.appendChild(script);
  };

  const handleWithdraw = () => {
    const amount = parseInt(diamondsToWithdraw);
    if (!amount || amount < 10) return toast.error('Minimum 10 diamonds');
    if ((currentUser.diamonds || 0) < amount) return toast.error('Not enough diamonds');

    if (withdrawMethod === 'bank' && 
        (!withdrawDetails.bankName || !withdrawDetails.accountNumber || !withdrawDetails.accountName)) {
      return toast.error('Please complete bank details');
    }
    if (withdrawMethod === 'mobile' && !withdrawDetails.mobileNumber) {
      return toast.error('Please enter mobile number');
    }

    setIsWithdrawing(true);

    setTimeout(() => {
      const updated = { ...currentUser, diamonds: (currentUser.diamonds || 0) - amount };
      localStorage.setItem('userProfile', JSON.stringify(updated));
      setCurrentUser(updated);

      addTransaction(
        'withdrawal',
        totalWithdrawAmount,
        `Withdraw ₦${totalWithdrawAmount.toLocaleString()} (${amount} diamonds) via ${withdrawMethod === 'bank' ? 'Bank' : 'Mobile Money'}`,
        'pending'
      );

      toast.success(`Withdrawal request of ₦${totalWithdrawAmount.toLocaleString()} submitted`);
      setDiamondsToWithdraw('');
      setWithdrawDetails({ bankName: '', accountNumber: '', accountName: '', mobileNumber: '' });
      setIsWithdrawing(false);
    }, 1600);
  };

  const filteredTransactions = transactions.filter(tx => {
    const typeMatch = filterType === 'all' || tx.type === filterType;
    const statusMatch = filterStatus === 'all' || tx.status === filterStatus;
    return typeMatch && statusMatch;
  });

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-slate-950 dark:via-indigo-950/20 dark:to-purple-950/10 pb-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <Wallet className="w-9 h-9 text-indigo-600 dark:text-indigo-400" />
            <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-500 bg-clip-text text-transparent">
              Wallet
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400">Manage Coins • Withdraw Diamonds • View History</p>
        </div>

        {/* Main content - two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* Left side - Deposit & Withdraw (takes 2/3 on large screens) */}
          <div className="lg:col-span-2 space-y-6">

            {/* Balances */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-lg border border-white/40 dark:border-slate-700/50 p-6 text-center hover:shadow-xl transition-all">
                <Coins className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Coins</p>
                <p className="text-4xl font-bold text-slate-900 dark:text-white mt-1">{currentUser.coins || 0}</p>
              </div>
              <div className="bg-white/70 dark:bg-slate-800/60 backdrop-blur-lg rounded-2xl shadow-lg border border-white/40 dark:border-slate-700/50 p-6 text-center hover:shadow-xl transition-all">
                <Gem className="w-10 h-10 text-purple-500 mx-auto mb-3" />
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Diamonds</p>
                <p className="text-4xl font-bold text-slate-900 dark:text-white mt-1">{currentUser.diamonds || 0}</p>
              </div>
            </div>

            {/* Buy Coins */}
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
                disabled={isBuying || !coinsToBuy || parseInt(coinsToBuy) < 1}
                className="w-full py-4.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white font-semibold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed transform active:scale-[0.98]"
              >
                {isBuying ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                {isBuying ? 'Processing...' : `Pay ₦${totalBuyAmount.toLocaleString()}`}
              </button>
            </div>

            {/* Withdraw Diamonds */}
            <div className="bg-white/75 dark:bg-slate-800/65 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 dark:border-slate-700/40 p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <ArrowDownToLine className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Withdraw Diamonds</h2>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-5">Min ₦1,000 (10 Diamonds) • 1–3 days</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {diamondPresets.map(amount => (
                  <button
                    key={amount}
                    onClick={() => setDiamondsToWithdraw(amount.toString())}
                    disabled={(currentUser.diamonds || 0) < amount}
                    className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                      diamondsToWithdraw === amount.toString()
                        ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/30 shadow-md'
                        : 'border-transparent hover:border-purple-300 dark:hover:border-purple-700/50 bg-white/60 dark:bg-slate-700/40 hover:shadow-md'
                    } ${(currentUser.diamonds || 0) < amount ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                  Amount (min 10 diamonds)
                </label>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Withdrawal Method</label>
                <div className="grid grid-cols-2 gap-4">
                  {withdrawMethods.map(method => (
                    <button
                      key={method.value}
                      onClick={() => setWithdrawMethod(method.value)}
                      className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all duration-300 border-2 ${
                        withdrawMethod === method.value
                          ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/30 shadow-md'
                          : 'border-transparent hover:border-purple-300 dark:hover:border-purple-700/50 bg-white/60 dark:bg-slate-700/40 hover:shadow-md'
                      }`}
                    >
                      <method.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      <span className="font-medium text-sm">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {withdrawMethod === 'bank' && (
                <div className="space-y-4 mb-6">
                  <input name="bankName" value={withdrawDetails.bankName} onChange={handleInputChange} placeholder="Bank Name" className="w-full p-4 bg-white/60 dark:bg-slate-700/40 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  <input name="accountNumber" value={withdrawDetails.accountNumber} onChange={handleInputChange} placeholder="Account Number" className="w-full p-4 bg-white/60 dark:bg-slate-700/40 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  <input name="accountName" value={withdrawDetails.accountName} onChange={handleInputChange} placeholder="Account Name" className="w-full p-4 bg-white/60 dark:bg-slate-700/40 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
              )}

              {withdrawMethod === 'mobile' && (
                <div className="mb-6">
                  <input name="mobileNumber" value={withdrawDetails.mobileNumber} onChange={handleInputChange} placeholder="Mobile Money Number (OPay, Palmpay...)" className="w-full p-4 bg-white/60 dark:bg-slate-700/40 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400" />
                </div>
              )}

              <button
                onClick={handleWithdraw}
                disabled={isWithdrawing || !diamondsToWithdraw || parseInt(diamondsToWithdraw) < 10 || (currentUser.diamonds || 0) < parseInt(diamondsToWithdraw)}
                className="w-full py-4.5 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed transform active:scale-[0.98]"
              >
                {isWithdrawing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Banknote className="w-5 h-5" />}
                {isWithdrawing ? 'Requesting...' : `Withdraw ₦${totalWithdrawAmount.toLocaleString()}`}
              </button>

              {(currentUser.diamonds || 0) < parseInt(diamondsToWithdraw || 0) && diamondsToWithdraw && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-3 flex items-center justify-center gap-2">
                  <AlertCircle size={16} /> Insufficient diamonds
                </p>
              )}
            </div>
          </div>

          {/* Right side - Transaction History */}
          <div className="lg:col-span-1">
            <div className="bg-white/75 dark:bg-slate-800/65 backdrop-blur-xl rounded-3xl shadow-xl border border-white/40 dark:border-slate-700/40 p-6 sm:p-8 sticky top-8">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <History className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">History</h2>
                </div>
                <button 
                  onClick={() => setIsHistoryCollapsed(prev => !prev)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  {isHistoryCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                </button>
              </div>

              {!isHistoryCollapsed && (
                <>
                  {/* Filters */}
                  <div className="flex gap-3 mb-5">
                    <div className="flex-1 relative">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <select
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white/60 dark:bg-slate-700/40 border border-slate-300 dark:border-slate-600 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 text-sm"
                      >
                        <option value="all">All Types</option>
                        <option value="purchase">Purchases</option>
                        <option value="withdrawal">Withdrawals</option>
                      </select>
                    </div>
                    <div className="flex-1 relative">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-white/60 dark:bg-slate-700/40 border border-slate-300 dark:border-slate-600 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 text-sm"
                      >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </div>

                  {filteredTransactions.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                      No matching transactions
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                      {filteredTransactions.map(tx => (
                        <div 
                          key={tx.id}
                          className="flex items-start justify-between p-3 rounded-xl bg-white/50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 transition-all hover:bg-slate-50 dark:hover:bg-slate-600/40"
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-full flex-shrink-0 ${
                              tx.type === 'purchase' 
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' 
                                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                            }`}>
                              {tx.type === 'purchase' ? <ArrowUpFromLine size={16} /> : <ArrowDownToLine size={16} />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                                {tx.description}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {tx.timestamp}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2">
                            <p className={`text-sm font-semibold whitespace-nowrap ${
                              tx.type === 'purchase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                            }`}>
                              {tx.type === 'purchase' ? '+' : '-'}₦{tx.amount.toLocaleString()}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 capitalize">
                              {tx.status}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default MonetaryValue;