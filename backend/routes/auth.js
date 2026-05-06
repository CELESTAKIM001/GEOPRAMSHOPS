const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/auth');

// Admin login - credentials validated against ENV (never exposed to client)
router.post('/login', async (req, res) => {
  try {
    const { email, password, phone } = req.body;

    // Multi-factor check: email + password required, phone optional
    const validEmail = email === process.env.ADMIN_EMAIL;
    const validPassword = password === process.env.ADMIN_PASSWORD;
    const validPhone = !phone || phone === process.env.ADMIN_PHONE || phone === process.env.ADMIN_ALT_PHONE;

    if (!validEmail || !validPassword || !validPhone) {
      // Generic error - don't reveal which field failed
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { email: process.env.ADMIN_EMAIL, role: 'admin', app: 'GeopramGifts' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      token,
      admin: { email: process.env.ADMIN_EMAIL, role: 'admin' },
      message: 'Welcome back, Admin!'
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token
router.get('/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, admin: req.admin });
});

// Logout (client-side token removal, but we acknowledge)
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
