const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// KORA CONFIG - Replace with your live secret key
const KORA_SECRET_KEY = 'your_live_kora_secret_here';
const KORA_BASE_URL = 'https://api.korapay.com/merchant/api/v1';

// Initialize payment
app.post('/api/initialize-payment', async (req, res) => {
  const { amount, coins, reference, redirectUrl, userId, userEmail } = req.body;
  
  try {
    const paymentData = {
      amount: Number(amount),
      currency: "NGN",
      reference: reference,
      customer: {
        email: userEmail || 'customer@example.com',
        name: 'User'
      },
      metadata: { userId, coins },
      redirect_url: redirectUrl || 'https://your-app.com/callback',
      channels: ["card", "bank_transfer"]
    };

    const response = await axios.post(
      `${KORA_BASE_URL}/charges/initialize`,
      paymentData,
      { headers: { 'Authorization': `Bearer ${KORA_SECRET_KEY}` } }
    );

    if (response.data.status && response.data.data?.payment_url) {
      res.json({ success: true, paymentUrl: response.data.data.payment_url });
    } else {
      res.status(400).json({ success: false, message: 'Kora init failed' });
    }
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify payment
app.get('/api/verify-payment/:reference', async (req, res) => {
  const { reference } = req.params;
  try {
    const response = await axios.get(`${KORA_BASE_URL}/charges/${reference}`, {
      headers: { 'Authorization': `Bearer ${KORA_SECRET_KEY}` }
    });
    const result = response.data;
    if (result.status && result.data?.status === 'success') {
      res.json({ success: true, message: 'Payment verified' });
    } else {
      res.json({ success: false, message: 'Payment not successful' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));