# 🚀 Quick Start Guide

## 5-Minute Setup

### 1. Install Node.js
Download and install from https://nodejs.org (LTS version)

### 2. Setup Project
```bash
# Navigate to project folder
cd geopram-payment-system

# Install all dependencies
npm install
```

### 3. Create .env File
Create a file named `.env` in the root directory with:

```env
CONSUMER_KEY=your_key_here
CONSUMER_SECRET=your_secret_here
SHORTCODE=4574727
PASSKEY=your_passkey_here
CALLBACK_URL=http://localhost:5000/api/callback

ADMIN_EMAIL=geopramtech@gmail.com
ADMIN_PASSWORD=GeoPramTech72222
ADMIN_PHONE=0702781490
VERIFY_EMAIL=celestakim018@gmail.com
ALT_PHONE=0101370035

PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_key_change_this
```

### 4. Get M-Pesa Credentials
1. Visit https://developer.safaricom.co.ke
2. Sign up for developer account
3. Create new app "Lipa Na M-Pesa Sandbox"
4. Copy Consumer Key and Secret
5. Get Passkey from settings
6. Set Callback URL in app settings

### 5. Run Application
```bash
# Development (auto-reload)
npm run dev

# Or production mode
npm start
```

✅ Open http://localhost:5000 in browser

### 6. Admin Login
- **Email:** geopramtech@gmail.com
- **Password:** GeoPramTech72222

---

## Features Overview

### 📊 Dashboard
- Real-time transaction stats
- Today's sales & success rate
- Monthly revenue tracking

### 🛍️ Shop
- Browse products
- Buy with M-Pesa
- Instant payment processing

### 📦 Product Management
- Add new products
- Upload images (local or GitHub)
- Set prices & descriptions
- Delete products

### 💳 Payments
- STK Push integration
- Automatic M-Pesa popup
- Real-time payment status

### 📈 Reports
- Download daily reports
- Weekly sales analysis
- Monthly summaries
- Yearly statistics
- Excel format (.xlsx)

---

## API Response Examples

### Login Response
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "admin": {
    "email": "geopramtech@gmail.com",
    "verifyEmail": "celestakim018@gmail.com",
    "phone": "0702781490"
  }
}
```

### Payment Initiation
```json
{
  "success": true,
  "message": "STK Push sent successfully",
  "checkoutRequestID": "ws_co_20240101123456789",
  "responseCode": "0"
}
```

### Transaction Record
```json
{
  "id": "ws_co_20240101123456789",
  "phone": "254712345678",
  "amount": 1000,
  "status": "SUCCESS",
  "mpesaCode": "ABC123XYZ",
  "timestamp": "2024-01-01 12:34:56"
}
```

---

## Common Commands

```bash
# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# Create test transaction data
npm run seed

# Run tests
npm test
```

---

## File Locations

- **Server:** `server.js`
- **Frontend:** `public/index.html`
- **Transactions:** `data/transactions.json`
- **Products:** `data/products.json`
- **Environment:** `.env` (create this)
- **Images:** `public/uploads/`

---

## Deployment Checklist

Before deploying to production:

- [ ] Change admin password
- [ ] Update JWT_SECRET
- [ ] Set NODE_ENV=production
- [ ] Update CALLBACK_URL to production domain
- [ ] Enable HTTPS
- [ ] Add database (MongoDB/PostgreSQL)
- [ ] Set up proper logging
- [ ] Enable rate limiting
- [ ] Add CORS restrictions
- [ ] Test all payment flows

---

## Troubleshooting

**"Cannot find module"**
```bash
npm install
```

**Port already in use**
```bash
# Change PORT in .env to 3000, 3001, etc.
PORT=3000
```

**M-Pesa STK not appearing**
- Check phone number format: 254712345678
- Verify consumer key/secret
- Check callback URL is accessible

**Login fails**
- Ensure .env variables are set
- Check email matches ADMIN_EMAIL
- Verify password matches

---

## Example Product JSON

```json
{
  "id": "1234567890",
  "name": "Premium Package",
  "price": 5000,
  "description": "Professional services package",
  "image": "https://example.com/image.jpg",
  "createdAt": "2024-01-01T12:00:00Z"
}
```

---

## Example Transaction JSON

```json
{
  "id": "ws_co_20240101123456789",
  "phone": "254712345678",
  "amount": 1000,
  "resultCode": 0,
  "resultDesc": "The service was successful",
  "mpesaCode": "ABC123XYZ",
  "timestamp": "2024-01-01 12:34:56",
  "status": "SUCCESS",
  "items": ["Premium Package"]
}
```

---

## Contact & Support

- 📧 **Email:** geopramtech@gmail.com
- 📧 **Verify:** celestakim018@gmail.com
- 📱 **Phone:** 0702781490
- 📱 **Alt:** 0101370035

---

## Next Steps

1. ✅ Install and run locally
2. ✅ Test with M-Pesa sandbox
3. ✅ Add your products
4. ✅ Deploy to Vercel/Heroku
5. ✅ Switch to production M-Pesa
6. ✅ Set up database
7. ✅ Monitor transactions

---

**You're all set! Happy coding! 🎉**
