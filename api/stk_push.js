const axios = require('axios');
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');

const CONSUMER_KEY = process.env.CONSUMER_KEY;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET;
const SHORTCODE = process.env.SHORTCODE;
const PASSKEY = process.env.PASSKEY;
const CALLBACK_URL = process.env.CALLBACK_URL;

let cachedToken = null;
let tokenExpiry = null;

/**
 * Get OAuth token from M-Pesa
 */
const getAccessToken = async () => {
  try {
    // Return cached token if still valid
    if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
      return cachedToken;
    }

    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');

    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: { Authorization: `Basic ${auth}` }
      }
    );

    cachedToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in * 1000);

    return cachedToken;
  } catch (error) {
    console.error('❌ Token error:', error.response?.data || error.message);
    throw new Error('Failed to get access token');
  }
};

/**
 * Initiate STK Push
 */
const initiateStkPush = async (req, res) => {
  try {
    const { phone, amount, items = [] } = req.body;

    // Validate input
    if (!phone || !amount) {
      return res.status(400).json({ error: 'Phone and amount required' });
    }

    // Format phone number (remove +254, add 254)
    const formattedPhone = phone.replace(/^0/, '254').replace(/^\+/, '');
    const parsedAmount = parseInt(amount);

    if (parsedAmount < 1) {
      return res.status(400).json({ error: 'Amount must be at least 1 KES' });
    }

    const token = await getAccessToken();
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');

    const payload = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerBuyGoodsOnline',
      Amount: parsedAmount,
      PartyA: formattedPhone,
      PartyB: '5367886',
      PhoneNumber: formattedPhone,
      CallBackURL: CALLBACK_URL,
      AccountReference: 'GeoPramTech',
      TransactionDesc: 'Payment for Geopram Technologies Services'
    };

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.ResponseCode === '0') {
      res.json({
        success: true,
        message: 'STK Push sent successfully',
        checkoutRequestID: response.data.CheckoutRequestID,
        responseCode: response.data.ResponseCode,
        items: items
      });
    } else {
      res.status(400).json({
        success: false,
        error: response.data.ResponseDescription,
        responseCode: response.data.ResponseCode
      });
    }
  } catch (error) {
    console.error('❌ STK Push error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to initiate payment'
    });
  }
};

/**
 * Check transaction status
 */
const checkStatus = async (req, res) => {
  try {
    const { checkoutRequestID } = req.params;

    // In production, query your database
    // For now, return a status check message
    res.json({
      checkoutRequestID,
      status: 'pending',
      message: 'Payment status will be updated via callback'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { initiateStkPush, checkStatus, getAccessToken };
