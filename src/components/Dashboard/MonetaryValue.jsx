// MonetaryValue.jsx — Fixed with Interswitch, Naira, Diamonds, Responsive, and Backend Example
import React, { useState, useEffect } from 'react';
import { Banknote, CreditCard, Wallet, ArrowRight, Diamond } from 'lucide-react';

function MonetaryValue() {
  const [currentUser, setCurrentUser] = useState(null);
  const [diamondsAmount, setDiamondsAmount] = useState(100); // Default diamonds to buy
  const [paymentMethod, setPaymentMethod] = useState('card'); // Default payment method
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      setCurrentUser(JSON.parse(profile));
    }
  }, []);

  const diamondOptions = [100, 500, 1000, 5000]; // Predefined diamond amounts
  const pricePerDiamond = 10; // 10 Naira per diamond (adjust as needed)

  const totalAmount = diamondsAmount * pricePerDiamond;

  const handleBuyDiamonds = () => {
    setIsProcessing(true);

    // Manual Interswitch form submission
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://sandbox.webpay.interswitchng.com/paydirect/pay'; // Test URL; use live for production

    const params = {
      product_id: 'YOUR_PRODUCT_ID', // Replace with your Interswitch product ID
      pay_item_id: 'YOUR_PAY_ITEM_ID', // Replace with your pay item ID
      amount: totalAmount * 100, // In kobo (100 kobo = 1 Naira)
      currency: '566', // NGN code
      site_redirect_url: window.location.origin + '/monetary?success=true',
      txn_ref: Date.now().toString(),
      cust_id: currentUser?.email || 'guest',
      cust_name: currentUser?.name || 'Guest',
      // Add hash if required by your merchant setup
    };

    Object.keys(params).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = params[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();

    setIsProcessing(false);
  };

  // On success (from callback)
  useEffect(() => {
    if (window.location.search.includes('success=true')) {
      if (currentUser) {
        const updated = { ...currentUser, diamonds: (currentUser.diamonds || 0) + diamondsAmount };
        localStorage.setItem('userProfile', JSON.stringify(updated));
        setCurrentUser(updated);
        alert(`Success! ${diamondsAmount} diamonds added to your account.`);
        window.history.replaceState({}, '', '/monetary');
      }
    }
  }, [currentUser, diamondsAmount]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-10 text-center">
          <Diamond className="w-20 h-20 text-purple-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Please log in to buy diamonds</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-3">
            Buy Diamonds
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Exchange Naira for diamonds to use in WE CONNECT
          </p>
        </div>

        {/* Current Balance */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6 flex items-center justify-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg">
            <Diamond className="w-7 h-7" />
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Your Diamonds</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-white">
              {currentUser.diamonds || 0}
            </p>
          </div>
        </div>

        {/* Select Amount */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
            Select Amount
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {diamondOptions.map(amount => (
              <button
                key={amount}
                onClick={() => setDiamondsAmount(amount)}
                className={`p-4 rounded-xl transition-all duration-200 ${
                  diamondsAmount === amount
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <p className="font-bold">{amount} Diamonds</p>
                <p className="text-sm">₦{amount * pricePerDiamond}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
            Payment Method
          </h2>
          <div className="space-y-3">
            <button
              onClick={() => setPaymentMethod('interswitch')}
              className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all duration-200 ${
                paymentMethod === 'interswitch' ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <CreditCard className="w-6 h-6 text-blue-600" />
              <span className="font-medium">Interswitch (Card/Bank)</span>
            </button>
          </div>
        </div>

        {/* Buy Button */}
        <button
          onClick={handleBuyDiamonds}
          disabled={isProcessing}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
        >
          <ArrowRight size={20} />
          Buy Now - ₦{totalAmount}
        </button>
      </div>
    </div>
  );
}

export default MonetaryValue;