const express = require('express');
const router = express.Router();
const axios = require('axios');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const CONSUMER_KEY = process.env.CONSUMER_KEY;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET;
const SHORTCODE = process.env.SHORTCODE || '4574727';
const PASSKEY = process.env.PASSKEY;
const CALLBACK_URL = process.env.CALLBACK_URL;
const TILL_NUMBER = process.env.TILL_NUMBER || '5367886';

// Get M-Pesa access token
async function getMpesaToken() {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  const response = await axios.get(
    'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    { headers: { Authorization: `Basic ${auth}` } }
  );
  return response.data.access_token;
}

// Format phone number to 254XXXXXXXXX
function formatPhone(phone) {
  phone = phone.replace(/\s+/g, '').replace(/[^0-9]/g, '');
  if (phone.startsWith('0')) phone = '254' + phone.slice(1);
  if (phone.startsWith('+254')) phone = phone.slice(1);
  if (!phone.startsWith('254')) phone = '254' + phone;
  return phone;
}

// STK Push - initiate payment
router.post('/stkpush', async (req, res) => {
  try {
    const { phone, amount, orderId, customerName } = req.body;

    if (!phone || !amount) {
      return res.status(400).json({ error: 'Phone number and amount are required' });
    }

    const formattedPhone = formatPhone(phone);
    const parsedAmount = parseInt(amount);

    if (parsedAmount < 1) {
      return res.status(400).json({ error: 'Amount must be at least KES 1' });
    }

    const token = await getMpesaToken();

    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

    const stkResponse = await axios({
      method: 'POST',
      url: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        BusinessShortCode: SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerBuyGoodsOnline',
        Amount: parsedAmount,
        PartyA: formattedPhone,
        PartyB: TILL_NUMBER,
        PhoneNumber: formattedPhone,
        CallBackURL: CALLBACK_URL,
        AccountReference: 'GeopramGifts',
        TransactionDesc: 'Geopram Technologies Shops'
      }
    });

    const { CheckoutRequestID, MerchantRequestID, ResponseDescription } = stkResponse.data;

    // Save pending order
    const order = {
      id: orderId || uuidv4(),
      checkoutRequestId: CheckoutRequestID,
      merchantRequestId: MerchantRequestID,
      phone: formattedPhone,
      amount: parsedAmount,
      customerName: customerName || 'Customer',
      status: 'pending',
      tillNumber: TILL_NUMBER,
      shortcode: SHORTCODE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.push(order);

    res.json({
      success: true,
      message: 'STK Push sent! Check your phone to complete payment.',
      checkoutRequestId: CheckoutRequestID,
      orderId: order.id,
      tillNumber: TILL_NUMBER
    });

  } catch (err) {
    console.error('STK Push error:', err.response?.data || err.message);
    res.status(500).json({
      error: 'Payment initiation failed. Please try again.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// M-Pesa Callback
router.post('/callback', (req, res) => {
  try {
    const callbackData = req.body;
    db.callbacks.push({ ...callbackData, receivedAt: new Date().toISOString() });

    const { Body } = callbackData;
    if (!Body?.stkCallback) return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;

    const orderIdx = db.orders.findIndex(o => o.checkoutRequestId === CheckoutRequestID);

    if (orderIdx !== -1) {
      if (ResultCode === 0) {
        // Payment successful
        const meta = {};
        CallbackMetadata?.Item?.forEach(item => {
          meta[item.Name] = item.Value;
        });

        db.orders[orderIdx] = {
          ...db.orders[orderIdx],
          status: 'completed',
          mpesaReceiptNumber: meta.MpesaReceiptNumber,
          transactionDate: meta.TransactionDate,
          amount: meta.Amount,
          updatedAt: new Date().toISOString()
        };
      } else {
        db.orders[orderIdx] = {
          ...db.orders[orderIdx],
          status: 'failed',
          failureReason: ResultDesc,
          updatedAt: new Date().toISOString()
        };
      }
    }

    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
});

// Check payment status
router.get('/status/:checkoutRequestId', (req, res) => {
  const order = db.orders.find(o => o.checkoutRequestId === req.params.checkoutRequestId);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  res.json({
    status: order.status,
    receipt: order.mpesaReceiptNumber,
    amount: order.amount,
    message: order.status === 'completed'
      ? `Payment confirmed! Receipt: ${order.mpesaReceiptNumber}`
      : order.status === 'failed'
      ? `Payment failed: ${order.failureReason}`
      : 'Waiting for payment confirmation...'
  });
});

module.exports = router;
