// pages/PaymentCallback.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('tx_ref');
      const transactionId = searchParams.get('transaction_id');
      
      if (!reference) {
        setStatus('error');
        setMessage('Invalid payment reference');
        return;
      }
      
      try {
        const paymentRef = doc(db, 'pending_payments', reference);
        const paymentDoc = await getDoc(paymentRef);
        
        if (paymentDoc.exists()) {
          const payment = paymentDoc.data();
          
          if (payment.status === 'completed') {
            setStatus('success');
            setMessage(`Success! ${payment.coins} coins have been added to your wallet.`);
            
            // Redirect after 3 seconds
            setTimeout(() => navigate('/wallet'), 3000);
          } else if (payment.status === 'failed') {
            setStatus('error');
            setMessage('Payment failed. Please try again.');
          } else {
            setStatus('pending');
            setMessage('Payment is being processed. Please wait...');
            
            // Poll for status update
            const checkInterval = setInterval(async () => {
              const updatedDoc = await getDoc(paymentRef);
              if (updatedDoc.exists()) {
                const updated = updatedDoc.data();
                if (updated.status === 'completed') {
                  clearInterval(checkInterval);
                  setStatus('success');
                  setMessage(`Success! ${updated.coins} coins have been added to your wallet.`);
                  setTimeout(() => navigate('/wallet'), 3000);
                } else if (updated.status === 'failed') {
                  clearInterval(checkInterval);
                  setStatus('error');
                  setMessage('Payment failed. Please try again.');
                }
              }
            }, 3000);
            
            // Stop polling after 5 minutes
            setTimeout(() => clearInterval(checkInterval), 300000);
          }
        } else {
          setStatus('error');
          setMessage('Payment record not found');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage('An error occurred while verifying your payment');
      }
    };
    
    verifyPayment();
  }, [searchParams, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Verifying Payment</h2>
            <p className="text-slate-600 dark:text-slate-400">Please wait while we confirm your transaction...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Payment Successful!</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{message}</p>
            <p className="text-sm text-slate-500">Redirecting to wallet...</p>
          </>
        )}
        
        {status === 'pending' && (
          <>
            <Loader2 className="w-16 h-16 text-yellow-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Processing Payment</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{message}</p>
            <p className="text-sm text-slate-500">This may take a few moments</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Payment Failed</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{message}</p>
            <button
              onClick={() => navigate('/wallet')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
            >
              Return to Wallet
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default PaymentCallback;