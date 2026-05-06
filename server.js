const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const XLSX = require('xlsx');
require('dotenv').config();

// Import routes
const { initiateStkPush, checkStatus } = require('./api/stk_push');
const { handleCallback } = require('./api/callback');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(fileUpload());
app.use(express.static('public'));

// Data storage paths - Use /tmp for Vercel compatibility
const isProduction = process.env.NODE_ENV === 'production';
const dataDir = isProduction ? '/tmp/geopram-data' : path.join(__dirname, 'data');
const transactionsFile = path.join(dataDir, 'transactions.json');
const productsFile = path.join(dataDir, 'products.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data files
if (!fs.existsSync(transactionsFile)) {
  fs.writeFileSync(transactionsFile, JSON.stringify([], null, 2));
}
if (!fs.existsSync(productsFile)) {
  fs.writeFileSync(productsFile, JSON.stringify([], null, 2));
}

// Authentication Middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes

/**
 * Admin Login
 */
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const verifyEmail = process.env.VERIFY_EMAIL;

    if (email !== adminEmail) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (password !== adminPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { email, verifyEmail, role: 'admin' },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      admin: {
        email,
        verifyEmail,
        phone: process.env.ADMIN_PHONE
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * STK Push - Initiate Payment
 */
app.post('/api/pay', initiateStkPush);

/**
 * Payment Callback from M-Pesa
 */
app.post('/api/callback', handleCallback);

/**
 * Check Payment Status
 */
app.get('/api/status/:checkoutRequestID', checkStatus);

/**
 * Get All Transactions (Admin)
 */
app.get('/api/admin/transactions', verifyToken, (req, res) => {
  try {
    const transactions = JSON.parse(fs.readFileSync(transactionsFile, 'utf8'));
    res.json({ transactions, count: transactions.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get Transactions by Date Range (Admin)
 */
app.get('/api/admin/transactions/filter/:period', verifyToken, (req, res) => {
  try {
    const { period } = req.params;
    const transactions = JSON.parse(fs.readFileSync(transactionsFile, 'utf8'));

    const now = moment();
    let filtered = transactions;

    switch (period) {
      case 'day':
        filtered = transactions.filter(t =>
          moment(t.timestamp).isSame(now, 'day')
        );
        break;
      case 'week':
        filtered = transactions.filter(t =>
          moment(t.timestamp).isSame(now, 'week')
        );
        break;
      case 'month':
        filtered = transactions.filter(t =>
          moment(t.timestamp).isSame(now, 'month')
        );
        break;
      case 'year':
        filtered = transactions.filter(t =>
          moment(t.timestamp).isSame(now, 'year')
        );
        break;
    }

    // Calculate stats
    const totalAmount = filtered.reduce((sum, t) => sum + (t.amount || 0), 0);
    const successCount = filtered.filter(t => t.status === 'SUCCESS').length;

    res.json({
      period,
      transactions: filtered,
      stats: {
        count: filtered.length,
        totalAmount,
        successCount,
        failureCount: filtered.length - successCount
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Download Transactions as Excel
 */
app.get('/api/admin/download/:period', verifyToken, (req, res) => {
  try {
    const { period } = req.params;
    const transactions = JSON.parse(fs.readFileSync(transactionsFile, 'utf8'));

    const now = moment();
    let filtered = transactions;

    switch (period) {
      case 'day':
        filtered = transactions.filter(t =>
          moment(t.timestamp).isSame(now, 'day')
        );
        break;
      case 'week':
        filtered = transactions.filter(t =>
          moment(t.timestamp).isSame(now, 'week')
        );
        break;
      case 'month':
        filtered = transactions.filter(t =>
          moment(t.timestamp).isSame(now, 'month')
        );
        break;
      case 'year':
        filtered = transactions.filter(t =>
          moment(t.timestamp).isSame(now, 'year')
        );
        break;
    }

    // Prepare data for Excel
    const data = filtered.map(t => ({
      'Transaction ID': t.id,
      'Phone Number': t.phone,
      'Amount (KES)': t.amount,
      'Status': t.status,
      'M-Pesa Code': t.mpesaCode,
      'Timestamp': t.timestamp
    }));

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    const filename = `transactions-${period}-${moment().format('YYYY-MM-DD')}.xlsx`;
    const filepath = path.join(dataDir, filename);

    XLSX.write(workbook, { bookType: 'xlsx', type: 'file', cellStyles: true }, filepath);

    res.download(filepath, filename, (err) => {
      if (err) console.error('Download error:', err);
      // Clean up file after download
      fs.unlink(filepath, () => {});
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Add/Update Product
 */
app.post('/api/admin/products', verifyToken, (req, res) => {
  try {
    const { id, name, price, description, image } = req.body;
    const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

    const productData = {
      id: id || Date.now().toString(),
      name,
      price: parseFloat(price),
      description,
      image: image || '',
      createdAt: new Date().toISOString()
    };

    const existingIndex = products.findIndex(p => p.id === productData.id);
    if (existingIndex >= 0) {
      products[existingIndex] = { ...products[existingIndex], ...productData };
    } else {
      products.push(productData);
    }

    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));

    res.json({ success: true, product: productData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get All Products
 */
app.get('/api/products', (req, res) => {
  try {
    const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Delete Product
 */
app.delete('/api/admin/products/:id', verifyToken, (req, res) => {
  try {
    const { id } = req.params;
    const products = JSON.parse(fs.readFileSync(productsFile, 'utf8'));

    const filtered = products.filter(p => p.id !== id);
    fs.writeFileSync(productsFile, JSON.stringify(filtered, null, 2));

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Upload Image from Local or URL
 */
app.post('/api/admin/upload-image', verifyToken, (req, res) => {
  try {
    const { imageUrl, imageName } = req.body;

  // If image file is uploaded
      if (req.files && req.files.image) {
        const uploadDir = isProduction ? '/tmp/geopram-uploads' : path.join(__dirname, 'public', 'uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

      const filename = `${Date.now()}-${req.files.image.name}`;
      const filepath = path.join(uploadDir, filename);

      req.files.image.mv(filepath, (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, imageUrl: `/uploads/${filename}` });
      });
    } else if (imageUrl) {
      // If image URL is provided (e.g., from GitHub)
      res.json({ success: true, imageUrl });
    } else {
      res.status(400).json({ error: 'No image provided' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get Dashboard Stats
 */
app.get('/api/admin/stats', verifyToken, (req, res) => {
  try {
    const transactions = JSON.parse(fs.readFileSync(transactionsFile, 'utf8'));

    const today = transactions.filter(t =>
      moment(t.timestamp).isSame(moment(), 'day')
    );
    const thisMonth = transactions.filter(t =>
      moment(t.timestamp).isSame(moment(), 'month')
    );

    const stats = {
      totalTransactions: transactions.length,
      todayTransactions: today.length,
      todayAmount: today.reduce((sum, t) => sum + (t.amount || 0), 0),
      monthlyAmount: thisMonth.reduce((sum, t) => sum + (t.amount || 0), 0),
      successRate: transactions.length > 0
        ? ((transactions.filter(t => t.status === 'SUCCESS').length / transactions.length) * 100).toFixed(2)
        : 0
    };

    res.json({ stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║  🎉 GeoPram Payment System Started  🎉  ║
║  ✅ Server running on port ${PORT}        ║
║  🔐 Admin Login: geopramtech@gmail.com ║
║  📱 STK Push Ready                      ║
╚════════════════════════════════════════╝
  `);
});

module.exports = app;
