const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// PUBLIC: Get all active products
router.get('/', (req, res) => {
  const { category, search } = req.query;
  let products = db.products.filter(p => p.active);

  if (category && category !== 'All') {
    products = products.filter(p => p.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
    );
  }

  res.json({ products });
});

// PUBLIC: Get single product
router.get('/:id', (req, res) => {
  const product = db.products.find(p => p.id === req.params.id && p.active);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ product });
});

// ADMIN: Get all products (including inactive)
router.get('/admin/all', authMiddleware, (req, res) => {
  res.json({ products: db.products });
});

// ADMIN: Create product
router.post('/', authMiddleware, (req, res) => {
  const { name, description, price, category, image, stock } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  // Validate image URL (must be http/https, no local paths)
  if (image && !image.startsWith('http')) {
    return res.status(400).json({ error: 'Image must be a valid URL (e.g., from GitHub)' });
  }

  const product = {
    id: uuidv4(),
    name,
    description: description || '',
    price: parseFloat(price),
    category: category || 'General',
    image: image || 'https://via.placeholder.com/400x300/16a34a/white?text=GeopramGifts',
    stock: parseInt(stock) || 0,
    active: true,
    createdAt: new Date().toISOString()
  };

  db.products.push(product);
  res.status(201).json({ success: true, product });
});

// ADMIN: Update product
router.put('/:id', authMiddleware, (req, res) => {
  const idx = db.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });

  const { name, description, price, category, image, stock, active } = req.body;

  // Validate image URL
  if (image && !image.startsWith('http')) {
    return res.status(400).json({ error: 'Image must be a valid URL' });
  }

  db.products[idx] = {
    ...db.products[idx],
    ...(name && { name }),
    ...(description !== undefined && { description }),
    ...(price && { price: parseFloat(price) }),
    ...(category && { category }),
    ...(image && { image }),
    ...(stock !== undefined && { stock: parseInt(stock) }),
    ...(active !== undefined && { active }),
    updatedAt: new Date().toISOString()
  };

  res.json({ success: true, product: db.products[idx] });
});

// ADMIN: Delete product
router.delete('/:id', authMiddleware, (req, res) => {
  const idx = db.products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });

  db.products.splice(idx, 1);
  res.json({ success: true, message: 'Product deleted' });
});

module.exports = router;
