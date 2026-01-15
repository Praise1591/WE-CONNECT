// MonetaryValue.jsx — Professional, Flexible Buy/Withdraw (Custom Amount + Clean UX) with Paystack
import React, { useState, useEffect } from 'react';
import { Coins, Diamond, ArrowRight, Loader2, CreditCard, Wallet, Banknote, AlertCircle, Gem } from 'lucide-react';
import { toast } from 'react-toastify';

function MonetaryValue() {
  const [currentUser, setCurrentUser] = useState(null);
  const [coinsToBuy, setCoinsToBuy] = useState(''); // String for custom input
  const [diamondsToWithdraw, setDiamondsToWithdraw] = useState(''); // String for custom input
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [withdrawDetails, setWithdrawDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    mobileNumber: '',
  });
  const [isBuying, setIsBuying] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      setCurrentUser(JSON.parse(profile));
    }
  }, []);

  const coinPresets = [10, 50, 100, 200];
  const pricePerCoin = 100; // ₦100 per coin (₦1000 = 10 coins)
  const totalBuyAmount = parseInt(coinsToBuy) * pricePerCoin || 0;

  const diamondPresets = [10, 20, 50, 100];
  const valuePerDiamond = 100; // 1 diamond = ₦100
  const totalWithdrawAmount = parseInt(diamondsToWithdraw) * valuePerDiamond || 0;

  const withdrawMethods = [
    { value: 'bank', label: 'Bank Transfer', icon: Banknote },
    { value: 'mobile', label: 'Mobile Money (e.g., OPay, Palmpay)', icon: Wallet },
  ];

  const handleInputChange = (e) => {
    setWithdrawDetails({ ...withdrawDetails, [e.target.name]: e.target.value });
  };

  const handleBuyCoins = () => {
    if (!currentUser) {
      toast.error('Please log in first');
      return;
    }
    if (!coinsToBuy || parseInt(coinsToBuy) < 1) {
      toast.error('Enter a valid number of coins');
      return;
    }

    setIsBuying(true);

    // Dynamically load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.onload = () => {
      const handler = window.PaystackPop.setup({
        key: 'pk_test_YOUR_PUBLIC_KEY_HERE', // Replace with your Paystack public key
        email: currentUser.email,
        amount: totalBuyAmount * 100, // in kobo
        currency: 'NGN',
        ref: 'WE_CONNECT_' + Math.floor((Math.random() * 1000000000) + 1),
        metadata: {
          coins: parseInt(coinsToBuy),
          user_id: currentUser.email
        },
        callback: (response) => {
          // TODO: Verify on backend with response.reference
          const updated = { ...currentUser, coins: (currentUser.coins || 0) + parseInt(coinsToBuy) };
          localStorage.setItem('userProfile', JSON.stringify(updated));
          setCurrentUser(updated);
          toast.success(`${coinsToBuy} coins added! 🎉`);
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
      toast.error('Failed to load Paystack');
      setIsBuying(false);
    };
    document.body.appendChild(script);
  };

  const handleWithdraw = () => {
    const amount = parseInt(diamondsToWithdraw);
    if (!amount || amount < 10) {
      toast.error('Minimum withdrawal is 10 diamonds');
      return;
    }
    if ((currentUser.diamonds || 0) < amount) {
      toast.error('Insufficient diamonds');
      return;
    }
    if (withdrawMethod === 'bank' && (!withdrawDetails.bankName || !withdrawDetails.accountNumber || !withdrawDetails.accountName)) {
      toast.error('Fill all bank details');
      return;
    }
    if (withdrawMethod === 'mobile' && !withdrawDetails.mobileNumber) {
      toast.error('Enter mobile number');
      return;
    }

    setIsWithdrawing(true);

    // TODO: Backend API for withdrawal
    setTimeout(() => {
      const updated = { ...currentUser, diamonds: currentUser.diamonds - amount };
      localStorage.setItem('userProfile', JSON.stringify(updated));
      setCurrentUser(updated);
      toast.success(`₦${totalWithdrawAmount.toLocaleString()} withdrawal requested!`);
      setDiamondsToWithdraw('');
      setIsWithdrawing(false);
    }, 2000);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-10 text-center max-w-sm w-full">
          <Wallet className="w-20 h-20 text-indigo-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold">Please log in</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-2">To manage your wallet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center py-6">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Wallet</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">Buy coins • Withdraw diamonds</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 text-center">
            <Coins className="w-10 h-10 text-amber-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Coins</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{currentUser.coins || 0}</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-6 text-center">
            <Gem className="w-10 h-10 text-indigo-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Diamonds</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">{currentUser.diamonds || 0}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow p-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Buy Coins</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">₦1000 = 10 Coins</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {coinPresets.map(amount => (
              <button
                key={amount}
                onClick={() => setCoinsToBuy(amount)}
                className={`p-4 rounded-xl transition-all ${
                  coinsToBuy === amount ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <p className="text-lg font-medium">{amount} Coins</p>
                <p className="text-sm">₦{(amount * pricePerCoin).toLocaleString()}</p>
              </button>
            ))}
          </div>
          <input
            type="number"
            min="1"
            value={coinsToBuy}
            onChange={(e) => setCoinsToBuy(e.target.value)}
            placeholder="Custom amount"
            className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleBuyCoins}
            disabled={isBuying || !coinsToBuy || parseInt(coinsToBuy) < 1}
            className="w-full py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isBuying ? <Loader2 className="animate-spin" /> : <CreditCard />}
            {isBuying ? 'Processing...' : `Buy for ₦${totalBuyAmount.toLocaleString()}`}
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow p-6">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Withdraw Diamonds</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Min 10 Diamonds = ₦1000</p>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {diamondPresets.map(amount => (
              <button
                key={amount}
                onClick={() => setDiamondsToWithdraw(amount)}
                disabled={(currentUser.diamonds || 0) < amount}
                className={`p-4 rounded-xl transition-all ${
                  diamondsToWithdraw === amount ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                } ${(currentUser.diamonds || 0) < amount ? 'opacity-50' : ''}`}
              >
                <p className="text-lg font-medium">{amount} Diamonds</p>
                <p className="text-sm">₦{(amount * valuePerDiamond).toLocaleString()}</p>
              </button>
            ))}
          </div>
          <input
            type="number"
            min="10"
            value={diamondsToWithdraw}
            onChange={(e) => setDiamondsToWithdraw(e.target.value)}
            placeholder="Custom amount (min 10)"
            className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="space-y-4 mb-6">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Withdrawal Method</label>
            <div className="grid grid-cols-2 gap-4">
              {withdrawMethods.map(method => (
                <button
                  key={method.value}
                  onClick={() => setWithdrawMethod(method.value)}
                  className={`p-4 rounded-xl flex items-center justify-center gap-3 transition-all ${
                    withdrawMethod === method.value ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-500' : 'bg-slate-100 dark:bg-slate-700'
                  } border-2`}
                >
                  <method.icon className="w-6 h-6" />
                  <span className="font-medium">{method.label}</span>
                </button>
              ))}
            </div>
          </div>
          {withdrawMethod === 'bank' && (
            <div className="space-y-4">
              <input name="bankName" value={withdrawDetails.bankName} onChange={handleInputChange} placeholder="Bank Name" className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-xl" />
              <input name="accountNumber" value={withdrawDetails.accountNumber} onChange={handleInputChange} placeholder="Account Number" className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-xl" />
              <input name="accountName" value={withdrawDetails.accountName} onChange={handleInputChange} placeholder="Account Name" className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-xl" />
            </div>
          )}
          {withdrawMethod === 'mobile' && (
            <input name="mobileNumber" value={withdrawDetails.mobileNumber} onChange={handleInputChange} placeholder="Mobile Number" className="w-full p-4 border border-slate-300 dark:border-slate-600 rounded-xl" />
          )}
          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing || !diamondsToWithdraw || parseInt(diamondsToWithdraw) < 10 || (currentUser.diamonds || 0) < parseInt(diamondsToWithdraw)}
            className="w-full mt-6 py-4 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isWithdrawing ? <Loader2 className="animate-spin" /> : <Banknote />}
            {isWithdrawing ? 'Processing...' : `Withdraw ₦${totalWithdrawAmount.toLocaleString()}`}
          </button>
          {(currentUser.diamonds || 0) < parseInt(diamondsToWithdraw || 0) && (
            <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
              <AlertCircle size={16} />
              Insufficient diamonds
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MonetaryValue;