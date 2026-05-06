const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// PUBLIC: Create order (before payment)
router.post('/', (req, res) => {
  try {
    const { items, customerName, phone, email, address, notes } = req.body;

    if (!items || !items.length || !customerName || !phone) {
      return res.status(400).json({ error: 'Items, customer name, and phone are required' });
    }

    // Calculate total from products in DB
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = db.products.find(p => p.id === item.productId && p.active);
      if (!product) return res.status(404).json({ error: `Product ${item.productId} not found` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }
      total += product.price * item.quantity;
      orderItems.push({ ...product, quantity: item.quantity, subtotal: product.price * item.quantity });
    }

    const order = {
      id: uuidv4(),
      orderNumber: `GG-${Date.now()}`,
      items: orderItems,
      customerName,
      phone,
      email: email || '',
      address: address || '',
      notes: notes || '',
      total,
      status: 'pending',
      paymentStatus: 'unpaid',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.orders.push(order);
    res.status(201).json({ success: true, order: { id: order.id, orderNumber: order.orderNumber, total } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// PUBLIC: Get order status
router.get('/:id/status', (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json({
    status: order.status,
    paymentStatus: order.paymentStatus,
    orderNumber: order.orderNumber,
    receipt: order.mpesaReceiptNumber
  });
});

// ADMIN: Get all orders
router.get('/', authMiddleware, (req, res) => {
  const { status, from, to, page = 1, limit = 50 } = req.query;
  let orders = [...db.orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (status) orders = orders.filter(o => o.status === status);
  if (from) orders = orders.filter(o => new Date(o.createdAt) >= new Date(from));
  if (to) orders = orders.filter(o => new Date(o.createdAt) <= new Date(to + 'T23:59:59'));

  const total = orders.length;
  const paginated = orders.slice((page - 1) * limit, page * limit);
  const revenue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.amount || o.total || 0), 0);

  res.json({ orders: paginated, total, revenue, page: parseInt(page), pages: Math.ceil(total / limit) });
});

// ADMIN: Update order status
router.put('/:id', authMiddleware, (req, res) => {
  const idx = db.orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Order not found' });

  db.orders[idx] = { ...db.orders[idx], ...req.body, updatedAt: new Date().toISOString() };
  res.json({ success: true, order: db.orders[idx] });
});

module.exports = router;
